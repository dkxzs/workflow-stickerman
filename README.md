# YouTube Content Engine

Hệ thống bán tự động hỗ trợ sản xuất nội dung video YouTube chuẩn hóa (Stickman / 2D Minimalist Animation), tối ưu cho quy trình phối hợp giữa các AI Agent và nhà sáng tạo nội dung.

---

## 1. Trạng Thái Hiện Tại Của Dự Án

- **Giai đoạn**: Khởi tạo kiến trúc dự án, hoàn thiện tài liệu hướng dẫn (`instructions/`), quy trình làm việc (`workflows/`), và biểu mẫu (`templates/`).
- **Mã nguồn Engine (`engine/`)**: Chưa triển khai code thực thi; chưa cài đặt thư viện Python (tuân thủ nguyên tắc thiết lập hạ tầng tài liệu trước).
- **Định hướng chiến lược nội dung (`instructions/CONTENT_STRATEGY.md`)**: **Đang ở trạng thái chờ nghiên cứu và xác thực (Pending Research & Validation)**. Hệ thống chưa khóa cố định vào bất kỳ ngách nào (kể cả Psychology hay Self-Improvement) nhằm phục vụ đánh giá dữ liệu thị trường khách quan trước khi chốt ngách.

---

## 2. Kiến Trúc Thư Mục

```
youtube-content-engine/
│
├── README.md                     # Tài liệu tổng quan dự án & hướng dẫn khởi tạo
├── AGENT_ROUTER.md               # Quy định điều phối & phân vai các AI Agent
├── .gitignore                    # Bỏ qua file tạm, môi trường ảo, cache & file render nặng
│
├── instructions/                 # Bộ quy chuẩn nghiệp vụ & nguyên tắc cốt lõi
│   ├── GLOBAL_RULES.md           # Quy tắc chung về chất lượng, an toàn bản quyền, đặt tên
│   ├── CONTENT_STRATEGY.md       # Khung chiến lược ngách (Trạng thái: Chờ xác thực)
│   ├── SCRIPT_GUIDELINES.md      # Quy chuẩn viết kịch bản tối ưu retention & TTS
│   ├── STORYBOARD_RULES.md       # Quy tắc bóc tách cảnh quay và nhịp visual
│   ├── VISUAL_STICKMAN.md        # Tiêu chuẩn thẩm mỹ & tư thế stickman animation
│   └── QUALITY_CHECKLIST.md      # Bảng kiểm tra chất lượng 4 lớp trước khi xuất bản
│
├── workflows/                    # Quy trình thực thi chuẩn hóa 8 bước
│   ├── 01-research.md            # Bước 1: Nghiên cứu đề tài & phân tích đối thủ
│   ├── 02-concept.md             # Bước 2: Xây dựng góc nhìn (Hook & Packaging)
│   ├── 03-script.md              # Bước 3: Biên soạn kịch bản chi tiết
│   ├── 04-storyboard.md          # Bước 4: Chuyển kịch bản thành Storyboard JSON
│   ├── 05-audio-tts.md           # Bước 5: Tạo audio lồng tiếng (TTS) & đo thời lượng
│   ├── 06-visual-render.md       # Bước 6: Render hoạt họa Stickman theo cảnh
│   ├── 07-editing-mix.md         # Bước 7: Dựng video, hòa âm SFX/BGM & phụ đề
│   └── 08-publishing.md          # Bước 8: Kiểm duyệt QA & xuất bản lên YouTube
│
├── engine/                       # Module code tự động hóa (đã chạy được)
│   ├── requirements.txt          # Danh sách thư viện
│   ├── config.py                 # File cấu hình toàn cục
│   ├── vocab.py                  # DANH MỤC ĐÓNG: pose, mood, icon, camera, SFX mà engine hỗ trợ
│   ├── icons.py                  # Thư viện icon vẽ bằng code cho card
│   ├── storyboard_validator.py   # Kiểm tra storyboard (Gate 4)
│   ├── tts_engine.py             # Xử lý text-to-speech
│   ├── stickman_renderer.py      # Render nhân vật, card, camera; contact sheet; xem thử 20 giây
│   ├── audio_mixer.py            # Xử lý hòa trộn âm thanh
│   ├── utils/                    # Các module tiện ích bổ trợ
│   └── base_assets/              # Kho tài nguyên gốc
│       ├── poses/                # Tư thế nhân vật mẫu
│       ├── sfx/                  # Hiệu ứng âm thanh cơ bản
│       └── bgm/                  # Nhạc nền miễn phí bản quyền
│
├── templates/                    # Biểu mẫu chuẩn hóa
│   ├── script-template.md        # Mẫu kịch bản chi tiết
│   ├── storyboard-schema.json    # JSON Schema xác thực cấu trúc phân cảnh
│   ├── storyboard-example.json   # Storyboard mẫu 9 cảnh, đủ trường, chạy được
│   └── metadata-template.md      # Mẫu tiêu đề, mô tả, tags, chapters YouTube
│
├── projects/                     # Không gian thực thi từng video cụ thể
│   └── video-001/                # Dự án video mẫu (Sandbox)
│       ├── 01_research.md
│       ├── 02_script.md
│       ├── 03_storyboard.json
│       ├── audio_scenes/         # Audio render từng phân cảnh
│       ├── video_scenes/         # Video render từng phân cảnh
│       ├── output/               # Video hoàn chỉnh cuối cùng
│       └── qa_report.md          # Báo cáo đánh giá chất lượng video
│
└── tests/                        # Kiểm thử tự động cho Engine
    ├── test_tts.py               # Kiểm thử TTS engine
    ├── test_renderer.py          # Kiểm thử Stickman renderer
    ├── test_vocab_validator.py   # Kiểm thử danh mục, validator, camera, contact sheet
    └── test_audio_mixer.py       # Kiểm thử Audio mixer
```

