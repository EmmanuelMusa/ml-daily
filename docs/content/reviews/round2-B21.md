# Round 2 review, batch B21 (responsible, rai-0005 to rai-0022)

## Compare summary

Blind solve of 15 scorable questions: 15 AGREE, 0 DISAGREE. Three open questions skipped (rai-0019, rai-0020, rai-0021).

Result: 13 passed, 5 fixed. Final build: `python tools/build.py --content scratch/write2/B21 --glossary scratch/cat --require-concepts --out scratch/write2/B21/out/bank.json` exits 0 (responsible 18, total 18).

## Per question

- rai-0005: pass. TPR gap 0.08, FPR gap 0.10, key 0.10 checked by hand. Slip figures 0.27 and 0.65 also check out.
- rai-0006: pass. Proxy key is clear, distractors are real misconceptions.
- rai-0007: fixed. Key (FPR higher in group A, 0.20 against about 0.08) is right. The explanation said equal precision "is what calibration gives at the decision level", which is false, since calibrated scores only give equal precision if score distributions above the threshold also match. Now calls it predictive parity and notes in deeper that the same clash holds for calibrated scores.
- rai-0008: fixed. The distractor "per-group thresholds are in-processing" directly contradicted a key, so one of the pair had to be true, which gave the threshold key away. Replaced with "relabelling training examples is in-processing" (it is pre-processing) and explained it.
- rai-0009: pass. Score 0.50, key on SHAP credit versus intervention effect is the one defensible answer.
- rai-0010: pass. 46.0 − 31.5 − 9.9 = 4.6, check agrees.
- rai-0011: fixed. Key is right, but the wrong options (be older, move home, a 5.3 rating on a five-star scale) are not close, so this is one core idea. Difficulty relabelled from 2 to 1.
- rai-0012: pass. Model card, near misses (datasheet, system card) explained.
- rai-0013: pass. Prompt states the exp(ε) bound, so differential privacy is the only fit.
- rai-0014: pass. Temperature, system prompt and extra epochs all explained by content.
- rai-0015: pass. Privacy claims stay at main ideas (minimization, storage limitation, hashed email is still personal data), asof present.
- rai-0016: pass. Averaging close miss is handled well with secure aggregation.
- rai-0017: pass. Limited risk with a transparency duty is the main idea of the Act for a public-facing chatbot. No dates or article numbers, asof present.
- rai-0018: fixed. Writer note confirmed in spirit. The key was the only option covering several harm types, so breadth alone picked it. Rebalanced: the one-session distractor and the prompt-author distractor now also cover every harm type, and all four options are within a few characters. Explanation now says why breadth without regression tests, or without outside testers, still falls short.
- rai-0019: fixed. The model answer suggested measuring "approval among applicants who went on to repay", which cannot be observed for rejected applicants. Now measures default among approved applicants and notes that rejected applicants have no repayment record. EU AI Act line (credit scoring of individuals is high-risk) is a main idea and kept.
- rai-0020: pass. Global versus local split, tools and gaming risk are sound.
- rai-0021: pass. Writer note ruled: the EU AI Act line stays hedged ("likely falls there") and sits only in the explanation. No point in the answer depends on the classification, so the self-grade does not hinge on a contested reading.
- rai-0022: pass. Writer note ruled: "membership" stays in accept. The blank is followed by "attack" and no other named attack starts with that word, so a learner who types it has named the right idea.

## Key or meaning changed

- rai-0008: one distractor replaced (per-group thresholds as in-processing became relabelling as in-processing). Key indexes unchanged.
- rai-0011: difficulty 2 to 1. Key unchanged.
- rai-0018: all four option texts rewritten. Key index unchanged.
- rai-0019: model answer changed on how to measure error rates by group.

## Resolved DISAGREE by editing

- None. All 15 scorable questions agreed.
