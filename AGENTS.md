# AGENTS.md — Quy Tắc Điều Phối Gốc

Hướng dẫn cho mọi AI coding agent (Antigravity, Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI…) làm việc trong `youtube-content-engine`.

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
- Skill người que: [`.agent/skills/stickman-video/SKILL.md`](.agent/skills/stickman-video/SKILL.md) / [`.agents/skills/stickman-video/SKILL.md`](.agents/skills/stickman-video/SKILL.md)
- Skill vẽ tay: [`.agent/skills/whiteboard-video/SKILL.md`](.agent/skills/whiteboard-video/SKILL.md) / [`.agents/skills/whiteboard-video/SKILL.md`](.agents/skills/whiteboard-video/SKILL.md)
