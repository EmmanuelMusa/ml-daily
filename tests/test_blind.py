import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import blind  # noqa: E402

FIXTURES = ROOT / "tests" / "fixtures" / "content"
KEY_FIELDS = {"answer", "explanation", "deeper", "check", "accept", "points", "tolerance"}


class BlindTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.out = Path(self.tmp.name)

    def strip(self):
        path = blind.strip("evaluation", FIXTURES, self.out)
        return json.loads(path.read_text(encoding="utf-8"))

    def test_strip_removes_keys(self):
        items = self.strip()
        self.assertEqual(len(items), 6)
        for item in items:
            self.assertFalse(KEY_FIELDS & set(item), item["id"])
            self.assertEqual(set(item) - {"options"}, {"id", "format", "prompt"})

    def test_strip_keeps_original_option_index_in_display_order(self):
        items = {i["id"]: i for i in self.strip()}
        mcq = items["eval-9001"]
        self.assertEqual([o["index"] for o in mcq["options"]], blind.option_order("eval-9001", 4))
        source = json.loads((FIXTURES / "evaluation.json").read_text(encoding="utf-8"))
        texts = {q["id"]: q["options"] for q in source if "options" in q}
        for o in mcq["options"]:
            self.assertEqual(o["text"], texts["eval-9001"][o["index"]])

    def test_option_order_matches_js(self):
        vec = json.loads((ROOT / "tests" / "fixtures" / "option-order.json").read_text(encoding="utf-8"))
        for qid, order in vec.items():
            self.assertEqual(blind.option_order(qid, len(order)), order)

    def test_compare_reports_disagreement(self):
        answers = self.out / "answers.json"
        answers.write_text(json.dumps({
            "eval-9001": 0, "eval-9002": [0, 1], "eval-9003": "Sensitivity",
            "eval-9004": "0.8", "eval-9006": "north",
        }), encoding="utf-8")
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = blind.compare("evaluation", answers, FIXTURES)
        text = buf.getvalue()
        self.assertEqual(code, 0)
        self.assertIn("AGREE eval-9001", text)
        self.assertIn("AGREE eval-9003", text)
        self.assertIn("AGREE eval-9006", text)
        self.assertIn("DISAGREE eval-9002", text)
        self.assertIn("DISAGREE eval-9004", text)
        self.assertIn("SKIP eval-9005", text)


if __name__ == "__main__":
    unittest.main()
