# Round 2 review, batch B10 (llm-0024 to llm-0040)

## Compare summary

Blind solve of 13 auto-graded questions: 13 AGREE, 0 DISAGREE. The 4 open questions were skipped as the guide says.

## Per question

- llm-0024 pass. Reward hacking with the KL penalty set to 0. Key and all three distractors are explained by content.
- llm-0025 pass. Temperature 0.5 on logits 2, 1, 0 gives 0.87. Check and working agree.
- llm-0026 pass. Top-p keeps four tokens (sum 0.86), so 0.42 / 0.86 = 0.49. The overshoot rule is stated in the prompt.
- llm-0027 fixed. The key was the longest option. Shortened its last clause so length no longer hints at it. Meaning unchanged.
- llm-0028 pass. Open question on where reasoning earns its cost. Points and model answer match.
- llm-0029 pass. Hallucination causes and fixes. Keys are the training objective, weak storage of rare facts, and grounding with abstention.
- llm-0030 pass. Lost in the middle. Rerank, keep fewer and place the strongest at the edges is the only option that targets position.
- llm-0031 fixed. Ruling on the writer note: the prompt now says "empirical" scaling results, the key says the 20 to 1 ratio comes from fitted scaling laws, and the explanation says it is a rule of thumb that shifts with data and architecture. The 60B distractor said "the largest model that fits in the budget", which clashed with the 120B option that also fits. It now claims a wrong optimum of about 4 tokens per parameter, which is plausible and clearly false. Only the 27B plan is defensible.
- llm-0032 fixed. Arithmetic is right (5.4 days). Difficulty changed from 3 to 2 because the formula and every number are given, so it is a short plug-in calculation, which the guide labels Medium.
- llm-0033 fixed. The key was the longest option. Trimmed one word. Meaning unchanged.
- llm-0034 pass with small edit. Added more spellings for the router to accept (gating layer, router network, routing function, gating mechanism).
- llm-0035 pass. Prompt, few-shot or fine-tune for tone. Sound eval-first answer.
- llm-0036 pass. Domain fine-tune plan with retrieval for facts, data cleaning, held-out eval, forgetting checks and a pilot.
- llm-0037 fixed. Ruling on the writer note: the prompt asks what the technique is called, and "majority voting" (maj@k) is a common name for exactly this method in eval reports, so rejecting it would mark a correct candidate wrong. Added majority voting variants and maj@k to accept, and one sentence to the explanation naming the alias.
- llm-0038 pass. Reward model. Explanation separates it from the critic and the reference model.
- llm-0039 pass. Nondeterminism at temperature 0. Keys are batch-dependent floating-point order, backend changes and property-based tests.
- llm-0040 pass. Extending a rotary context from 4,096 to 32,000 tokens. Rotary angle claim checked (slowest dimensions do not finish a cycle within 4,096 tokens).

Batch balance after edits: the key is the longest mcq option in 1 of 5 (llm-0031) and the shortest in none.

## Key or meaning changed

- llm-0031: one distractor rewritten (60B plan now claims a 4 to 1 optimum). Key unchanged.
- llm-0032: difficulty 3 to 2. Answer unchanged.
- llm-0037: accepted answers widened to include majority voting and maj@k.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
