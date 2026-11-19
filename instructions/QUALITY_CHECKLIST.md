# QUALITY CHECKLIST — PUBLICATION GATEWAY AND AUDIT STANDARDS

## 1. PURPOSE AND AUDIT PROTOCOL

This document defines the strict, measurable quality assurance standards required before any video can be approved for publishing. It governs **Gate 5 (Publication Readiness)** and is executed by `AGENT-08-PUBLISH` in accordance with `AGENT_ROUTER.md` and `workflows/08-publishing.md`.

Quality is non-negotiable. Every finished production must undergo systematic auditing against this checklist, and findings must be recorded in `projects/<project_id>/qa_report.md`. 

### The Gate 5 Rule
No video may be published, scheduled, or set public on YouTube without an approved `qa_report.md` showing an overall status of **PASS**, followed by **explicit user confirmation**.

```
+------------------------------------+
|  Draft Master:                     |
|  output/final_video.mp4            |
+------------------------------------+
                  |
                  v
+------------------------------------+
|  AGENT-08-PUBLISH                  |
|  (Applies QUALITY_CHECKLIST)       |
+------------------------------------+
                  |
                  v
+------------------------------------+
|  Audit Report:                     |
|  projects/<id>/qa_report.md        |
+------------------------------------+
          /                \
   [ PASS ]                [ FAIL ]
        |                      |
        v                      v
Generate metadata.txt    Halt release; route defects
& await User Sign-off    back to responsible agent
```

---

## 2. SEVERITY LEVELS AND PASS/FAIL CRITERIA

Every issue identified during the audit must be classified into one of three standardized severity levels:

### 2.1 Critical (Showstopper)
- **Definition**: Any defect that directly violates factual truth, breaks technical playback, infringes copyright, breaches platform policy, introduces audio/visual desynchronization, drops narration, or compromises the channel's 2D Stickman brand identity.
- **Resolution**: **Zero tolerance**. A video containing even a single unresolved Critical defect **MUST FAIL**. The defect must be corrected, the affected assets re-rendered, and the audit repeated.

### 2.2 Major (High Priority)
- **Definition**: Significant flaws that harm viewer retention, audio comfort, or narrative clarity without causing technical failure or policy breaches (e.g., noticeably slow pacing in a specific section, an awkward pause between sentences, slightly muffled sound effects, or an unclear chart label).
- **Resolution**: Must be fixed **OR** receive explicit written approval from the user with a documented justification recorded in `qa_report.md`.

### 2.3 Minor (Low Priority Polish)
- **Definition**: Trivial cosmetic discrepancies that do not measurably harm viewer comprehension or overall production value (e.g., a tiny alignment offset in a background prop, a subtle transition that could be 2 frames faster).
- **Resolution**: Documented in the audit report; may be resolved in future iterations or accepted as-is without blocking release.

### 2.4 Final Certification Rules
- **OVERALL STATUS: PASS** — 0 Critical defects AND 0 unresolved Major defects. All 8 checklist stages verified.
- **OVERALL STATUS: FAIL** — ≥ 1 Critical defect OR ≥ 1 unapproved Major defect. Release is blocked.

---

## 3. CHECKLIST STAGES

### Stage A: Research Quality & Factual Verification
- [ ] **A.1 Source Verification**: All factual claims, scientific mechanisms, historical events, and numbers are backed by verified sources in `01_research.md`.
- [ ] **A.2 Cross-Checking**: Controversial, surprising, or counter-intuitive claims are corroborated across multiple reputable references.
- [ ] **A.3 Uncertainty Communication**: Where scientific consensus is divided or historical data is estimated, the narration explicitly communicates the uncertainty rather than stating hypothesis as fact.
- [ ] **A.4 Zero Fabrication**: Zero invented quotes, fake statistics, fabricated historical anecdotes, or hallucinated citations.
- [ ] **A.5 Valid Logic**: Explanations follow sound cause-and-effect reasoning without misleading leaps in logic.

