---
name: whiteboard-video
description: Làm video vẽ tay bảng trắng (whiteboard animation) trên nền giấy màu kem từ một chủ đề, một kịch bản lời dẫn hoặc file phụ đề SRT, ra thành phẩm hoàn chỉnh có giọng đọc và phụ đề. Quy trình - chủ đề → viết kịch bản → tạo giọng đọc sinh SRT theo giọng thật, hoặc đọc SRT → phân cảnh → tạo ảnh nét vẽ cùng phong cách → chia vùng theo mạch truyện (annotation.json / sequence / startMs / protectedRegions) → chỉnh trên trang xem trước → render MP4 bằng nét bút liền mạch (đi nét ink → tô màu color) → ghép cảnh, gắn phụ đề, ghép giọng đọc (mặc định Edge TTS trong `engines/whiteboard/.env`; có thể đổi sang CIT Voice Studio offline hoặc Vbee). Dùng khi người dùng yêu cầu làm video vẽ tay, video whiteboard, video bảng trắng, hoặc biến phụ đề/kịch bản/chủ đề thành video vẽ tay. Cô lập 100%, không dùng pipeline HTML/SVG của stickman.
---

# Video vẽ tay bảng trắng (Whiteboard Video Skill)

Biến chủ đề, kịch bản hoặc phụ đề SRT thành video vẽ tay bảng trắng. **Dàn dựng** theo cơ chế mặt nạ từng vùng: các vùng hiện ra lần lượt theo mạch truyện, vùng chưa tới lượt bị ẩn hoàn toàn, chỗ chồng lấn được bảo vệ bằng `protectedRegions`. **Cách vẽ** là nét bút liền mạch: trong phạm vi được phép của mỗi vùng, đầu bút trượt liên tục theo khung xương/lưới để đi nét (`ink`) rồi tô màu (`color`). Mọi vùng dùng chung một canvas, vùng đã vẽ xong được giữ lại.

> **Quy tắc cô lập:** Luồng này chạy **hoàn toàn độc lập** trong `engines/whiteboard/` bằng Python `.venv` riêng (`engines/whiteboard/.venv/`). **Tuyệt đối không** dùng pipeline HTML/SVG/Node của Stickman (`engine/`, `instructions/VISUAL_STICKMAN.md`, `templates/storyboard-schema.json`) và **không** áp dụng điều khoản cấm whiteboard trong `instructions/GLOBAL_RULES.md` (vốn chỉ dành cho luồng Stickman).

**Ngôn ngữ:** mọi lời giải thích, phân cảnh, nhãn vùng (`label`), `narrativeRole`, ghi chú, kịch bản và giao diện gửi cho người dùng đều viết bằng **tiếng Việt**, trừ khi người dùng yêu cầu ngôn ngữ khác.

---

## Điều phối vai trò AI theo chặng (gọn, đúng việc)

| Chặng | Vai trò AI đảm nhiệm | Đầu ra chính (`projects/<tên-dự-án>/`) |
|---|---|---|
| **0a. Kịch bản** | **Whiteboard Scriptwriter** — viết lời dẫn giàu hình ảnh cụ thể, câu ngắn ≤ 5s | `script.md` |
| **0b. Giọng đọc & SRT** | **Voice & Timing Engineer** — cắt câu, tạo TTS (Edge/CIT/Vbee), sinh SRT theo giọng thật | `draft.srt`, `input.srt`, `narration.m4a`, `tts-cache/` |
| **1–2. Phân cảnh & Ảnh** | **Storyboard & Sketch Director** — chia cảnh 20–35s, gọi công cụ tạo ảnh hoặc viết prompt | `STORYBOARD.md`, `IMAGE_PROMPTS.md`, `scene-XX-<tên>.png` |
| **3–5. Chia vùng & Preview** | **Scene Annotator** — xem ảnh thật + đọc SRT, gán tọa độ pixel & `protectedRegions`, mở `preview.html` | `scene-XX-<tên>.annotation.json`, `scene-XX-regions.png` |
| **6–8. Render & Hoàn thiện** | **Whiteboard Render Engineer** — render MP4 nét liền, ghép cảnh, gắn phụ đề, ghép giọng & QA | `scene-XX-whiteboard.mp4`, `final.mp4`, `final-sub-voice.mp4` |

