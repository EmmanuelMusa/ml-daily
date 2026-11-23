# Round 2 review, batch B04 (evaluation)

File: scratch/write2/B04/evaluation.json, 17 questions, eval-0009 to eval-0025.

## Compare summary

Blind solve: 17 AGREE, 0 DISAGREE. No answer key was wrong. Every numeric key was recomputed by hand and with a script and matched.

15 questions passed as written. 2 were fixed for distractor problems.

## Per question

- eval-0009: pass. Majority-class baseline is the clear key. Explanation checks both readings of the 0.2 point gap correctly.
- eval-0010: pass. Specificity 4,712 / 4,960 = 0.95. Explanation covers the all-bags and precision slips with correct numbers.
- eval-0011: pass. False positive rate, accept list covers fall-out and 1 minus specificity. Hints are strong but fair for an easy fill.
- eval-0012: fixed. The key was the only hedged option ("falls or stays the same", "usually"), which gave it away, and the recall-rises distractor carried a reason that contradicted itself. Rewrote the three distractors with matching hedges and parallel shape, and updated the explanation line for the recall-rises option.
- eval-0013: pass. Pairwise reading of AUC, distractors are accuracy, precision and threshold dependence, each explained.
- eval-0014: pass. 9.5 / 12 = 0.79 with the tie as half. Explanation shows the 0.75 and 0.83 slips.
- eval-0015: pass. F-beta score, F1 and F2 example numbers check out (0.64 and 0.78).
- eval-0016: pass. Micro 0.87 minus macro 0.70 = 0.17. Good note that micro precision equals accuracy here.
- eval-0017: pass. Mean log loss 1.29. The 0.18 and 0.49 slip figures are correct.
- eval-0018: pass. RMSE for costs that grow with miss size. Units, ordering and MAPE distractors are each explained by content.
- eval-0019: pass. √26 ≈ 5.1. Bias, √130 and MSE slips are correct.
- eval-0020: pass. Negative R² means worse than the test-set mean. Explanation of why R² can go negative is correct.
- eval-0021: pass. WAPE for slow sellers. Explanation of MAPE asymmetry and pooled RMSE scale is correct.
- eval-0022: pass. Recall@5 = 3 / 6 = 0.50. Explanation separates precision@5 and the shown-only denominator.
- eval-0023: pass. MRR 0.42 over all five queries. Slip figures 0.52 and 0.40 are correct.
- eval-0024: pass. NDCG@3 = 3.893 / 5.893 ≈ 0.66, ideal built from all five results. Hard label kept, since the full-list ideal is the trap that separates candidates.
- eval-0025: fixed. The NDCG distractor claimed it was "the only" metric that rewards higher placement, which an option list containing MRR exposes as false at a glance. Replaced it with a plausible but wrong reason (graded relevance across the first page) and rewrote its explanation line to show why the log discount suits scanning users, not stop-at-first-match users.

## Key or meaning changed

- None.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
