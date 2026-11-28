# AGENT ROUTER — YOUTUBE CONTENT ENGINE

## 1. VIDEO TYPE ROUTING (MANDATORY FIRST STEP)

This repository contains **2 completely isolated video production engines**. Determine the requested type before starting any task:

| Request Type | Required Skill & Scope | Strictly Forbidden |
|---|---|---|
| **Stickman / Người que 2D** *(default YouTube Explainer)* | `.agent/skills/stickman-video/SKILL.md` + `instructions/`, `workflows/`, `templates/`, `engine/`, `projects/` | Do not read, run, or edit anything in `engines/whiteboard/`. |
| **Whiteboard / Vẽ tay bảng trắng** | `.agent/skills/whiteboard-video/SKILL.md` + `engines/whiteboard/` (`.venv`, `scripts/`, `assets/`) + `projects/` | Do not use Stickman pipeline (`engine/`, `instructions/VISUAL_STICKMAN.md`, `templates/storyboard-schema.json`). |

If the user has not specified which video type they want, ask one short clarifying question before creating files.

---

## 2. STICKMAN PIPELINE — INSTRUCTION PRIORITY

Follow instructions in this order (report conflicts clearly; never silently override prior decisions):
1. User's explicit instructions in the current task.
2. `instructions/GLOBAL_RULES.md`
3. `instructions/CONTENT_STRATEGY.md`
4. `instructions/SCRIPT_GUIDELINES.md`
5. Task-specific instructions (`STORYBOARD_RULES.md`, `VISUAL_STICKMAN.md`, `QUALITY_CHECKLIST.md`).
6. Corresponding workflow file (`workflows/01-research.md` … `08-publishing.md`).

---

## 3. WORKING PRINCIPLES

- **Evidence before assumptions:** Never fabricate statistics, research findings, competitor metrics, quotes, or sources. Distinguish verified facts from estimates/hypotheses.
- **No premature automation:** Do not modify engine code, install packages, or add paid APIs unless explicitly requested.
- **Preserve project structure:** Do not rename, delete, or overwrite user-created project files without approval.
- **Visuals are chosen, not drawn:** Pick `pose`, `mood`, `icon`, `camera`, `background`, and `sfx` strictly from `engine/vocab.py` (`python -m engine.vocab`). The Node renderer (`engine/auto_director.mjs`) draws everything.
- **Report honestly:** After each stage, report created/modified files, completed work, issues, items needing approval, and the next step. Never claim completion without verification.
- **Channel niche status:** Niche remains pending research validation until explicitly approved by the user in `01_research.md`.

---

## 4. PRODUCTION WORKFLOW & APPROVAL GATES

Execute stages strictly in order and **pause at every Gate for user sign-off**:

```text
01 Research → [Gate 1] → 02 Concept → [Gate 2] → 03 Script → [Gate 3]
→ 04 Storyboard → [Gate 4] → 05 Audio TTS
→ 06 Visual Render (contact sheet → preview 6 scenes → [Gate 4B] → full render)
→ 07 Edit & Mix → 08 QA & Publishing → [Gate 5]
```

### Agent Execution Matrix

| Stage | Agent ID | Role | Required Reading | Output (`projects/<project_id>/`) |
|---|---|---|---|---|
| **01. Research** | `AGENT-01-RESEARCH` | Content Researcher & Analyst | `workflows/01-research.md`, `GLOBAL_RULES.md`, `CONTENT_STRATEGY.md` | `01_research.md` |
| **02. Concept** | `AGENT-02-CONCEPT` | Strategist & Packaging | `workflows/02-concept.md`, `GLOBAL_RULES.md`, `CONTENT_STRATEGY.md`, `01_research.md` | `## Approved Concept` in `01_research.md` |
| **03. Script** | `AGENT-03-WRITER` | Scriptwriter (US English) | `workflows/03-script.md`, `GLOBAL_RULES.md`, `CONTENT_STRATEGY.md`, `SCRIPT_GUIDELINES.md`, `templates/script-template.md` | `02_script.md` *(frozen after Gate 3)* |
| **04. Storyboard** | `AGENT-04-DIRECTOR` | Storyboard & Visual Director | `workflows/04-storyboard.md`, `GLOBAL_RULES.md`, `STORYBOARD_RULES.md`, `VISUAL_STICKMAN.md`, `templates/storyboard-schema.json` | `03_storyboard.json` |
| **05. Voice/Audio** | `AGENT-05-VOICE` | Audio & TTS Engineer | `workflows/05-audio-tts.md`, `GLOBAL_RULES.md` | `audio_scenes/SCENE_XXX.*` |
| **06. Render** | `AGENT-06-RENDER` | Animation Renderer | `workflows/06-visual-render.md`, `GLOBAL_RULES.md`, `VISUAL_STICKMAN.md` | `video_scenes_vector/`, `output/video_preview_master.mp4`, `output/video_full_master.mp4` |
| **07. Edit/Mix** | `AGENT-07-EDITOR` | Video Editor & Audio Mixer | `workflows/07-editing-mix.md`, `GLOBAL_RULES.md` | `output/final_video.mp4` |
| **08. QA & Pub** | `AGENT-08-PUBLISH` | QA & Publishing Manager | `workflows/08-publishing.md`, `GLOBAL_RULES.md`, `QUALITY_CHECKLIST.md`, `CONTENT_STRATEGY.md`, `templates/metadata-template.md` | `qa_report.md` → `output/metadata.txt` *(only if QA passes)* |

---

## 5. GOVERNANCE & HANDOFF PROTOCOLS

1. **Scene ID Uniformity:** IDs assigned in `03_storyboard.json` (`SCENE_001`, `SCENE_002`...) must match identically across `audio_scenes/` and `video_scenes_vector/`.
2. **Script Freeze & Exception Rule:** After Gate 3, never silently alter `02_script.md`. If a critical TTS/factual error appears downstream, pause and ask user approval before editing `02_script.md`, regenerating audio, and updating `03_storyboard.json`.
3. **Strict QA-to-Publishing Order:** Inspect final video against `QUALITY_CHECKLIST.md` → write `qa_report.md` → **only if QA passes**, generate `output/metadata.txt`. **Never auto-upload or publish** without explicit user confirmation.
4. **Gate Criteria:**
   - **Gate 1:** User approves topic/niche in `01_research.md`.
   - **Gate 2:** User approves concept angle, 3 titles, and thumbnail idea (recorded under `## Approved Concept`).
   - **Gate 3:** User approves and freezes `02_script.md`.
   - **Gate 4:** `python -m engine.storyboard_validator projects/<project_id>/03_storyboard.json` reports `0 error(s)`.
   - **Gate 4B:** User approves preview (`node engine/auto_director.mjs --project=<id> --preview=6`) before full render.
   - **Gate 5:** `qa_report.md` passes with zero unresolved copyright or quality flags.
