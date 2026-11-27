# GEMINI.md

Đọc và tuân thủ toàn bộ quy tắc định tuyến 2 luồng video (Stickman vs Whiteboard) trong [`AGENTS.md`](AGENTS.md) và [`AGENT_ROUTER.md`](AGENT_ROUTER.md).

- Video **người que / stickman** → CHỈ chạy theo `.agent/skills/stickman-video/SKILL.md` (hoặc `.agents/skills/stickman-video/SKILL.md`). Không chạm `engines/whiteboard/`.
- Video **vẽ tay / whiteboard** → CHỈ chạy theo `.agent/skills/whiteboard-video/SKILL.md` (hoặc `.agents/skills/whiteboard-video/SKILL.md`). Không dùng pipeline HTML/SVG của stickman.