---

## Tham số mặc định

| Hạng mục | Yêu cầu mặc định |
|---|---|
| Nền giấy | Ảnh tạo ra dùng màu giấy cũ kem ấm (`#F5EBD7`). Khi render, lấy mẫu màu nền ở gần bốn góc ảnh gốc (thụt vào trong); cấm nền trắng tinh. |
| Cách vẽ | Mỗi vùng vẽ bằng nét liền: đi nét `ink` (phác nét) → tô `color` (trả lại màu gốc), tỉ lệ thời gian `ink:color = 2:1`. |
| Đường bút | `--ink-path grid` (lưới, mặc định, ổn định) hoặc `skeleton` (bám khung xương, hợp với ảnh nét rõ). |
| Kiểu tô màu | `--color-fill contour-wipe` (quét theo viền, mặc định) hoặc `brush` (tô theo vệt bút). |
| Vùng chưa vẽ | Phạm vi được phép của một vùng = khung `region` trừ đi các vùng vẽ sau và `protectedRegions`; vùng chưa tới lượt ẩn hoàn toàn. |
| Nguồn thời lượng | `sceneDurationMs` của mỗi ảnh lấy từ khoảng thời gian phụ đề của cảnh đó (nên 20–35 giây/cảnh). |
| Khung chỉnh sửa | Trang xem trước mặc định hiện mọi khung vùng có đánh số; khung này không thuộc nội dung video. |
| Trình thông dịch Python | `<ENV_PY>` = `engines/whiteboard/.venv/Scripts/python.exe` (Windows) hoặc `engines/whiteboard/.venv/bin/python` (macOS/Linux). |
| Cấu hình TTS | Đọc từ `engines/whiteboard/.env` (mặc định `TTS_PROVIDER=edge`; có thể đổi sang `cit` hoặc `vbee`). |

## Quy chuẩn hình ảnh (bắt buộc)

Mọi ảnh gốc của các cảnh phải cùng một ngôn ngữ hình ảnh. Trước khi tạo ảnh, đưa đầy đủ các yêu cầu sau vào prompt; tạo xong kiểm tra lại từng điều:

- **Phong cách và bố cục:** minh hoạ vẽ tay tối giản, kiểu phác thảo bút chì/bút mực, thẩm mỹ nét vẽ tiết chế giống Notion. Ưu tiên truyền đạt ý, không cầu kỳ tả thực; bố cục đơn giản, nền sạch, nhiều khoảng trống; cảm xúc nhẹ nhàng, rõ ràng. Nét vẽ, nhân vật, màu sắc thống nhất trong cả loạt.
- **Style prompt chuẩn tiếng Anh (khi gọi công cụ/API sinh ảnh):**
  `"minimalist hand-drawn black ink sketch on warm beige paper #F5EBD7, clean background, well-separated elements, no text"`
- **Màu sắc và chất liệu:** nền giấy màu kem `#F5EBD7`, nét phác xám đậm/đen; chỉ dùng **đỏ, cam, xanh dương** làm điểm nhấn ít ỏi. Không dùng màu nhấn khác, màu quá rực hay chất liệu phức tạp.
- **Nhân vật và đồ vật:** thể hiện bằng đường viền đơn giản, ít nét, chừa khoảng trống; nhấn vào quan hệ/biến đổi/ý chính, không vào tỉ lệ, chất liệu, chi tiết thật.
- **Tuyệt đối cấm:** bất kỳ chữ, từ, chữ cái, số, font hay nhãn nào trong ảnh cảnh; cảm giác tả thực, chi tiết ảnh chụp, hiệu ứng 3D, chất liệu tranh sơn; cảnh phức tạp, nền dày đặc, trang trí rườm rà, màu quá rực.
- **Ngoại lệ bàn tay vẽ:** nếu người dùng nói rõ chữ trên thân bút trong `engines/whiteboard/assets/drawing-hand.png` là dấu nhận diện của họ và muốn giữ, thì được giữ; nó không tính là chữ trong ảnh cảnh. Khi chưa có xác nhận đó, coi như ảnh không được có chữ.

