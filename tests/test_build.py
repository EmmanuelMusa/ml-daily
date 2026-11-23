import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build  # noqa: E402
from build import normalize_fill, parse_number, prose_violations, validate_question  # noqa: E402

FIXTURES = ROOT / "tests" / "fixtures" / "content"


def fixture(fmt):
    qs = json.loads((FIXTURES / "evaluation.json").read_text(encoding="utf-8"))
    return copy.deepcopy(next(q for q in qs if q["format"] == fmt))


def words(n):
    return " ".join(["word"] * n)


class ValidateTests(unittest.TestCase):
    def test_fixture_questions_are_valid(self):
        qs = json.loads((FIXTURES / "evaluation.json").read_text(encoding="utf-8"))
        for q in qs:
            self.assertEqual(validate_question(q, "evaluation"), [], q["id"])

    def test_missing_deeper_is_error(self):
        q = fixture("mcq")
        del q["deeper"]
        errors = validate_question(q, "evaluation")
        self.assertTrue(any("deeper" in e for e in errors), errors)

    def test_mcq_needs_four_options(self):
        q = fixture("mcq")
        q["options"] = q["options"][:3]
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_multi_answer_must_be_nonempty_list(self):
        q = fixture("multi")
        q["answer"] = []
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q["answer"] = 1
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_numeric_needs_tolerance_and_check(self):
        q = fixture("numeric")
        del q["tolerance"]
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q = fixture("numeric")
        del q["check"]
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_open_needs_three_to_six_points(self):
        q = fixture("open")
        q["points"] = q["points"][:2]
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q["points"] = ["a point"] * 7
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_id_prefix_must_match_topic(self):
        q = fixture("mcq")
        q["id"] = "fnd-0001"
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_explanation_word_limits(self):
        q = fixture("mcq")
        q["explanation"] = words(79)
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q["explanation"] = words(251)
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q["explanation"] = words(80)
        self.assertEqual(validate_question(q, "evaluation"), [])

    def test_mcq_key_much_longer_than_distractors_is_error(self):
        q = fixture("mcq")
        q["options"] = ["a" * 130, "b" * 100, "c" * 100, "d" * 100]
        q["answer"] = 0
        errors = validate_question(q, "evaluation")
        self.assertTrue(any("longer" in e for e in errors), errors)
        q["options"][0] = "a" * 120
        self.assertEqual(validate_question(q, "evaluation"), [])

    def test_multi_keys_much_longer_than_distractors_is_error(self):
        q = fixture("multi")
        q["options"] = ["a" * 60, "b" * 60, "c" * 40, "d" * 40, "e" * 60]
        q["answer"] = [0, 1, 4]
        errors = validate_question(q, "evaluation")
        self.assertTrue(any("longer" in e for e in errors), errors)

    def test_difficulty_is_1_2_or_3(self):
        q = fixture("mcq")
        q["difficulty"] = 4
        self.assertNotEqual(validate_question(q, "evaluation"), [])

    def test_asof_must_be_iso_date_when_present(self):
        q = fixture("mcq")
        q["asof"] = "Nov 2026"
        self.assertNotEqual(validate_question(q, "evaluation"), [])
        q["asof"] = "2026-11-23"
        self.assertEqual(validate_question(q, "evaluation"), [])


class ProseTests(unittest.TestCase):
    def test_em_dash_flagged(self):
        self.assertEqual(len(prose_violations("a — b")), 1)

    def test_semicolon_flagged(self):
        self.assertEqual(len(prose_violations("a; b")), 1)

    def test_code_is_ignored(self):
        self.assertEqual(prose_violations("Run `x=1; y=2` now."), [])
        self.assertEqual(prose_violations("Code:\n\n```python\nx = 1; y = 2\n```\n\nDone."), [])


class ParseTests(unittest.TestCase):
    def test_parse_number(self):
        for s, v in [(".5", 0.5), ("0.50", 0.5), ("1,000", 1000), ("75%", 75), ("3/4", 0.75), (" 2 ", 2)]:
            self.assertAlmostEqual(parse_number(s), v)
        for s in ["", "abc", "1/0"]:
            self.assertIsNone(parse_number(s))
        for s in ["0,5", "1,5", "12,34"]:
            self.assertIsNone(parse_number(s))
        self.assertEqual(parse_number("12,345,678"), 12345678)
        self.assertEqual(parse_number("1,000.5"), 1000.5)

    def test_normalize_fill(self):
        self.assertEqual(normalize_fill("  Cross-Entropy. "), "cross entropy")
        self.assertEqual(normalize_fill("k_means"), "k means")


