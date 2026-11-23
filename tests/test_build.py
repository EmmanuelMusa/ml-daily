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

    def test_normalize_fill(self):
        self.assertEqual(normalize_fill("  Cross-Entropy. "), "cross entropy")
        self.assertEqual(normalize_fill("k_means"), "k means")


if __name__ == "__main__":
    unittest.main()
