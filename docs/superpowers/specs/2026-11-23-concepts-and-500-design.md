# ML Daily: concepts, glossary and 500 questions

Date: 2026-11-23. Approved by the owner in chat ("yes to both, go ahead"). Extends `2026-11-23-ml-daily-design.md`.

## What the owner asked for

1. Grow the bank from 90 to 500 questions, with the same quality process.
2. While reviewing answers, mark concepts to keep and read up on later.
3. Built-in meanings and explanations for key concepts, with visuals where they help, as long as the app stays light.
4. A much better Progress page and Settings page.

## Decisions

- **Concept glossary in the app.** About 250 concepts. Each entry has a name, other names, a one-line meaning, a short body (what it is, why it matters, a small example), a common mix-up, and related concepts. About 40 entries carry a diagram drawn as inline SVG that uses the theme colours. No photos and no images copied from the web. The glossary loads only when a concept is opened or the Concepts tab is used.
- **Concept buttons on questions.** Every question lists 1 to 4 glossary concepts. After Check they show as small buttons under the explanation. Tapping one opens its concept card.
- **Concept card.** It opens as its own view at `#concept/<id>`, so the phone's back button returns to the question. It holds a Save button, the meaning, the diagram if there is one, the body, the mix-up, related concepts, and a count of questions that use it.
- **Concepts tab.** This is a fourth tab between Today and Progress. **My list** shows saved concepts and the owner's own saved terms, newest first, each with where it was saved from. Removing an item is allowed. **Glossary** is searchable and grouped by topic. Search matches names and other names.
- **Save a term.** A free text box on the Concepts tab stores any word or phrase. If it matches a glossary name or other name, it saves that concept instead.
- **Saved data** lives in the progress object as `saved: [{ "concept": id } or { "term": text }, "from": question id or null, "day": "YYYY-MM-DD"]`. It is optional, so older progress codes still load. It travels with the progress code.
- **Progress page redesign.** It shows a 12-week activity calendar in the scorecard style, bank coverage (seen, learned, total), reviews due over the next 7 days, topic mastery with the weakest first, and accuracy by difficulty. Numbers come from a tested stats function.
- **Settings redesign.** Groups are Appearance (theme), Your data (move progress, saved concepts count), About (bank size, build date, how reviews are scheduled), and a separate Start over area.
- **500 questions.** 410 new questions are written in waves, about 25 per writer agent. Each wave gets blind review and critique by separate agents, as in round 1. The topic split is foundations 32, classic 40, evaluation 42, data 34, deep 36, llm 40, integration 44, agents 42, optimization 38, mlops 40, design 30, math 34, responsible 22, python 26. No subtopic repeats a round 1 angle without a clearly different skill.
- **Build checks added.** Every question's `concepts` must exist in the glossary. Glossary entries are validated for length and style. Diagrams may only use plain SVG shapes and text: no scripts, no event attributes, no links, no images, no foreignObject.

## Non-goals

- No images fetched from the internet and no image hosting.
- No full answer browsing. The glossary explains ideas and never shows question keys.
- No accounts or sync service. The progress code stays the way to move data.
