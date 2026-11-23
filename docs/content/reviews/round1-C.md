# Round 1 review, group C (deep, llm, optimization)

## Blind solve compare

I answered every question from the stripped files before opening the content. Numeric answers were worked by hand and confirmed with a short script: dl-0003 = 3523, llm-0003 = 16, opt-0001 = 3.5, opt-0002 = 8.6 (8,589,934,592 bytes).

- deep: 5 AGREE, 0 DISAGREE, 1 SKIP (dl-0006 is open)
- llm: 6 AGREE, 0 DISAGREE
- optimization: 6 AGREE, 0 DISAGREE, 1 SKIP (opt-0007 is open)
- Total: 17 AGREE, 0 DISAGREE, 2 SKIP

No DISAGREE needed a verdict. I reran the strip and compare after the edits and all 17 still AGREE.

## Per question

- dl-0001: fixed. Key was the longest option (191 against 168 to 185). Tightened the key to 175. Two distractors were weak. "Stacked sigmoid layers collapse into one linear function" is plainly false, and "ReLU outputs can also be negative" gets ReLU wrong in a way anyone can spot. Replaced them with an exploding-gradient and clipping misconception and with the real non-zero-centred sigmoid issue (zigzag updates), which only fails because ReLU outputs are not negative either. Rewrote the wrong-option paragraph of the explanation to match. Key now shortest at 175 against 186 to 196.
- dl-0002: fixed. Key was the longest option by a little. The overfitting distractor ("training loss grows") was weak, so it became "the batch size is too large", a real misconception. Lengthened the other distractors slightly. Key is now 93 against 94 to 96. Explanation updated for the new distractor.
- dl-0003: pass.
- dl-0004: fixed (minor). Writer note ruled on. The prompt says "subtract the mean" and "a learned scale and shift", which rules out RMSNorm clearly and fairly, and "no statistics shared across the batch" rules out batch norm. The explanation now says in one sentence why RMSNorm is ruled out, since only the deeper paragraph mentioned it.
- dl-0005: fixed. Key was the longest option (168 against 144 to 167). Tightened the key and made the distractors equally specific (one now names `zero_grad()`, one names RuntimeError). Key is now 147 against 143 to 150. Explanation wording matched to the new option text.
- dl-0006: pass.
- llm-0001: fixed. Key was much longer than the rest (194 against 143 to 152). Tightened the key and added detail to the three distractors. Key is now 161 against 157 to 164.
- llm-0002: fixed. Key was the longest option (171 against 154 to 160). Also moved the setting from a support bot to a maths tutoring app to cut the repeated customer support setting. Rewrote all four options to equal length. The UTF-8 distractor now states the true fact (a Thai character is three bytes) and fails on "every byte is one token", which makes it more plausible. Key is now 158 against 147 to 164. Explanation rewritten to match.
- llm-0003: pass.
- llm-0004: fixed (minor). Writer note ruled on. "Frozen at its original precision" was enough for a careful reader but easy to skim past, and a QLoRA answer would be marked wrong. The prompt now says "frozen and unquantized at its original precision", so the QLoRA exclusion is explicit. Explanation sentence updated to match.
- llm-0005: fixed. Key was the longest option (193 against 156 to 168). Tightened the key and made the self-scoring and rejection sampling distractors equally specific. Key is now 156 against 159 to 168. Difficulty 3 is at the generous end, since it mostly tests knowing what DPO is, but the reference-model detail separates close options, so I kept it.
- llm-0006: pass.
- opt-0001: pass.
- opt-0002: pass.
- opt-0003: fixed. Key was the longest option (181 against 151 to 161). Writer note ruled on. "Best next step" invited the unlisted alternative of keeping sensitive layers at higher precision. The prompt now asks which of these steps is most likely to win back most of the lost accuracy, and the explanation names mixed precision for sensitive layers as a sound fix that is not offered. The test-set calibration distractor was a give-away (obvious leakage), so it became "rerun post-training quantization with a much larger calibration set", which is plausible but cannot fix 4-bit rounding. The dynamic quantization distractor was reworded to the common belief that per-input activation scales fix the error. Key is now 164 against 166 to 176. Exactly one option is defensible.
- opt-0004: fixed (minor). Moved the setting from a support-ticket classifier to a search-query intent classifier to cut the repeated customer support setting. The soft-target example in the explanation now uses laptops, laptop accessories and phones.
- opt-0005: pass. Key was already not the longest (123 against 120 to 131).
- opt-0006: pass.
- opt-0007: pass.

Totals: 8 pass, 11 fixed. Across the 8 mcq the key is now the longest option in 0 of 8.

Customer support settings: llm-0002 and opt-0004 were moved to other settings. llm-0005 keeps its bank FAQ assistant.

## Questions whose answer key or core meaning changed

- No answer key changed in any question.
- opt-0003: the stem changed from "best next step" to "which of these steps is most likely to win back most of the lost accuracy", and two distractors were replaced. The key and the concept tested are the same.

## DISAGREE resolved by editing the question

- None. There were no DISAGREE results.

## Build

`python tools/build.py` exits 0 with total 90.
