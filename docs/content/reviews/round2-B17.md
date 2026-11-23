# Round 2 review, batch B17 (mlops, ops-0008 to ops-0024)

## Compare summary

Blind solve of 16 scorable questions (ops-0010 is open and was skipped): 16 AGREE, 0 DISAGREE. No answer key was wrong.

Result: 14 passed, 3 fixed. The key is the shortest option in ops-0016 and ops-0019 only, and the gaps are 1 to 5 characters, so there is no length pattern. No key is the longest option.

## Per question

- ops-0008 pass. KS gap of about 0.002 at p < 0.001 and the Bonferroni cut-off of about 0.00002 both check out. Every distractor is addressed by content.
- ops-0009 pass. The mechanism in the prompt points to one test, and the accept list covers KS spellings.
- ops-0010 pass. Open design question with six clear points and a model answer that covers them.
- ops-0011 pass. 500 × 2,700 × 0.02 × 0.04 = 1,080. The 54,000 full-rollout figure in the explanation is right.
- ops-0012 pass. Only the registry option gives a rollback in minutes. Distractors are plausible.
- ops-0013 pass. Clear fill, sensible accept list.
- ops-0014 pass. The latest-value-only table is a good distractor and the explanation names the leak.
- ops-0015 fixed. The prompt left the order count's freshness need and the relative cost of streaming to the reader, so the "lowest cost" ruling against streaming the 30-day average leaned on an unstated assumption. The prompt now says the order count must include the last minute of orders and that streaming costs more than nightly batch. The explanation for the all-streaming option now cites that. Exactly one option meets both needs. Difficulty 3 kept, since the reader still has to place the courier distance at request time and reject raw-table scans under 50 ms.
- ops-0016 pass. One clearly real-time case and three clear batch cases.
- ops-0017 pass. 36,000,000 / 15,000 = 2,400 s = 40 min.
- ops-0018 pass. Four keys of six is fine here. Each key is a standard pre-deploy gate and both distractors (exact prediction match, lower training loss) are clearly wrong for a new model.
- ops-0019 pass. Only the recent shared holdout gives a fair comparison. The stale launch test set is a strong distractor.
- ops-0020 fixed. Two distractors leaned on absolutes ("always help more", "only add noise"), which made the flexible key easy to spot without knowing the topic. Reworded both into plausible reasons a real team would give, and updated the explanation to name the assumption each one makes. Key unchanged.
- ops-0021 pass. Accept list covers walk-forward and time series cross-validation.
- ops-0022 pass. The no-penalty detail rules out SLA, and the explanation separates SLI, SLO and SLA.
- ops-0023 pass. 1,500 × 2,592,000 × 0.0005 = 1,944,000. The 3.6 hour burn figure is right.
- ops-0024 fixed. The prompt asked whether "the service" is healthy, which made the missing-value key arguable, since a reader could treat input data quality as outside service health. The prompt now asks about the service and the live data reaching it, so all four keys are clearly right and the two static metrics are clearly wrong.

## Key or meaning changed

- None. No answer key changed. ops-0015 and ops-0024 prompts were sharpened without changing the intended answer.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
