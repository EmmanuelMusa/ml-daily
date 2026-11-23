# Round 2 review, batch B07 (deep, dl-0007 to dl-0021)

## Compare summary

Blind solve of 14 auto-graded questions: 14 AGREE, 0 DISAGREE. dl-0013 is open and was skipped. No answer key was wrong.

Option length before review: the key was the longest option in 4 of 7 mcq (dl-0009, dl-0014, dl-0015, dl-0020). After review it is the longest in 1 of 7 (dl-0015, by one character) and the shortest in 1 of 7 (dl-0007).

## Per question

- dl-0007: pass. Multi-label sigmoid plus BCE, distractors all real mistakes.
- dl-0008: pass. 20.086 / 23.804 = 0.84 checked. Added the temperature concept, which the deeper note covers.
- dl-0009: fixed. Key was the longest option. Tightened its first sentence ("so the shift is safe"). All numeric claims checked: mean shift leaves an exponent near 337, float64 overflows above about 709, clipping gives about 16.1.
- dl-0010: pass. −ln 0.25 = 1.386, mistakes (0.51, 0.60) checked.
- dl-0011: pass. ŷ = 2.5, gradient −7.5, update to 0.875 checked.
- dl-0012: fixed. The prompt spelled out the whole mechanism (zero slope, no gradient), so it was pure term recall and too easy for difficulty 2. The prompt now gives only the symptoms, so the solver has to diagnose the cause before naming it.
- dl-0013: fixed. Model answer said "64 identical units", a number the prompt never gives. Now says a layer of identical units is no better than a single unit. Zero-init gradient claim (only the output bias learns) verified.
- dl-0014: fixed. Key was the longest option. Lengthened the two distractors about recomputing validation statistics and resetting γ and β with plausible detail. Added layer-normalization as a concept since the explanation names it as a fix.
- dl-0015: fixed. Key said "a random 30% of the units", but dropout zeroes each unit independently with probability 0.3, so the count varies. Key now says that. Key was tied longest and is now within one character of the next option. Added the regularization concept.
- dl-0016: pass. 1.8 / 0.6 = 3.0, wrong paths 4.5 and 1.08 checked.
- dl-0017: pass. Options balanced, explanation covers each distractor by content.
- dl-0018: pass. ⌊97 / 3⌋ + 1 = 33, and the single-padding slip gives 32 as stated.
- dl-0019: pass. Accept list covers parameter sharing and variants.
- dl-0020: fixed. Key was the longest option. Tightened its wording ("needs the previous one, so steps run in order").
- dl-0021: pass. 1 billion parameters × 2 × 4 bytes = 8 GB checked.

## Key or meaning changed

- dl-0015: key text made precise (each unit zeroed with probability 0.3). Same option, same index.
- dl-0012: prompt no longer explains the mechanism. Answer unchanged.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
