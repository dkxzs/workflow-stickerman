# AGENTS.md — Quy Tắc Điều Phối Gốc

Hướng dẫn cho mọi AI coding agent (Antigravity, Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI…) làm việc trong `youtube-content-engine`.

## [BƯỚC 0: CHỌN CHỦ ĐỀ & ĐỊNH HÌNH KỊCH BẢN] (Bắt buộc khi chưa có kịch bản chốt)

Khi người dùng yêu cầu tìm ý tưởng, chọn chủ đề, hoặc lên kế hoạch video mới (chưa có kịch bản/SRT chốt sẵn):
- **BẮT BUỘC** chạy skill `.agent/skills/content-strategist/SKILL.md` (hoặc `.agents/skills/content-strategist/SKILL.md`) trước để kiểm chứng web theo cổng 4 chốt Pass/Fail và xuất `projects/<project_id>/content-brief.md` cho người dùng duyệt.
- Chỉ sau khi người dùng duyệt `content-brief.md`, mới bàn giao sang `stickman-video` (`Simply Stickman`) hoặc `whiteboard-video` (`Simply Ink`) để viết kịch bản chi tiết và render.
- Tuyệt đối không sửa code trong `engine/` và `engines/whiteboard/`.

## Định tuyến loại video (Bắt buộc)

Dự án có **2 luồng dựng video độc lập, cô lập 100%**. Khi người dùng yêu cầu làm video, chọn đúng luồng ngay từ đầu:

1. **Khi yêu cầu làm video người que / stickman:**
   - **CHỈ** đọc và thực thi theo `.agent/skills/stickman-video/SKILL.md` (hoặc `.agents/skills/stickman-video/SKILL.md`) cùng quy trình chuẩn trong `AGENT_ROUTER.md`, `instructions/`, `workflows/`, `templates/`, `engine/`.
   - **Không chạm** vào `engines/whiteboard/`.

2. **Khi yêu cầu làm video vẽ tay / whiteboard / bảng trắng:**
   - **CHỈ** đọc và thực thi theo `.agent/skills/whiteboard-video/SKILL.md` (hoặc `.agents/skills/whiteboard-video/SKILL.md`).
   - Toàn bộ script và môi trường Python chạy độc lập bằng `engines/whiteboard/.venv/Scripts/python.exe` (Windows) hoặc `engines/whiteboard/.venv/bin/python` (macOS/Linux).
   - **Không dùng** pipeline HTML/SVG/Node của stickman (`engine/`, `instructions/VISUAL_STICKMAN.md`, `templates/storyboard-schema.json`).

3. **Nếu người dùng chưa nêu rõ loại video:** hỏi xác nhận ngắn gọn xem muốn làm **người que (stickman)** hay **vẽ tay (whiteboard)** trước khi bắt đầu.

## Tài liệu tham chiếu

- Điều phối tổng thể & bảng phân vai chi tiết: [`AGENT_ROUTER.md`](AGENT_ROUTER.md)
- Skill tiền kỳ (Bước 0): [`.agent/skills/content-strategist/SKILL.md`](.agent/skills/content-strategist/SKILL.md) / [`.agents/skills/content-strategist/SKILL.md`](.agents/skills/content-strategist/SKILL.md)
- Skill người que (`Simply Stickman`): [`.agent/skills/stickman-video/SKILL.md`](.agent/skills/stickman-video/SKILL.md) / [`.agents/skills/stickman-video/SKILL.md`](.agents/skills/stickman-video/SKILL.md)
- Skill vẽ tay (`Simply Ink`): [`.agent/skills/whiteboard-video/SKILL.md`](.agent/skills/whiteboard-video/SKILL.md) / [`.agents/skills/whiteboard-video/SKILL.md`](.agents/skills/whiteboard-video/SKILL.md)
