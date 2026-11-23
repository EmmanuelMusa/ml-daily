# Round 2 review, batch B18 (mlops, ops-0025 to ops-0040)

## Compare summary

Blind solve of the 11 scored questions: 11 AGREE, 0 DISAGREE. The 5 open questions were skipped as the guide asks. Numbers worked by hand: ops-0031 gives $5,184 / 25,920 = $0.20 per 1,000, and ops-0039 gives 30 × (1 − 0.99⁸⁰) = 30 × 0.5525 = 16.57, so 16.6.

## Per question

- ops-0025: fixed. The distractor about daily averages was not a per-request trace at all, so it fell to the wording of the prompt. Replaced it with a per-request log of question, answer, model version, total latency and an error flag, which is tempting but still hides the retrieved context. Explanation updated to say why it fails.
- ops-0026: pass. BLEU is clearly unusable with no references, and the three keys are standard label-free signals.
- ops-0027: pass. Pinning the environment is the one fix that removes the cause. Easy label is fair.
- ops-0028: pass. Model answer and points cover feature diffing, the usual skew causes and a parity test.
- ops-0029: pass. Random exploration slice is the only option that removes the selection bias. Each wrong option is explained by content.
- ops-0030: pass. Clear lineage chain and the preconditions for it.
- ops-0031: pass. All numbers given, check matches the key, and the explanation shows the full-capacity trap.
- ops-0032: pass. Queue depth plus warm capacity is the only option that tracks GPU load and covers the 6-minute start.
- ops-0033: pass. Mitigate, diagnose, prevent, with a score-spread guard.
- ops-0034: pass. Batch scoring fits the weekly need and the steps are complete.
- ops-0035: pass. Layered monitoring with a separate safety track for the refund tool.
- ops-0036: pass. Only blue-green fits a full switch with a live old copy. Accept list covers spellings and red-black.
- ops-0037: pass. Writer note ruled: four keys of six is fine, and each key breaks the offline to live link. The seed distractor is clearly false as worded, since seed noise on 200,000 orders is a small fraction of a point, nowhere near 5.
- ops-0038: pass. Freshness is the only check that sees a stale but valid value.
- ops-0039: pass. Writer note ruled: the prompt states 80 features, 1% false alarm rate, 30 days, no true drift and independence. Recomputed 16.57, which rounds to 16.6. Hard label kept, since it combines the complement rule with expectation over days and the 24-day trap catches many candidates.
- ops-0040: pass. Recalibrating or resetting the threshold to capacity is the only sound option, and min-max rescaling is a good near miss.

## Key or meaning changed

- None. ops-0025 had one distractor replaced, but the key and the question are unchanged.

## Resolved DISAGREE by editing

- None. There were no DISAGREE results.

Final build: `python tools/build.py --content scratch/write2/B18 --glossary scratch/cat --require-concepts --out scratch/write2/B18/out/bank.json` exits 0 with mlops 16, total 16.
