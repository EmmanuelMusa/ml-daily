# Round 2 review, batch B11 (integration)

File: scratch/write2/B11/integration.json, 18 questions, int-0009 to int-0026.

## Compare summary

Blind solve: 16 AGREE, 0 DISAGREE, 2 SKIP (int-0016 and int-0021 are open). No answer key was wrong. Every numeric key was recomputed by hand and with a script and matched (0.0315, 20.5, 0.74).

11 questions passed as written. 7 were fixed: two for an option that was not clearly true or false or a term that was not pinned down, one for a small inconsistency in a deeper note, and four for key length balance.

Key length across the 8 mcq: before the fixes the key was the shortest option in 4 of 8 (int-0009, int-0010, int-0013, int-0022). After shortening one distractor in each, the key is the shortest in none and the longest in 2 (int-0011, and int-0020 where it ties with another option).

## Per question

- int-0009: fixed. Content was right. The key was the shortest option, so the word-for-word guarantee distractor was trimmed to sit below it. Meaning unchanged.
- int-0010: fixed. Content was right. The key was the shortest option, so the whole-library-in-the-prompt distractor was trimmed. Meaning unchanged.
- int-0011: pass. Embeddings blur rare codes, hybrid BM25 plus vector fixes it. Exact-kNN, bigger-dimension and BM25-alone distractors are each explained by content.
- int-0012: pass. 1/64 + 1/63 ≈ 0.0315. Tolerance 0.00005 fits 4 places. The leave-out-k and averaging slips are shown.
- int-0013: fixed. Content was right. The key was the shortest option, so the add-more-images distractor was trimmed. Meaning unchanged.
- int-0014: pass. 5 million × 1,024 × 4 bytes = 20.48 GB. The int8 and 2³⁰ slips are shown.
- int-0015: pass. Cosine favours B (0.99 vs 0.71), dot product favours A (3 vs 0.9). The query-length trap is explained well.
- int-0016: pass. Open answer covers incompatible vector spaces, a parallel re-embedded index, dual writes, own golden set and gradual cut-over with rollback.
- int-0017: pass. 37 / 50 = 0.74. Hit@1 and hit@10 slips shown, and the recall versus hit rate distinction is correct. The precision-at-k concept card covers recall@k.
- int-0018: pass. Rank 14 never reaches a top-5 context (retrieval), rank 2 does and the model contradicts it (generation). Hard label kept as a debugging case.
- int-0019: pass. Query rewriting, with reformulation, condensing and contextualization accepted. The expansion mix-up is explained.
- int-0020: pass. Post-filtering spends the top 10 on other tenants, so filter inside the search. Query-name, cut-off and dimension distractors are explained.
- int-0021: pass. Open answer puts access control in retrieval, takes identity from the session, syncs permission changes, keys caches by permission and logs chunks used.
- int-0022: fixed. Content was right. The key was the shortest option, so the one-line-prompt distractor was trimmed. Meaning unchanged.
- int-0023: fixed. The prompt asked which defences "meaningfully reduce the risk", while the explanation itself said the system-prompt line "helps a little". So that option was neither clearly true nor clearly false. The prompt now asks which defences still limit the damage even if the model is fooled into following a planted instruction. Under that wording the system-prompt line, the secret prompt and the bigger model all clearly fail, since each works only if the model is not fooled. The explanation line was updated to match. Key unchanged.
- int-0024: fixed. Writer note ruled on. The old blank defined the attack as a user crafting input to make a model break its own safety rules, which "direct prompt injection" also fits under some common taxonomies. The prompt now says the policy comes from the model's safety training and that the user is trying to talk the model out of it "rather than hijack the app's own task instructions". That points only to jailbreak, so "direct prompt injection" stays unaccepted. Key unchanged.
- int-0025: fixed. The key option says input moderation can stop a request before the main model spends any tokens, but the deeper note said input checks often run in parallel with the main call, which spends them. The note now says teams accept some wasted tokens on blocked requests in exchange for lower latency. Key unchanged.
- int-0026: pass. Position, verbosity and self-preference biases with sound fixes. Temperature 0, finer scale and blind-label distractors are each explained by content.

## Key or meaning changed

- int-0023: key unchanged, but the question now asks which defences hold even if the model is fooled, instead of which "meaningfully reduce the risk".
- int-0024: key unchanged, but the prompt now separates the attack from hijacking app instructions and ties the policy to safety training.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
