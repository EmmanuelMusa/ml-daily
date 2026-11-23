# Round 2 review, batch B16 (optimization, opt-0024 to opt-0038)

## Compare summary

Blind solve of the 11 auto-graded questions: 11 AGREE, 0 DISAGREE. The 4 open questions (opt-0030, opt-0032, opt-0033, opt-0038) were skipped by design and reviewed by hand.

MCQ key length check: the key is the longest option in 1 of 4 mcq (opt-0026, a tie at 171 characters) and the shortest in none. That is within the quarter limit.

## Per question

- opt-0024: pass. Key describes one-pass verification with stop at first rejection. Each wrong option is explained by content.
- opt-0025: pass. Re-derived 3.05 by hand (1 + α + α² + α³ + α⁴ with α = 0.75). The check matches. The explanation names both common slips (4.00 and 2.05).
- opt-0026: pass. Only the key describes exact attention. Distractors claim small output changes, so they look consistent with the prompt and force knowledge of the mechanism. The 537 MB figure checks out.
- opt-0027: pass. Re-computed the softmax examples (0.997, 0.0025, 0.0001 at T = 1 and 0.75, 0.17, 0.08 at T = 4). The 1 / T² gradient point is correct.
- opt-0028: pass. Unstructured versus structured pruning is clear, and every wrong option is answered.
- opt-0029: pass. One clear term with sensible accept variants.
- opt-0030: pass. Model answer and points cover confirm first, then fix the loader, then re-measure.
- opt-0031: fixed. The prompt states the nearest-rank rule exactly and the key follows it (position 10 is 115 ms, position 19 is 480 ms, difference 365). The interpolation figures (501 and 116.5) and the mean (172.5) are correct. The explanation said "1 in 20 takes four times as long or more", but 2 of the 20 values (480 and 900) are at least four times the median. Changed it to say the slowest 2 of the 20.
- opt-0032: fixed. The model answer stated "queue wait plus a running batch plus its own pass" as if it were the full latency. Reworded it as a simple worst case that ignores network time and longer backlogs, and changed the first point to match. Also changed "about 60% busy" to "about 60% of their full-batch capacity", since at 750 queries per second per GPU the batches will not fill to 16. Throughput numbers (167, 1,230, 1,455, 1,422 per second) check out.
- opt-0033: pass. Re-checked the budget: 26.2 GB of fp16 cache, 6.5 GB of 4-bit weights, 13.1 GB of 8-bit cache, and about 11,000 fp16 cache tokens after 8-bit weights.
- opt-0034: pass. Key is quantization, head removal and top-5 acceptance. The three exact changes are each explained.
- opt-0035: pass. Keys and values only. Queries, weights and logits are each ruled out with a reason.
- opt-0036: pass. Per-request formula gives three levers (key-value heads, bytes, tokens). Weight quantization, FlashAttention and batch size are each ruled out.
- opt-0037: pass. All-reduce, with reduce and all-gather named as near misses. The ring traffic figure is correct.
- opt-0038: pass. 16 bytes per parameter gives 112 GB and 56 GB per GPU sharded. The LoRA and QLoRA numbers are sound.

## Key or meaning changed

- None. No answer key changed. opt-0032's model answer now states its latency model as a simplification, which sharpens it without changing the recommendation.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.

Build: `python tools/build.py --content scratch/write2/B16 --glossary scratch/cat --require-concepts --out scratch/write2/B16/out/bank.json` exits 0 (optimization 15, total 15).
