# Round 2 review, batch B06 (data, data-0007 to data-0034)

## Compare summary

Blind solve of 24 auto-graded questions: 24 AGREE, 0 DISAGREE. The 4 open questions (data-0026, data-0032, data-0033, data-0034) were skipped as the tool requires and reviewed by reading.

Key length across the 11 mcq: the key is never the strict longest option. It was the strict shortest only in data-0011, now lengthened slightly. In data-0022, data-0024 and data-0031 it ties for shortest by a few characters, which a reader cannot exploit. So the key is not systematically shortest or longest.

Final build: `python tools/build.py --content scratch/write2/B06 --glossary scratch/cat --require-concepts --out scratch/write2/B06/out/bank.json` exits 0 (data 28, total 28).

## Per question

- data-0007: pass. Patient leakage across a random photo split, group split as the fix. Distractors plausible, explanation covers each.
- data-0008: pass. Point-in-time join on `recorded_time`. The event-time and same-day snapshot traps are both explained well. Difficulty 3 is fair.
- data-0009: pass. Near-duplicate grouping before the split. Clear and well explained.
- data-0010: pass. MCAR, MAR and MNAR cases are cleanly separable and only the `heart_rate` statement is correct. Difficulty 3 kept, since telling MAR from MNAR in context trips up many candidates.
- data-0011: fixed. Key was the strict shortest option. Reworded to "a 0/1 column that marks which rows were blank" so lengths are balanced. Meaning unchanged.
- data-0012: fixed. Prompt asked for "the better choice" among four options. Changed to "the best choice". Key unchanged.
- data-0013: pass. Training statistics give 1.75, live statistics give the 1.38 trap, and the explanation shows both.
- data-0014: pass. Min-max scaling, accept list covers the spellings.
- data-0015: fixed. A comma splice in the explanation made the reason for the log hard to read. Put the salary example in brackets. Key unchanged.
- data-0016: pass. One-hot encoding, good contrast with ordinal encoding.
- data-0017: pass. Dummy variable trap, explanation shows why the solution is not unique and gives three fixes.
- data-0018: pass. Smoothed target encoding 7 / 28 = 0.25, check matches.
- data-0019: pass. Hashing collisions with 4,096 buckets. Wrong options describe real misconceptions about hashing.
- data-0020: pass. IQR, domain limits and z-score on bell-shaped columns are keys. Blind tail deletion and dropping worst predictions are clearly wrong.
- data-0021: pass. IQR rule, Tukey variants accepted.
- data-0022: pass. SMOTE before cross-validation leaks into validation folds. Each wrong option is a real SMOTE misconception.
- data-0023: pass. Balanced weight 1,200 / 180 = 6.67, check runs the snippet.
- data-0024: pass. Odds correction gives 0.091. The backwards correction and the small-p shortcut are good distractors.
- data-0025: pass. Stratified split, explanation names the "balanced" mistake.
- data-0026: pass. Selection bias from approved-only labels. Model answer is 145 words and the points are complete.
- data-0027: fixed. The option keyed label smoothing as "a loss that limits the pull of wrong labels". That is not clearly defensible. Label smoothing only caps target confidence and does not down-weight rows the model badly misfits, and its benefit under noise is mixed in the literature. Reworded the option to a noise-robust loss such as generalized cross-entropy, which does cap the pull of misfit rows. Explanation now says how GCE works and why label smoothing is only a milder relative. The option stays a key.
- data-0028: pass. Writer note ruled: kappa is 0.5334, the prompt asks for 2 decimal places, the key is 0.53 and the tolerance 0.005 covers the exact value. No change needed.
- data-0029: pass. Uncertainty sampling, least-confidence variants accepted.
- data-0030: pass. Freshness, schema, distribution and range checks are keys. Exact mean match and zero-filling before the check are clearly wrong.
- data-0031: pass. Feature selection outside cross-validation, shown by the shuffled-label test. L1 and RFE distractors leak the same way and the explanation says so.
- data-0032: pass. Unit change from kilograms to grams. Answer covers confirmation by slicing, recovery, data contracts and input monitoring.
- data-0033: pass. Delivery-time features with point-in-time aggregates and post-order leakage named.
- data-0034: pass. Labelling plan with a random test set, weak supervision, active learning, pre-labels and kappa checks.

## Key or meaning changed

- data-0027: the label smoothing option now names a noise-robust loss such as generalized cross-entropy. Still a key, but the option's meaning changed.

## Resolved DISAGREE by editing

- None. All 24 auto-graded questions agreed with the blind solve.
