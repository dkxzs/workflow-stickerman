# SCRIPT GUIDELINES — STICKMAN EXPLAINER

## 1. SCRIPT OBJECTIVE

Write original, engaging, informative YouTube narration for English-speaking audiences based strictly on the `## Approved Concept` section in `projects/<project_id>/01_research.md`.
The script must:

- Capture attention immediately.
- Create genuine curiosity.
- Explain the subject clearly.
- Maintain viewer interest throughout.
- Deliver meaningful, verifiable information.
- End with a satisfying conclusion.

The narration should feel like an intelligent, witty friend explaining something fascinating over coffee.

## 2. LANGUAGE AND VOICE

Use natural American English.
The narrator should sound:

- Intelligent.
- Conversational.
- Confident.
- Approachable.
- Curious.
- Occasionally witty.

Avoid:

- Robotic phrasing or AI clichés (e.g., _"delve into"_, _"tapestry"_, _"in conclusion"_, _"it's important to note"_).
- Overly formal academic language.
- Unnatural sentence structures.
- Excessive filler.
- Repetitive explanations.
- Unnecessary rhetorical questions.

Write for **spoken delivery**, not for reading an academic article.

## 3. OPENING HOOK

The opening (first 15–30 seconds) must quickly give viewers a reason to continue watching.
Possible approaches:

- An unusual or counter-intuitive question.
- A surprising verified fact.
- An unexpected everyday scenario.
- A common misconception.
- A relatable hypothetical situation.
- A problem viewers want to understand.

Avoid generic openings such as:

- _"Hello everyone, welcome back to my channel."_
- _"In today's video, we are going to talk about..."_

Do not spend too much time introducing the channel or explaining the video's outline. Establish curiosity immediately without making misleading promises.

## 4. STORY STRUCTURE

Use a narrative structure appropriate to the topic.
A typical effective structure:

- **A. Hook:** Introduce an intriguing question, problem, or scenario.
- **B. Context:** Give viewers the minimum background needed to understand the subject.
- **C. Development:** Explain the main ideas progressively, building momentum.
- **D. Interesting Discoveries:** Introduce surprising details, real examples, consequences, or unexpected connections.
- **E. Payoff:** Answer the central question and tie the major ideas together.
- **F. Ending:** Finish with a memorable, satisfying final thought.

This is a flexible framework, not a rigid template for every video.

## 5. RETENTION AND PACING

Maintain viewer interest through:

- New information every 20–30 seconds.
- Concrete, relatable examples.
- Tight, punchy explanations.
- Unexpected details or reversals.
- Meaningful transitions.
- Shifts in visual situations (giving the Stickman character new scenarios to act out).

Avoid repeating the same point using different wording. Do not add artificial cliffhangers or fake suspense. Every paragraph must earn its place.

## 6. HUMOR AND PERSONALITY

**IMPORTANT:** Humor is part of the channel's narration identity.
The default balance should be informative and serious in substance, with occasional dry or clever humorous lines.

Use humor naturally through:

- Clever comparisons.
- Light sarcasm.
- Unexpected observations.
- Relatable everyday references.
- Brief deadpan narrator commentary.
- Funny hypothetical situations.

**Tone examples (for reference only — do not reuse mechanically):**

- _"Unfortunately, ancient humans didn't have central heating. Or electricity. Or even the luxury of complaining about their internet connection."_
- _"Your brain is incredibly powerful. It can recognize faces, solve complex problems, and somehow remember an embarrassing moment from seven years ago at 3 AM."_

**Humor rules:**

1. Humor must fit the context naturally.
2. Jokes must sound effortless when spoken aloud by TTS.
3. Avoid forcing a joke into every paragraph.
4. Avoid excessive slang and short-lived internet memes.
5. Avoid humor that requires niche local cultural knowledge.
6. Never distort facts to make a joke work.
7. Do not treat serious or sensitive subjects disrespectfully.
8. The script must remain genuinely informative even if all jokes were removed.

As an initial guideline, a 6–8 minute video may contain approximately **2–4 noticeable humorous moments** (a flexible reference, not a strict quota).

## 7. EXPLANATION TECHNIQUES

Prefer:

- Concrete examples.
- Everyday comparisons.
- Simple, vivid analogies.
- Step-by-step explanations.
- Cause-and-effect reasoning.
- Short relatable scenarios.

When explaining a complex concept, introduce the intuitive core idea before discussing technical details. Define unfamiliar terms simply when necessary, without oversimplifying important scientific or historical distinctions.

## 8. FACTUAL CLAIMS AND SOURCES

Scripts must be grounded in verified research (`projects/<project_id>/01_research.md`).
For important factual claims:

- Verify the primary or reputable source.
- Keep a record of supporting evidence.
- Avoid unsupported statistics.
- Avoid presenting speculation as established fact.
- Preserve important scientific or historical qualifications.
- Do not invent quotations.

When evidence is uncertain or debated, state that clearly. Store detailed citations in the `Research Notes` / `Sources` section rather than cluttering the spoken narration.

## 9. SCRIPT LENGTH

Script length must be determined by desired video duration, narration speed, natural pauses, and topic depth.
Use approximately **130–150 spoken English words per minute** as an initial planning estimate:

- **6 minutes:** ~780–900 words.
- **8 minutes:** ~1,040–1,200 words.

These are planning estimates, not mandatory word counts. Never pad a script with fluff merely to hit a word target.

## 10. SENTENCE DESIGN (TTS-OPTIMIZED)

Write sentences specifically optimized for clean Text-to-Speech (`edge-tts`) delivery:

- Prefer clear, medium-length sentences (10–22 words). Break up overly long multi-clause sentences.
- Use standard punctuation (periods, commas, question marks, em-dashes `—`) to create natural breathing pauses.
- Spell out abbreviations, symbols, and units so TTS pronounces them reliably (e.g., write _"percent"_ instead of `"%"`, _"for example"_ instead of `"e.g."`, _"United States"_ instead of `"U.S."` when appropriate).
- Keep the `Narration` section completely free of raw URLs, bracketed stage directions, or markdown formatting symbols inside sentences so `tts_engine.py` can parse clean spoken text directly.
- Review uncommon names, numbers, dates, and technical terms before generating audio.

## 11. TRANSITIONS

Each section should connect smoothly to the next.
Use transitions that:

- Raise the next logical question.
- Explain why the next point matters.
- Connect cause and effect.
- Build directly on what was just revealed.

Avoid repetitive mechanical transitions such as _"Now let's talk about..."_ or _"Moving on to..."_.

## 12. ENDING

The ending should:

- Clearly answer the video's central question.
- Reinforce the single most important takeaway.
- Leave the viewer with a sharp, satisfying final thought.

Avoid abrupt endings or long, drawn-out outros. A brief, natural call to action may be included only when appropriate.

## 13. SCRIPT FORMATTING

Save the completed script to `projects/<project_id>/02_script.md` using this exact structure:

```markdown
# Video Title (Working Title)

## Core Idea

A 1–2 sentence summary of the video's central message.

## Target Duration

Estimated duration (e.g., ~7 minutes / ~1,000 words).

## Narration

[Complete spoken narration divided into clearly labeled section headers, containing ONLY clean spoken text.]

## Research Notes

Important claims, nuances, or caveats that require special attention.

## Sources

A numbered list of verified research sources supporting the script.
```
