# Round 2 review, batch B13 (agents)

File: scratch/write2/B13/agents.json, 17 questions, agt-0009 to agt-0025.

## Compare summary

Blind solve: 16 AGREE, 0 DISAGREE, 1 SKIP (agt-0020 is open). No answer key was wrong. Both numeric keys were recomputed by hand and with a script and matched (69.1 and 225).

10 questions passed as written. 7 were fixed: one fill blank that allowed more than one term, two mcq where the key was the longest option, one prompt whose sandbox list let distractors be matched word for word, one overstated claim, one muddled explanation line and one missing concept tag.

Key length across the 9 mcq after edits: the key is the longest option only in agt-0009, and there it ties with a distractor. It is never the sole shortest.

## Per question

- agt-0009: fixed (minor). Key is right and every distractor is explained. Added the workflow-vs-agent concept, since the explanation contrasts the loop with a fixed scripted workflow.
- agt-0010: pass. Tool calling, with function calling and tool use accepted. Structured output and ReAct near misses are explained.
- agt-0011: pass. All results returned before the next call, each tagged with its call ID. The finish-order trap and the race-condition distractor are explained by content.
- agt-0012: pass. Merge, group and load on demand fixes the overlap and the 30,000-token cost. The prompt guide, larger window and 85-way router are each explained.
- agt-0013: fixed. Writer note ruled on. The blank "the request's ______" let a reader argue for "request ID" or other names. The prompt now reads "the request's ______ key", so the blank asks for one word and "request ID" no longer fits the sentence. The key is "idempotency". All idempotency forms (idempotency key, idempotence, idempotent) and all deduplication forms (dedup, dedupe, deduplication, with or without "key") are accepted. "Request ID" stays out, because a per-attempt request ID is exactly the mistake the question teaches. The explanation line about that mistake was reworded so it describes the idea, not a typed answer.
- agt-0014: pass. 0.996625¹³ × 0.85² gives 69.1%. The all-retried (95.1%), no-retry (8.7%) and 3-retries slips all check out. Hard label kept, since the twist is spotting that the unretried writes set the ceiling.
- agt-0015: pass. 75,000 input tokens per ticket, 75 million in all, $225. The $39 and $36 slips and the 3.3 times figure for 20 steps check out.
- agt-0016: fixed. The key was the longest option by 9 characters and the only three-part one. Shortened it so it is now level with the shortest. Meaning unchanged. The explanation now says the full log sits in a file the agent can open.
- agt-0017: fixed. The key was the longest option. Trimmed it to "Close what a customer's letter names" with the same actions. Meaning unchanged. The three investigation distractors are plausible and explained.
- agt-0018: fixed. Writer note ruled on. The explanation said bare "Are you sure?" self-critique "is unreliable". It now says it "tends not to help reliably", which matches the research it cites (often fails to fix errors, sometimes breaks right answers). The subject-line line now adds that a model judging style tends to reward its own taste. Added the llm-as-judge concept. Keys unchanged.
- agt-0019: pass. Good fit with parallel clean contexts, more total tokens and brief-only visibility. The no-extra-cost, bigger-window and shared-context distractors are explained.
- agt-0020: pass. Open answer covers showing the real diff, risk tiers, escalation, enforcement in code and reversibility. Points are concrete and gradable.
- agt-0021: fixed. The prompt listed "no network access, no credentials or environment secrets, limits on CPU, memory and run time", so each distractor could be ruled out by matching words. The sandbox is now described by mechanism (no network interface, empty environment, CPU, memory and wall-clock caps, destroyed after the run), so each distractor needs one step of reasoning. The explanation was updated to match. Key unchanged.
- agt-0022: pass. Least privilege, with least authority and POLP accepted. Need to know, defence in depth and zero trust are explained.
- agt-0023: pass. Host runs one client per server, and the tracker client carries the call. Server-to-server, local-only-files and model-connects distractors are explained. asof present.
- agt-0024: fixed (minor). Keys are right: poisoned descriptions, rug-pull changes and scoped tokens. The explanation said the poisoning "so the three correct statements matter together", which did not follow. It now says one bad server puts the whole assistant at risk and the other two keys limit that risk.
- agt-0025: pass. Removing the outbound channel breaks the attack for good. The prompt rule, classifier and better-model distractors each only lower the odds, and the explanation says so.

## Key or meaning changed

- agt-0013: the answer string changed from "idempotency key" to "idempotency" because "key" moved into the prompt. The idea tested is the same, and "idempotency key" is still accepted.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
