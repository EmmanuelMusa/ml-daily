# Round 2 review, batch B01 (foundations, fnd-0008 to fnd-0032)

## Compare summary

Blind solve of 20 auto-graded questions: 20 AGREE, 0 DISAGREE. 5 open questions skipped (fnd-0016, fnd-0022, fnd-0023, fnd-0025, fnd-0031).

Result: 19 pass, 6 fixed. Final build exits 0.

## Per question

- fnd-0008: pass. Clean three-way match, every wrong pairing explained by content.
- fnd-0009: pass. Selection on the test set explained as fitting at the model level.
- fnd-0010: pass. 7,320 / 12,000 = 0.61, check correct, good point about the uniform-guess trap.
- fnd-0011: pass. Flat curves at high error with a 1-point gap, key and distractors sound.
- fnd-0012: pass. Training error and weight norm are monotone in λ for ridge, U-shaped validation error is the expected pattern.
- fnd-0013: pass. Accept list covers the variants, checkpointing and reduce-on-plateau named as wrong answers.
- fnd-0014: pass. Clear term, explanation separates the effect from overfitting and sparsity.
- fnd-0015: pass. Zero-gradient reason is correct, all three distractors rebutted.
- fnd-0016: fixed. The model answer said Naive Bayes "reaches its best accuracy with fewer examples" as a flat fact. Reworded as a known tendency: it tends to get close to its own best with far fewer examples, but that best is often lower than logistic regression's. The explanation now cites the Ng and Jordan comparison as a tendency, not a guarantee. Also softened "p(x) can flag" to "can hint at", since a Naive Bayes p(x) is a crude density.
- fnd-0017: pass. Key correct, the adaptive-search and row-sampling distractors are plausible mix-ups.
- fnd-0018: pass. Good training-loss test for why hyperparameters are tuned on validation data.
- fnd-0019: pass. 1 − 0.95⁴⁰ = 0.8715, side figures (60 trials, 1% needs about 300) verified.
- fnd-0020: pass. Prior-odds correction verified: factor 12.25, a summer 0.10 becomes about 0.58.
- fnd-0021: pass. Grouped and temporal rows keyed, stratification correctly shown as harmless.
- fnd-0022: fixed. The explanation said the common weak answer is a majority-class baseline, which does not fit a regression task. Now it names a global average arrival time as the lone weak baseline and says why route medians and a simple model set a better bar.
- fnd-0023: fixed. The model answer called the gap to the 4% target "avoidable bias" outright. Now it says the answer treats the target as the reachable error, since avoidable bias is strictly measured against the best achievable error.
- fnd-0024: pass. Totals 0.19 and 0.16 verified, flip example (0.13 against 0.15) verified.
- fnd-0025: pass. Gaussian and Laplace penalties, λ = σₙ² / σ_w² and the MAP-not-posterior-mean point are all correct.
- fnd-0026: fixed. The key said lasso "puts nearly all weight on one input". A simulation with two noisy copies at correlation 0.99 showed lasso often keeps both at a weak penalty, with a lopsided and unstable split, and zeros one only at stronger penalties. The key now says lasso tends to favour one input, often zeroing the other, with the choice flipping between resamples. The explanation adds when both survive. Same option stays the key.
- fnd-0027: pass. Bandit, full RL and contextual bandit each explained, supervised rows rebutted.
- fnd-0028: fixed. Difficulty lowered from 3 to 2 because the formula is given and the task is a three-step plug-in. The rival model sentence moved before the ask so it reads as context, not a second question. Concept train-validation-test-split swapped for binomial-distribution, which matches the SE of a proportion.
- fnd-0029: pass. Fold arithmetic (120 rows, all 30 positives in the last fold in file order) verified.
- fnd-0030: pass. Means, the paired differences and the three-quarters overlap of training sets verified.
- fnd-0031: fixed. The concept list includes mae but nothing linked it. Added that pinball loss at τ = 0.5 is half the absolute error, so MAE is the symmetric special case. τ = 0.9 and the dollar-cost equivalence verified.
- fnd-0032: pass. Lasso's limit of at most n nonzero weights and the scikit-learn mixing parameter are correct.

## Key or meaning changed

- fnd-0026: key option reworded from "puts nearly all weight on one input" to "tends to favour one input, often zeroing the other". Same option is still the key.
- fnd-0016: model answer claim about Naive Bayes data efficiency restated as a tendency with a lower ceiling.
- fnd-0028: difficulty changed from 3 to 2. Answer unchanged at 1.27.

## Resolved DISAGREE by editing

- None. All 20 auto-graded questions agreed.
