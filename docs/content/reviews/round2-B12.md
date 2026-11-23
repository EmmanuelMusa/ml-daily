# Round 2 review, batch B12 (integration, int-0027 to int-0044)

## Compare summary

Blind solve of 14 scored questions: 14 AGREE, 0 DISAGREE, 4 SKIP (open). Both numeric keys were checked by hand: 32400 for int-0032 and 12.50 for int-0034.

Key length across the 6 mcq after fixes: the key is the longest option only in int-0029 (130 against 127), and it is the shortest in none.

## Per question

- int-0027: fixed. The option about repeating the check said "the agreement check", which pointed at another option. It now names lawyer labels, so it stands alone. Key unchanged.
- int-0028: fixed (minor). Added "answer faithfulness" to accept, matching the glossary alias.
- int-0029: pass.
- int-0030: fixed. Three distractors were ruled out by absolute wording ("leaves no room", "cannot favour either", "Only a pairwise prompt"), so the key picked itself. Replaced them with a position-bias claim, a length-bias claim and a no-human-check claim, all phrased without giveaway words, and rewrote the second paragraph of the explanation to cover each. Shortened the key so it is no longer the longest. Dropped the position-bias concept, because the glossary entry covers click position bias in ranking, not LLM-judge position bias.
- int-0031: pass.
- int-0032: pass. Working and both trap values (40,500 and 43,200) verified.
- int-0033: pass.
- int-0034: fixed (concepts). Added model-cascade, since escalating failed small-model answers to the large model is a cascade.
- int-0035: pass.
- int-0036: pass.
- int-0037: fixed (concepts). Dropped model-routing, which is not part of a hosted versus self-hosted decision.
- int-0038: pass.
- int-0039: pass.
- int-0040: pass.
- int-0041: pass.
- int-0042: fixed (concepts). Added two-tower-model, whose glossary entry lists bi-encoder as an alias.
- int-0043: fixed. The explanation claimed the old page "wins about as often as the new one", which is more precise than anyone can say. It now says the old page can easily rank above the new one. Replaced the deduplication concept (about duplicate training rows) with approximate-nearest-neighbor, which the ANN distractor is about.
- int-0044: pass.

## Key or meaning changed

- int-0030: key unchanged, but three distractors are new, so the question now tests whether position bias, length bias and the need for human checks survive pairwise judging.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.

Final build: `python tools/build.py --content scratch/write2/B12 --glossary scratch/cat --require-concepts --out scratch/write2/B12/out/bank.json` exits 0 with integration 18, total 18.
