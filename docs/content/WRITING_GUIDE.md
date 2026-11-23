# ML Daily writing guide

This guide is for anyone writing or reviewing ML Daily questions. Read all of it before you start. The design is in `docs/superpowers/specs/2026-11-23-ml-daily-design.md`.

## Who the questions are for

The reader is preparing for **ML engineer and applied AI/LLM engineer** interviews and assessments at **early to mid level (0 to 3 years)**. Most questions sit at that level. Hard questions reach senior territory: system design, production tradeoffs, debugging under real constraints. Data scientist and research topics appear where they overlap with those roles.

Ask of every question: **would a real interviewer or online assessment for this role plausibly ask this, or something very close?** If not, don't write it.

## The quality bar

A question fails if any of these is true:

1. **More than one defensible answer**, or the question can't be answered from what it says (missing numbers, unclear units, unstated assumptions).
2. **The answer key is wrong**, or the explanation teaches something false or outdated.
3. **Trivia**: recall of a name, date, paper author or API flag that nobody asks in interviews.
4. **Weak distractors**: wrong options that are silly, off-topic or obviously wrong, so the key can be picked without knowing the topic.
5. **A give-away key**: the key is the only long, hedged or carefully qualified option, or it repeats words from the prompt that no other option repeats.
6. **The explanation just restates the answer.**
7. **The difficulty label is unfair** (see below).
8. **Trick wording**: double negatives, "which is NOT" without bold, gotchas that test reading rather than knowledge.

## Difficulty

- **1 Easy**: one core idea that any candidate for the role should know cold. One step to answer.
- **2 Medium**: needs applying an idea to a situation, a short calculation of two or three steps, or choosing between close options.
- **3 Hard**: needs combining several ideas, judging a tradeoff, or debugging a realistic situation. A strong mid-level candidate gets it with thought, and a weak one does not.

## Formats

| Format | Rules |
|---|---|
| `mcq` | Exactly 4 options and one key. Options similar in length and style. No "all of the above" or "none of the above". |
| `multi` | 4 to 6 options, at least 1 key (usually 2 or 3). The prompt ends with "Select all that apply." Each option must be clearly true or clearly false for an expert. |
| `fill` | A blank `______` that has one clear term as answer. Put spelling variants, abbreviations and synonyms in `accept`. Answers are matched after lower-casing, trimming, and treating hyphens and underscores as spaces. Don't ask for a long phrase. |
| `numeric` | Give every number needed. Say the exact form expected: "as a decimal to 2 places", "in GB, where 1 GB = 10⁹ bytes, to 1 decimal place", "as a whole number". Set `tolerance` to cover rounding to the asked precision (for 2 decimal places use 0.005, for 1 decimal place use 0.05, for a whole number use 0.5). A `check` is required. |
| `open` | An explain or design question. `answer` is a model answer of 60 to 180 words. `points` holds 3 to 6 short key points a good answer must cover. The reader grades themselves against these. |

Options are shown in a shuffled order. **Never refer to options by position or letter** ("option B", "the last option"). Refer to them by content ("the option about early stopping").

## Answer checks

Every `numeric` question has a `check`: Python that computes the answer from the numbers in the prompt and assigns it to `result`. The build runs it and fails if `result` doesn't match `answer` within `tolerance`. Write the check from the prompt, independently of your own working, so it really tests the key.

Code-reading questions (predict the output, find the value) must also carry a `check` that runs the exact snippet and sets `result`:

- For a `fill` question, `result` is a string that must match the answer after normalizing.
- For an `mcq` question, `result` must equal the exact text of the key option.

Checks may import `numpy`, `pandas` and `sklearn`. The pinned versions are numpy 2.5.5, pandas 3.1.1 and scikit-learn 1.9.1. Name the major version in prompts whose answer depends on library behaviour ("Using pandas 3.x"). Pandas 3 uses copy-on-write, so chained assignment never changes the original frame. PyTorch is not installed. PyTorch questions stay at the concept level and have no check.

Run the build after every edit:

```
python tools/build.py --no-checks     # fast shape and style check
python tools/build.py                 # full check, must exit 0
```

## Explanations

`explanation` is 80 to 250 words. Write it for someone who got the question wrong and wants to understand, not just be told.

- Open with the reason the key is right, in plain words.
- For `mcq` and `multi`, say why **each** wrong option is wrong, by content. For `multi`, also say why each key is right.
- For `fill`, `numeric` and `open`, name the most common mistake and show where it goes wrong. For `numeric`, show the working step by step with the real numbers.
- Go a bit deeper than the answer: the intuition, the mechanism, or the condition under which the answer would change.

`deeper` is 20 to 90 words. It is one paragraph on how this shows up in real work or in an interview: what a strong candidate would add, a production gotcha, or a follow-up an interviewer might ask.

## Facts that change

Test principles that stay true. Don't test vendor APIs, model names, prices, context-window sizes or version numbers. Well-established named ideas are fine (LoRA, DPO, ReAct, the Model Context Protocol as a concept, PSI, SHAP). If a question touches regulation or a specific protocol, add `"asof": "2026-11-23"`. Regulation questions stick to the main ideas of the EU AI Act and general privacy principles. When a number such as a price is needed for a calculation, make it clearly hypothetical ("Suppose a model costs $3 per million input tokens").

## Style

