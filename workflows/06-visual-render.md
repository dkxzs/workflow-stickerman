# Workflow 06: Visual & Animation Render

## Mục Tiêu
Render các đoạn video clip hoặc hình ảnh động Stickman theo từng phân cảnh đã mô tả trong Storyboard.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-06-RENDER`
- **Tham chiếu**: `instructions/VISUAL_STICKMAN.md`
- **Input**: `projects/{project_id}/03_storyboard.json`
- **Output**: Các tệp video từng scene (`{SCENE_ID}.mp4`) trong `projects/{project_id}/video_scenes/`

## Các Bước Thực Hiện
1. **Nạp thông số phân cảnh**:
   - Đọc tư thế (`stickman_pose`), hành động, tọa độ vị trí (`position`), đạo cụ, camera (`framing`, `movement`) và thời lượng thực tế (`actual_duration_sec`) của từng scene từ storyboard.
2. **Dựng hoạt cảnh (Scene Rendering)**:
   - Render hình ảnh nhân vật que, đường nét, hiệu ứng chữ hoặc icon minh họa.
   - Áp dụng các hiệu ứng máy quay (Zoom-in, Pan) để loại bỏ hoàn toàn khung hình tĩnh.
3. **Xuất video phân cảnh**:
   - Xuất file `{SCENE_ID}.mp4` với đúng thời lượng của file âm thanh tương ứng (`actual_duration_sec`).
