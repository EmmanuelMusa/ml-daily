# Round 2 review, batch B03 (classic)

File: scratch/write2/B03/classic.json, 16 questions, cls-0025 to cls-0040.

## Compare summary

Blind solve: 12 AGREE, 0 DISAGREE, 4 SKIP (open questions). No answer key was wrong. Both numeric keys were recomputed by hand and by the build checks and matched (3.75 and 3.96).

10 questions passed as written. 6 were fixed. One difficulty label changed (cls-0030, 2 to 1).

## Per question

- cls-0025: pass. Conditional independence given the class is the one clear term. Accept list is sensible and the explanation separates it from plain independence.
- cls-0026: pass. Margin, support vectors and the direction of C are all correct, including that larger C means weaker regularisation.
- cls-0027: fixed. The prompt said "RBF kernel", so the word kernel was sitting in the prompt and the blank reduced to finishing a phrase. Now it describes the Gaussian similarity exp(−γ‖x − z‖²) without the word. The explanation already names it as the RBF kernel. The 170,000 column figure checks out (C(103, 3) = 176,851).
- cls-0028: pass. Only P6 is borderline (√13 against 5), so A holds P1, P2, P3 and P6 and x = 3.75. Easy label kept, since it is one k-means iteration with one distance to check.
- cls-0029: pass. Elbow at 3 (drop of 3,900 then 300 to 500) and silhouette peak 0.51 agree. Each wrong k is explained by content.
- cls-0030: fixed. Writer note ruled on. The prompt gives the full formula and asks only for its name, which is one step of recall, so medium was unfair. Relabelled to easy. Content and accept list are fine.
- cls-0031: pass. DBSCAN with eps as a radius and min_samples as the core count. Two DBSCAN options make the reader prove they know what the settings do, which is the point, not a cue.
- cls-0032: fixed. Writer note ruled on. All four options were within 1 character and the key was tied for longest. Trimmed the key to "splits at the midline ... weighs each group's shape and size" so it is now the shortest. Key and meaning unchanged.
- cls-0033: fixed. Writer note ruled on. The length tie was minor, but the bigger cue was shape: the three distractors all began "A short path means" and the key did not. Rewrote the key in the same frame ("A short path means the reading lies away from the dense mass, so a few random cuts were enough to isolate it"). Lengths now 106 to 109. Same meaning.
- cls-0034: fixed. Both keys carried hedges ("probably", "more likely") while every distractor was flat, which let a reader pick by tone. Added "likely ... roughly" to the island width option and "broadly" to the UMAP option. Both stay clearly false, since t-SNE resizes islands by local density and UMAP still distorts sizes and gaps.
- cls-0035: pass. 3.6 + 0.3 − 0.4 + 0.46 = 3.96. The sign slip (4.56) and missing mean (0.36) figures are correct.
- cls-0036: pass. In-sample 1-NN predictions are perfect on training rows, so the meta-model trusts the most overfit model. Out-of-fold predictions are the clear fix.
- cls-0037: pass. Sequential trees on negative gradients, learning rate with early stopping, then depth and leaf size. Tweedie and monotonic constraints suit the pricing setting.
- cls-0038: pass. Covers scaling, skew, k-means baseline, choosing k, stability and a controlled campaign test.
- cls-0039: fixed. The model answer's example (+3 and −1 against −1 and +3 giving the same predictions) only holds if the two spends are on the same scale, which the prompt does not say. Added "with both spends standardised". VIF of 1 / (1 − 0.97²) ≈ 16.9 is correct.
- cls-0040: pass. One-vs-rest, multinomial and softmax summing to 1 are true. One-vs-one needs 10 models, raw one-vs-rest outputs need not sum to 1, and ordinal coding is wrong.

## Key or meaning changed

- None. cls-0030 changed difficulty only (2 to 1). cls-0033 key was reworded with the same meaning.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
