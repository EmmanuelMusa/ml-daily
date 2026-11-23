# Round 2 review, batch B09 (llm)

File: scratch/write2/B09/llm.json, 17 questions, llm-0007 to llm-0023.

## Compare summary

Blind solve: 16 AGREE, 0 DISAGREE, 1 SKIP (llm-0018 is open). No answer key was wrong. Every numeric key was recomputed by hand and with a script and matched (3.15, 1.31, 6.05, 7.80).

13 questions passed as written. 4 were fixed: one for a false claim in a deeper note, one for an ambiguous fill, and two for weak distractors.

## Per question

- llm-0007: pass. Query matched against keys, softmax mixes values. Each distractor role swap is explained by content.
- llm-0008: fixed. Key 3.15 is right. The deeper note said the second output component (about 1.21) comes almost entirely from the two tokens with the larger weights. In fact the lowest-weight token gives 0.72 of the 1.21 because its value is 8. Rewrote the note to show the working and make that point.
- llm-0009: pass. Heads give separate attention patterns at about the same cost. Compute, sequence-slice and ensemble distractors are plausible and explained.
- llm-0010: fixed. Writer note ruled on. The accept list took both "lower triangular" and "upper triangular", and each is used in practice (one names the kept entries, the other the blocked ones), so the blank had no single clear answer. The prompt now fixes the layout (rows are queries, entries above the diagonal are set to −∞) and asks for the mask named for the rule it enforces. Only causal and its rule-naming synonyms (look-ahead, subsequent, autoregressive) are accepted. Both triangle terms were removed. The explanation now says why people name it by either triangle.
- llm-0011: pass. Permutation symmetry plus mean pooling explains the identical scores. RoPE rotates queries and keys. Value rotation, learned absolute and ALiBi-style distractors are each explained.
- llm-0012: pass. Writer note ruled on. Every distractor puts the encoder-only model on a generation task, which it has no step to do, so only the key is defensible. The one permutation that would be arguable (encoder-only tagging, decoder-only translation, encoder-decoder copy) is not among the options.
- llm-0013: pass. 12d² × 24 plus one tied 50,000 × 2,048 matrix gives 1.31 billion. Hard label kept, since the output projection, the two MLP matrices and the tie are three separate traps.
- llm-0014: pass. Byte-pair encoding, with byte-level variants accepted. WordPiece and Unigram mix-ups are correctly described.
- llm-0015: fixed. The "no real downside" distractor was easy to drop for anyone who expects a tradeoff, and the key was the only option with a cost. Replaced it with a tradeoff option that wrongly says only the input embedding grows because the output layer maps to d_model. Rewrote its explanation line to show the output layer is d_model × vocabulary and grows by the same 229M.
- llm-0016: pass. exp(72,000 / 40,000) = e^1.8 ≈ 6.05. Base and sum-versus-mean slips are shown.
- llm-0017: pass. Keys are the probability reading, the branching-factor reading and the no-labels point. Tokenizer, helpfulness and perplexity 1.0 distractors are each clearly false and explained.
- llm-0018: pass. Open answer covers pretraining, SFT and preference tuning with what each changes. Points are concrete and gradable.
- llm-0019: pass. Next-token prediction, with causal language modelling accepted. The "tokens 1 to t" detail rules out masked language modelling.
- llm-0020: pass. About 94% of the loss would go to prompt text. Attention-mask, near-zero-loss and no-gradient distractors are explained by content.
- llm-0021: pass. Catastrophic forgetting with mixing, lower learning rate or LoRA as fixes. Tokenizer, underfitting and weight-decay distractors are explained.
- llm-0022: pass. r(d_in + d_out) per matrix gives 278,528 per layer and 7.80 million in all. The 0.8% comparison checks out (about 969 million full weights).
- llm-0023: fixed. The distractor that said rank sets how many layers get adapters and alpha sets the learning rate was too far off to tempt anyone. Replaced it with an option that also merges the update but keeps the scale at 2 because "alpha alone sets it", so the hard question now tests the α / r scaling rather than only the merge. Rewrote its explanation line.

## Key or meaning changed

- llm-0010: meaning sharpened. The blank now asks for the rule-named term only, and "lower triangular", "upper triangular" and "triangular" are no longer accepted. The key "causal" is unchanged.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
