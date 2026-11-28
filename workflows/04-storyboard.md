# Workflow 04: Storyboard Generation

## Mục Tiêu
Bóc tách kịch bản thành tệp dữ liệu phân cảnh có cấu trúc (`storyboard.json`) để làm đầu vào trực tiếp cho engine âm thanh và hình ảnh.
Storyboard chỉ dùng **giá trị có trong danh mục của engine** (`python -m engine.vocab`). Không tự đặt tên pose, icon, camera mới.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-04-DIRECTOR`
- **Tham chiếu**: `instructions/STORYBOARD_RULES.md`, `templates/storyboard-schema.json`, `templates/storyboard-example.json` (bản mẫu đủ trường, chạy được)
- **Input**: `projects/{project_id}/02_script.md`

## Các Bước Thực Hiện
1. **Xem danh mục giá trị hợp lệ**: chạy `python -m engine.vocab` và mở `templates/storyboard-example.json` làm mẫu.
2. **Trích xuất phân cảnh**: đọc từng `SCENE_ID` trong `02_script.md`. Mỗi cảnh một ý, tối đa 3.5 giây (tách `SCENE_005_A`, `SCENE_005_B` nếu dài hơn).
3. **Gán thuộc tính cho từng cảnh** (chọn từ danh mục, không tự bịa):
   - `visual.layout`: luân phiên giữa `story_action` (kể chuyện toàn cảnh không cần card), `dialogue` (2+ nhân vật trong `visual.characters[]`), `closeup` (cận mặt biểu cảm mạnh), `explainer_split` (nhân vật + thẻ `visual.card` khi giải thích khái niệm), hoặc `custom_image` (ảnh minh họa AI đồng phong cách kèm zoom/pan).
   - `visual.stickman_pose`, `visual.mood`, `visual.outfit`, `visual.hair`, `visual.hand_prop`, `visual.position.x`.
   - `visual.background`: chọn từ thư viện nền màu `assets/backgrounds/` (`cozy_office`, `city_street`, `park_sunny`, `cozy_cafe`, `stage_spotlight`, `bedroom_night`…) hoặc đường dẫn ảnh nền tùy chỉnh.
   - `visual.card`: chỉ dùng ở các cảnh `explainer_split` khi thực sự cần hiển thị khái niệm/số liệu (1-3 từ), **không** ép mọi cảnh đều có card.
   - `visual.header`: tiêu đề đầu mục, chỉ dùng ở cảnh mở đầu mỗi phần.
   - `visual.camera`: `framing` + `movement`; luân phiên để không có hai cảnh liên tiếp trùng hệt nhau.
   - `audio.sfx` và `audio.bgm_mood`.
4. **Kiểm tra bằng validator (Gate 4)**:
   ```bash
   python -m engine.storyboard_validator projects/{project_id}/03_storyboard.json
   ```
   - Sửa tới khi `0 error(s)`. Thông báo lỗi nêu rõ cảnh, trường, giá trị sai và các giá trị cho phép.
5. **Bàn giao**: lưu vào `projects/{project_id}/03_storyboard.json`.