VENV_PY = ROOT / "tools" / ".venv" / "Scripts" / "python.exe"


def write_content(tmp, topic, questions):
    d = Path(tmp)
    (d / f"{topic}.json").write_text(json.dumps(questions), encoding="utf-8")
    return d


def make_q(topic, n, difficulty=1):
    q = fixture("mcq")
    q["id"] = f"{build.TOPICS[topic][0]}-{n:04d}"
    q["topic"] = topic
    q["difficulty"] = difficulty
    return q


class CheckTests(unittest.TestCase):
    def test_run_check_returns_result(self):
        self.assertEqual(build.run_check("result = 40/80", sys.executable), 0.5)

    @unittest.skipUnless(VENV_PY.exists(), "check venv missing")
    def test_run_check_uses_pandas_from_venv(self):
        code = "import pandas as pd\nresult = int(pd.Series([1, 2]).sum())"
        self.assertEqual(build.run_check(code, build.check_python()), 3)

    def test_run_check_error_raises(self):
        with self.assertRaises(build.CheckError):
            build.run_check("result = 1/0", sys.executable)
        with self.assertRaises(build.CheckError):
            build.run_check("x = 1", sys.executable)


class BuildTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.out = Path(self.tmp.name) / "out" / "bank.json"

    def test_check_mismatch_is_build_error(self):
        q = fixture("numeric")
        q["answer"] = 0.6
        d = Path(self.tmp.name) / "c"
        d.mkdir()
        write_content(d, "evaluation", [q])
        import io, contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = build.main(["--content", str(d), "--out", str(self.out), "--glossary", str(ROOT / "tests" / "fixtures" / "glossary")])
        self.assertEqual(code, 1)
        self.assertIn(q["id"], buf.getvalue())

    def test_duplicate_ids_are_error(self):
        d = Path(self.tmp.name) / "c"
        d.mkdir()
        a = make_q("evaluation", 1)
        b = make_q("data", 1)
        b["id"] = "data-0001"
        c = make_q("data", 2)
        c["id"] = "data-0001"
        write_content(d, "evaluation", [a])
        write_content(d, "data", [b, c])
        import io, contextlib
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(build.main(["--content", str(d), "--out", str(self.out), "--glossary", str(ROOT / "tests" / "fixtures" / "glossary")]), 1)

    def test_bank_has_no_check_field(self):
        import io, contextlib
        with contextlib.redirect_stdout(io.StringIO()):
            code = build.main(["--content", str(FIXTURES), "--out", str(self.out), "--glossary", str(ROOT / "tests" / "fixtures" / "glossary")])
        self.assertEqual(code, 0)
        bank = json.loads(self.out.read_text(encoding="utf-8"))
        self.assertEqual(bank["version"], 1)
        self.assertEqual(len(bank["questions"]), 6)
        self.assertTrue(all("check" not in q for q in bank["questions"]))
        self.assertEqual(bank["topics"][0], {"key": "foundations", "title": "ML foundations"})


class OrderTests(unittest.TestCase):
    def sample(self):
        qs = []
        for t in ("evaluation", "data", "math"):
            for i, d in enumerate((3, 1, 2, 1), start=1):
                qs.append(make_q(t, i, d))
        return qs

    def test_order_is_stable(self):
        a = [q["id"] for q in build.order_bank(self.sample())]
        b = [q["id"] for q in build.order_bank(self.sample())]
        self.assertEqual(a, b)

    def test_order_rotates_topics(self):
        topics = [q["topic"] for q in build.order_bank(self.sample())]
        self.assertEqual(set(topics[:3]), {"evaluation", "data", "math"})
        for a, b in zip(topics, topics[1:]):
            self.assertNotEqual(a, b, topics)

    def test_order_easier_first_within_topic(self):
        ordered = build.order_bank(self.sample())
        for t in ("evaluation", "data", "math"):
            ds = [q["difficulty"] for q in ordered if q["topic"] == t]
            self.assertEqual(ds, sorted(ds))


if __name__ == "__main__":
    unittest.main()
