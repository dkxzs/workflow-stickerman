# Workflow 08: Quality Assurance & Publishing

## Mục Tiêu
Kiểm định toàn diện chất lượng video theo Checklist, hoàn thiện bộ metadata YouTube SEO và tiến hành xuất bản.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-08-PUBLISH`
- **Tham chiếu**: `instructions/QUALITY_CHECKLIST.md`, `templates/metadata-template.md`
- **Input**: Video master tại `output/`, `01_research.md`

## Các Bước Thực Hiện
1. **Kiểm tra chất lượng (QA Audit)**:
   - Đối chiếu video xuất xưởng với 4 cổng trong `instructions/QUALITY_CHECKLIST.md`.
   - Ghi lại kết quả kiểm tra vào `projects/{project_id}/qa_report.md`.
2. **Chuẩn bị Metadata chuẩn SEO**:
   - Điền đầy đủ thông tin vào mẫu `templates/metadata-template.md`.
   - Tạo các mốc thời gian (Timestamps / Chapters) chính xác theo video master.
3. **Đăng tải & Thiết lập YouTube**:
   - Tải video lên YouTube ở chế độ Không công khai (Unlisted) để kiểm tra bản quyền (Content ID Check).
   - Đặt lịch phát hành chính thức sau khi bản quyền sạch 100%.
