# Round 2 review, batch B05 (evaluation)

File: scratch/write2/B05/evaluation.json, 17 questions, eval-0026 to eval-0042.

## Compare summary

Blind solve: 13 AGREE, 0 DISAGREE, 4 SKIP (open). No answer key was wrong. Both numeric keys were recomputed with a script and matched (14 days, 0.17).

13 questions passed as written. 4 were fixed: one for give-away distractors, one for a figure quoted from memory, and two for small wording or tagging problems.

## Per question

- eval-0026: fixed. Keys are right (below diagonal means overestimated risk, ECE weights by bin size, base-rate model has ECE near 0 with no ranking). The explanation called a below-diagonal bin "overconfidence", which is wrong for low-risk bins where predictions near 0.05 can sit above the observed rate without being too extreme. Replaced it with "scores for that bin should be pulled down".
- eval-0027: fixed. Platt scaling is the clear key. Added "logistic calibration" to accept. The explanation said training scores are "already overconfident", which is loose for SVM margins, so it now says the model has already fitted those examples and their scores are more extreme than on new reviews.
- eval-0028: pass. Random PR-AUC equals the positive rate, 0.05. Each distractor is explained by content.
- eval-0029: pass. p₂ = 0.044, n = 39,428 per arm, 39,428 / 3,000 = 13.14, so 14 days. Hard label kept because of the relative-lift and per-arm traps.
- eval-0030: fixed. Writer note ruled on. A simulation of a null effect with cumulative z-tests gave about 14% at 5 looks, 19% at 10, 25% at 20 and 27% at 28 looks. The 25% at 20 looks figure was right, but the test in the prompt has 28 daily looks, so the explanation now gives both figures and says "more than five times the planned rate".
- eval-0031: pass. Writer note ruled on. Four keys of six is fine here. Interference through shared kitchens, a sample ratio mismatch (chi-square 512), a fading novelty effect and 2 of 25 metrics at p below 0.05 are each clearly real threats. Chance-sized age imbalance and a two-full-week run are each clearly not.
- eval-0032: fixed. The key was the only option without an absolute ("need not mean", against "only", "never", "always", "must"), which gave it away. Rewrote the three distractors as plausible but wrong reasons: a held-out week too close to training, AUC ignoring calibration so log loss would have warned, and the impression versus user unit change. Rewrote the explanation lines for each by content.
- eval-0033: pass, with a tag fix. Keys and the ±12 point interval for 40 tickets at 80% are correct. Added the macro-micro-averaging concept, since the macro-average distractor is the idea a learner should read up on.
- eval-0034: pass. Mix numbers check (26%, 16%, reweighted 28%). Model answer covers the grouping-before-treatment caveat.
- eval-0035: pass. False positive, accept list covers type I error and false alarm.
- eval-0036: pass. ROUGE rewards overlap, BLEU has the same blind spot, ROUGE-1 does not help. Each distractor is explained.
- eval-0037: pass. Time split, matured labels, backtests, alert-budget metrics and shadow mode with proxies. Explanation of how unmatured labels distort both metrics is correct.
- eval-0038: pass. Precision floor then maximise recall. The spam-flood follow-up about precision rising is correct.
- eval-0039: pass. ROC facts are right, squaring on [0, 1] keeps the order. Easy label is fair for a strong candidate.
- eval-0040: pass. 80 / 476 = 0.168, so 0.17. Original market precision of 400 / 780 = 0.51 checks out.
- eval-0041: pass. SD of 500, gap of 7.8 SD, chi-square about 61. Sample ratio mismatch is the clear term.
- eval-0042: pass. Offline gate, primary metric, guardrails with preset limits, and a reasoned ship call with a holdback.

## Key or meaning changed

- eval-0032: key unchanged, but all three distractors were replaced, so the meaning of the wrong options changed.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
