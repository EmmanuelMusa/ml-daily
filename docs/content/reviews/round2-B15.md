# Round 2 review: B15 optimization (opt-0008 to opt-0023)

## Compare summary

Blind solve from the stripped file: 16 AGREE, 0 DISAGREE. My blind answers were 0.010, 43.2, 512, bfloat16, FSDP, 90, PagedAttention and 34 for the open-answer items, and the first-listed key for every mcq. Agreement on opt-0009 hid a real problem with the question, covered below.

## Per question

- opt-0008: fixed (minor). Key 0.010 is right and does not hang on unstated details. 1.13 / 0.04 = 28.25 is not a tie, so the rounding rule does not matter, and q = 8 needs no clipping. One explanation line wrote "8 − 20" for the slip of adding z twice. Now reads 0.04 × (8 + (−20)).
- opt-0009: fixed. The old key was weight-only int8 with 16-bit activations. That avoids activation outliers by not quantizing activations at all, so it dodges the stated setup rather than fixing it. Percentile clipping was only wrong if you assumed the outlier channels matter, which the prompt never said. The prompt now says the team wants every matrix multiplication fully int8 and that zeroing the outlier channels wrecks the outputs. The new key moves the outlier scale from activations into the weights with a per-channel factor (the smoothing approach). The weight-only option was removed. The clipping distractor now gives a true-sounding reason that is wrong for this model. Explanation and deeper rewritten, with weight-only and mixed-precision decomposition moved to deeper as the fixes when int8 activations are not required.
- opt-0010: fixed (difficulty 3 to 2). Key 43.2 GB is right. The prompt lists every component and its precision, so the work is a sum and one multiply. That is a medium short calculation, not a hard multi-idea question.
- opt-0011: pass. 4 × 16 × 8 = 512.
- opt-0012: pass. bfloat16 with good accept variants. fp16 contrast in the explanation is correct.
- opt-0013: pass. Options balanced, each wrong option named as pipeline, tensor or no-sync training.
- opt-0014: pass. ZeRO and FSDP both accepted, so either common name scores. Explanation and stage note are correct.
- opt-0015: pass. Tensor parallelism inside servers and pipeline across them. Distractors carry false but plausible reasons.
- opt-0016: pass. 16 GB at about 1 TB/s gives about 16 ms, matching the 20 ms step. The KV cache option contradicts the short prompts, which is fair.
- opt-0017: pass. 1.8 × 10¹² / 20 × 10⁹ = 90.
- opt-0018: fixed (balance). Key was the longest option. Lengthened the answer-cap distractor slightly. Content unchanged.
- opt-0019: fixed. The two keys about GPU use and queue wait each carried a "since" reason and no distractor did, a give-away pattern. All six options are now bare phrases of similar length. Key set unchanged.
- opt-0020: fixed (balance). Key was the longest option. Lengthened the chunk-splitting distractor slightly. Content unchanged.
- opt-0021: pass. PagedAttention with sensible accepts. FlashAttention near miss explained.
- opt-0022: pass. 46 GB free, 163,840 bytes per token, about 1.342 GB per sequence, 34 sequences. The common-mistake figures 6, 68 and 55 all check out.
- opt-0023: pass. One eighth because 4 KV heads replace 32. The narrower-heads distractor is a good same-size, wrong-mechanism trap.

Key length across the 7 mcq after edits: the key is longest in 1 (opt-0013, by one character) and shortest in 1 (opt-0009).

## Key or meaning changed

- opt-0009: prompt now fixes the int8-everywhere constraint and states the outlier channels matter. Key changed from weight-only int8 to per-channel smoothing that folds the factor into the weights.
- opt-0010: difficulty label changed from 3 to 2. Key unchanged.

## Resolved DISAGREE by editing

- None. All 16 agreed. opt-0009 was edited because its agreed key was not the best answer to the setup as worded.

Final build: `python tools/build.py --content scratch/write2/B15 --glossary scratch/cat --require-concepts --out scratch/write2/B15/out/bank.json` exits 0 with optimization 16, total 16.
