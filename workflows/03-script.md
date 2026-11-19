# Workflow 03: Retention Scriptwriting

## Mục Tiêu
Biên soạn kịch bản chi tiết từng từ, tối ưu hóa nhịp điệu cho TTS và giữ chân người xem liên tục từ đầu đến cuối.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-03-WRITER`
- **Tham chiếu**: `instructions/SCRIPT_GUIDELINES.md`, `templates/script-template.md`
- **Input**: Concept đã duyệt từ `01_research.md`

## Các Bước Thực Hiện
1. **Xây dựng Dàn ý chi tiết (Outline)**:
   - Phân bổ cấu trúc 5 phần (Hook -> Setup -> Core Value -> Climax -> CTA).
2. **Viết kịch bản chi tiết theo Scene**:
   - Viết theo biểu mẫu chuẩn `templates/script-template.md`.
   - Mỗi câu thoại gắn liền với một `SCENE_ID`.
   - Đưa chú thích hình ảnh `[VISUAL]` vào từng phân cảnh.
3. **Rà soát âm điệu đọc (Read-Aloud Check)**:
   - Đọc to kịch bản với tốc độ nói tự nhiên để phát hiện các câu dài dòng, khó thở hoặc từ ngữ trúc trắc.
4. **Bàn giao**: Lưu vào `projects/{project_id}/02_script.md`.
