# Round 1 review, group E (mlops, design, python)

## Blind solve

Compare output: 15 AGREE, 0 DISAGREE, 2 SKIP (open questions ops-0007 and sysd-0004).

- mlops: 6 AGREE, 1 SKIP
- design: 4 AGREE, 1 SKIP
- python: 5 AGREE

All code snippets were run with tools/.venv (numpy 2.5.5, pandas 3.1.1, scikit-learn 1.9.1). Every explanation matches the real behaviour: the broadcast shape is (32, 10, 64), the pandas snippet returns 65 and raises a ChainedAssignmentError warning on the chained line, the axis sum returns 7, and `cv=5` for a classifier resolves to StratifiedKFold.

## Per question

- ops-0001: fixed. The key was the longest option. Reworded it to "the same inputs now lead to different outcomes, so P(y | x) has changed", which is now shorter than every distractor.
- ops-0002: pass.
- ops-0003: fixed. The prompt defined the term in the sentence with the blank, which turned it into pure recall. The blank now follows the scenario ("This kind of problem is called ______"), so the reader has to tell skew apart from drift. Kept "feature skew" in accept: it is the standard name (for example in TFDV) for feature values that differ between training and serving because they are computed by different code, which is exactly this case.
- ops-0004: fixed. The prompt said the label "will not be known for most of these loans", which left room to argue that precision and recall could be computed on the rest. It now says no loan has reached the end of the 12-month window. The explanation adds why scoring only the early defaults would mislabel future defaulters. Ruling on 4 keys out of 6: fine. Each key is clearly right (feature drift, prediction drift, data quality, first missed payment as a proxy) and each distractor is clearly wrong.
- ops-0005: fixed. Difficulty 3 to 2. Recalling the PSI formula and summing five terms is a short calculation, which is the guide's definition of medium, not a combination of several ideas.
- ops-0006: pass.
- ops-0007: pass.
- sysd-0001: fixed. The key was the longest option and repeated "cheap" and "large model" from the prompt. It now reads "Running the ranking model on every video for each request is far too slow, so retrieval cuts the pool first" and is the shortest option.
- sysd-0002: fixed. The key was the longest option. Tightened it to "Stream both aggregates into a feature store as payments arrive, look them up by card ID, and fall back to rules on timeout", now the shortest option.
- sysd-0003: pass.
- sysd-0004: pass.
- sysd-0005: fixed. Every key was longer than every distractor. Shortened the onboarding and content-feature keys, reworded the exploration key, made the sign-up embedding distractor more plausible ("fits from their profile at sign-up time"), and added a sixth option, a distractor about raising the number of latent factors. Keys are now 92 to 102 characters and distractors 102 to 104. The explanation covers the new distractor.
- py-0001: pass. Ruling on the easy label: fair. It is one rule (align from the right, size 1 stretches) applied once, and broadcasting is something any ML engineer candidate should know cold.
- py-0002: pass.
- py-0003: fixed. The key was the longest option. Tightened it to "The scaler is fit on all rows, held-out folds included. Wrap the scaler and model in a Pipeline and cross-validate that", now the shortest option.
- py-0004: pass.
- py-0005: fixed. Difficulty 3 to 2. It tests what two well-known calls do and tells apart close statements, which is medium. It does not combine ideas or debug a situation.

After the fixes the key is the longest option in 0 of the 6 mcq across the three topics.

## Answer key or core meaning changed

None. No answer index changed. The ops-0004 prompt was tightened without changing which options are keys. Difficulty labels changed on ops-0005 and py-0005 (3 to 2).

## DISAGREE resolved by editing the question

None. There were no DISAGREE results.

## Build

`python tools/build.py` exits 0 (total 90).