### Stage B: Concept and Script Quality
- [ ] **B.1 Central Idea**: The video delivers on one clear, cohesive core message as defined in the approved concept.
- [ ] **B.2 Truthful Opening Hook**: The opening 15–30 seconds creates immediate, genuine curiosity without deceptive clickbait or false promises.
- [ ] **B.3 Natural American English**: Narration uses fluent, conversational American English free of awkward phrasing or robotic AI clichés.
- [ ] **B.4 Pacing & Retention**: New information, examples, or perspective shifts occur every 20–30 seconds.
- [ ] **B.5 Value Over Filler**: Zero unnecessary repetition, rhetorical padding, or fluff inserted merely to lengthen runtime.
- [ ] **B.6 Tasteful Humor**: Humor (2–4 moments) is natural, witty, context-appropriate, and does not compromise factual clarity or viewer respect.
- [ ] **B.7 Satisfying Conclusion**: The conclusion answers the opening inquiry, summarizes the core takeaway, and leaves a memorable final thought.

### Stage C: Storyboard & Data Integrity
- [ ] **C.1 100% Narration Coverage**: Every word from the approved `02_script.md` is present in `03_storyboard.json` without omissions or duplication.
- [ ] **C.2 Uniform Scene IDs**: Scene identifiers (`SCENE_001`, `SCENE_002`, etc.) match across storyboard JSON, audio clips, and video renders.
- [ ] **C.3 Visual Relevance**: Visual descriptions directly support and clarify the spoken words rather than acting as random decoration.
- [ ] **C.4 Continuity**: Characters, props, and environments maintain logical continuity between adjacent scenes.
- [ ] **C.5 Schema Compliance**: `03_storyboard.json` is strictly valid JSON conforming to `templates/storyboard-schema.json`, with valid `estimated_duration_sec` and populated `actual_duration_sec`.

### Stage D: Audio Synthesis & Mixing Quality
- [ ] **D.1 Pronunciation Accuracy**: TTS pronounces all words, proper nouns, dates, numbers, and technical terminology correctly.
- [ ] **D.2 Natural Rhythm & Inflection**: Narration flows smoothly with natural pauses at punctuation; no robotic stuttering or cutoffs.
- [ ] **D.3 Audio Integrity**: Zero audio clipping, digital distortion, clicks, pops, or harsh sibilance.
- [ ] **D.4 Loudness Standards**: Voice track is consistent and balanced across all scenes (target ~ -14 LUFS integrated).
- [ ] **D.5 Music & SFX Balance**: Background music is ducked cleanly beneath spoken narration (-24 to -28 LUFS); sound effects are punchy but not deafening (-18 to -20 LUFS).

### Stage E: Visual & Animation Standards
- [ ] **E.1 Pure 2D Stickman Style**: All scenes adhere strictly to `instructions/VISUAL_STICKMAN.md`.
- [ ] **E.2 Zero Whiteboard Artifacts**: Absolutely no visible drawing hands, simulated whiteboard pen strokes, or marker-drawing effects.
- [ ] **E.3 Character Integrity**: Stickman proportions (head-to-body ratio, limb lengths, stroke widths) remain identical across all scenes.
- [ ] **E.4 Motion Smoothness**: Transitions between poses are snappy and clean; zero broken interpolations, floating limbs, or erratic jumps.
- [ ] **E.5 Object Continuity**: Props do not appear or disappear without an animated event (e.g., pop-in, scale bounce, slide-in, dissolve).
- [ ] **E.6 Safe Margins**: All critical text, labels, and character heads reside safely within the 80% title/action safe area, away from YouTube UI overlays.
- [ ] **E.7 Zero Blank Frames**: No unintentional black frames, missing background canvas, or empty flashes between scenes.

### Stage F: Video Assembly & Technical Master
- [ ] **F.1 Frame-Accurate Synchronization**: Visual scene durations match the exact audio duration (`actual_duration_sec`) with zero cumulative drift.
- [ ] **F.2 Resolution & Frame Rate**: Output file is precisely 1920 × 1080 at 30.00 FPS, progressive scan.
- [ ] **F.3 Clean Transitions**: Cuts, fades, and wipes execute smoothly without stutter or frame tearing.
- [ ] **F.4 Encoding Integrity**: Video codec is H.264 (MP4 container), AAC audio at 192+ kbps, high profile, web-optimized.
- [ ] **F.5 Complete Playback**: The master video (`output/final_video.mp4`) plays seamlessly from 00:00 to the final frame without crashing, freezing, or artifacting.

### Stage G: Copyright, Brand Safety & YouTube Monetization
- [ ] **G.1 Originality**: Narrative structure, phrasing, and visual staging are completely original. No stolen competitor assets or word-for-word scripts.
- [ ] **G.2 Commercial Rights**: All background music tracks and sound effects are licensed or verified public domain / royalty-free for commercial YouTube use.
- [ ] **G.3 Advertiser Friendliness**: Content complies with YouTube Advertiser-Friendly Content Guidelines (no gratuitous violence, hate speech, dangerous acts, or adult content).
- [ ] **G.4 No Unsubstantiated Guarantees**: Documentation and script avoid false promises regarding monetization approval or guaranteed financial/personal results.

