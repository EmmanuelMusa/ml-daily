# Round 2 review, batch B22 (python, py-0006 to py-0026)

## Compare summary

Blind solve of 19 scored questions: 19 AGREE, 0 DISAGREE. The two open questions (py-0025, py-0026) were skipped by design.

Every check was run in tools/.venv (numpy 2.5.5, pandas 3.1.1, scikit-learn 1.9.1). Side claims were run too: `pixels + 300` raises OverflowError, `KFold(5, random_state=1)` raises ValueError, the stratified split gives 18 fraud rows for seeds 0, 7 and 42, and `df["amount"] / a` gives 9 NaN rows. Two of eight mcq keys are the longest option (py-0006 is a four-way tie, py-0018 wins by one character), which is within the quarter limit.

## Per question

- py-0006: pass. View versus copy, all distractors map to a real misconception.
- py-0007: pass. Distractor sums 1665 and 1710 and the precedence note checked.
- py-0008: pass. NEP 50 wraparound confirmed, OverflowError for 300 confirmed, `pixels.sum()` widens to uint64.
- py-0009: pass. Gap of 5.55e-17 and `np.isclose(1e-9, 0.0)` being True confirmed.
- py-0010: pass. float64 for true division, int64 for floor division.
- py-0011: pass. Shapes of the wrong options confirmed by the check.
- py-0012: pass. Swapped-axis and wrong-fee slips both give 20.0 as stated.
- py-0013: pass. One-argument `np.where` output confirmed.
- py-0014: pass. Division by the `agg` result gives 9 all-NaN rows. Hard label is generous but defensible, since it combines groupby shape with index alignment.
- py-0015: pass. Inner join 7 and outer join 9 confirmed.
- py-0016: pass. Positional, zero-filled and `fill_value=0` means checked (183.3, 102.5, 137.5).
- py-0017: pass.
- py-0018: pass. Check shows the whole-column shift leaks a label across cards.
- py-0019: pass. 9 columns, dense output, `remainder` drops `user_id`.
- py-0020: pass. `classes_` is ["churn", "stay"] and column 1 is "stay".
- py-0021: pass. `random_state` with `shuffle=False` raises ValueError in 1.9.1 as the explanation says.
- py-0022: pass. 18 fraud rows in a 300-row test set.
- py-0023: fixed. The explanation said calling `backward()` twice on one graph fails, which is not true with `retain_graph=True` or for graphs with no saved tensors. Softened to "usually fails, unless the first call passed `retain_graph=True`". Replaced a `detach()` aside that the deeper note already covered with a line on what an accumulated gradient looks like when debugging.
- py-0024: fixed. Writer note ruled on. The MSELoss line said "PyTorch only warns, and the loss is meaningless". Now says PyTorch emits a UserWarning about the size mismatch but does not raise, and that the broadcast loss pulls every prediction toward the batch mean price. Concept `pytorch-autograd` swapped for `numpy-broadcasting`, since no option is about autograd and the silent bug is a broadcasting bug. Key unchanged.
- py-0025: pass. Writer note ruled on. Ran the original three `apply` lines and the three model-answer replacements on a 2,000-row frame: `.dt.days`, `groupby("user_id")["user_id"].transform("size")` and `(amount > 100).astype(int)` all match row for row, including negative day gaps. The `cumcount` leakage fix in the deeper note also runs.
- py-0026: pass. Model answer and step names (`prep__text__tfidf__min_df`) are consistent.

## Key or meaning changed

- None.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
