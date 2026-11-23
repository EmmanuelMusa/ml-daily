# Round 1 review, group D (integration, agents)

## Blind solve and compare

Both topics were solved blind from `scratch/blind/<topic>.json` before the content files were opened.

- integration: 7 AGREE, 0 DISAGREE, 1 SKIP (int-0008 is open)
- agents: 7 AGREE, 0 DISAGREE, 1 SKIP (agt-0008 is open)
- Total: 14 AGREE, 0 DISAGREE, 2 SKIP

Numeric working: int-0002 is 4 / (3 × √5) = 0.596, so 0.60. int-0007 is 12,000 × (6,000 × $2 + 500 × $8) / 10⁶ × 30 = $5,760. agt-0006 is 0.97²⁰ = 0.5438, so 54.4%.

## Per question

- int-0001: fixed. The key was the longest option (123 characters against 108 to 118). Tightened it to 110 characters with the same meaning. Explanation unchanged.
- int-0002: pass.
- int-0003: fixed. The key was the longest option (133 characters). Tightened it to 112 and shortened the regex distractor so lengths sit between 112 and 121. The explanation said tool calling enforces a schema "in a similar way", which is not true of every setup, so it now says some setups treat the schema as a strong hint, which is one more reason to validate.
- int-0004: pass. The key is not the longest option.
- int-0005: fixed. Writer note upheld. Blanking only "indirect" in "______ prompt injection" made the item a one-word guess between direct and indirect. The blank is now the full term ("The specific name for this type of attack is ______."), the answer is "indirect prompt injection", and accept covers "indirect injection", "indirect", "indirect prompt injection attack", "cross domain prompt injection" and "xpia". The weak "cross domain" alone was dropped. The explanation now names plain "prompt injection" as the common incomplete answer and says why the word "indirect" matters.
- int-0006: fixed. Writer note upheld with a careful restatement. Prompt caching reuses work only for a leading run of tokens identical to an earlier request, because each token's stored attention state depends on every token before it. The explanation now gives that reason instead of a bare "caches match on an exact prefix". It also no longer says caching always cuts cost, since billing for cached tokens is a vendor choice. It says caching usually lowers input cost because reused tokens need little new compute.
- int-0007: fixed. Writer note upheld. The explanation said output tokens "usually cost several times more" as a general fact. It now says that in this example output costs four times as much per token, that real price lists often charge more for output, and that the ratio varies, so use the actual rates.
- int-0008: pass.
- agt-0001: fixed. The key was the longest option (125 characters). Tightened it to 109. The distractor "always makes a system more accurate" used an absolute word that gives it away, so it now reads as a plausible tradeoff claim ("it can adapt its steps to odd reports, which matters more here than cost or predictability"). The "cannot call external systems" distractor was shortened. Explanation updated to answer the new distractor by content.
- agt-0002: pass. Difficulty 2 is at the low edge for naming ReAct from a trace, but fair.
- agt-0003: fixed. The key was the longest option (152 characters). Tightened it to 122 and shortened the empty-result distractor. Explanation unchanged.
- agt-0004: pass.
- agt-0005: fixed. The key was the longest option (118 characters). Rewritten to 108 and the context-window distractor shortened, so lengths sit between 103 and 116.
- agt-0006: pass. Writer note ruled: the prompt asks for 1 decimal place and the tolerance is 0.05, which match. The true value is 54.38%, inside the tolerance of the key 54.4. The check no longer rounds its own result, so the build now tests the key against the unrounded value.
- agt-0007: fixed. The key was the longest option (145 characters). Tightened it to 119. The larger-window distractor used "always", so it now reads "so every page and instruction stays in view", which is the tempting but wrong belief the explanation already rebuts.
- agt-0008: pass.

After the fixes the key is the longest option in 0 of 7 mcq across both topics. It is the shortest in 1 (int-0003, by 5 to 9 characters), and the middle in the rest.

## Answer key or core meaning changed

- int-0005: the answer changed from "indirect" to "indirect prompt injection", and the blank now asks for the whole term. The concept tested is the same.

No other key changed. agt-0001 and agt-0007 had one distractor reworded, which changes what that distractor claims but not the key.

## DISAGREE resolved by editing the question

None. There were no DISAGREE results.

## Build

`python tools/build.py` exits 0 with 90 questions in total, 8 in integration and 8 in agents.
