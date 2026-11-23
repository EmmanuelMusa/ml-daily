# ML Daily UI review

Reviewed on 2026-11-23 in the running app at 375 x 812 and 1100 x 800, light and dark. This file records what was wrong, what changed, and the motion plan.

## What already works

- One column, white paper, ink buttons, colour only for results. The look is calm and reads as a study tool.
- Serif prompt against sans UI gives the question a clear voice.
- The sticky action bar sits flush on the bottom tab bar on phones, and Check is always in reach.
- Focus moves to the verdict after Check and to the prompt after Next, so keyboard and screen reader users land in the right place.

## Screen by screen

### Today, question

- The scorecard rail is the one memorable element but it is small (18 px squares) and quiet. It reads as a row of checkboxes, not a scorecard.
- Rail squares carry right and wrong by colour alone. Green and brick are hard to tell apart for people with red green colour blindness. The only text is a `title`, which touch screens and most screen readers never surface.
- The radio and checkbox marks use `--line-strong` (#c9d0dc), about 1.5 to 1 against white. Form controls need 3 to 1 to be seen reliably. The text answer box has the same problem.
- Selecting an option swaps the mark in one frame. There is no press feedback, so a tap on a phone feels unconfirmed until the mark appears.
- Hovering a locked option on desktop gives it an ink border (`border-color: inherit` picks up the text colour). It looks selectable when it is not.

### Today, after Check

- Every element arrives at once. The verdict, the key, the explanation and Going deeper all compete in the same frame, so the eye has no order.
- The verdict is a 24 px icon beside bold text. It is the most important line on the screen and it is about the same weight as the meta line.
- A wrong pick keeps an ink dot, so the row says "brick" but the mark says "selected, neutral". The right pick keeps an ink dot too.
- Options that were neither picked nor right keep full contrast and compete with the key.
- The explanation runs at 1.5 line height. Long paragraphs on a phone read better at 1.6.

### Explain format

- Show model answer swaps the model block in with no sign of where it appeared. On a phone the scroll stops with the heading hidden behind the sticky bar.
- Got it, Partly and Missed are well sized. Nothing to change beyond motion.

### Summary

- "You got 1 of 3 right today" is the result of the day but it is set as a grey lede, the weakest text on the page.
- Prompts are cut at 88 characters mid word ("subsample val..."), even on desktop where there is room for the whole first line twice over.
- The rail label still says "3 of 3" when the set is done.
- Nothing marks the moment the set ends. It is the natural place for one small reward.

### Progress

- Bars render at final width. Nothing draws the eye to the per topic picture.
- "Not started" rows look the same as "0 of 1 right" rows. Both show an empty bar at full ink label weight.
- Figures use proportional digits, so values shift sideways as numbers change.
- The Day figure repeats the header label. Kept because six figures balance the 2 and 3 column grids.

### Settings

- "Clear my progress" looks the same as the harmless buttons around it.
- Everything else is plain and clear. The theme switch reads well in both themes.

### Shell

- The active bottom tab is shown only by bolder text. At a glance on a phone the three tabs look alike.
- No press feedback on buttons or tabs.
- Changing tabs replaces the page in one frame.

### Dark theme

- Contrast is good throughout. The result colours are lighter so filled rail squares need a dark glyph, not white. Paper works for both themes.

### Empty and error states

- "Nothing due today" and the load error are plain sentences in muted text. They are clear and need no change.

## Ranked changes

1. Answer moment: order the reveal (rail square, verdict, key highlight, explanation in sequence). Biggest effect on daily feel.
2. Rail: larger squares (24 px), a check or cross glyph inside filled squares so colour is not the only signal, hidden text per square for screen readers, "Done" when the set is finished.
3. Control contrast: new `--control` token at 3 to 1 or better for radio and checkbox marks and text inputs.
4. Option feedback: press scale, marks that fill with a short scale, wrong pick mark in brick, right pick mark in green, unpicked non key options muted after Check, fix the locked hover border.
5. Verdict: icon in a soft round badge, larger text.
6. Summary: score as a large figure, full prompts clamped to two lines instead of cut mid word, rail replays once.
7. Progress: bars grow from zero, not started rows muted, tabular digits.
8. Settings: Clear my progress in brick text.
9. Tabs: a short ink bar marks the active tab on phones.
10. Explanation line height 1.6.
11. Small fixes found while testing. Show model answer scrolled the heading behind the sticky bar on phones, so it now has a scroll margin. The verdict, prompt and headings showed a blue focus ring after Check and Next although they are not controls, so elements with `tabindex="-1"` lose the ring. A review question lost its dashed outline while current, so it keeps it. Hover styles only apply on devices that can hover, so a tapped row on a phone does not keep a hover border.
12. `app.js` imports `icons.js?v=3` so a cached old icon file cannot meet the new draw-in CSS.

## Motion plan

All motion lives in one `@media (prefers-reduced-motion: no-preference)` block at the end of `style.css`. With reduced motion on, nothing moves or fades and every element shows in its final state at once. Only `transform` and `opacity` are animated, except the multi select mark fill (a 20 px square, background colour) and button disabled opacity.

Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` for arrivals. `--ease-settle: cubic-bezier(0.34, 1.4, 0.64, 1)` for the rail square only, a small overshoot of about 6 percent that settles once.

Nothing waits on motion. Buttons are never animated in, so Check, Next and the self grade buttons can be pressed in the first frame. Animations replay only on the event that caused them (Check, Next, reveal, tab change), not on other re-renders.

| Moment | What moves | Duration | Delay |
|---|---|---|---|
| Tap an option | Row scales to 0.985 while pressed | 120 ms | 0 |
| Pick an option | Radio dot or checkbox tick scales from 0.4 to 1 and fades in | 160 ms | 0 |
| Check | Current rail square scales 0.6 to 1 with settle, glyph draws | 320 ms, glyph 220 ms | 0, glyph 140 ms |
| Check | Verdict badge scales 0.7 to 1 and fades in | 260 ms | 0 |
| Check | Verdict icon stroke draws | 300 ms | 80 ms |
| Check | Key option soft fill fades in, wrong pick fill fades in | 260 ms | 60 ms |
| Check | Option flag icon draws | 260 ms | 160 ms |
| Check | Answer line, explanation, Going deeper fade and rise 6 px | 280 ms each | 120, 180, 240 ms |
| Override (I was right) | Rail square and verdict as on Check, text stays still | as above | as above |
| Show model answer | Model block fades and rises 6 px | 280 ms | 0 |
| Next | New question fades and rises 8 px. Rail stays still. New current square fades its ring in | 240 ms | 0 |
| Set finished | Rail squares fill in turn, heading, score and list fade and rise | 280 ms per square | 70 ms apart, text from 120 ms |
| Tab change | Page fades in | 180 ms | 0 |
| Progress opens | Bars grow from the left (scaleX 0 to 1) | 420 ms | 25 ms apart |
| Mobile tab bar | Active bar grows from the centre | 200 ms | 0 |
| Button press | Scales to 0.98 | 100 ms | 0 |

## Considered and not done

- Outgoing fade between questions. It would delay the next question by its length or need two copies of the page on screen. The incoming rise gives the same sense of moving on with no wait.
- Counting up the summary score. With 3 to 8 questions a count up is a flicker, not a reward. The rail replay carries that moment instead.
- Confetti, looping pulses, streak flames. Against the brief.
- Removing the Day figure on Progress. It repeats the header, but six figures keep the grid even.
- Disabling Load this code while the box is empty. It would change behaviour the error message already covers.
