# Round 2 review, batch B14 (agents, agt-0026 to agt-0042)

## Compare summary

Blind solve of 12 auto-graded questions: 12 AGREE, 0 DISAGREE. 5 open questions skipped (agt-0031, agt-0032, agt-0033, agt-0038, agt-0042).

Result: 10 pass, 7 fixed. No answer key changed. Final build exits 0 (agents 17, total 17).

Key length across the 5 mcq: the key is never the longest option and never the shortest. It is second longest in four and third longest in one.

## Per question

- agt-0026: pass. Outcome check as the main score plus trajectory guards. The exact-match distractor is a real over-correction and is rebutted by content.
- agt-0027: fixed. Writer note ruled on. The prompt already asked for "all 4 attempts succeed", which cannot be read as pass@k, but it never named the metric the subtopic is about. It now asks "What is pass^4, the chance that all 4 of 4 attempts succeed?" so the name and the definition sit together. 0.85⁴ = 0.522, and the 99.95% pass@4 side figure is correct.
- agt-0028: fixed. Key "routing" is right. Added "intent routing" and "semantic routing" to accept, since both are common names for the same classify-then-dispatch step.
- agt-0029: pass. Chaining, parallel contract checks and orchestrator-workers are good fits, the three mismatches are each clearly wrong for an expert and explained.
- agt-0030: fixed. Writer note ruled on. Not accepting "reflection" is fair, because the prompt names the four sibling workflow patterns and asks for the fifth by name. Added "generator-critic" to accept, since "generator-evaluator" was already there and the critic wording is just as common.
- agt-0031: pass. Model answer starts from the trace, separates empty from error, checks the harness, and treats loop detection as a safety net.
- agt-0032: fixed. The prompt asks when the agent stops to ask a person, but concepts did not include human-in-the-loop. Added it.
- agt-0033: pass. Per-step traces, run outcome, versions, masking, replay and aggregate alerts all covered.
- agt-0034: pass. 6 × 1.8 + 5 × 0.6 = 13.8 s, the 14.4 s trap is the right common mistake.
- agt-0035: pass. Read-back of real state over the agent's claim, three distractors rebutted.
- agt-0036: fixed. The "full HTML of each page" distractor was the status quo the prompt already names as the problem, so it gave itself away. Replaced with "each product's full description and all its customer reviews, so the agent never needs a second call", which is a tempting half fix that still floods the context. Explanation updated to rebut it.
- agt-0037: pass. System prompt rule as useful guidance but not a boundary, with both overstatements (closes the risk, no effect) rebutted.
- agt-0038: pass. Break-even 0.02 × A = $3 gives A = $150, plus risk-based escalation, audits and a moving threshold.
- agt-0039: fixed. The distractors were too easy for a hard question, and "rerun from record 1 with duplicates as cleanup" was ruled out by the prompt's own "without wasting the work". Replaced it with "find the highest source id already in the new CRM and carry on from the next record, with no other check", which sounds sensible but skips the half-written record 3,100. Explanation updated. Same keys.
- agt-0040: pass. Narrow tools with least privilege, the container and "shell cannot be traced" distractors are plausible and rebutted.
- agt-0041: fixed. Concepts listed reflection, which this question does not touch. Swapped it for llm-as-judge, since one distractor turns on why a judge reading the summary is weaker. Keys and text unchanged.
- agt-0042: pass. Shadow mode, narrow permissions, staged gates set in advance, gradual rollout and rollback.

## Key or meaning changed

- None. agt-0027 now names pass^4 in the prompt, but the asked quantity and the key (52.2) are the same.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.
