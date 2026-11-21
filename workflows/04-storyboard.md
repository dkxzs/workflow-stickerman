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
   - `visual.stickman_pose`, `visual.mood`, `visual.position.x` (0.25 hoặc 0.75)
   - `visual.card`: `icon` + `title` (1-3 từ) + `subtitle` tùy chọn. Cảnh nào nhắc tới một khái niệm thì nên có card.
   - `visual.header`: tiêu đề đầu mục, chỉ dùng ở cảnh mở đầu mỗi phần.
   - `visual.camera`: `framing` + `movement`; luân phiên để không có hai cảnh liên tiếp trùng hệt nhau.
   - `audio.sfx` và `audio.bgm_mood`.
   - Luân phiên pose và đặt hero ở hai bên (0.25 / 0.75) để video có nhịp.
4. **Kiểm tra bằng validator (Gate 4)**:
   ```bash
   python -m engine.storyboard_validator projects/{project_id}/03_storyboard.json
   ```
   - Sửa tới khi `0 error(s)`. Thông báo lỗi nêu rõ cảnh, trường, giá trị sai và các giá trị cho phép.
5. **Bàn giao**: lưu vào `projects/{project_id}/03_storyboard.json`.
