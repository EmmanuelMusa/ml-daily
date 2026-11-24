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
9. The build rejects a multiple choice or select-all question when the average right option is more than 25% longer than the average wrong option. Round 1 writers made the right option the longest in 27 of 35 questions, which lets people guess.
10. Number answers with a comma are read only when the comma separates thousands (`1,000`). A decimal comma such as `0,5` is refused, so Check stays off, instead of being misread as 5.
11. If the day changes while a question is half answered or its answer is showing, the screen stays put. The new day's set starts at the next press of Next.
12. When every question has been seen and no past misses can be redone today, the summary hides the Do more button and says misses come back when due.
13. The round 1 mix is 35 multiple choice, 11 select all, 13 fill in, 20 worked numbers and 11 explain. It leans more on worked numbers than the 15% target because assessments use them a lot and code can prove their answers.
14. The glossary loads in the background right after the first screen shows, not only when a concept is opened. That way the concept buttons are ready by the time an answer is checked. Today never waits for it.
15. Every question lists 1 to 4 glossary concepts, and the build requires them. Diagrams may not contain comments, CDATA, doctypes or processing instructions. The page reads SVG with the HTML parser, and these are where the HTML and XML parsers disagree.
16. "Back to the question" on a concept card unwinds every card opened from that question in one step. A card opened from a link or from the glossary goes back to the Concepts tab instead.
17. Card label "Other names and variants" replaces "Also called", because some entries list variants such as ReLU that are not true synonyms.
18. Bank size: 500 questions (mcq 190, fill 78, multi 60, numeric 100, open 72), easy 149, medium 228, hard 123, using all 267 concepts.
19. Screens 1024 px and wider get a sidebar with the tabs and a small panel for today's set, streak, accuracy, reviews due tomorrow and saved concepts. At 1200 px and wider, pages use two columns: on Today the question sits on the left and the explanation on the right, with Next pinned level with the end of the explanation. Phones keep the earlier layout.
20. On Today, the number keys pick options and Enter presses the main button (Check, Next, Show model answer or Do 3 more). Enter never presses Got it, Partly or Missed, so a self mark is always a deliberate click. Keys do nothing while typing in a box.
21. Glossary search matches names and other names first, grouped by topic. Concepts that match only in their one line meaning follow in a group of their own, so searching for an idea still finds the terms that explain it.
22. The Progress calendar shows 26 weeks on wide screens and 12 on phones. Pointing at or tapping a square shows that day under the calendar, and screen readers get a list of the days practised.
23. Loading a progress code adds it to the progress on the device instead of replacing it. Each question is settled on its own, and the device that answered it last wins. Saved concepts are combined, and removing one beats any save made before it. A code loaded by hand is always added, even after a reset.
24. Sync between devices uses a secret Gist in the person's own GitHub account and a token they make with only the gist permission. The browser talks straight to GitHub, so the site still needs no server. The token is kept under its own storage key and is never put in a progress code. Secret Gists are unlisted rather than encrypted, which is fine for a record of which questions were answered.
25. Sync runs when the app opens, about 4 seconds after the last change, when the person comes back to the tab, when the tab is hidden with changes not yet sent, and when the connection returns. An expired token, a token without the gist permission, or an unreadable Gist file stops automatic syncing until the person presses Sync now. Theme stays per device.
26. Clear my progress also clears every synced device. Anything answered on another device before the reset is dropped when it next syncs, including answers made offline there before it heard about the reset.
