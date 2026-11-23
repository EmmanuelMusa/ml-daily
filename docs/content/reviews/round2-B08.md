# Round 2 review, batch B08 (deep, dl-0022 to dl-0036)

## Compare summary

Blind solve of 12 scored questions: 12 AGREE, 0 DISAGREE, 3 open questions skipped (dl-0032, dl-0033, dl-0034).

Result: 11 pass, 4 fixed. Build exits 0 (deep 15, total 15).

Across the five mcq, the key is now the longest option in none of them. Before the review it was strictly longest in dl-0026 and tied for longest in dl-0031.

## Per question

- dl-0022 pass. Coupled L2 versus decoupled decay in Adam is explained correctly and every distractor is answered by content.
- dl-0023 pass. Warmup and decay reasoning is right. The bias correction distractor is the longest option, so no length tell.
- dl-0024 pass. 782 steps per epoch times 5 is 3,910, and the check matches. The drop_last case is covered.
- dl-0025 fixed. The key ended with a hedge ("still check validation accuracy, as huge batches can generalize worse") that stood against the "matching accuracy at any batch size" distractor and gave the key away. The key now gives the real reason for warmup, and the generalization caveat stays in the explanation.
- dl-0026 fixed. Writer note upheld. The key was the longest option, so it was shortened to sit inside the range of the distractors. The explanation said the head has "a few thousand parameters", which is low for a 12-class head on a typical CNN, so it now says tens of thousands at most.
- dl-0027 pass. Three sound practices, three clearly false ones. The weight decay option is false because decay pulls toward zero, which the explanation says.
- dl-0028 pass. Flips and 180 degree turns clearly break digit labels, and the three keys clearly keep them.
- dl-0029 pass. One clear term, good accept list, explanation separates clipping from normalization, loss scaling and clipping by value.
- dl-0030 pass. Clear term, and the explanation covers one-hot and feature hashing mix-ups.
- dl-0031 fixed. The key was tied for the longest option, so it was trimmed by a few words. Content and key unchanged.
- dl-0032 pass. Model answer and points cover first-loss check, overfitting one batch, data inspection and a short run.
- dl-0033 pass. Inductive bias, data size and serving cost are reasoned in a clear order.
- dl-0034 pass. Frozen embeddings, tuned threshold, linear probe, baseline and boilerplate pitfall are all covered.
- dl-0035 pass. The same-images detail rules out drift and overfitting, and gradient tracking is correctly called harmless to outputs.
- dl-0036 fixed. Writer note upheld. The key about a "typical sign of overconfident probabilities" that a reliability diagram "would reveal" was interpretive, not clearly true for an expert, as a multi option must be. It is replaced by a statement that is certainly true: temperature scaling fitted on the validation set could lower validation loss without changing any predicted class. The explanation now says why, and the deeper note moves the reliability diagram there as practical advice.

## Key or meaning changed

- dl-0036: one key option replaced (overconfidence and reliability diagram replaced by temperature scaling lowering loss without changing predictions). Key indexes unchanged.

## Resolved DISAGREE by editing

- None. All 12 scored questions agreed.
