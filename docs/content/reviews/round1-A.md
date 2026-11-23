# Round 1 review, group A (foundations, classic, math)

## Blind solve compare

- foundations: 6 AGREE, 0 DISAGREE, 1 SKIP (fnd-0007 is open)
- classic: 6 AGREE, 0 DISAGREE, 1 SKIP (cls-0007 is open)
- math: 6 AGREE, 0 DISAGREE
- Total: 18 AGREE, 0 DISAGREE, 2 SKIP

All numeric keys were reworked by hand before reading the content: fnd-0005 = 121, cls-0004 = 0.317 (0.32), math-0001 = 0.137 (0.14), math-0004 = 3.80.

## Per question

- fnd-0001: fixed. Key was the longest option. Tightened the key and made the high bias distractor equally specific. Key is now 95 characters against 94 to 99.
- fnd-0002: pass.
- fnd-0003: fixed. Key was the longest option. Tightened the key wording. It now ties a distractor at 94 characters and the longest option is 101.
- fnd-0004: fixed. Writer note ruled on. Rejecting "underfitting" is fair, not a trick, because underfitting names the situation and is not a term of the decomposition. The prompt now says the decomposition splits error into three named terms and asks for the term, so the expected answer is clear. The explanation now lists the three terms (bias squared, variance, irreducible noise).
- fnd-0005: fixed. Writer note ruled on. The refit was stated, but "in total" left room to doubt. The prompt now asks for the total "counting that final refit". Key unchanged at 121.
- fnd-0006: pass.
- fnd-0007: pass.
- cls-0001: fixed. Key was the longest option. Dropped "on encoded features" from the key. Key is now 90 characters against 97 to 102.
- cls-0002: fixed. Key was the longest option by a little. Tightened the key wording. Key is now 92 characters against 89 to 96.
- cls-0003: fixed (minor). Added accepted variants (z-score, British spellings of feature normalisation and standardisation). In deeper, PCA was called a distance or margin based method, which is loose. It now says PCA follows raw variance.
- cls-0004: pass.
- cls-0005: pass.
- cls-0006: pass.
- cls-0007: pass.
- math-0001: pass.
- math-0002: pass.
- math-0003: fixed. Key was the longest option. Tightened the key ("Assuming no real effect...") and lengthened one distractor slightly. Key is now 94 characters against 86 to 97.
- math-0004: fixed. Writer note ruled on. The easy label was unfair. The guide defines easy as one step, and this needs a chain rule derivative, a plug-in and an update, with a known slip (dropping the inner x). That is a short calculation of two or three steps, so difficulty changed from 1 to 2. Key unchanged at 3.80.
- math-0005: fixed. Key was the longest option by 9 characters. Tightened the key. Key is now 105 characters against 106 to 108.
- math-0006: fixed. Writer note ruled on. The prompt now says to read the interval in the standard frequentist way, where the true mean is a fixed but unknown number. That makes the "95% probability the true mean lies in 41 to 47" statement clearly wrong. The explanation now adds that a Bayesian credible interval can match these numbers under a flat prior but rests on different assumptions.

After the fixes, the key is the longest option in 0 of 8 mcq across the three topics (fnd-0003 ties).

## Answer key or core meaning changed

None. No answer key changed. Rewording kept every key and the meaning of every option. The one label change is math-0004, difficulty 1 to 2.

## DISAGREE resolved by editing the question

None. There were no DISAGREE results.

## Build

`python tools/build.py` exits 0 (total 90 questions, group A has foundations 7, classic 7, math 6).
