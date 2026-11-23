# Rulings

Builder calls the owner can reverse. Newest at the bottom.

1. The app is called ML Daily. Suggested repo `ml-daily`.
2. Explanation length 80 to 250 words. The "Going deeper" note is required and 20 to 90 words.
3. For multiple choice and select all, the explanation covers why each wrong option is wrong. For the other formats, it covers the most common mistake.
4. Questions test principles, not vendor APIs, model names, prices or versions. Regulation questions carry an `asof` date.
5. Answer checks run in `tools/.venv` with numpy 2.5.5, pandas 3.1.1 and scikit-learn 1.9.1. Code questions name the major version in the prompt (for example "pandas 3.x").
6. Review cap 5 a day, intervals 1, 3, 7, 21 days, then learned. "Partly" on an open question counts as a miss.
7. Number answers accept `.5`, `1,000`, `75%` (read as 75) and fractions like `3/4`.
8. Progress codes start with `MLD1.` and are plain base64 of the progress, not compressed.
