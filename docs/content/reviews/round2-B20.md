# Round 2 review, batch B20 (math, math-0007 to math-0034)

## Compare summary

Blind solve of 26 scorable questions (math-0033 and math-0034 are open and were skipped): 26 AGREE, 0 DISAGREE. No answer key was wrong. Every numeric key was recomputed by hand and with a quick script.

Result: 22 passed, 6 fixed. The build exits 0.

## Per question

- math-0007 pass. 60 / 200 = 0.30. Both reversed-denominator slips are named in the explanation.
- math-0008 fixed. Writer note upheld. The answer needs the save probability 0.4 × 0.25, the expected benefit 0.10 × $200, then the cost subtracted, with a trap in skipping the churn probability. That is a two to three step calculation, so the label moved from 1 to 2. Added the calibration concept, which the deeper note leans on. Key of $10 unchanged.
- math-0009 fixed. The 8-seed distractor was not self-consistent: its own rule (each doubling halves the error) gives 4 seeds, the same as the other distractor, so a careful reader could reject it on arithmetic alone. Replaced it with a 256-seed option that swaps variance and error (variance falling with √n), which is a real confusion and gives a consistent wrong number. Explanation updated to work both wrong rules. Key of 16 unchanged.
- math-0010 pass. 105 × 0.01 × 0.9¹³ ≈ 0.267.
- math-0011 pass. z = 2, half of 5% gives 2.5%. The exact 2.28% is noted, and the prompt asks for the rule.
- math-0012 fixed. Two distractors had odd wording ("compare the same means", "a test free of means") that read as filler and made them easy to drop. Rewrote them as a log-then-z-test plan and a rank-based test plan. Explanation now says why a rank test answers a different question. Key unchanged.
- math-0013 pass. Gaussian to MSE, Laplace to MAE, categorical to softmax cross-entropy are right. Every wrong pairing is explained by content.
- math-0014 fixed. Added common spellings to accept ("maximum likelihood estimator", "max likelihood", "max likelihood estimation"). Key unchanged.
- math-0015 pass. Type II. The low-α distractor is plausible and explained.
- math-0016 pass. Raising α from 1% to 5% is the only option that raises power.
- math-0017 pass. 1 − 0.95¹² ≈ 0.46.
- math-0018 pass. 0.18 − 1.96 × 0.01718 ≈ 0.146.
- math-0019 fixed. Added the selection-bias concept, since the flaw is that users choose dark mode themselves. Question and key unchanged.
- math-0020 pass. Keys are the product rule for independence, the addition rule for exclusive events, and exclusive events with positive probability being dependent.
- math-0021 pass. Keys are the dollars-to-cents scaling, the single outlier, and Spearman under a monotone transform.
- math-0022 pass. 0.7311 × 0.2689 × 2 ≈ 0.393.
- math-0023 pass. Mini-batch is the only correct statement, and the bias claim is shown to be backwards.
- math-0024 pass. Convex regularized log loss against a non-convex network. The cross-entropy-is-convex trap is explained well.
- math-0025 pass. Writer note upheld. f′(x) = 10x, so each step multiplies x by 1 − 10η, and |1 − 10η| < 1 gives 0 < η < 0.2. At η = 0.2 the factor is −1 and x oscillates, so 0.20 is the right boundary. The check simulates both sides. Difficulty 3 kept because the 2/a trap catches weak candidates.
- math-0026 pass. 32 × 3072, with a broad accept list.
- math-0027 pass. Cumulative shares 50, 75, 90 and 96.7%, so 4.
- math-0028 pass. Dot product, with cosine similarity named as the mix-up.
- math-0029 pass. Entropy, with cross-entropy named as the mix-up.
- math-0030 pass. Only the coding-cost statement is true. The cross-entropy distractor is subtle and correctly explained.
- math-0031 pass. Covariance. The correlation-matrix mix-up is covered.
- math-0032 pass. Chi-square goodness of fit with 3 degrees of freedom.
- math-0033 fixed. Swapped the entropy concept for softmax, since the answer covers log-softmax and log-sum-exp but never entropy itself. Content unchanged.
- math-0034 fixed. The James-Stein sentence said shrinking toward "a common point" beats the sample means, which is loose. With a data-chosen point it needs four or more means, and it only works with the right amount of shrinkage. Now says shrinking by the right amount toward a fixed point such as zero, which is the exact three-or-more result. Model answer and points unchanged.

## Key or meaning changed

- None. No answer key changed. math-0008 changed difficulty from 1 to 2. math-0009 and math-0012 changed distractor text only.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
