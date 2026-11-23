# ML Daily Round 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ML Daily static web app and its first 90 checked interview questions, ready to publish on GitHub Pages.

**Architecture:** A plain static site. Pure ES modules (`markup`, `grade`, `schedule`, `store`) hold all logic and are tested with `node --test`. `app.js` wires them to the page. Questions are authored as JSON per topic in `content/`, and `tools/build.py` validates them, runs their answer checks and writes one ordered `data/bank.json` that the app loads.

**Tech Stack:** HTML, CSS, vanilla JavaScript (ES modules, no libraries), Node 26 test runner, Python 3.14 standard library for tooling, plus NumPy, pandas and scikit-learn in `tools/.venv` for answer checks only.

**Spec:** `docs/superpowers/specs/2026-11-23-ml-daily-design.md`

## Global Constraints

- No third-party JavaScript or CSS. No build step for the site.
- `tools/build.py` and `tools/blind.py` use the Python standard library only. Library code runs only inside `check` snippets, through `tools/.venv`.
- Commit author `Emmanuel Musa <100617148+EmmanuelMusa@users.noreply.github.com>`, set in the repo's own `.git/config`. Never the owner's personal email.
- Commit messages carry no AI attribution of any kind: no `Co-Authored-By` naming Claude, no "Generated with" line (owner's global rule).
- Prose shown to the owner (app copy, prompts, explanations, `deeper`) has no em dash `—` and no semicolon outside code.
- No emojis anywhere in the interface. Icons are inline SVG.
- Works from 375 px wide upward. Tap targets at least 44 px tall.
- Light theme on white `#ffffff` by default, dark theme as an option.
- Daily set: due reviews first (oldest first, at most 5), then 3 new. "Do more" adds 3 new each press, no limit.
- Review intervals in days: `[1, 3, 7, 21]`, learned after a right answer at the 21 day step. A miss on review goes back to 1 day. "Partly" counts as a miss.
- Nothing is pushed to GitHub without the owner's go-ahead.

## Review Focus

1. **Browser storage blocked or throwing** (private window, blocked site data): the app still runs for the session and shows one quiet notice that progress will not be saved. Test in Task 5.
2. **Progress that names questions no longer in the bank** (a question edited out later): those ids are ignored, nothing crashes, stats skip them. Test in Task 5.
3. **Pasting a broken or foreign code into Import**: a clear error, and the current progress is untouched. Test in Task 5.
4. **Odd number entry**: `.5`, `0.50`, `1,000`, `75%`, `3/4`, spaces around the number all parse. Empty or `abc` means no answer yet, so Check stays disabled. Test in Task 3.
5. **Page left open past midnight**: the next time the page becomes visible or the owner presses Next, a new day's set is built. Unanswered new questions from yesterday are simply dealt again later, and unanswered reviews stay due. Test in Task 4.

---

## File map

```
ml-daily/
  index.html                  page shell, three views, loads assets/js/app.js as a module
  manifest.webmanifest        home screen name and icon
  assets/css/style.css        tokens for light and dark, layout, components
  assets/icons/icon.svg       app icon
  assets/js/markup.js         tiny markup renderer, HTML escaping
  assets/js/grade.js          answer parsing and grading, fixed option order
  assets/js/schedule.js       days, daily set, Do more, review schedule, stats
  assets/js/store.js          localStorage, export and import codes, pruning
  assets/js/icons.js          inline SVG icon strings
  assets/js/app.js            views and event wiring (not unit tested, checked in the browser)
  data/bank.json              built output, committed
  content/<topic>.json        question sources, one per topic
  content/blueprint-round1.json   the 90 question slots
  docs/content/WRITING_GUIDE.md   brief for writers and reviewers
  docs/content/reviews/       one review record per writer group
  docs/RULINGS.md             builder calls the owner can reverse
  tools/build.py              validate, run checks, order, write the bank
  tools/blind.py              strip keys for blind solving, compare answers
  tools/serve.py              local server with Cache-Control: no-store
  tools/requirements-check.txt  pinned NumPy, pandas, scikit-learn
  tests/*.test.mjs            node tests for the JS modules
  tests/test_build.py, tests/test_blind.py   unittest for the tools
  tests/fixtures/content/     six sample questions, one per format plus one code check
  .claude/launch.json         preview entry "ml-daily" on port 4174
  .gitignore                  tools/.venv/, scratch/, __pycache__/
```

Topic keys, id prefixes and titles (used by `build.py`, the app and the writers):

| key | prefix | title |
|---|---|---|
| foundations | fnd | ML foundations |
| classic | cls | Classic models and use cases |
| evaluation | eval | Evaluation and metrics |
| data | data | Data and features |
| deep | dl | Deep learning |
| llm | llm | Transformers and LLMs |
| integration | int | LLM integration |
| agents | agt | Agentic workflows |
| optimization | opt | Model optimization |
| mlops | ops | MLOps and production |
| design | sysd | ML system design |
| math | math | Math and statistics |
| responsible | rai | Responsible AI |
| python | py | Python for ML |

Question ids: `<prefix>-<4 digits>`, for example `eval-0007`.

---

### Task 1: Repo, check environment and content validator

**Files:**
- Create: `.gitignore`, `docs/RULINGS.md`, `tools/requirements-check.txt`, `tools/build.py`, `tests/test_build.py`, `tests/fixtures/content/*.json`

**Interfaces:**
- Produces (in `tools/build.py`):
  - `TOPICS: dict[str, tuple[str, str]]` key to (prefix, title), as in the table above, in that order.
  - `prose_violations(text: str) -> list[str]` returns messages for an em dash or a semicolon found outside fenced code blocks and inline code.
  - `validate_question(q: dict, topic_key: str) -> list[str]` returns error messages, empty when valid.
  - `normalize_fill(s: str) -> str` and `parse_number(s: str) -> float | None`, same rules as `grade.js` (Task 3).

- [ ] **Step 1: Set up the repo**

`git init -b main`, then `git config user.name "Emmanuel Musa"` and `git config user.email 100617148+EmmanuelMusa@users.noreply.github.com`. Write `.gitignore`. Create `tools/.venv` with `python -m venv tools/.venv`, install `numpy pandas scikit-learn`, then write the exact installed versions into `tools/requirements-check.txt` as `name==version` lines. Start `docs/RULINGS.md` with the builder calls already made in the spec (sections 10 and 16).

- [ ] **Step 2: Write the fixtures**

`tests/fixtures/content/evaluation.json` with six valid questions covering `mcq`, `multi`, `fill`, `numeric` (with a stdlib `check`), `open`, and one `fill` whose `check` imports pandas and sets `result` to a string. Every explanation 80 to 250 words, every `deeper` 20 to 90 words.

- [ ] **Step 3: Write failing tests in `tests/test_build.py`**

```python
class ValidateTests(unittest.TestCase):
    def test_fixture_questions_are_valid(self):  # every fixture question -> []
    def test_missing_deeper_is_error(self):       # del q["deeper"] -> an error mentioning "deeper"
    def test_mcq_needs_four_options(self):        # 3 options -> error
    def test_multi_answer_must_be_nonempty_list(self)
    def test_numeric_needs_tolerance_and_check(self)
    def test_open_needs_three_to_six_points(self)
    def test_id_prefix_must_match_topic(self):    # "fnd-0001" in topic "evaluation" -> error
    def test_explanation_word_limits(self):       # 79 words -> error, 251 -> error
    def test_difficulty_is_1_2_or_3(self)
    def test_asof_must_be_iso_date_when_present(self)

class ProseTests(unittest.TestCase):
    def test_em_dash_flagged(self):               # "a — b" -> 1 violation
    def test_semicolon_flagged(self):             # "a; b" -> 1 violation
    def test_code_is_ignored(self):               # "`x=1; y=2`" and a ``` fenced block with ; -> []

class ParseTests(unittest.TestCase):
    def test_parse_number(self):
        for s, v in [(".5", 0.5), ("0.50", 0.5), ("1,000", 1000), ("75%", 75), ("3/4", 0.75), (" 2 ", 2)]:
            self.assertAlmostEqual(parse_number(s), v)
        for s in ["", "abc", "1/0"]:
            self.assertIsNone(parse_number(s))
    def test_normalize_fill(self):
        self.assertEqual(normalize_fill("  Cross-Entropy. "), "cross entropy")
        self.assertEqual(normalize_fill("k_means"), "k means")
```

- [ ] **Step 4: Run, expect failures**

Run: `python -m unittest tests.test_build -v`
Expected: FAIL (ImportError or missing functions).

- [ ] **Step 5: Implement the validator in `tools/build.py`**

Rules from spec section 10: required fields `id topic subtopic format difficulty prompt answer explanation deeper`. `mcq` 4 options and int answer in range. `multi` 4 to 6 options, answer a non-empty list of unique in-range ints. `fill` string answer, optional `accept` list. `numeric` number answer, `tolerance` > 0, `check` required. `open` string answer, `points` 3 to 6 strings. Explanation 80 to 250 words, `deeper` 20 to 90 words (my call, recorded in RULINGS). Prose check on `prompt`, `explanation`, `deeper`, options, `points`, `answer` when it is a string. `normalize_fill`: lower case, strip, `-` and `_` to space, collapse spaces, strip trailing `.`. `parse_number`: strip spaces and commas, drop one trailing `%`, allow `a/b` with b not zero.

- [ ] **Step 6: Run, expect pass**

Run: `python -m unittest tests.test_build -v`
Expected: all PASS.

- [ ] **Step 7: Commit**

`git add -A` then `git commit -m "Add repo setup and question validator"`. The spec and this plan go in this first commit.

---

### Task 2: Answer checks, ordering and bank output

**Files:**
- Modify: `tools/build.py`
- Modify: `tests/test_build.py`

**Interfaces:**
- Consumes: Task 1 functions.
- Produces:
  - `check_python() -> str` path to `tools/.venv/Scripts/python.exe` (Windows) or `tools/.venv/bin/python`, falling back to `sys.executable`.
  - `run_check(code: str, python: str, timeout: int = 60) -> object` runs the snippet in a subprocess and returns the JSON-decoded value of `result`. Raises `CheckError` on error, timeout or a missing `result`.
  - `check_matches(q: dict, value: object) -> bool`: `numeric` within `tolerance`, `fill` by `normalize_fill(str(value))` against answer and `accept`, `mcq` by `str(value) == options[answer]`. A `check` on any other format is a validation error.
  - `order_bank(questions: list[dict], seed: int = 20261123) -> list[dict]`
  - `main(argv: list[str]) -> int`. CLI: `python tools/build.py [--content DIR] [--out FILE] [--no-checks]`. Defaults `content/` and `data/bank.json`. Prints one line per error as `<file>:<id>: <message>` and returns 1 if any, else prints a per-topic count table and returns 0.
- Bank file shape: `{"version": 1, "built": "YYYY-MM-DD", "topics": [{"key", "title"}], "questions": [...]}`. Questions are in deal order and have no `check` field.

- [ ] **Step 1: Write failing tests**

```python
def test_run_check_returns_result(self):          # "result = 40/80" -> 0.5
def test_run_check_uses_pandas_from_venv(self):   # "import pandas as pd; result = int(pd.Series([1,2]).sum())" -> 3 (skip if venv missing)
def test_run_check_error_raises(self):            # "result = 1/0" -> CheckError
def test_check_mismatch_is_build_error(self):     # fixture numeric with answer changed to 0.6 -> main returns 1, message names the id
def test_duplicate_ids_are_error(self):           # same id in two files -> main returns 1
def test_bank_has_no_check_field(self)
def test_order_is_stable(self):                   # same input twice -> same id order
def test_order_rotates_topics(self):              # 3 topics x 4 questions -> no topic appears twice in any window of 3
def test_order_easier_first_within_topic(self):   # within each topic, difficulty never decreases
```

- [ ] **Step 2: Run, expect failures**

Run: `python -m unittest tests.test_build -v`
Expected: the new tests FAIL.

- [ ] **Step 3: Implement**

`run_check` writes the snippet plus `import json, sys` and `print(json.dumps(result))` to a temp file, then runs it with the check Python. `order_bank` algorithm:

```
group questions by topic
within each topic: sort by (difficulty, rng.random()) with rng = random.Random(seed + hash of topic key via zlib.crc32)
rounds: while any topic has questions left:
    topic order for this round = remaining topics shuffled with random.Random(seed + round_number)
    if the first topic in this round equals the last topic dealt, rotate it to the end
    take one question from each topic in that order
```

- [ ] **Step 4: Run, expect pass**

Run: `python -m unittest tests.test_build -v` then `python tools/build.py --content tests/fixtures/content --out scratch/bank.json`
Expected: all PASS, and the build prints `evaluation 6` and exits 0.

- [ ] **Step 5: Commit**

`git commit -am "Run answer checks and write the ordered bank"`

---

### Task 3: Markup and grading modules

**Files:**
- Create: `assets/js/markup.js`, `assets/js/grade.js`, `tests/markup.test.mjs`, `tests/grade.test.mjs`

**Interfaces:**
- Produces:
  - `escapeHtml(s: string): string`
  - `renderMarkup(text: string): string`: paragraphs on blank lines, fenced code to `<pre><code>`, `` `x` `` to `<code>`, `**x**` to `<strong>`, lines starting `- ` to `<ul><li>`. All text escaped first.
  - `normalizeFill(s: string): string`, `parseNumber(s: string): number | null`, same rules as Task 1.
  - `hasResponse(q, response): boolean`
  - `grade(q, response): boolean`. Response by format: `mcq` original option index, `multi` array of original indexes, `fill` string, `numeric` string, `open` `"got" | "partly" | "missed"`.
  - `optionOrder(id: string, n: number): number[]` a permutation of `0..n-1` seeded by the id (FNV-1a hash into mulberry32), the same every call.

- [ ] **Step 1: Write failing tests**

```js
test('escapes html in plain text', () => assert.equal(renderMarkup('a <b> & c'), '<p>a &lt;b&gt; &amp; c</p>'));
test('fenced code keeps semicolons and escapes', ...)   // "```\nx<1; y\n```" -> '<pre><code>x&lt;1; y</code></pre>'
test('inline code, bold, list', ...)
test('parseNumber variants', ...)   // same table as Task 1, plus parseNumber('') === null
test('hasResponse is false for empty or unparseable numeric', ...)  // '' and 'abc' -> false, '.5' -> true
test('multi needs the exact set', ...)   // answer [0,2]: [2,0] true, [0] false, [0,1,2] false
test('fill uses accept list', ...)       // answer 'cross-entropy', accept ['log loss']: 'Log Loss' true
test('numeric respects tolerance', ...)  // answer 0.5 tol 0.005: '0.504' true, '0.51' false, '50%' false
test('open counts only got', ...)        // 'got' true, 'partly' false
test('optionOrder is a stable permutation', ...)  // same id twice equal, sorted equals [0..n-1], two ids differ for n=4 in at least one of ten sample ids
test('optionOrder matches the shared vector', ...) // equals tests/fixtures/option-order.json: {"eval-0007": [..4..], "py-0003": [..6..]}, generated once by this implementation and then frozen
```

- [ ] **Step 2: Run, expect failures**

Run: `node --test tests/`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement both modules**

- [ ] **Step 4: Run, expect pass**

Run: `node --test tests/`
Expected: all PASS.

- [ ] **Step 5: Commit**

`git commit -m "Add markup renderer and answer grading"` after `git add assets/js tests`.

---

### Task 4: Daily set, Do more and review schedule

**Files:**
- Create: `assets/js/schedule.js`, `tests/schedule.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces. All functions take and mutate a `progress` object and return it, unless said otherwise.

```js
// Progress shape (version 1)
{ v: 1,
  history: { [id]: [{ day: 'YYYY-MM-DD', ok: boolean }] },
  review:  { [id]: { step: 0..3, due: 'YYYY-MM-DD' } },
  learned: string[],
  today:   { day: 'YYYY-MM-DD', items: [{ id, kind: 'review'|'new'|'practice', result: null|boolean, before?: object|null }] } | null,
  settings: { theme: 'light'|'dark' } }
```

  - `INTERVALS = [1, 3, 7, 21]`, `REVIEW_CAP = 5`, `SET_SIZE = 3`
  - `dayKey(date: Date): string` local date `YYYY-MM-DD`. `addDays(day: string, n: number): string`.
  - `emptyProgress(): Progress`
  - `ensureToday(p, bankIds: string[], today: string)`: if `p.today?.day !== today`, set `p.today` to due reviews (`dueReviews`) as kind `review` followed by `nextNew(p, bankIds, SET_SIZE)` as kind `new`.
  - `dueReviews(p, today, cap = REVIEW_CAP): string[]` ids with `due <= today`, ordered by `due` then id.
  - `nextNew(p, bankIds, n): string[]` first ids in bank order with no history and not already in `p.today.items`.
  - `dealMore(p, bankIds, today): number` appends up to 3 `new` items. If none are left, appends up to 3 `practice` items from ids ever answered wrong that are not already in today's items, least recently seen first. Returns how many were added.
  - `recordResult(p, id, ok, today)`: appends to history, sets the item's `result`, stores `before` (a copy of `p.review[id]` or null). Then by kind. `new`: if wrong, `review[id] = {step: 0, due: today+1}`. `review`: if right and `step < 3`, step+1 and `due = today + INTERVALS[step+1]`. If right at step 3, delete the review entry and push to `learned`. If wrong, `{step: 0, due: today+1}`. `practice`: history only.
  - `overrideResult(p, id, today)`: for an item whose result is false, restore `review[id]` from `before`, set its last history entry `ok` to true, then apply the right-answer rule for its kind.
  - `stats(p, bank): { day, streak, answered, accuracy, byTopic: {[key]: {answered, right}}, learned, dueTomorrow }`. `day` is the number of distinct practice days including today. `streak` counts consecutive days with any answer ending today, or ending yesterday if nothing yet today. Accuracy uses each question's history entries. Ids not in `bank` are skipped.

- [ ] **Step 1: Write failing tests**

```js
test('first day deals three new in bank order', ...)            // ids a..j, empty -> today items a,b,c all kind new
test('reload same day keeps the same set', ...)                  // ensureToday twice -> same items, results kept
test('a miss comes back tomorrow first', ...)                    // miss b on day 1 -> day 2 items: review b, then new d,e,f
test('review ladder 1,3,7,21 then learned', ...)                 // right on each review -> due +3, +7, +21, then learned includes b and review has no b
test('miss on review resets to one day', ...)
test('review cap is five, rest roll over', ...)                  // 7 due -> 5 reviews today, other 2 still due tomorrow
test('do more adds three new each press', ...)                   // three presses -> 12 items, all distinct
test('do more falls back to practice when bank is used up', ...) // all seen, two ever missed -> adds 2 practice, then 0 when those are in today
test('practice results do not touch the schedule', ...)
test('override undoes a miss', ...)                              // new item wrong then override -> no review entry, history ok true
test('new day after midnight rebuilds the set', ...)             // set built for day 1 with one item unanswered, ensureToday(day 2) -> unanswered new id dealt again as new, unanswered review still present as review
test('stats skip unknown ids and count streak', ...)
```

- [ ] **Step 2: Run, expect failures**

Run: `node --test tests/`
Expected: schedule tests FAIL.

- [ ] **Step 3: Implement `schedule.js`**

- [ ] **Step 4: Run, expect pass**

Run: `node --test tests/`
Expected: all PASS.

- [ ] **Step 5: Commit**

`git commit -m "Add daily set, Do more and review schedule"`

---

### Task 5: Saving, export and import

**Files:**
- Create: `assets/js/store.js`, `tests/store.test.mjs`

**Interfaces:**
- Consumes: `emptyProgress()` from Task 4.
- Produces:
  - `STORAGE_KEY = 'ml-daily:v1'`
  - `loadProgress(storage = globalThis.localStorage): { progress, persistent: boolean }`. Any thrown error or missing storage gives `emptyProgress()` and `persistent: false`. Stored data that fails `isProgress` also gives a fresh progress, and the bad value is kept under `STORAGE_KEY + ':broken'`.
  - `saveProgress(progress, storage): boolean` false on any error.
  - `isProgress(x): boolean` shape check of the version 1 fields.
  - `exportCode(progress): string` is `'MLD1.' + base64url(UTF-8 JSON)`.
  - `importCode(code: string): Progress` trims whitespace. Throws `Error('That code is not an ML Daily progress code.')` for a wrong prefix, bad base64, bad JSON or a failed shape check.
  - `pruneUnknown(progress, bankIds: string[])` removes unknown ids from `review`, `learned` and today's items. History is kept, and `stats` skips unknown ids.

- [ ] **Step 1: Write failing tests**

```js
test('round trip through storage', ...)                // fake storage object with getItem/setItem
test('storage that throws gives persistent false', ...) // getItem throws -> emptyProgress, persistent false. saveProgress returns false
test('broken stored value is set aside', ...)
test('export then import gives the same progress', ...)
test('import rejects junk and leaves nothing changed', ...)  // 'hello', 'MLD1.%%%', 'MLD1.' + base64url('{"v":2}') all throw the exact message
test('prune drops unknown ids', ...)
```

- [ ] **Step 2: Run, expect failures**

Run: `node --test tests/`
Expected: store tests FAIL.

- [ ] **Step 3: Implement `store.js`**

Use `TextEncoder` and `btoa` and `atob` so the same code runs in Node and the browser.

- [ ] **Step 4: Run, expect pass**

Run: `node --test tests/`
Expected: all PASS.

- [ ] **Step 5: Commit**

`git commit -m "Add saving and progress codes"`

---

### Task 6: The app screens

**Files:**
- Create: `index.html`, `manifest.webmanifest`, `assets/css/style.css`, `assets/icons/icon.svg`, `assets/js/icons.js`, `assets/js/app.js`, `tools/serve.py`, `.claude/launch.json`

**Interfaces:**
- Consumes: everything from Tasks 3 to 5. Loads `data/bank.json` with `fetch`.
- Produces: the working app. Routes by hash: `#today` (default), `#progress`, `#settings`.

- [ ] **Step 1: Build a fixture bank for the screens**

Run: `python tools/build.py --content tests/fixtures/content --out data/bank.json`
Expected: exit 0. This bank is replaced in Task 10.

- [ ] **Step 2: Write the page and styles**

Layout from spec section 13. Header: "ML Daily", `Day N`, and the item counter `k/n`. Bottom bar on phones (under 720 px) and top tabs on wider screens with Today, Progress and Settings, each an SVG icon plus a word. The question card shows topic title, difficulty word (Easy, Medium, Hard) and format word (Multiple choice, Select all, Fill in, Work it out, Explain). Options appear as full-width tappable rows in `optionOrder` order. `numeric` uses `inputmode="decimal"`. `open` has an optional notes box and a "Show model answer" button, then three buttons: Got it, Partly, Missed. Check is disabled until `hasResponse` is true. After Check: verdict line (Right or Not quite), the correct answer, the explanation, a "Going deeper" block, a "Count it as right" link on `fill` and `numeric` misses, and Next. All question text goes through `renderMarkup`. Theme tokens on `:root` with `:root[data-theme="dark"]` overrides. `<html data-theme="light">` in the markup, and the saved theme is applied by a small inline head script.

- [ ] **Step 3: End of set and empty states**

The summary shows the score for this set, which topics it covered, and a **Do more** button that calls `dealMore`. When `dealMore` returns 0, it shows "You have seen every question. Nothing to redo right now." When the bank is used up but misses exist, the button reads "Do more (redo past misses)". Progress view: day, streak, answered, accuracy, learned, reviews due tomorrow, and one bar per topic with `right/answered`. Settings: theme switch showing both choices and which one is on, Export (shows the code in a read-only box with a Copy button), Import (text box, confirm, then replace), Reset (confirm). When storage is not persistent, one notice line at the top: "Progress can't be saved in this browser window."

- [ ] **Step 4: Day rollover wiring**

On `visibilitychange` to visible, and before dealing the next item, call `ensureToday` with `dayKey(new Date())` and re-render if the day changed.

- [ ] **Step 5: Local server and preview entry**

`tools/serve.py` serves the repo root on port 4174 with `Cache-Control: no-store`. `.claude/launch.json` holds `{"name": "ml-daily", "runtimeExecutable": "python", "runtimeArgs": ["tools/serve.py"], "port": 4174}`. Add the same entry, with `runtimeArgs` `["ml-daily/tools/serve.py"]`, to the parent folder's `.claude/launch.json` next to `portfolio`.

- [ ] **Step 6: Verify in the preview pane**

Start the `ml-daily` preview. At 375 by 812 and at desktop width, answer all six fixture questions through the page's own controls, using `read_page`, `find` and `form_input`, never the owner's real mouse or keyboard. Check: no console errors, Check is disabled when empty, each format grades right and wrong, the override works, Do more deals more, export then import round-trips, the dark theme reads well, and there's no sideways scroll at 375 px.

- [ ] **Step 7: Commit**

`git add -A` then `git commit -m "Add the app screens"`

- [ ] **Step 8: Owner look check (spec section 13 gate)**

Show the owner screenshots of the question screen, the answer screen and the summary, in both themes at phone width, and leave the preview running for them to click. Apply any changes they ask for before Task 10. Record each look ruling in `docs/RULINGS.md`.

---

### Task 7: Writing guide and the 90-slot blueprint

**Files:**
- Create: `docs/content/WRITING_GUIDE.md`, `content/blueprint-round1.json`, `tools/blind.py`, `tests/test_blind.py`

**Interfaces:**
- Blueprint entry: `{"id": "eval-0001", "topic": "evaluation", "subtopic": "...", "format": "mcq", "difficulty": 2, "skill": "one line on what an interviewer is checking"}`.
- `tools/blind.py strip <topic> [--content DIR]` writes `scratch/blind/<topic>.json` with only `id format prompt options` per question. Option order follows `optionOrder` (ported to Python with the same FNV-1a and mulberry32, checked against the JS by a shared test vector).
- `tools/blind.py compare <topic> <answers.json>`. The answers file maps id to response in the same shapes as `grade.js` (mcq and multi use original indexes). It prints `AGREE id` or `DISAGREE id: reviewer=<x> key=<y>` and skips `open`. It exits 0 always.

- [ ] **Step 1: Write the guide**

It covers: the target role and level (spec section 7), the quality bar (spec section 4 anti-goals as a checklist), format rules and word limits, what explanations must cover (spec section 10), the fast-changing facts rule, the style rules (plain, no em dash, no semicolon, second person is fine, no "Great question"), how to write wrong options (common misconceptions, near misses, a right fact that doesn't answer the question), and how to pin library versions in code questions. Add one fully worked example per format.

- [ ] **Step 2: Write the blueprint**

90 slots with counts per topic from spec section 8. Across the 90: about 40 mcq, 9 multi, 14 fill, 14 numeric, 13 open, and about 27 easy, 40 medium, 23 hard. Every topic has at least one of each difficulty and at least three formats. No subtopic repeats within a topic. Numeric slots go to evaluation, math, optimization (memory and throughput sums), classic and foundations. Code-reading slots go to python and data.

- [ ] **Step 3: Test blind.py (write failing tests, run, implement, run)**

```python
def test_strip_removes_keys(self)            # no answer, explanation, deeper, check, accept, points, tolerance
def test_option_order_matches_js(self)       # option_order equals every entry in tests/fixtures/option-order.json
def test_compare_reports_disagreement(self)
```

Run: `python -m unittest tests.test_blind -v`
Expected after implementing: PASS.

- [ ] **Step 4: Commit**

`git add -A` then `git commit -m "Add writing guide, round 1 blueprint and blind review tool"`

---

### Task 8: Write the 90 questions (five writer agents in parallel)

**Files:**
- Create: `content/<topic>.json` for all 14 topics

Groups (one fresh writer agent each, run in parallel):

| Group | Topics | Questions |
|---|---|---|
| A | foundations, classic, math | 20 |
| B | evaluation, data, responsible | 18 |
| C | deep, llm, optimization | 19 |
| D | integration, agents | 16 |
| E | mlops, design, python | 17 |

- [ ] **Step 1: Dispatch the writers**

Each writer's brief: read the spec, `WRITING_GUIDE.md` and their blueprint slots. Write exactly those ids. Make every `check` real code that computes the answer from the numbers in the prompt. Run `python tools/build.py --no-checks` until clean, then `python tools/build.py` until it exits 0. Report any slot they changed and why.

- [ ] **Step 2: Build everything**

Run: `python tools/build.py`
Expected: exit 0, and the count table matches the blueprint (90 total).

- [ ] **Step 3: Commit**

`git add content data` then `git commit -m "Write round 1 questions"`

---

### Task 9: Blind review and fixes (five reviewer agents in parallel)

**Files:**
- Create: `docs/content/reviews/round1-<group>.md`
- Modify: `content/<topic>.json`

- [ ] **Step 1: Dispatch the reviewers**

These are fresh agents, one per group, none of them a writer. Each one:
1. Runs `blind.py strip` for each topic, answers every question from the blind file only, and saves the answers to `scratch/blind/<topic>.answers.json`.
2. Runs `blind.py compare`.
3. Reads the full questions and scores each one pass or fail on the six checks in spec section 11, step 4.
4. Writes the record file: every disagreement and every fail, with a concrete fix.

- [ ] **Step 2: Fix**

A fresh fixer agent per group applies the fixes, or the original writer if it's still available. Any question with a disagreement is re-solved blind by a second reviewer after the fix. A question that fails twice is rewritten from its slot by a new writer.

- [ ] **Step 3: Rebuild and commit**

Run: `python tools/build.py`
Expected: exit 0, 90 questions.
`git commit -am "Fix round 1 questions after blind review"`

---

### Task 10: Spot check, final walkthrough, hand over

- [ ] **Step 1: Spot check**

I read every question that had a finding, plus at least two per topic chosen at random. Fix anything wrong and rebuild.

- [ ] **Step 2: Full test run**

Run: `node --test tests/` and `python -m unittest discover tests -v` and `python tools/build.py`
Expected: all pass, 90 questions.

- [ ] **Step 3: Walkthrough on the real bank**

In the preview at 375 px: clear storage, do day 1 (3 new), press Do more twice, miss one on purpose. Then export the progress code, move every date in it back one day with a scratch script, import it, and confirm the miss comes back first in a new set. Check for no console errors and that the explanations render correctly, including code blocks.

- [ ] **Step 4: Commit and ask about publishing**

Commit, then ask the owner whether to create the public repo `EmmanuelMusa/ml-daily` and turn on GitHub Pages from `main` root. Push only on their go-ahead. After the push, open `https://emmanuelmusa.github.io/ml-daily/` and confirm it loads the bank.