## Điểm dừng xác nhận (bắt buộc)

Trong quy trình mặc định, **sau mỗi bước phải dừng lại và chờ người dùng xác nhận rõ ràng** rồi mới sang bước tiếp. Trước khi được xác nhận, không được tạo ảnh, annotation, ảnh xem trước, video hay file ghép của bước sau. Không được coi "chưa trả lời", "đã cho phép chung chung trước đó" hay "người dùng không phản đối" là xác nhận. Khi người dùng yêu cầu sửa bước trước, chỉ làm lại đúng bước đó, xong lại chờ xác nhận.

Ngoại lệ duy nhất: **tạo xong file annotation JSON thì phải lập tức mở trang xem trước và nạp thư mục chứa JSON đó**. Việc này thuộc kết quả của bước 3, không cần chờ xác nhận riêng.

## Ba kiểu đầu vào

| Người dùng đưa | Bắt đầu từ bước |
|---|---|
| **Chủ đề** (một câu, một ý tưởng) | Bước 0a: viết kịch bản |
| **Kịch bản / lời dẫn** (đoạn văn) | Bước 0b: tạo giọng đọc, sinh SRT |
| **File SRT** | Bước 1 (quy trình gốc); làm xong có thể thêm bước 8 |

Khi bắt đầu từ chủ đề hoặc kịch bản, dùng **giọng đọc dẫn nhịp**: tạo giọng trước, lấy độ dài giọng thật để sinh SRT; phân cảnh và thời gian vẽ đều theo SRT này, nên video tự nhiên không có khoảng lặng thừa, không cần bước nhịp gọn.

## Quy trình

0a. **Viết kịch bản (chỉ khi đầu vào là chủ đề).** Dựa vào chủ đề, thời lượng mục tiêu (mặc định 60 giây, khoảng 180–220 từ tiếng Việt), người xem và giọng văn, viết lời dẫn: một câu mở gây tò mò → thân (câu chuyện/luận điểm) → một câu kết đọng lại. Mỗi câu đọc không quá khoảng 5 giây, dễ minh hoạ (có người, vật, hành động cụ thể); giữa các đoạn cách một dòng trống (cuối đoạn sẽ nghỉ lâu hơn). Lưu vào `projects/<tên-dự-án>/script.md`, kèm một câu thông điệp chính. **Xong thì dừng, chờ người dùng duyệt kịch bản.**

