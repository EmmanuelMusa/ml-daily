# Glossary review, round 2 (deep, llm, optimization, mlops, design)

Checked 93 entries and 18 diagrams. Every formula and worked number was recomputed: MLP and CNN parameter counts, softmax and temperature probabilities, layer norm, He init, attention and FFN weight counts, LoRA counts, KV cache bytes, mixed precision and sharded memory, FlashAttention score matrix size, decode time bound, TTFT, throughput, PSI term, SLO error budget, capacity, latency budget, position bias and cascade cost. All were right.

Rule used for aka: an alias stays when it is a real other name or a named variant or part that the card explains. It goes when it is over-broad, names a different thing, is a model or vendor name, or is contradicted by the card itself.

## Entries changed

### deep
- cross-entropy-loss: removed "binary cross-entropy" and "BCE" from aka. They belong to log-loss. "negative log-likelihood" stays here.
- weight-initialization: removed aka "initialization", which is over-broad (k-means and other methods have initialization too).
- transfer-learning: removed aka "feature extraction", which in general ML means feature engineering.
- backpropagation: labelled "backward pass costs about twice the forward pass" as a rule of thumb.
- gradient-clipping: labelled the 1.0 threshold as a rule-of-thumb starting point.
- learning-rate: labelled the Adam and SGD learning rate ranges as rough rules of thumb.
- dropout: labelled the 0.1 to 0.5 range as a rule of thumb.
- weight-decay: labelled the 0.01 to 0.1 AdamW range as a rule of thumb.

### llm
- tokenization: removed aka "token count" (not a name for tokenization). Labelled "a token is about three quarters of a word" as a rule of thumb.
- transformer-block: removed aka "transformer" (that names the whole model). The FFN text now says gated SwiGLU layers use three matrices at about 8/3× expansion, so the 8d² count still holds. Before, it implied a 4× expansion with SwiGLU.
- encoder-decoder-architectures: removed aka "BERT-style" and "GPT-style" (model and vendor names).
- pretraining: "uses the vast majority of the total training compute" softened to "usually takes most of", since post-training compute varies.
- supervised-fine-tuning: removed aka "fine-tuning" and "full fine-tuning" (over-broad, they also cover LoRA, RL and CNN fine-tuning). "LoRA makes it affordable on a single GPU" now says this holds for small and mid-sized models.
- rlhf: removed aka "PPO" (a general RL algorithm) and "preference tuning" (an umbrella that also covers DPO).
- dpo: removed aka "preference optimization" (umbrella term) and "preference pairs" (the data, not the method).
- lora: removed aka "adapters", "PEFT" and "parameter-efficient fine-tuning". Adapters are a different method and PEFT is the whole family.
- catastrophic-forgetting: removed aka "replay" (a mitigation, and also RL experience replay).
- in-context-learning: removed aka "few-shot learning", which in classic ML means learning new classes from a few labelled examples. Kept "few-shot prompting" here.
- chain-of-thought: removed aka "reasoning models" (a model class, not the technique).
- scaling-laws: removed aka "Chinchilla scaling" (a model name). The 20 tokens per parameter figure was already labelled a rule of thumb.
- mixture-of-experts: removed aka "router", which stays on model-routing. "gating network" and "top-k routing" stay.
- positional-encoding: mixup "which is why they now dominate" changed to "which is one reason they are widely used", to avoid a claim about the current state of the field.

### optimization
- pruning: removed aka "sparsity" (over-broad: sparse features, sparse MoE).
- mixed-precision-training: removed aka "bfloat16" (a number format, also used in inference).
- gradient-accumulation: removed aka "effective batch size" (kept on batch-size) and "micro-batching" (also means pipeline micro-batches).
- flash-attention: removed aka "fused attention" and "memory-efficient attention". Both are broader families that include other methods.
- data-parallelism: removed aka "DP", which also means differential privacy.
- model-parallelism: removed aka "TP" (true positive to most learners) and "PP". Mixup "adds memory but not speed" reworded to "gives more total memory but no speedup".
- gradient-checkpointing: labelled "backward costs about twice forward" as a rule of thumb.
- memory-bound-decoding: removed aka "roofline model", a broader performance model the card does not explain.
- throughput-vs-latency: removed aka "latency", which overlaps latency-budget.

### mlops
- data-drift: removed aka "covariate shift", which stays on distribution-shift.
- reproducibility: removed aka "lineage", which the model registry card also uses and which is not a name for reproducibility.
- llm-observability: removed aka "LLMOps", which names the whole operations practice.
- service-level-objective: removed aka "SLA" and "service level agreement". The card's own mixup says an SLO is not an SLA, and the app shows aka as "Also called". "SLI" and "error budget" stay as parts the card defines.

### design
- learning-to-rank: LambdaMART was called listwise. It now says LambdaMART is usually described as pairwise with a listwise target: its gradients come from pairs, each weighted by the change in a metric such as NDCG. Also, the line saying pairwise methods focus on the top positions now says this is true of metric-weighted methods such as LambdaMART. Plain RankNet weights all pairs equally.
- model-cascade: removed aka "cascade" (over-broad).
- capacity-estimation: labelled "peak is 2 to 5 times average" as a rule of thumb.

## Diagrams changed

- transformer-block: redrawn as pre-norm (Norm, sublayer, then residual add) to match the card, which describes the pre-norm form. The old drawing showed post-norm "Add & norm" boxes.
- mixture-of-experts: caption had a semicolon. Split into two sentences.
- convolutional-neural-network: "3x3 filter" changed to "3×3 filter".

The other 15 diagrams were checked and are correct: activation-function, backpropagation, residual-connection, self-attention (weights sum to 1), rlhf, lora (2dr against d², 65k against 16.8M), kv-cache, continuous-batching, speculative-decoding (2 accepted plus 1 own token), model-parallelism, data-drift, feature-store, canary-release, two-stage-recommender, model-cascade.

## Counts

- Entries checked: 93. Entries changed: 38 (deep 8, llm 14, optimization 9, mlops 4, design 3).
- Diagrams checked: 18. Diagrams changed: 3.
- Build: `python tools/build.py --no-checks --require-concepts` prints "glossary: 267 entries, 41 diagrams" with no errors. No alias clashes remain across the glossary.

## Left open

- "BCE" now has no home. The owner of log-loss may want to add it there next to "binary cross-entropy".
- Named variants such as ReLU, LSTM, AdamW, RMSNorm, QLoRA and MQA stay as aka on their parent cards. "Also called" is loose for these, but they help learners match a saved term.
