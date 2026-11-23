# Round 1 review, group B (evaluation, data, responsible)

## Blind solve

I answered every question from the stripped files before opening the content. Numeric answers were worked by hand and confirmed with a short script.

- evaluation: 7 AGREE, 0 DISAGREE, 1 SKIP (eval-0008, open)
- data: 5 AGREE, 0 DISAGREE, 1 SKIP (data-0006, open)
- responsible: 3 AGREE, 0 DISAGREE, 1 SKIP (rai-0004, open)
- Total: 15 AGREE, 0 DISAGREE, 3 open questions skipped

No DISAGREE needed a verdict. The compare was rerun after the edits and still shows 15 AGREE.

## Per question

- eval-0001: pass. Key 103 characters, the precision option 104, so the key is not the longest.
- eval-0002: fixed. The key was the longest option (131 against 116 to 124). Tightened it to "so even a tiny rate can swamp the few true hits" (116), same meaning.
- eval-0003: pass.
- eval-0004: pass.
- eval-0005: pass.
- eval-0006: fixed. The key was the longest option and echoed "holdout" and "pricing" from the prompt. Tightened it to "fit a calibration map on natural-rate data before pricing" (110, the AUC-noise option is now longest at 122). Same meaning.
- eval-0007: pass. z = 2.4696 confirmed. Difficulty 3 is at the generous end, since it is a standard four-step calculation, but the unequal group sizes and pooled SE are where candidates slip, so I kept it.
- eval-0008: pass. Break-even p = 15 / (0.25 × 400) = 0.15 is correct and the capacity point is covered.
- data-0001: fixed. The key was 101 characters against 87 to 90. Rewrote all four options to the same shape and length (77 to 81, key no longer longest). Changed the blood test option from "taken" to "reported" on the last morning, so it is clearly available at discharge and cannot be argued as a second leak. Matching word change in the explanation.
- data-0002: pass.
- data-0003: fixed. The prompt said the means were computed "over the whole training set", but the explanation said validation rows were encoded with the same full-data means and so leaked too. With a training-only mean, validation labels would not leak and the AUC jump is hard to explain. The prompt now says the encoding was computed over the full labelled dataset before splitting off validation, which matches the explanation. Key and options unchanged.
- data-0004: pass.
- data-0005: pass. 41.11 confirmed in pandas.
- data-0006: pass.
- rai-0001: fixed. The key was the longest option (113 against 103 to 110). Tightened it to "since true repayers are approved at unequal rates" (107, the "meets both criteria" option is now longest). Same meaning.
- rai-0002: fixed. Writer note ruling: the calculation and key are right, but the old explanation said the ratio "fails the four-fifths rule" in a tenant screening setting. That rule comes from US employee selection guidance and is not the legal test for housing. The explanation now says so plainly and calls 0.8 a screening flag that teams borrow outside hiring. The setting stays tenant screening, which keeps variety against rai-0004. asof kept.
- rai-0003: fixed. Writer note ruling: naming Shapley values in the prompt while accepting "shapley values" made the blank a copy of the prompt. I removed the term from the prompt and described the idea instead (features as players, average contribution over every joining order, contributions add up to the gap from the average prediction). "Shapley values" is now a fair answer that shows knowledge, so it stays accepted, with "shapley value" and "shapley" added. The explanation was rewritten so it no longer restates the prompt and says why Shapley values is accepted. Key unchanged (SHAP).
- rai-0004: fixed. Writer note ruling: the EU AI Act content is accurate and kept at the level of main ideas (recruitment filtering and ranking is high-risk, with duties around risk management, data governance, documentation, logging, transparency, human oversight, accuracy and robustness), and asof is set. Two refinements. The explanation now says the provider carries the main duties, and that here the company is the provider because it builds the tool, while as deployer it keeps oversight and tells people the system is used. It also adds the GDPR point that the prompt sets up: CVs ranked out of the top 20% and never read by a person may be solely automated decisions, which need safeguards such as human intervention. The matching key point was updated.

## Keys that are the longest option

Before: 4 of 6 mcq (eval-0002, eval-0006, data-0001, rai-0001). After: 0 of 6 (eval-0002 ties with one distractor at 116).

## Answer key or core meaning changed

None. No answer index, numeric answer or fill answer changed. The rai-0003 prompt no longer names Shapley values, and its accept list grew, but the question still asks for the same method.

## DISAGREE resolved by editing the question

None. There were no DISAGREE results. data-0003 was edited for an internal inconsistency between prompt and explanation that the blind solve did not expose, because the intended key was clear either way.

## Build

`python tools/build.py` exits 0 with total 90 questions.