0b. **Tạo giọng đọc, sinh SRT (đầu vào chủ đề/kịch bản).** Chỉ làm sau khi kịch bản được duyệt (chạy từ thư mục gốc dự án):
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/script_to_srt.py \
       projects/<tên-dự-án>/script.md \
       --output projects/<tên-dự-án>/draft.srt
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/tts_narration.py \
       projects/<tên-dự-án>/draft.srt \
       --output projects/<tên-dự-án>/narration.m4a \
       --retime-out projects/<tên-dự-án>/input.srt \
       --pause <từng mục trong PAUSES>
   ```
   `input.srt` là phụ đề cho mọi bước sau; `narration.m4a` là giọng đọc cuối cùng (bước 8 dùng lại cache). Báo cho người dùng: cách cắt câu, tổng thời lượng, giọng đã dùng, và mời nghe thử `narration.m4a`. Giọng/tốc độ/engine lấy theo `engines/whiteboard/.env` (mặc định `TTS_PROVIDER=edge`); người dùng chỉ định thì dùng `--provider` / `--voice` / `--speed`. **Xong thì dừng, chờ người dùng duyệt giọng đọc và cách cắt câu.**

1. **Đọc phụ đề, lên phương án hình (chưa tạo ảnh).** Dùng `engines/whiteboard/scripts/parse_srt.py` tách SRT thành từng câu và gợi ý chia cảnh 20–35 giây/cảnh. Từ đó đưa ra phương án: mỗi cảnh có số thứ tự, ý chính, đối tượng trong hình, khoảng phụ đề tương ứng và `sceneDurationMs`. Mỗi cảnh chỉ một ý chính. **Xong thì dừng, chờ duyệt phương án.**

2. **Tạo ảnh nét vẽ (`scene-XX-<tên>.png`).** Chỉ làm sau khi phương án được duyệt.
   - **Nếu dự án hoặc môi trường agent có sẵn script/API/công cụ tạo ảnh** (ví dụ subagent `image-generator` hoặc script sinh ảnh): tự gọi để tạo từng ảnh 16:9 tuân thủ quy chuẩn hình ảnh với style `"minimalist hand-drawn black ink sketch on warm beige paper #F5EBD7, clean background, well-separated elements, no text"`, lưu đúng vào `projects/<tên-dự-án>/scene-XX-<tên>.png`.
   - **Nếu không có công cụ sinh ảnh:** xuất đầy đủ prompt từng cảnh vào `projects/<tên-dự-án>/IMAGE_PROMPTS.md` và **dừng chờ người dùng** tạo rồi thả ảnh đúng tên `scene-XX-<tên>.png` vào thư mục dự án.
   - Không có chữ, ảnh chụp phức tạp, đối tượng chồng lên nhau hay yếu tố trái quy chuẩn. **Xong thì dừng, cho xem ảnh và chờ duyệt.**

3. **Đọc phụ đề trước, xem ảnh sau, rồi chia vùng và mở trang xem trước.** Chỉ làm sau khi ảnh được duyệt. Đọc phụ đề của cảnh, **thực sự mở xem ảnh** và lấy kích thước pixel gốc; không được đoán hình chỉ từ phụ đề, cũng không được xếp thứ tự máy móc theo vị trí. Rút ra các sự kiện trong phụ đề, gắn từng đối tượng nhìn thấy trong ảnh với sự kiện, xếp thứ tự vẽ theo mạch "bối cảnh → nhân vật/đồ vật chính → hành động, xung đột hoặc biến đổi → phản ứng/kết quả". Sau đó tạo `<tên-ảnh>.annotation.json` cùng thư mục. Tạo xong, lập tức mở `engines/whiteboard/assets/preview.html` bằng trình duyệt mặc định và dùng nút "Mở thư mục" nạp **thư mục chứa file annotation**. **Trang xem trước đã nạp xong thì dừng, chờ duyệt annotation và bản xem trước.**

4. **Xuất ảnh kiểm tra vùng.** Chỉ làm sau khi annotation được duyệt. Dùng `engines/whiteboard/scripts/render_annotation_preview.py` xuất ảnh đánh số/hướng vẽ, đối chiếu: thứ tự vùng khớp mạch truyện, mọi vùng nằm trong ảnh, đối tượng chồng lấn đã được `protectedRegions` bảo vệ. **Xong thì dừng, chờ duyệt ảnh kiểm tra.**

5. **Chỉnh và lưu trên trang xem trước.** Chỉ làm sau khi ảnh kiểm tra được duyệt, trên `engines/whiteboard/assets/preview.html` đã mở và nạp đúng thư mục. Kéo cạnh/góc để sửa `region`; sửa tên, hướng, bắt đầu/kết thúc (ms) và phụ đề; kéo danh sách đổi thứ tự; bấm "Lưu cảnh này / Lưu tất cả" để ghi lại `.annotation.json` gốc. **Lưu xong thì dừng, chờ duyệt annotation và thời gian cuối cùng.**

6. **Render bằng dòng lệnh.** Chỉ làm sau khi annotation và thời gian được duyệt. Dùng `engines/whiteboard/scripts/render_stream_whiteboard.py` render từng cảnh ra MP4, kiểm tra ba thời điểm: mở đầu, giữa một vùng có chồng lấn, và cuối cảnh. **Xong thì dừng, chờ duyệt video từng cảnh.**

7. **Ghép các cảnh (khi có nhiều cảnh).** Chỉ làm sau khi mọi cảnh được duyệt. Dùng `engines/whiteboard/scripts/merge_scenes.py` ghép theo thứ tự thành một video. **Xong thì dừng, chờ duyệt video ghép.**

8. **Gắn phụ đề + ghép giọng đọc (mặc định với đầu vào chủ đề/kịch bản; với đầu vào SRT thì làm khi người dùng yêu cầu).** Chỉ làm sau khi video ghép được duyệt. Dùng `ffmpeg` filter `subtitles` gắn `input.srt` vào hình, sau đó chạy `engines/whiteboard/scripts/tts_narration.py` để ghép giọng (lấy từ cache, không gọi lại API). Kiểm tra khung đầu/giữa/cuối và phân bố khoảng lặng (`silencedetect`). **Xong thì dừng, bàn giao video cuối.**

## Thư mục dự án

```text
projects/<tên-dự-án>/
  script.md                            # kịch bản (nếu bắt đầu từ chủ đề/kịch bản)
  input.srt                            # phụ đề chính thức
  IMAGE_PROMPTS.md                     # prompt tạo ảnh (khi không tự sinh ảnh)
  scene-01-<tên>.png
  scene-01-<tên>.annotation.json       # cùng tên với png
  scene-01-<tên>-whiteboard.mp4        # video cảnh
  scene-01-<tên>-preview.mp4           # đoạn xem thử (trang xem trước tạo, độ phân giải thấp)
  tts-cache/                           # giọng đọc từng câu (dùng lại, không tốn phí lần 2)
