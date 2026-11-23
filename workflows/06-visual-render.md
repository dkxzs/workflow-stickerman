# Workflow 06: Visual & Animation Render

## Mục Tiêu
Render video Stickman từ Storyboard bằng **engine Node chính** (`engine/auto_director.mjs` gọi `engine/vector_scene_renderer.mjs`).
Agent **không tự vẽ hình**: agent chỉ chọn giá trị trong danh mục đóng (`engine/vocab.py`), engine lo phần vẽ SVG, chuyển PNG qua `sharp` và ghép video/audio qua `ffmpeg`.

> **Lưu ý về Python renderer (`engine/stickman_renderer.py`)**: chỉ giữ lại để xuất nhanh **ảnh contact sheet tĩnh (`--contact-sheet`)** phục vụ kiểm tra bố cục nhanh; chức năng xuất video MP4 bằng Python đã lỗi thời và được thay thế hoàn toàn bởi pipeline Node `engine/auto_director.mjs`.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-06-RENDER`
- **Tham chiếu**: `instructions/VISUAL_STICKMAN.md`, `engine/vocab.py`
- **Input**: `projects/{project_id}/03_storyboard.json` (đã qua validator) và `audio_scenes/` (để có `actual_duration_sec`)
- **Output**:
  - Contact sheet (tùy chọn): `projects/{project_id}/previews/contact_sheet.png`
  - Bản xem thử 6 cảnh đầu: `projects/{project_id}/output/video_preview_master.mp4`
  - Video hoàn chỉnh: `projects/{project_id}/output/video_full_master.mp4`

## Các Bước Thực Hiện (làm đúng thứ tự, không bỏ bước)

1. **Kiểm tra storyboard (bắt buộc)**:
   ```bash
   python -m engine.storyboard_validator projects/{project_id}/03_storyboard.json
   ```
   - Còn `ERROR` thì quay lại sửa storyboard theo đúng thông báo, chạy lại cho tới khi hiện `Storyboard OK`.
   - Đọc các `WARNING`: cảnh quá 3.5 giây, hero che card, close_up che card, lặp pose 4 cảnh liên tiếp... Sửa những gì hợp lý.
   - Cần xem danh sách giá trị hợp lệ: `python -m engine.vocab`.

2. **Contact sheet (tùy chọn — dùng Python renderer chỉ để xem nhanh ảnh tĩnh toàn bộ bố cục)**:
   ```bash
   python engine/stickman_renderer.py --storyboard projects/{project_id}/03_storyboard.json \
       --contact-sheet projects/{project_id}/previews/contact_sheet.png
   ```
   - Mở ảnh và kiểm tra: tay chân đúng tư thế, chữ không bị cắt, card không đè lên nhân vật, các cảnh liên tiếp không giống hệt nhau.
   - Có lỗi: sửa `03_storyboard.json` (đổi pose / mood / x / camera / card), chạy lại. **Không sửa code engine để chữa lỗi một cảnh.**

3. **Cổng duyệt bản xem thử 6 cảnh đầu bằng Engine Node (Gate 4B, người dùng duyệt)**:
   ```bash
   node engine/auto_director.mjs --project={project_id} --preview=6
   ```
   - Lệnh này tự động chạy `storyboard_validator`, render SVG → PNG → ghép voiceover + nhạc nền cho 6 cảnh đầu tiên ra `projects/{project_id}/output/video_preview_master.mp4`.
   - Nếu `ffmpeg` chưa nằm trong `PATH`, đặt biến môi trường `FFMPEG_PATH=/path/to/ffmpeg`.
   - **Dừng lại, gửi `video_preview_master.mp4` chờ người dùng đồng ý.** Chưa được đồng ý thì không render toàn bộ.

4. **Render toàn bộ video bằng Engine Node (đường chính)**:
   ```bash
   node engine/auto_director.mjs --project={project_id}
   ```
   - Xuất từng cảnh vào `projects/{project_id}/video_scenes_vector/{SCENE_ID}.mp4` và ghép bản hoàn chỉnh tại `projects/{project_id}/output/video_full_master.mp4`.

5. **Báo cáo**: liệt kê số cảnh đã render, đường dẫn file output, các WARNING còn lại, và cảnh nào cần người dùng chú ý.

## Các lỗi hay gặp và cách sửa (chỉ sửa storyboard)

| Hiện tượng | Cách sửa trong storyboard |
|---|---|
| Nhân vật đè lên card | `position.x` = 0.25 (card bên phải) hoặc 0.75 (card bên trái) |
| Chữ card quá dài, bị co nhỏ | `card.title` chỉ 1-3 từ, chuyển ý phụ sang `card.subtitle` |
| Card bị cắt khi zoom | đổi `camera.framing` từ `close_up` sang `medium` |
| Cảnh nhàm, đứng yên lâu | cảnh > 3.5s thì tách `SCENE_005_A`, `SCENE_005_B`, đổi pose/camera |
| Mặt không hợp cảm xúc | đặt `visual.mood` trực tiếp: neutral, eager, happy, flat, deadpan, sad |

## Quy tắc
- Mỗi lần chạy sửa hình, **chỉ sửa storyboard**, rồi chạy lại bước 1 và 3.
- Muốn thêm pose / icon / SFX mới thì phải sửa code engine; việc đó cần người dùng yêu cầu rõ (xem `AGENT_ROUTER.md` mục 5.3).
