# Workflow 05: Audio Synthesis (TTS)

## Mục Tiêu
Tạo âm thanh giọng đọc AI chất lượng cao cho từng phân cảnh và cập nhật thời lượng chính xác vào Storyboard.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-05-VOICE`
- **Input**: `projects/{project_id}/03_storyboard.json`
- **Output**: Tệp `.wav` từng scene (`{SCENE_ID}.wav`) trong `projects/{project_id}/audio_scenes/`

## Các Bước Thực Hiện
1. **Chuẩn bị văn bản đọc**:
   - Xử lý các từ ngữ đặc biệt, dấu ngắt nghỉ `[pause]`.
2. **Sinh âm thanh qua TTS Engine**:
   - Sử dụng giọng đọc đã được cấu hình chuẩn (tự nhiên, truyền cảm, nhịp điệu ổn định).
   - Xuất file âm thanh theo định dạng `{SCENE_ID}.wav`.
3. **Đo đạc thời lượng thực tế (Duration Sync)**:
   - Đo thời lượng chính xác của từng file âm thanh vừa sinh ra.
   - Cập nhật trường `actual_duration_sec` vào lại `03_storyboard.json` để đồng bộ hoàn hảo với visual.