```

Ảnh và cấu hình phải cùng tên: `foo.png` ↔ `foo.annotation.json`.

## Xếp thứ tự theo nghĩa, mô hình thời gian & bất biến mặt nạ (bắt buộc)

- **Căn cứ đọc & toạ độ:** trước khi chia vùng phải có cả phụ đề lẫn ảnh gốc đã mở xem. `canvas.width` / `canvas.height` bằng đúng kích thước pixel ảnh gốc; mọi `region` ghi `x`, `y`, `width`, `height` bằng số nguyên pixel, gốc góc trên bên trái.
- **Trường mỗi vùng:** `sequence` (liên tục từ 1), `narrativeRole` (tiếng Việt), `subtitle`, `region`, `reveal`, `handPath`.
- **Thời gian nối tiếp & tốc độ vẽ vừa phải (bắt buộc):** chỉ có một cây bút, các vùng trong cùng cảnh nối tiếp nhau (`startMs` không chồng nhau); mỗi vùng chia `ink:color = 2:1`. Để nét vẽ thong thả, tự nhiên (tránh vẽ quá nhanh), mỗi vùng cần tối thiểu **`3.500 – 6.000 ms`** (chi tiết nhỏ như mũi tên/ký hiệu tối thiểu `2.000 – 2.500 ms`, cụm phức tạp `5.000 – 8.000 ms`); không nhồi quá nhiều vùng vào cảnh ngắn (`Số vùng ≤ floor((sceneDurationMs - 1000) / 3500)`). Nếu lời thoại cảnh ngắn hơn thời gian vẽ đẹp, tăng khoảng nghỉ cuối cảnh (`--pause` `1.2–1.5s`, `--tail` `1.5s`, tốc độ đọc `--speed 0.95–1.0`) hoặc gộp ý vào cảnh dài `15–30s`. Giữ ảnh hoàn chỉnh cuối cảnh ít nhất **`1,0 – 1,5 giây`**.
- **Bất biến mặt nạ:** phạm vi được phép của mỗi vùng = `region` trừ `region` của mọi vùng vẽ sau và trừ `reveal.protectedRegions`. Vùng chưa tới lượt ẩn hoàn toàn.

## Lệnh (chạy từ thư mục gốc dự án)

Mọi script Python của luồng whiteboard chạy bằng `.venv` riêng trong `engines/whiteboard/`:
- Windows: `<ENV_PY>` = `engines/whiteboard/.venv/Scripts/python.exe`
- macOS/Linux: `<ENV_PY>` = `engines/whiteboard/.venv/bin/python`

1. **Kiểm tra / chuẩn bị môi trường:**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/prepare_env.py --check
   python engines/whiteboard/scripts/prepare_env.py
   ```
