# GLOBAL RULES — YOUTUBE CONTENT ENGINE

## 1. LANGUAGE

- All published narration must use natural American English unless a project explicitly requires another language.
- Use clear, conversational vocabulary.
- Avoid unnecessarily complicated academic language.
- Avoid awkward literal translations.
- Internal documentation may use English or Vietnamese when appropriate.
- YouTube titles, descriptions, tags, and other publishing metadata must be written in English.

## 2. TARGET AUDIENCE

The primary target audience is English-speaking viewers, especially audiences in the United States.
Content should be understandable to international English-speaking viewers.
Consider:

- Cultural familiarity.
- Everyday experiences.
- Relevant examples.
- Appropriate humor.
- Clear explanations of unfamiliar concepts.

Do not assume all viewers have the same cultural background.

## 3. VIDEO FORMAT

Default production targets:

- **Platform:** YouTube.
- **Format:** Long-form explainer videos.
- **Resolution:** 1920 × 1080.
- **Frame rate:** 30 FPS.
- **Aspect ratio:** 16:9.
- **Visual style:** 2D Stickman animation.

These are default production settings and may be adjusted when a specific project requires it.
Video duration must follow the content rather than an arbitrary fixed limit.
Use 6–8 minutes as an initial planning reference, not a strict requirement.

## 4. CONTENT QUALITY

Every video should satisfy the following:

1. It has one clear central topic.
2. It provides genuine informational or entertainment value.
3. It has a coherent beginning, middle, and ending.
4. It avoids unnecessary repetition.
5. It maintains logical transitions.
6. It uses examples that help viewers understand the subject.
7. It does not exaggerate claims or misrepresent evidence.

## 5. FACTUAL ACCURACY

Accuracy is more important than dramatic storytelling.
For factual content:

- Verify important claims using reliable sources.
- Prefer primary sources, academic publications, official institutions, and reputable publications.
- Cross-check controversial or surprising claims.
- Keep track of sources used during research.
- Distinguish established facts from scientific hypotheses and speculation.
- Never fabricate statistics, quotations, historical events, or scientific explanations.

If reliable evidence is unavailable, either omit the claim or clearly communicate the uncertainty.

## 6. ORIGINALITY

Do not copy another creator's:

- Script.
- Narrative structure word for word.
- Unique jokes.
- Visual sequences.
- Thumbnail composition.
- Distinctive presentation.

Competitor research is for identifying opportunities, audience interests, and content gaps.
Every finished video must have its own original explanation and presentation.

## 7. STORYTELLING

Prefer a narrative structure that includes:

- A compelling opening.
- A clear question or problem.
- Progressive explanation.
- Interesting examples.
- Meaningful developments.
- A satisfying conclusion.

Avoid introductions that spend too long explaining what the video will discuss.
Do not reveal every interesting detail immediately if doing so weakens the narrative.

## 8. HUMOR AND TONE

The default tone should be informative, engaging, and conversational.
Occasional humor is encouraged.
Use:

- Clever comparisons.
- Unexpected observations.
- Light sarcasm.
- Relatable everyday situations.
- Brief humorous comments.

Do not force jokes into every section.
Avoid:

- Excessive slang.
- Outdated memes.
- Offensive humor.
- Unnecessary insults.
- Jokes that confuse factual explanations.

The content should remain valuable even when the humorous lines are removed.

## 9. VISUAL CONSISTENCY

Maintain a recognizable 2D Stickman identity throughout the channel.
Visuals should:

- Support the narration.
- Communicate the intended idea.
- Use consistent character proportions.
- Maintain coherent scene composition.
- Avoid unnecessary visual clutter.

Supporting elements such as props, diagrams, environments, labels, and simple illustrations are allowed.
Strictly avoid whiteboard hand-drawing animations or mixed-media styles that conflict with the pure 2D Stickman identity.

## 10. AUDIO QUALITY

Audio must be clear and comfortable to listen to.
Prioritize:

- Natural voice delivery.
- Correct pronunciation.
- Consistent volume.
- Appropriate pacing.
- Clean transitions.
- Background music that does not overpower narration.

Do not rely on fixed audio levels without listening to the actual result.

## 11. TECHNICAL RULES

- Prefer free and locally executable tools where practical (e.g., Python, Edge-TTS, FFmpeg).
- Avoid unnecessary paid services and unnecessary API dependencies.
- Centralize paths and settings inside `engine/config.py` using cross-platform relative paths (never hardcode OS-specific paths like `D:\` inside scripts) so the repository runs smoothly across both Windows and Linux VPS environments.
- Do not install packages without understanding their purpose.
- Test new technical features with small examples.
- Keep production files organized and preserve reusable assets.

## 12. COPYRIGHT AND MONETIZATION AWARENESS

All content must be created with long-term monetization in mind.
Avoid:

- Reused content with minimal transformation.
- Mass-produced repetitive videos.
- Copyrighted music or visuals without appropriate rights.
- Misleading thumbnails and titles.
- Artificially inflated claims.

A consistent visual style is acceptable, but each video must provide meaningful original value.
Follow YouTube's current policies and verify policy-sensitive decisions using official documentation.

## 13. QUALITY PRIORITY

When trade-offs are necessary, prioritize in this order:

1. Factual accuracy.
2. Viewer value.
3. Narrative quality.
4. Audio and visual clarity.
5. Production efficiency.
6. Publishing speed.

Never sacrifice accuracy or viewer value merely to publish faster.