### Stage H: Packaging, Metadata & Release Readiness
- [ ] **H.1 Honest & Compelling Title**: Title is under 60 characters, captures curiosity, and accurately represents the video topic.
- [ ] **H.2 High-Contrast Thumbnail**: Thumbnail is readable at mobile scale, contains 3 or fewer focal elements, uses high-contrast Stickman art, and matches the video content.
- [ ] **H.3 Complete Description**: Includes a strong 3-line hook, verified timestamps/chapters, relevant context, and search-friendly keywords.
- [ ] **H.4 QA Report Documented**: Detailed audit results logged in `projects/<project_id>/qa_report.md`.
- [ ] **H.5 Final User Authorization**: Explicit user approval obtained prior to uploading or setting public.

---

## 4. QA REPORT TEMPLATE (`projects/<project_id>/qa_report.md`)

When auditing a video, copy and complete this exact template in the project directory:

```markdown
# QUALITY ASSURANCE REPORT (QA GATE 5)

## 1. Project Information
- **Project ID**: `video-XXX`
- **Video Title**: [Working or Final Title]
- **Audit Date**: YYYY-MM-DD
- **Auditing Agent**: `AGENT-08-PUBLISH`
- **Master Video File**: `output/final_video.mp4`
- **Master Duration**: MM:SS (Total seconds: XXX.X s)
- **Overall QA Status**: [PASS / FAIL]

---

## 2. Executive Summary
[Brief paragraph summarizing the overall quality of the production, highlights, and any notable issues addressed during the audit.]

---

## 3. Stage-by-Stage Audit Results

| Stage | Audit Focus | Result | Critical Defects | Major Defects | Minor Defects |
|---|---|---|---|---|---|
| **A** | Research & Factual Accuracy | [PASS/FAIL] | 0 | 0 | 0 |
| **B** | Concept & Script Quality | [PASS/FAIL] | 0 | 0 | 0 |
| **C** | Storyboard & Data Integrity | [PASS/FAIL] | 0 | 0 | 0 |
| **D** | Voice Synthesis & Audio Mix | [PASS/FAIL] | 0 | 0 | 0 |
| **E** | Visual & Animation Standards| [PASS/FAIL] | 0 | 0 | 0 |
| **F** | Video Assembly & Master Specs| [PASS/FAIL] | 0 | 0 | 0 |
| **G** | Copyright & Monetization | [PASS/FAIL] | 0 | 0 | 0 |
| **H** | Packaging & YouTube SEO | [PASS/FAIL] | 0 | 0 | 0 |

---

## 4. Detailed Findings & Defect Log

### 4.1 Critical Issues (Must be 0 for PASS)
*None* (or list specific defects with timestamps, scene IDs, and required corrective actions).

### 4.2 Major Issues (Requires Fix or User Sign-Off)
*None* (or list specific issues with explanation and impact analysis).

### 4.3 Minor Polish Notes
- [e.g., SCENE_004: Background cloud could be moved 20px higher in future template updates.]

---

## 5. Technical Verification Log

| Parameter | Specification | Actual Measured | Status |
|---|---|---|---|
| Resolution | 1920 × 1080 | [e.g., 1920x1080] | [MATCH / MISMATCH] |
| Frame Rate | 30.00 FPS | [e.g., 30.00 fps] | [MATCH / MISMATCH] |
| Aspect Ratio | 16:9 | 16:9 | MATCH |
| Total Scenes | [N] scenes | [N] scenes rendered | MATCH |
| Audio/Video Sync Drift | Max ±0.05s | [Measured drift, e.g., 0.00s] | PASS |
| Whiteboard Prohibited Check | Zero hand-drawing | Verified 100% 2D Stickman | PASS |

---

## 6. Final Certification & Sign-off

- **Auditor Certification**:
  I confirm that this video has been systematically inspected against `instructions/QUALITY_CHECKLIST.md`. All facts, audio levels, visuals, and technical files have been verified.
  - Overall Verdict: **[PASS / FAIL]**

- **User Sign-Off**:
  - Publication Approved by User: [ ] YES   [ ] NO
  - User Signature / Confirmation Date: [Pending User Review]
```