2. **Kịch bản → SRT nháp:**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/script_to_srt.py \
       projects/<tên-dự-án>/script.md \
       --output projects/<tên-dự-án>/draft.srt [--max-chars 80] [--min-chars 12]
   ```
3. **Đọc phụ đề + gợi ý chia cảnh:**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/parse_srt.py \
       <phụ-đề.srt> --target-sec 30 --min-sec 25 --max-sec 35
   ```
4. **Ảnh kiểm tra vùng (đánh số):**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/render_annotation_preview.py \
       <ảnh> <annotation> <ảnh-kiểm-tra>
   ```
5. **Trang xem trước (không cần server):** mở `engines/whiteboard/assets/preview.html` bằng Chrome/Edge, bấm "Mở thư mục" chọn `projects/<tên-dự-án>/`.
6. **Render một cảnh:**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/render_stream_whiteboard.py \
       <ảnh> <annotation> <ra.mp4> engines/whiteboard/assets/drawing-hand.png \
       [--ink-path grid|skeleton] [--color-fill contour-wipe|brush] [--total-ms <mili-giây>]
   ```
7. **Ghép các cảnh:**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/merge_scenes.py \
       --inputs canh1.mp4 canh2.mp4 canh3.mp4 --output final.mp4
   ```
8. **Gắn phụ đề** (cần `ffmpeg` trong PATH; trên Windows dùng đường dẫn tương đối cho `subtitles=`):
   ```bash
   ffmpeg -i final.mp4 -vf "subtitles=input.srt:force_style='FontName=Arial,FontSize=15,PrimaryColour=&H00303030,OutlineColour=&H10D7EBF5,BorderStyle=3,Outline=6,Shadow=0,MarginV=14'" \
       -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart final-sub.mp4
   ```
9. **Giọng đọc (mặc định `TTS_PROVIDER=edge` trong `engines/whiteboard/.env`; hỗ trợ `edge`, `cit`, `vbee`):**
   ```bash
   engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/tts_narration.py \
       <phụ-đề.srt> --output narration.m4a --video final-sub.mp4 \
       [--provider edge|cit|vbee] [--voice <tên/mã-giọng>] [--speed 1.05]
   ```
10. **Nhịp gọn (tùy chọn cho đầu vào SRT có nhiều khoảng lặng):**
    ```bash
    engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/tts_narration.py \
        input.srt --output narration.m4a --retime-out input.tight.srt --gap 0.3 --pause 6=0.8 --tail 1.0
    engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/retime_annotations.py \
        --old-srt input.srt --new-srt input.tight.srt --annotations canh1.annotation.json canh2.annotation.json
    ```

## Kiểm tra chất lượng

- Khung đầu tiên là nền giấy kem sạch, chưa lộ nét nào.
- Đã đọc phụ đề và thực sự xem ảnh gốc; `canvas` khớp kích thước ảnh, mọi `region` là pixel nguyên và nằm trong ảnh.
- Kiểm tra 3 thời điểm: mở đầu, giữa vùng chồng lấn, cuối cảnh — vùng chưa vẽ không lộ, vùng bảo vệ không rò, khung cuối giữ ảnh hoàn chỉnh ít nhất 0,5 giây.
- Có giọng đọc: giọng, phụ đề và hình khớp nhau; không có khoảng lặng dài bất thường.
