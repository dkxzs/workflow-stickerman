# Workflow 04: Storyboard Generation

## Mục Tiêu
Bóc tách kịch bản thành tệp dữ liệu phân cảnh có cấu trúc (`storyboard.json`) để làm đầu vào trực tiếp cho engine âm thanh và hình ảnh.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-04-DIRECTOR`
- **Tham chiếu**: `instructions/STORYBOARD_RULES.md`, `templates/storyboard-schema.json`
- **Input**: `projects/{project_id}/02_script.md`

## Các Bước Thực Hiện
1. **Trích xuất phân cảnh**:
   - Đọc từng `SCENE_ID` trong `02_script.md`.
2. **Gán thuộc tính hoạt họa & âm thanh**:
   - Chọn `stickman_pose` từ danh mục trong `instructions/VISUAL_STICKMAN.md`.
   - Xác định chuyển động `action` và đạo cụ `props`.
   - Chọn hiệu ứng âm thanh `sfx` và tâm trạng nhạc nền `bgm_mood`.
3. **Kiểm tra tính hợp lệ của Schema**:
   - Đảm bảo file JSON tuân thủ đầy đủ định dạng trong `templates/storyboard-schema.json`.
4. **Bàn giao**: Lưu vào `projects/{project_id}/03_storyboard.json`.
