# Round 2 review: B19 design (sysd-0006 to sysd-0030)

## Compare summary

Blind solve of the 20 scorable questions: 20 AGREE, 0 DISAGREE. The 5 open questions were skipped as the tool requires. Passed 21, fixed 4.

## Per question

- sysd-0006: pass. Clean contrast, distractors swap inputs and reverse cold start.
- sysd-0007: pass. Key is the precomputed item vectors plus ANN index. Each distractor is a real misconception.
- sysd-0008: pass. Propensity weighting from a randomised slice is the one sound fix. The position-feature distractor is wrong because it serves last time's position.
- sysd-0009: fixed (explanation only). Writer note ruling: exactly one option is defensible. The pairwise option is pinned to equal weighting with a false reason, so a LambdaRank-style loss is not on offer, and both pointwise options carry false reasons. Added a sentence saying a pairwise loss weighted by NDCG change would also fit, so the reader sees why equal weighting is the flaw.
- sysd-0010: pass. Bandit regret argument is correct and each distractor is answered.
- sysd-0011: pass. 0.8 + 0.2/5 = 0.84, check matches.
- sysd-0012: pass. 65.7 TB, TiB slip explained.
- sysd-0013: pass. 18.52 rounds up to 19, headroom mistakes worked through correctly.
- sysd-0014: pass. 200 minus 40 margin minus 105 on the critical path gives 55.
- sysd-0015: pass. Raising the threshold sends more mail to the large model.
- sysd-0016: pass. 0.30 + 0.18 × 6.00 = 1.38, the split mistake (1.33) is correct.
- sysd-0017: pass. Keys are cache, regional popular list and fallback alerting. Each wrong option has a clear flaw.
- sysd-0018: fixed. The options printed the costs of both fail-open choices, so the candidate only had to compare two given numbers. That made the hard label unfair. Options now describe the actions with no figures, so the candidate has to work out all three costs. The explanation now states the fail-closed cost and the gap between the two fail-open choices. Key unchanged.
- sysd-0019: pass. Feedback loop with exploration as the fix.
- sysd-0020: pass. Model answer and points cover hybrid retrieval, graded labels, position bias, offline and online evaluation.
- sysd-0021: pass. Quantile loss at the 80th percentile, 4 to 1 penalty ratio checked.
- sysd-0022: fixed (wording). The explanation said the model "underbids", but the platform does not bid. Now says it ranks ads bid on conversions too low.
- sysd-0023: pass. Cost arithmetic checked: 6 × 3,000 tokens at $2 per million is 3.6 cents, $1,800 a day.
- sysd-0024: pass. Points match what a system design interviewer expects in the first minutes.
- sysd-0025: pass. Thompson sampling, UCB and epsilon-greedy contrasts are correct.
- sysd-0026: pass. Implicit feedback, accept list fine.
- sysd-0027: pass. MMR-style penalty, publisher cap and recency boost are keys. Shuffle, bigger pool and retraining are each clearly wrong.
- sysd-0028: fixed (difficulty 3 to 2). Each distractor carries an obvious flaw (single criterion, the model's own prediction, an offline metric in an online test), so this is choosing between close options, not a hard tradeoff. Keys unchanged.
- sysd-0029: pass. 12,000 × 0.35 = 4,200.
- sysd-0030: pass. Global model with city features is the one sound choice for a small team and sparse new cities.

## Key or meaning changed

- None. sysd-0018 options were reworded but the keyed action and its meaning are the same.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