- Plain, simple English. Short sentences. Second person is fine.
- **No em dashes. No semicolons** outside code. The build rejects them.
- No emojis, no exclamation marks, no "Great question", no filler like "It's important to note that".
- Use Unicode for maths (σ, Σ, √, x², ŷ, ≤, ×). No LaTeX.
- Markup allowed: blank line for a new paragraph, `inline code`, fenced code blocks with a language, `**bold**`, and lines starting with `- ` for lists.
- Use realistic settings: fraud, churn, recommendations, search, support bots, medical screening, ads, logistics.
- Vary the setting and the sentence shapes across a batch. Don't start every prompt with "You are".

## File format

Each topic lives in `content/<topic>.json` as a JSON array. Write exactly the ids, formats and difficulties in `content/blueprint-round1.json`. The subtopic and skill there say what to test. You may sharpen the angle, but don't change the format or difficulty without a strong reason, and report it if you do.

```json
{
  "id": "eval-0003",
  "topic": "evaluation",
  "subtopic": "precision",
  "format": "numeric",
  "difficulty": 1,
  "prompt": "...",
  "answer": 0.8,
  "tolerance": 0.005,
  "check": "tp = 40\nfp = 10\nresult = tp / (tp + fp)",
  "explanation": "...",
  "deeper": "...",
  "tags": ["precision"]
}
```

Fields: `options` (mcq, multi), `answer` (index, list of indexes, string or number), `accept` (fill, optional), `tolerance` and `check` (numeric), `points` (open), `concepts` (1 to 4 ids from `content/glossary/catalogue.json`, the ideas a learner should read up on after this question), `asof` (optional), `tags` (optional, 1 to 3 short words).

## Worked examples

See `tests/fixtures/content/evaluation.json` for one complete question in each format. Match their depth. Don't copy their topics.

## For reviewers: blind solve, then critique

1. `python tools/blind.py strip <topic>` writes `scratch/blind/<topic>.json`, which has prompts and options only. Options carry their original `index`.
2. Answer every question from that file alone, as a strong candidate would, without opening the content file. Save `scratch/blind/<topic>.answers.json` as `{ "id": response }`. Use the option `index` for `mcq`, a list of `index` values for `multi`, a string for `fill` and `numeric`. Skip `open`.
3. `python tools/blind.py compare <topic> scratch/blind/<topic>.answers.json` prints AGREE or DISAGREE for each one.
4. Now read the full questions. For each one, mark pass or fail on these six checks: one defensible answer, clear wording, plausible distractors with no give-away key, explanation correct and not a restatement, fair difficulty label, interview-relevant. Every DISAGREE needs a verdict: your solve was wrong, or the question is wrong or ambiguous.
5. Write each failure with a concrete fix.

## Glossary entries

Concepts live in `content/glossary/<topic>.json`. The catalogue in `content/glossary/catalogue.json` fixes every id, name and home topic, so write exactly those. An entry is a short reference card for someone who just met the idea in a question.

```json
{
  "id": "precision",
  "name": "Precision",
  "topic": "evaluation",
  "aka": ["positive predictive value", "PPV"],
  "summary": "Of everything the model flagged as positive, the share that really was positive.",
  "body": "...",
  "mixup": "...",
  "related": ["recall", "f1-score"],
  "diagram": "precision"
}
```

- `summary`: 8 to 35 words. One plain sentence a learner could repeat in an interview.
- `body`: 60 to 180 words, markup allowed. Cover what it is, why it matters in real work, and one small concrete example with numbers or a scenario. Give a formula when there is one. Write it so it teaches, not as a dictionary line.
- `mixup` (optional): 12 to 70 words on the confusion people most often have, such as precision versus recall.
- `related`: 1 to 5 other catalogue ids, the ones a learner should read next.
- `aka`: other names and common abbreviations. These also power the "Save a term" matching, so include the spellings people really type.
- `diagram`: only when the catalogue marks the concept `"diagram": true`. The value is the concept id, and the file is `content/glossary/diagrams/<id>.svg`.
- The same style rules apply: plain English, no em dashes, no semicolons, no emojis, durable facts only, and `asof` on anything about regulation or a named protocol.
- Never give away a question's answer key. The glossary explains ideas, not specific questions.

## Diagrams

Each diagram is a small inline SVG that the app shows inside the concept card, in both light and dark themes.

- The root is `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" role="img">`, with no width or height. Aim for a viewBox about 320 wide and 140 to 220 tall so text stays readable on a phone.
- Start with a `<title>` that says what the picture shows.
- Allowed elements: svg, g, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, title, defs, marker. Nothing else, so no scripts, links, images, styles or foreignObject.
- Colour **only** with palette classes. Fills: f-ink, f-muted, f-line, f-sheet, f-paper, f-right (soft green), f-wrong (soft red), f-none. Strokes: s-ink, s-muted, s-line, s-sheet, s-paper, s-right, s-wrong, s-none. Stroke weight: s-thin, s-thick, s-dash. Text: t-small, t-label, t-bold, t-muted. A `fill` or `stroke` attribute may only be `none` or `currentColor`.
- By default shapes have no fill and an ink stroke 1.5 wide, and text is ink at 12 px. Text has no stroke.
- Arrowheads use a `<marker>` in `<defs>` and `marker-end="url(#id)"`. Give marker ids a prefix from the concept id, such as `prec-arrow`, so two diagrams never clash.
- Keep it simple and labelled: a few shapes, short labels, and real meaning. No decoration.
- Check every diagram with `python tools/build.py --no-checks`, which rejects anything off the rules.
