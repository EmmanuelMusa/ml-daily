# Glossary fact-check R1: foundations, classic, evaluation, data

Checked 89 entries (foundations 21, classic 22, evaluation 24, data 22) and 13 diagrams. Every formula and worked number was recomputed. Changed 19 entries and 4 diagrams. No errors were found in formulas or worked examples.

## Entries

- distribution-shift: the label shift example (fraud rate rising during an attack) did not keep P(x | y) fixed, since attacks change what fraud looks like. Replaced it with flu rising from 2% to 10% of clinic visits in winter while symptoms look the same. Kept "covariate shift" here, as the most standard owner.
- reinforcement-learning: removed aka "reward learning" (usually means learning a reward model) and "policy learning" (a loose term, also used in econometrics).
- hyperparameter-tuning: removed aka "hyperparameters", which names the settings, not the tuning.
- early-stopping: removed aka "patience", which is one setting of early stopping, not another name for it.
- curse-of-dimensionality: removed aka "high-dimensional data" and "high dimensionality", which describe the data, not the curse.
- linear-regression: removed aka "linear model", a wider family that includes logistic regression.
- random-forest: removed aka "forest of trees", not a real name for the method.
- gradient-boosting: removed aka "boosting", a wider family that includes AdaBoost.
- stacking: removed aka "blending", which the entry's own mixup describes as a different, simpler method.
- gaussian-mixture-model: removed aka "soft clustering", a wider idea that covers other methods too.
- confusion-matrix: removed aka "contingency table", the general statistics term.
- calibration: ECE wording changed from "sums the gaps" to "averages the absolute gaps, weighted by bin size", which is the real definition.
- macro-micro-averaging: removed aka "weighted average", a generic phrase that would match unrelated text.
- bleu-rouge: removed aka "n-gram overlap", a description rather than a name.
- data-leakage: removed aka "leaky features", which clashed with "leaky feature" on target-leakage.
- deduplication: removed aka "MinHash", a general similarity technique, not a name for deduplication.
- class-weights: removed aka "cost-sensitive learning", the wider family that class weights belong to.
- outliers: removed aka "outlier detection" to fix the alias clash. It stays on anomaly-detection, its standard owner.
- data-validation: removed aka "data contract" and "data contracts", a related but different practice.

## Diagrams

- support-vector-machine: the margin arrow started inside the margin and stopped short of the far edge, covering about 34 of the 44 units between the dashed lines. It now runs edge to edge, perpendicular to the lines. Moved its label off the dashed line.
- k-means: the line "to the mean of its points" ran past the right edge of the viewBox. Moved the indented step lines 4 units left.
- calibration: "says 90%, right 72% of the time" changed to "happens 72% of the time", which matches the axis (observed rate) and the dashed-line note.
- bias-variance-tradeoff: the title said total error is bias² plus variance, but the drawn total curve sits a constant noise offset above that sum. The title now says plus noise.

## Checked and left as is

- All other diagrams are correct: ROC area works out at 0.80 to match its label, the PR baseline sits at 0.2, the k-NN ring holds exactly the 3 nearest points (2 circles, 1 square), the confusion matrix axes and cells are right, and the learning curve, cross-validation, time split, decision tree and point-in-time pictures match their entries.
- Alias "binary cross-entropy" (log-loss vs cross-entropy-loss) was left alone because cross-entropy-loss is in another topic's file. "Negative log-likelihood" is not in these files.
- Build: `python tools/build.py --no-checks --require-concepts` prints "glossary: 267 entries, 41 diagrams" with no errors.
