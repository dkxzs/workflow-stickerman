# YouTube Content Engine

Hệ thống sản xuất video YouTube bán tự động gồm **2 engine độc lập, cô lập 100%**, tối ưu cho quy trình phối hợp giữa AI Agent và người sáng tạo nội dung:

1. **Stickman Explainer (`engine/`)**: Hoạt họa người que 2D vector (Node SVG + Sharp + FFmpeg), 1080p 30 FPS, quy trình 8 bước có cổng duyệt (Approval Gates).
2. **Whiteboard Animation (`engines/whiteboard/`)**: Video vẽ tay bảng trắng trên nền giấy kem (`#F5EBD7`) bằng Python `.venv` riêng, chạy từ chủ đề / kịch bản / SRT → ảnh nét vẽ → chia vùng annotation → render nét bút liền mạch + giọng đọc + phụ đề.

---

## 1. Cấu Trúc Thư Mục

```text
youtube-content-engine/
├── AGENTS.md / GEMINI.md         # Quy tắc định tuyến 2 luồng video cho AI Agent
├── AGENT_ROUTER.md               # Điều phối 8 bước, phân vai & cổng duyệt (Stickman)
├── .agent/skills/                # Skill chuẩn cho Antigravity (đồng bộ với .agents/skills/)
│   ├── stickman-video/SKILL.md
│   └── whiteboard-video/SKILL.md
│
├── instructions/                 # Quy chuẩn nghiệp vụ (Stickman)
├── workflows/                    # Quy trình 8 bước (01-research → 08-publishing)
├── templates/                    # Mẫu kịch bản, metadata, storyboard schema & example
├── assets/                       # Kho tài nguyên dùng chung (audio BGM/SFX, backgrounds, fonts, textures)
│
├── engine/                       # [LUỒNG STICKMAN] Engine Node chính + công cụ Python
│   ├── auto_director.mjs         # [CHÍNH] Điều phối render SVG → PNG → FFmpeg MP4
│   ├── vector_scene_renderer.mjs # [CHÍNH] Vẽ khung hình SVG 1080p
│   ├── character_renderer.mjs    # [CHÍNH] Rig & diễn xuất nhân vật Stickman
│   ├── backgrounds.mjs           # Thư viện bối cảnh vector & ảnh nền
│   ├── icons.mjs                 # Thư viện 15 icon SVG cho info card
│   ├── vocab.py                  # Danh mục đóng: pose, mood, icon, camera, background, SFX
│   ├── storyboard_validator.py   # Kiểm tra storyboard (Gate 4)
│   ├── tts_engine.py             # Tạo giọng đọc Edge-TTS & đo thời lượng từng cảnh
│   ├── stickman_renderer.py      # [CONTACT SHEET] Tạo nhanh ảnh xem trước bố cục
│   ├── icons.py / audio_mixer.py # Tiện ích Python hỗ trợ/legacy
│   └── requirements.txt          # Thư viện Python cho luồng Stickman
│
├── engines/whiteboard/           # [LUỒNG WHITEBOARD] Engine Python độc lập (.venv riêng)
│   ├── scripts/                  # script_to_srt, parse_srt, tts_narration, render_stream_whiteboard, merge_scenes...
│   ├── assets/                   # drawing-hand.png, preview.html
│   ├── .env / .env.example       # Cấu hình TTS (mặc định Edge TTS; hỗ trợ CIT / Vbee)
│   └── .venv/                    # Môi trường ảo Python riêng
│
├── projects/                     # Nơi lưu mọi dự án video (cả Stickman lẫn Whiteboard)
│   └── <project_id>/             # Ví dụ: video-001, video-002, test-whiteboard-01...
│
└── tests/                        # Bộ kiểm thử tự động (Node + Pytest)
```

---

## 2. Chạy Nhanh — Luồng Stickman (`engine/`)

Nguyên tắc: AI **chọn** giá trị từ danh mục đóng `engine/vocab.py`, engine Node **vẽ** SVG → PNG → MP4.

```bash
# 1. Xem danh mục giá trị hợp lệ & kiểm tra storyboard (Gate 4)
python -m engine.vocab
python -m engine.storyboard_validator projects/video-001/03_storyboard.json

# 2. [ĐƯỜNG CHÍNH] Render bản xem thử 6 cảnh đầu hoặc toàn bộ video (Node)
node engine/auto_director.mjs --project=video-001 --preview=6
node engine/auto_director.mjs --project=video-001

# Đặt FFMPEG_PATH nếu ffmpeg chưa có trong PATH (PowerShell):
# $env:FFMPEG_PATH="C:\path\to\ffmpeg.exe"; node engine/auto_director.mjs --project=video-001 --preview=6

# 3. [TÙY CHỌN] Tạo contact sheet tĩnh để duyệt nhanh bố cục
python engine/stickman_renderer.py --storyboard templates/storyboard-example.json --contact-sheet out/sheet.png

# 4. Chạy bộ kiểm thử tự động
npm test
python -m pytest tests/ -q
```

---

## 3. Chạy Nhanh — Luồng Whiteboard (`engines/whiteboard/`)

Toàn bộ script Whiteboard chạy qua `.venv` riêng trong `engines/whiteboard/`, lưu đầu ra tại `projects/<tên-dự-án>/`. Chi tiết đầy đủ quy trình nằm tại [`.agent/skills/whiteboard-video/SKILL.md`](.agent/skills/whiteboard-video/SKILL.md).

```bash
# Kiểm tra môi trường Whiteboard (Windows)
engines/whiteboard/.venv/Scripts/python.exe engines/whiteboard/scripts/prepare_env.py --check
```
