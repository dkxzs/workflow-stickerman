---
name: stickman-video
description: Sản xuất video giải thích hoạt họa người que 2D (Stickman Explainer) cho YouTube theo quy trình 8 bước có kiểm soát chất lượng và các cổng duyệt (Approval Gates). Dùng khi người dùng yêu cầu làm video người que, stickman, hoặc video YouTube explainer theo luồng chuẩn của dự án. Tuyệt đối cô lập, không chạm vào `engines/whiteboard/`.
---

# Stickman Video Skill (Luồng Người Que 2D)

Luồng sản xuất video **2D Stickman Explainer** chuẩn hóa của `youtube-content-engine` (1920×1080, 30 FPS, ngôn ngữ mặc định tiếng Anh Mỹ tự nhiên trừ khi người dùng yêu cầu ngôn ngữ khác).

> **Quy tắc cô lập:** Luồng này **chỉ** sử dụng `instructions/`, `workflows/`, `templates/`, `engine/`, `assets/` và `projects/`. **Tuyệt đối không** đọc, gọi script, hoặc ghi tệp vào `engines/whiteboard/`.

---

## 1. Thứ tự ưu tiên tài liệu

1. Yêu cầu trực tiếp của người dùng trong tác vụ hiện tại.
2. `instructions/GLOBAL_RULES.md`
3. `instructions/CONTENT_STRATEGY.md`
4. `instructions/SCRIPT_GUIDELINES.md`
5. `instructions/STORYBOARD_RULES.md`, `instructions/VISUAL_STICKMAN.md`, `instructions/QUALITY_CHECKLIST.md`
6. Tệp quy trình tương ứng trong `workflows/01-research.md` … `workflows/08-publishing.md`
7. Chi tiết đầy đủ điều phối nằm tại `AGENT_ROUTER.md`.

---

## 2. Quy trình 8 bước & Cổng duyệt (Approval Gates)

Thực hiện tuần tự, **dừng chờ người dùng duyệt ở mỗi Gate** trước khi sang bước kế tiếp:

```text
01 Research → [Gate 1] → 02 Concept → [Gate 2] → 03 Script → [Gate 3]
→ 04 Storyboard → [Gate 4] → 05 Audio TTS
→ 06 Visual Render (contact sheet → [Gate 4B] → full render)
→ 07 Editing & Mix → 08 QA & Publishing → [Gate 5]
```

### Bảng điều phối vai trò AI

| Bước | Vai trò AI (`AGENT_ROUTER.md`) | Tài liệu bắt buộc đọc | Đầu ra (`projects/<project_id>/`) |
|---|---|---|---|
| **01. Research** | `AGENT-01-RESEARCH` — Content Researcher & Market Analyst | `workflows/01-research.md`, `GLOBAL_RULES.md`, `CONTENT_STRATEGY.md` | `01_research.md` |
| **02. Concept** | `AGENT-02-CONCEPT` — Content Strategist & Packaging | `workflows/02-concept.md`, `GLOBAL_RULES.md`, `CONTENT_STRATEGY.md` | `## Approved Concept` trong `01_research.md` |
| **03. Script** | `AGENT-03-WRITER` — Scriptwriter | `workflows/03-script.md`, `SCRIPT_GUIDELINES.md`, `templates/script-template.md` | `02_script.md` *(khóa sau Gate 3)* |
| **04. Storyboard** | `AGENT-04-DIRECTOR` — Storyboard Artist & Visual Director | `workflows/04-storyboard.md`, `STORYBOARD_RULES.md`, `VISUAL_STICKMAN.md`, `templates/storyboard-schema.json` | `03_storyboard.json` |
| **05. Audio TTS** | `AGENT-05-VOICE` — Audio & TTS Engineer | `workflows/05-audio-tts.md`, `GLOBAL_RULES.md` | `audio_scenes/SCENE_XXX.*` |
| **06. Visual Render** | `AGENT-06-RENDER` — Animation Renderer | `workflows/06-visual-render.md`, `VISUAL_STICKMAN.md` | Contact sheet → `video_scenes/SCENE_XXX.mp4` |
| **07. Edit & Mix** | `AGENT-07-EDITOR` — Video Editor & Audio Mixer | `workflows/07-editing-mix.md`, `GLOBAL_RULES.md` | `output/final_video.mp4` |
| **08. QA & Pub** | `AGENT-08-PUBLISH` — Quality Controller & Publishing | `workflows/08-publishing.md`, `QUALITY_CHECKLIST.md`, `templates/metadata-template.md` | `qa_report.md` → `output/metadata.txt` *(chỉ khi QA pass)* |

---

## 3. Nguyên tắc cốt lõi & Lệnh thực thi

- **Chọn, không tự vẽ:** AI chỉ chọn `pose`, `mood`, `icon`, `camera`, `sfx` từ danh mục đóng trong `engine/vocab.py`; bộ dựng trong `engine/` sẽ vẽ SVG → PNG → MP4.
- **Đồng nhất mã cảnh:** `SCENE_001`, `SCENE_002`… trong `03_storyboard.json` phải khớp tuyệt đối với tệp trong `audio_scenes/` và `video_scenes/`.
- **Đóng băng kịch bản:** Sau Gate 3, không tự ý sửa lời dẫn trong `02_script.md` mà không có xác nhận từ người dùng.
- **Chuẩn schema:** Mọi storyboard phải hợp lệ theo `templates/storyboard-schema.json` (tham khảo mẫu `templates/storyboard-example.json`).

### Lệnh thường dùng (chạy từ thư mục gốc dự án)

```bash
# 1. Xem danh mục giá trị hợp lệ & kiểm tra storyboard (Gate 4)
python -m engine.vocab
python -m engine.storyboard_validator projects/<project_id>/03_storyboard.json

# 2. [TÙY CHỌN] Tạo contact sheet tĩnh để duyệt trước (Gate 4B)
python engine/stickman_renderer.py --storyboard projects/<project_id>/03_storyboard.json --contact-sheet projects/<project_id>/contact_sheet.png

# 3. [ĐƯỜNG CHÍNH] Render bản xem thử 6 cảnh đầu hoặc toàn bộ video (Node SVG + Sharp + FFmpeg)
node engine/auto_director.mjs --project=<project_id> --preview=6
node engine/auto_director.mjs --project=<project_id>

# Nếu ffmpeg chưa có trong PATH, truyền FFMPEG_PATH:
# PowerShell: $env:FFMPEG_PATH="C:\path\to\ffmpeg.exe"; node engine/auto_director.mjs --project=<project_id>

# 4. Chạy bộ kiểm thử tự động của engine Stickman
node --test tests/*.test.mjs
python -m pytest tests/ -q
```
