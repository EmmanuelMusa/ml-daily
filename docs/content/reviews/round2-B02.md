# Round 2 review, batch B02 (classic, cls-0008 to cls-0024)

## Compare summary

Blind solve of 16 scorable questions: 16 AGREE, 0 DISAGREE. cls-0024 is open and was skipped.

Result: 12 passed as written, 5 fixed. No answer key changed. Final build: `python tools/build.py --content scratch/write2/B02 --glossary scratch/cat --require-concepts --out scratch/write2/B02/out/bank.json` exits 0 with classic 17, total 17.

## Per question

- cls-0008: fixed. Writer note ruled on. The 4 keys of 6 are each clearly right (linearity, independent errors, constant variance, no exact collinearity) and fine to keep. The distractor about features sharing the target's units was silly, so it is now "delivery times across all deliveries follow a normal distribution", a common real confusion between the target's overall shape and the errors. Explanation rewritten for that option.
- cls-0009: pass.
- cls-0010: pass. sigmoid(0.5) = 0.622, key 0.62 confirmed.
- cls-0011: pass.
- cls-0012: pass. Gain 0.549, key 0.55 confirmed.
- cls-0013: fixed. Writer note ruled on. The pruning key was the longest option, so it is now "Prune back weak branches with cost-complexity pruning", in line with the others, and the cross-validation point moved into the explanation. The distractor "keep splitting until every leaf is pure" was a give-away given 100% training accuracy, so it is now "switch the split criterion from Gini to entropy", which is tempting but clearly does not limit growth. The concept `pruning` pointed to neural network pruning in the optimization topic, so it is now `regularization`.
- cls-0014: fixed. "Guaranteed to stay exactly the same" overclaimed, since library details such as casting to float32 can in rare cases merge very close log values. Now "will stay the same". Key unchanged.
- cls-0015: pass.
- cls-0016: pass.
- cls-0017: pass.
- cls-0018: pass. 140 + 0.1 × 30 = 143 confirmed.
- cls-0019: pass.
- cls-0020: pass.
- cls-0021: fixed. The explanation line "shuffling on held-out data does not punish the ID" was confusing and did not say plainly why the permutation option is wrong. It now says permutation importance would rank the ID lower, because shuffling it barely changes the held-out score.
- cls-0022: fixed. The distractor "more neighbours always add information" used "always" as a give-away, so it now reads "each vote then draws on more labelled tickets". The explanation claimed 100% training accuracy at k = 1 "whatever the data", which is false when identical tickets carry different labels. Both sentences corrected.
- cls-0023: pass. Nearest three are P1, P2, P3, vote 2 to 1 for label 1. Inverse-distance figures in deeper (1.21 to 1.00) confirmed.
- cls-0024: pass. Model answer 159 words with 5 points.

## Key or meaning changed

- None. No key moved. cls-0008 and cls-0013 each had one distractor replaced, and cls-0014's prompt wording softened, but the correct options and their meaning are the same.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
