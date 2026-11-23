# Glossary review R3: integration, agents, responsible, math, python

Checked 86 entries and 10 diagrams. Recomputed every worked number (chunk counts, vector memory, cosine, RRF, routing cost, pⁿ, DI ratios, Laplace scale, FedAvg weights, Bayes, variance, z-test, CI, power, Bonferroni, entropy, KL, PCA, gradient steps) and checked the pandas 3.1.1 and NumPy 2.5.5 claims. All were right.

## Text changes

- hybrid-search: mixup said BM25 scores are unbounded. Changed to "have no fixed range".
- conditional-probability: mixup called confusing P(A | B) with P(B | A) the base-rate fallacy. Renamed to confusion of the inverse, which ignores the base rate.
- pandas-merge: summary listed the how options as if complete. pandas 3 also has left_anti and right_anti, so it now says "such as".
- vectorization: one laptop timing was presented as a fact ("under 0.01 seconds, roughly 40 times"). Now framed as one measured run (about 60 times here) with a note that the ratio depends on machine, size and operation. Softened "usually tens to hundreds of times".

## Alias removals (loosely related terms, not other names)

- chunking: removed chunk size, chunk overlap. Reason: settings of chunking, not other names.
- vector-database: removed vector index. Reason: a vector index is the ANN structure, not the database.
- approximate-nearest-neighbor: removed vector search. Reason: vector search also covers exact search.
- cosine-similarity: removed cosine distance. Reason: cosine distance is 1 minus the similarity, a different number.
- bm25: removed keyword search, lexical search, sparse retrieval. Reason: broader families, not names for BM25.
- hybrid-search: removed reciprocal rank fusion, RRF. Reason: RRF is one fusion method, not hybrid search itself.
- cross-encoder-reranking: removed second-stage ranking. Reason: broader than cross-encoder reranking.
- prompt-engineering: removed system prompt, few-shot prompting. Reason: parts of a prompt, and few-shot prompting clashed with in-context-learning.
- structured-output: removed JSON mode, constrained decoding, grammar-constrained decoding. Reason: JSON mode is a vendor feature name, and constrained decoding is one mechanism.
- prompt-injection: removed injection attack. Reason: injection attack also means SQL and other injection.
- guardrails: removed input filtering, output filtering, content moderation, moderation. Reason: moderation and filtering are kinds of guardrail, not names for it.
- llm-as-judge: removed auto-eval. Reason: auto-eval also covers automatic metrics.
- groundedness: removed attribution, grounded generation. Reason: attribution and grounded generation are related ideas, not the metric.
- golden-dataset: removed eval set, evaluation dataset. Reason: any eval set is broader than a golden set.
- semantic-caching: removed response caching, LLM cache, embedding cache. Reason: broader caches, and embedding cache means caching embeddings.
- model-routing: removed model selection, router. Reason: model selection means choosing a model in development, and router clashed with mixture-of-experts.
- streaming-responses: removed server-sent events, SSE, stream=true. Reason: SSE is a transport and stream=true a vendor flag.
- rate-limits-and-backoff: removed HTTP 429, 429 Too Many Requests. Reason: a status code, not a name for the idea.
- agent-loop: removed LLM agent, AI agent, agent. Reason: agent and AI agent name the system, not the loop.
- workflow-vs-agent: removed agentic workflow, deterministic workflow, LLM pipeline. Reason: names of one side only, and agentic workflow often means the opposite.
- tool-calling: removed tools. Reason: too generic.
- plan-and-execute: removed plan and solve, planning agent, planner. Reason: Plan-and-Solve is a different prompting method, and planner is too generic.
- multi-agent-system: removed supervisor agent, subagents, sub-agents. Reason: components, not names for the system.
- agent-memory: removed long-term memory, short-term memory, working memory, agent state. Reason: parts of memory, and long-term memory clashes with LSTM usage. Added LLM memory.
- context-engineering: removed context compaction, compaction. Reason: compaction is one technique within it.
- human-in-the-loop: removed human-on-the-loop, approval gate. Reason: human-on-the-loop is a distinct, contrasted idea, and approval gate is one form.
- sandboxing: removed container isolation. Reason: one way to sandbox.
- idempotency: removed idempotency key, safe retries. Reason: a technique and a consequence, not the property.
- trajectory-evaluation: removed agent evaluation, process evaluation, tool-call evaluation. Reason: broader or narrower kinds of evaluation.
- compounding-errors: removed error propagation. Reason: error propagation means uncertainty propagation in numerics.
- demographic-parity: removed group fairness. Reason: group fairness covers equalized odds too.
- equal-opportunity: removed error rate parity. Reason: error rate parity usually means equal overall error rate.
- disparate-impact: removed four-fifths rule, 80% rule. Reason: the four-fifths rule is a test for it, not a name.
- proxy-discrimination: removed fairness through unawareness, proxies. Reason: fairness through unawareness is the flawed practice, and proxies is too generic.
- shap-values: removed shap. Reason: duplicate of SHAP.
- counterfactual-explanation: removed algorithmic recourse, recourse. Reason: recourse is a related but distinct idea, as the body says.
- model-card: removed system card, model factsheet. Reason: system cards and factsheets are different documents.
- differential-privacy: removed privacy budget. Reason: privacy budget is a part of DP. Kept DP as the field standard abbreviation.
- pii-handling: removed GDPR, data minimization, PII redaction. Reason: GDPR is a law, and the others are practices.
- federated-learning: removed on-device learning, collaborative learning. Reason: on-device and collaborative learning are not necessarily federated.
- bayes-theorem: removed posterior probability. Reason: the posterior is an output of the theorem.
- variance: removed Bessel's correction, ddof. Reason: related details, not names.
- normal-distribution: removed 68-95-99.7 rule. Reason: a property of the distribution.
- binomial-distribution: removed Bernoulli distribution, Bernoulli trials. Reason: Bernoulli is a different distribution.
- maximum-likelihood-estimation: removed likelihood, log-likelihood, negative log-likelihood, NLL. Reason: likelihood terms are not names for MLE, and NLL stays on cross-entropy-loss.
- hypothesis-testing: removed null hypothesis, H0, Type I error, Type II error. Reason: parts of a test, not names for it.
- confidence-interval: removed margin of error, error bars. Reason: margin of error is half the width, and error bars can show anything.
- statistical-power: removed sample size calculation, minimum detectable effect, MDE. Reason: MDE and sample size are inputs and outputs of power analysis.
- multiple-comparisons: removed Bonferroni correction, Benjamini-Hochberg, false discovery rate, FDR, family-wise error rate, FWER, p-hacking, peeking. Reason: corrections, error rates and practices, not names for the problem.
- convexity: removed non-convex, nonconvex, convex optimisation, convex optimization. Reason: non-convex is the opposite, and convex optimisation is the field.
- pca: removed explained variance ratio. Reason: an output of PCA.
- kl-divergence: removed KL penalty. Reason: a use of KL.
- numpy-axis: removed keepdims. Reason: a separate argument.
- views-vs-copies: removed .copy(), shares memory, np.shares_memory. Reason: methods, not names.
- numpy-dtypes: removed astype, type promotion. Reason: a method and a separate idea.
- pandas-indexing: removed reset_index, set_index. Reason: separate methods.
- pandas-copy-on-write: removed chained assignment, SettingWithCopyWarning, ChainedAssignmentError. Reason: related warnings and practices, not names.
- pandas-groupby: removed agg, transform. Reason: separate methods.
- pandas-merge: removed df.join, left join, inner join, SQL join, merge_asof. Reason: df.join and merge_asof are different functions, and join types are options.
- sklearn-pipeline: removed ColumnTransformer. Reason: a different class.
- estimator-api: removed fit_transform, predict_proba. Reason: single methods.
- pytorch-autograd: removed backward(), loss.backward(), requires_grad, computational graph, zero_grad. Reason: API pieces, not names.
- eval-mode: removed model.train(), train mode, torch.inference_mode(), inference_mode. Reason: the opposite mode and a separate API.

## Diagrams

- model-context-protocol.svg: one server was labelled with a product name. Relabelled "tickets", matching the entry example.
- The other 9 (RAG, ANN, cross-encoder, agent loop, multi-agent, normal, gradient descent, PCA, broadcasting) are correct. PCA axes match the eigenvectors of the plotted points, gradient steps are perpendicular to the contours, and the normal curve heights match exp(−z²/2).

## Kept on purpose

- Named variants that the body teaches as the concept stay: HNSW and IVF, SGD variants, TreeSHAP and KernelSHAP, FedAvg, DP-SGD, Reflexion, t-test and z-test.
- DP stays on differential-privacy, where it is the standard abbreviation. Another checker removes it from data-parallelism.

## Counts

Entries checked: 86. Entries changed: 65 (4 with text fixes, 63 with alias removals, 2 of them both). Diagrams changed: 1.
