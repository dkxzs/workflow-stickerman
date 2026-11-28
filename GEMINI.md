# GEMINI.md

Đọc và tuân thủ toàn bộ quy tắc Bước 0 tiền kỳ và định tuyến 2 luồng video (Stickman vs Whiteboard) trong [`AGENTS.md`](AGENTS.md) và [`AGENT_ROUTER.md`](AGENT_ROUTER.md).

- **Bước 0 (tìm ý tưởng / chưa có kịch bản chốt)** → BẮT BUỘC chạy `.agent/skills/content-strategist/SKILL.md` (hoặc `.agents/skills/content-strategist/SKILL.md`) để xuất `content-brief.md` cho người dùng duyệt trước.
- Video **người que / stickman (`Simply Stickman`)** → CHỈ chạy theo `.agent/skills/stickman-video/SKILL.md` (hoặc `.agents/skills/stickman-video/SKILL.md`). Không chạm `engines/whiteboard/`.
- Video **vẽ tay / whiteboard (`Simply Ink`)** → CHỈ chạy theo `.agent/skills/whiteboard-video/SKILL.md` (hoặc `.agents/skills/whiteboard-video/SKILL.md`). Không dùng pipeline HTML/SVG của stickman.
