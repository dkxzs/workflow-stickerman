# GLOBAL RULES — YOUTUBE CONTENT ENGINE

> **Scope:** Applies to the **Stickman Explainer** pipeline (`engine/`, `instructions/`, `workflows/`). For the isolated **Whiteboard** pipeline, follow `.agent/skills/whiteboard-video/SKILL.md`.

## 1. LANGUAGE & TARGET AUDIENCE

- **Narration & Metadata:** Natural American English by default (unless the user explicitly requests another language). Use clear, conversational wording—avoid stiff academic phrasing or literal translations.
- **Internal Docs:** English or Vietnamese as appropriate.
- **Audience:** English-speaking YouTube viewers (primarily US, accessible internationally). Use relatable everyday examples and clearly explain unfamiliar concepts.

## 2. DEFAULT VIDEO FORMAT (STICKMAN)

- **Platform:** YouTube (long-form explainer).
- **Specs:** `1920 × 1080`, `30 FPS`, `16:9`, 2D Stickman animation.
- **Duration:** Driven by topic and narrative (6–8 minutes is a planning reference, not a hard limit).

## 3. CONTENT QUALITY & EXECUTION STANDARDS

Every video must satisfy:
1. One clear central topic with genuine educational or entertainment value.
2. Coherent arc (compelling hook → clear question/problem → progressive explanation with examples → satisfying conclusion) without bloated intros.
3. Zero unnecessary repetition; smooth logical transitions.
4. **Physical Coherence & Meticulous Execution:** Environments, props, and proportions must be clean, logically placed, and consistent across cuts. No sloppy geometry or disappearing props.
5. **Expressive Character Acting:** Plan concrete acting beats and micro-expressions (see `instructions/STORYBOARD_RULES.md`) rather than static poses.

## 4. FACTUAL ACCURACY & ORIGINALITY

- **Accuracy first:** Verify claims against primary/reputable sources; distinguish facts from hypotheses. Never fabricate statistics, quotes, historical events, or citations. Omit or qualify unverifiable claims.
- **Originality:** Never copy another creator's script, unique jokes, visual sequences, or thumbnail composition. Competitor research is strictly for identifying audience demand and content gaps.

## 5. HUMOR & TONE

- Default tone: intelligent, approachable, conversational, lightly witty.
- Use clever comparisons, relatable situations, and light sarcasm that support the explanation.
- Avoid forced jokes, outdated memes, excessive slang, or offensive humor. The video must remain valuable even without the jokes.

## 6. VISUAL & AUDIO CONSISTENCY

- **Visuals (Stickman pipeline):** Maintain a clean, consistent 2D Stickman identity using `engine/vocab.py` assets; avoid mixing unrelated visual styles inside a Stickman video.
- **Audio:** Prioritize natural delivery, accurate pronunciation, balanced levels, and subtle BGM that never overpowers narration. Always inspect actual rendered audio rather than trusting blind presets.

## 7. TECHNICAL & MONETIZATION RULES

- **Tools:** Prefer free, local tools (Node.js, Python, Edge-TTS, FFmpeg). Avoid paid APIs or unnecessary packages without explicit user approval. Use cross-platform relative paths (never hardcode OS-specific paths like `D:\` inside code).
- **Monetization & Copyright:** Build for long-term YouTube monetization—avoid reused/low-effort content, unlicensed music/visuals, misleading clickbait, or exaggerated claims.
- **Quality Priority Order:** `1. Factual accuracy` → `2. Viewer value` → `3. Narrative quality` → `4. Audio/Visual clarity` → `5. Efficiency` → `6. Speed`.
