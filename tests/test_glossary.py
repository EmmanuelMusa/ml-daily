import contextlib
import io
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build  # noqa: E402

GLOSS = ROOT / "tests" / "fixtures" / "glossary"
CONTENT = ROOT / "tests" / "fixtures" / "content"
CAT = {"precision", "recall", "class-imbalance"}


def entry():
    return json.loads((GLOSS / "evaluation.json").read_text(encoding="utf-8"))[0]


class ConceptTests(unittest.TestCase):
    def test_fixture_entries_are_valid(self):
        for e in json.loads((GLOSS / "evaluation.json").read_text(encoding="utf-8")):
            self.assertEqual(build.validate_concept(e, "evaluation", CAT), [], e["id"])

    def test_unknown_related_is_error(self):
        e = entry()
        e["related"] = ["nope"]
        self.assertTrue(any("related" in m for m in build.validate_concept(e, "evaluation", CAT)))

    def test_entry_not_in_catalogue_is_error(self):
        e = entry()
        e["id"] = "f1-score"
        self.assertNotEqual(build.validate_concept(e, "evaluation", CAT), [])

    def test_summary_and_body_limits(self):
        e = entry()
        e["summary"] = "Too short."
        self.assertNotEqual(build.validate_concept(e, "evaluation", CAT), [])
        e = entry()
        e["body"] = " ".join(["word"] * 181)
        self.assertNotEqual(build.validate_concept(e, "evaluation", CAT), [])

    def test_style_rules_apply(self):
        e = entry()
        e["summary"] = "Of everything flagged; the share that was right, as a rate between zero and one."
        self.assertTrue(any("semicolon" in m for m in build.validate_concept(e, "evaluation", CAT)))


class SvgTests(unittest.TestCase):
    def test_fixture_diagram_is_clean(self):
        svg = (GLOSS / "diagrams" / "precision.svg").read_text(encoding="utf-8")
        self.assertEqual(build.svg_problems(svg), [])

    def test_unsafe_or_off_palette_svg_rejected(self):
        bad = [
            '<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>',
            '<svg viewBox="0 0 10 10"><rect onclick="x()" width="1" height="1"/></svg>',
            '<svg viewBox="0 0 10 10"><a href="https://x.y"><rect width="1" height="1"/></a></svg>',
            '<svg viewBox="0 0 10 10"><image href="x.png"/></svg>',
            '<svg viewBox="0 0 10 10"><rect style="fill:url(https://x)" width="1" height="1"/></svg>',
            '<svg viewBox="0 0 10 10"><rect fill="#ff0000" width="1" height="1"/></svg>',
            '<svg viewBox="0 0 10 10"><rect class="f-pink" width="1" height="1"/></svg>',
            '<svg width="100" viewBox="0 0 10 10"></svg>',
            '<svg><rect width="1" height="1"/></svg>',
            'not xml',
        ]
        for s in bad:
            self.assertNotEqual(build.svg_problems(s), [], s)

    def test_local_marker_reference_allowed(self):
        s = ('<svg viewBox="0 0 10 10"><defs><marker id="a" viewBox="0 0 4 4" refX="2" refY="2" '
             'markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L4 2L0 4z" class="f-ink"/></marker></defs>'
             '<line x1="0" y1="5" x2="9" y2="5" class="s-ink" marker-end="url(#a)"/></svg>')
        self.assertEqual(build.svg_problems(s), [])


class GlossaryBuildTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp)

    def run_build(self, content=CONTENT, *extra):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = build.main(["--content", str(content), "--glossary", str(GLOSS),
                               "--out", str(self.tmp / "bank.json"),
                               "--glossary-out", str(self.tmp / "glossary.json"), "--no-checks", *extra])
        return code, buf.getvalue()

    def test_glossary_written_with_inline_svg(self):
        code, out = self.run_build()
        self.assertEqual(code, 0, out)
        g = json.loads((self.tmp / "glossary.json").read_text(encoding="utf-8"))
        self.assertEqual([c["id"] for c in g["concepts"]], ["precision", "recall"])
        self.assertIn("<svg", g["concepts"][0]["svg"])
        self.assertNotIn("svg", g["concepts"][1])
        self.assertEqual(g["topics"][0]["key"], "foundations")

    def test_question_concepts_must_exist(self):
        src = self.tmp / "content"
        shutil.copytree(CONTENT, src)
        qs = json.loads((src / "evaluation.json").read_text(encoding="utf-8"))
        qs[0]["concepts"] = ["no-such-concept"]
        (src / "evaluation.json").write_text(json.dumps(qs), encoding="utf-8")
        code, out = self.run_build(src)
        self.assertEqual(code, 1)
        self.assertIn("no-such-concept", out)

    def test_require_concepts_flag(self):
        code, out = self.run_build(CONTENT, "--require-concepts")
        self.assertEqual(code, 1)
        self.assertIn("concepts", out)

    def test_question_concepts_list_shape(self):
        src = self.tmp / "content"
        shutil.copytree(CONTENT, src)
        qs = json.loads((src / "evaluation.json").read_text(encoding="utf-8"))
        for q in qs:
            q["concepts"] = ["precision"]
        qs[1]["concepts"] = ["precision", "recall", "class-imbalance", "precision", "recall"]
        (src / "evaluation.json").write_text(json.dumps(qs), encoding="utf-8")
        code, out = self.run_build(src, "--require-concepts")
        self.assertEqual(code, 1)
        self.assertIn(qs[1]["id"], out)


if __name__ == "__main__":
    unittest.main()