### Chạy nhanh bước hình ảnh

```bash
python -m engine.vocab                                   # xem các giá trị hợp lệ (đưa cho AI đọc)
python -m engine.storyboard_validator projects/video-001/03_storyboard.json
python engine/stickman_renderer.py --storyboard templates/storyboard-example.json --contact-sheet out/sheet.png
python engine/stickman_renderer.py --storyboard <storyboard> --output-dir <dir> --preview-seconds 20   # bản xem thử 20 giây
python -m pytest -q
```

Nguyên tắc: AI **chọn** giá trị trong `engine/vocab.py`, engine **vẽ**. Chi tiết ở `workflows/06-visual-render.md`.

---

## 3. Quy Trình Vận Hành 8 Bước

1. **Research (`workflows/01-research.md`)**: Thu thập dữ liệu tìm kiếm, nhu cầu khán giả và phân tích video đối thủ.
2. **Concept (`workflows/02-concept.md`)**: Quyết định góc tiếp cận (Angle), tiêu đề A/B/C và ý tưởng Thumbnail trước khi viết kịch bản.
3. **Script (`workflows/03-script.md`)**: Soạn thảo kịch bản theo công thức giữ chân người xem (Hook - Retain - Deliver - Climax - CTA).
4. **Storyboard (`workflows/04-storyboard.md`)**: Bóc tách kịch bản thành cấu trúc phân cảnh JSON chuẩn schema.
5. **Audio TTS (`workflows/05-audio-tts.md`)**: Chuyển đổi văn bản thành âm thanh, đo đạc thời lượng chính xác từng câu.
6. **Visual Render (`workflows/06-visual-render.md`)**: Tạo dựng hình ảnh/hoạt cảnh Stickman theo storyboard.
7. **Editing & Mix (`workflows/07-editing-mix.md`)**: Hợp nhất visual, giọng đọc, âm thanh hiệu ứng (SFX), nhạc nền (BGM) và phụ đề.
8. **Publishing (`workflows/08-publishing.md`)**: Đánh giá kiểm định chất lượng (QA), tối ưu hóa SEO metadata và phát hành video.

---

## 4. Kế Hoạch Tiếp Theo

1. Tiến hành khảo sát dữ liệu thị trường và hoàn thành tài liệu `instructions/CONTENT_STRATEGY.md` để lựa chọn ngách nội dung tối ưu.
2. Xây dựng mã nguồn lõi trong `engine/` dựa trên yêu cầu từ `templates/storyboard-schema.json`.
3. Kiểm thử luồng tự động hóa hoàn chỉnh trên dự án mẫu `projects/video-001/`.
