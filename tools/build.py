"""Validate ML Daily question files and write the bank the app loads.

Usage: python tools/build.py [--content DIR] [--out FILE] [--no-checks]
Standard library only. Answer checks run in tools/.venv when it exists.
"""
import argparse
import datetime
import json
import os
import random
import re
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TOPICS = {
    "foundations": ("fnd", "ML foundations"),
    "classic": ("cls", "Classic models and use cases"),
    "evaluation": ("eval", "Evaluation and metrics"),
    "data": ("data", "Data and features"),
    "deep": ("dl", "Deep learning"),
    "llm": ("llm", "Transformers and LLMs"),
    "integration": ("int", "LLM integration"),
    "agents": ("agt", "Agentic workflows"),
    "optimization": ("opt", "Model optimization"),
    "mlops": ("ops", "MLOps and production"),
    "design": ("sysd", "ML system design"),
    "math": ("math", "Math and statistics"),
    "responsible": ("rai", "Responsible AI"),
    "python": ("py", "Python for ML"),
}

FORMATS = ("mcq", "multi", "fill", "numeric", "open")
REQUIRED = ("id", "topic", "subtopic", "format", "difficulty", "prompt", "answer", "explanation", "deeper")
EXPLANATION_WORDS = (80, 250)
DEEPER_WORDS = (20, 90)
KEY_LENGTH_LIMIT = 1.25  # average key length may be at most 25% above the average distractor

_FENCE = re.compile(r"```.*?```", re.S)
_INLINE = re.compile(r"`[^`\n]*`")


def _strip_code(text):
    return _INLINE.sub("", _FENCE.sub("", text))


def prose_violations(text):
    """Messages for each em dash or semicolon outside code."""
    plain = _strip_code(text)
    out = []
    for ch, name in (("—", "em dash"), (";", "semicolon")):
        out += [f"{name} in prose"] * plain.count(ch)
    return out


def normalize_fill(s):
    s = str(s).strip().lower().replace("-", " ").replace("_", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s.rstrip(".").strip()


_GROUPED = re.compile(r"[+-]?\d{1,3}(,\d{3})+(\.\d*)?%?")
_NUM = re.compile(r"[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?", re.I)


def parse_number(s):
    """Same rules as parseNumber in assets/js/grade.js."""
    t = re.sub(r"\s", "", str(s))
    if "," in t:
        if not _GROUPED.fullmatch(t):
            return None
        t = t.replace(",", "")
    if t.endswith("%"):
        t = t[:-1]
    if not t:
        return None
    parts = t.split("/")
    if len(parts) > 2 or not all(_NUM.fullmatch(p) for p in parts):
        return None
    if len(parts) == 2:
        b = float(parts[1])
        return None if b == 0 else float(parts[0]) / b
    return float(t)


def _word_count(text):
    return len(_strip_code(text).split())


def _is_int(x):
    return isinstance(x, int) and not isinstance(x, bool)


def validate_question(q, topic_key):
    errors = []
    for field in REQUIRED:
        if field not in q or q[field] in (None, ""):
            errors.append(f"missing {field}")
    if errors:
        return errors

    prefix = TOPICS[topic_key][0]
    if not re.fullmatch(rf"{re.escape(prefix)}-\d{{4}}", q["id"]):
        errors.append(f"id must look like {prefix}-0001")
    if q["topic"] != topic_key:
        errors.append(f"topic must be {topic_key}")
    fmt = q["format"]
    if fmt not in FORMATS:
        return errors + [f"unknown format {fmt}"]
    if q["difficulty"] not in (1, 2, 3) or not _is_int(q["difficulty"]):
        errors.append("difficulty must be 1, 2 or 3")
    if "asof" in q and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(q["asof"])):
        errors.append("asof must be YYYY-MM-DD")

    ans = q["answer"]
    opts = q.get("options")
    if fmt == "mcq":
        if not isinstance(opts, list) or len(opts) != 4:
            errors.append("mcq needs exactly 4 options")
        elif not _is_int(ans) or not 0 <= ans < 4:
            errors.append("mcq answer must be an option index")
    elif fmt == "multi":
        if not isinstance(opts, list) or not 4 <= len(opts) <= 6:
            errors.append("multi needs 4 to 6 options")
        elif (not isinstance(ans, list) or not ans or len(set(ans)) != len(ans)
              or not all(_is_int(a) and 0 <= a < len(opts) for a in ans)):
            errors.append("multi answer must be a non-empty list of unique option indexes")
    elif fmt == "fill":
        if not isinstance(ans, str):
            errors.append("fill answer must be a string")
        if "accept" in q and not (isinstance(q["accept"], list) and all(isinstance(a, str) for a in q["accept"])):
            errors.append("accept must be a list of strings")
    elif fmt == "numeric":
        if not isinstance(ans, (int, float)) or isinstance(ans, bool):
            errors.append("numeric answer must be a number")
        tol = q.get("tolerance")
        if not isinstance(tol, (int, float)) or tol <= 0:
            errors.append("numeric needs a tolerance above 0")
        if not q.get("check"):
            errors.append("numeric needs a check")
    elif fmt == "open":
        if not isinstance(ans, str):
            errors.append("open answer must be a string")
        pts = q.get("points")
        if not isinstance(pts, list) or not 3 <= len(pts) <= 6:
            errors.append("open needs 3 to 6 points")
    if fmt in ("mcq", "multi") and not errors:
        keys = set(ans) if fmt == "multi" else {ans}
        key_len = [len(o) for i, o in enumerate(opts) if i in keys]
        other_len = [len(o) for i, o in enumerate(opts) if i not in keys]
        if other_len and sum(key_len) / len(key_len) > KEY_LENGTH_LIMIT * sum(other_len) / len(other_len):
            errors.append("key is much longer than the other options, which gives it away")
    if "check" in q and fmt not in ("numeric", "fill", "mcq"):
        errors.append(f"check is not allowed on {fmt}")

    n = _word_count(q["explanation"])
    if not EXPLANATION_WORDS[0] <= n <= EXPLANATION_WORDS[1]:
        errors.append(f"explanation has {n} words, needs {EXPLANATION_WORDS[0]} to {EXPLANATION_WORDS[1]}")
    n = _word_count(q["deeper"])
    if not DEEPER_WORDS[0] <= n <= DEEPER_WORDS[1]:
        errors.append(f"deeper has {n} words, needs {DEEPER_WORDS[0]} to {DEEPER_WORDS[1]}")

    prose = [q["prompt"], q["explanation"], q["deeper"]]
    prose += [o for o in (opts or []) if isinstance(o, str)]
    prose += [p for p in (q.get("points") or []) if isinstance(p, str)]
    if isinstance(ans, str):
        prose.append(ans)
    for text in prose:
        errors += prose_violations(text)
    return errors


# ---------------------------------------------------------------- checks



class CheckError(Exception):
    pass


def check_python():
    venv = ROOT / "tools" / ".venv"
    for candidate in (venv / "Scripts" / "python.exe", venv / "bin" / "python"):
        if candidate.exists():
            return str(candidate)
    return sys.executable


def run_check(code, python, timeout=60):
    """Run a check snippet and return the JSON value of its `result`."""
    script = code + "\n\nimport json as _json\nprint(_json.dumps(result))\n"
    fd, path = tempfile.mkstemp(suffix=".py")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(script)
        try:
            proc = subprocess.run([python, "-I", path], capture_output=True, text=True,
                                  timeout=timeout, cwd=tempfile.gettempdir())
        except subprocess.TimeoutExpired:
            raise CheckError(f"check timed out after {timeout}s")
        if proc.returncode != 0:
            last = (proc.stderr.strip().splitlines() or ["unknown error"])[-1]
            raise CheckError(f"check failed: {last}")
        lines = proc.stdout.strip().splitlines()
        try:
            return json.loads(lines[-1])
        except (IndexError, ValueError):
            raise CheckError("check printed no result")
    finally:
        os.unlink(path)


def check_matches(q, value):
    fmt = q["format"]
    if fmt == "numeric":
        return isinstance(value, (int, float)) and abs(value - q["answer"]) <= q["tolerance"] + 1e-12
    if fmt == "fill":
        accepted = {normalize_fill(a) for a in [q["answer"], *q.get("accept", [])]}
        return normalize_fill(str(value)) in accepted
    if fmt == "mcq":
        return str(value) == q["options"][q["answer"]]
    return False


# ---------------------------------------------------------------- order

def order_bank(questions, seed=20261123):
    """Deal order: rotate through topics, easier questions earlier within each topic."""
    by_topic = {}
    for q in questions:
        by_topic.setdefault(q["topic"], []).append(q)
    for key, qs in by_topic.items():
        rng = random.Random(seed + zlib.crc32(key.encode()))
        keyed = [(q["difficulty"], rng.random(), q["id"], q) for q in sorted(qs, key=lambda q: q["id"])]
        by_topic[key] = [k[3] for k in sorted(keyed, key=lambda k: k[:3])]
    out, last, rnd = [], None, 0
    while any(by_topic.values()):
        topics = sorted(k for k, qs in by_topic.items() if qs)
        random.Random(seed + rnd).shuffle(topics)
        if len(topics) > 1 and topics[0] == last:
            topics.append(topics.pop(0))
        for t in topics:
            out.append(by_topic[t].pop(0))
        last = out[-1]["topic"]
        rnd += 1
    return out


# ---------------------------------------------------------------- glossary

CONCEPT_ID = re.compile(r"[a-z0-9]+(-[a-z0-9]+)*")
SUMMARY_WORDS = (8, 35)
BODY_WORDS = (60, 180)
MIXUP_WORDS = (12, 70)

SVG_TAGS = {"svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
            "text", "tspan", "title", "defs", "marker"}
SVG_ATTRS = {"id", "class", "viewBox", "role", "aria-hidden", "aria-label", "d", "points",
             "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height",
             "transform", "opacity", "fill", "stroke", "stroke-width", "stroke-dasharray",
             "stroke-linecap", "stroke-linejoin", "fill-opacity", "stroke-opacity", "text-anchor",
             "dominant-baseline", "font-size", "font-weight", "marker-end", "marker-start",
             "marker-mid", "refX", "refY", "markerWidth", "markerHeight", "orient", "markerUnits",
             "dx", "dy"}
_PALETTE = ("ink", "muted", "line", "right", "wrong", "sheet", "paper", "none")
SVG_CLASSES = ({f"f-{c}" for c in _PALETTE} | {f"s-{c}" for c in _PALETTE}
               | {"s-thin", "s-thick", "s-dash", "t-small", "t-label", "t-bold", "t-muted"})
_MARKER_REF = re.compile(r"url\(#[A-Za-z][\w-]*\)")


def _local(name):
    return name.split("}", 1)[-1]


def svg_problems(text):
    """Problems that make a diagram unsafe or off the app's palette. Empty means clean."""
    import xml.etree.ElementTree as ET
    # The page injects the raw text with the HTML parser, which reads <!...> and <?...> differently
    # from an XML parser. Refuse them outright so the two parsers cannot disagree.
    body = re.sub(r"^\s*<\?xml[^>]*\?>", "", text)
    if "<!" in body or "<?" in body or "]]>" in body:
        return ["comments, CDATA, doctypes and processing instructions are not allowed"]
    try:
        root = ET.fromstring(text)
    except ET.ParseError as e:
        return [f"not valid SVG ({e})"]
    out = []
    if _local(root.tag) != "svg":
        out.append("root element must be svg")
    if "viewBox" not in root.attrib:
        out.append("svg needs a viewBox")
    if "width" in root.attrib or "height" in root.attrib:
        out.append("svg must not set width or height")
    for el in root.iter():
        tag = _local(el.tag)
        if tag not in SVG_TAGS:
            out.append(f"element <{tag}> is not allowed")
            continue
        for raw, value in el.attrib.items():
            name = _local(raw)
            if raw.startswith("{http://www.w3.org/XML/1998/namespace}"):
                continue
            if name not in SVG_ATTRS:
                out.append(f"attribute {name} on <{tag}> is not allowed")
            elif name in ("fill", "stroke") and value not in ("none", "currentColor"):
                out.append(f"{name}={value!r} on <{tag}>: use a palette class instead")
            elif name == "class":
                bad = [c for c in value.split() if c not in SVG_CLASSES]
                if bad:
                    out.append(f"class {' '.join(bad)} on <{tag}> is not in the palette")
            elif name.startswith("marker-") and not _MARKER_REF.fullmatch(value):
                out.append(f"{name} must point to a local marker like url(#arrow)")
    return out


def validate_concept(e, topic_key, catalogue_ids):
    errors = []
    for field in ("id", "name", "topic", "summary", "body", "related"):
        if not e.get(field):
            errors.append(f"missing {field}")
    if errors:
        return errors
    if not CONCEPT_ID.fullmatch(str(e["id"])):
        errors.append("id must be lower-case kebab-case")
    if e["id"] not in catalogue_ids:
        errors.append("id is not in the catalogue")
    if e["topic"] != topic_key:
        errors.append(f"topic must be {topic_key}")
    aka = e.get("aka", [])
    if not isinstance(aka, list) or not all(isinstance(a, str) for a in aka):
        errors.append("aka must be a list of strings")
    for field, (lo, hi) in (("summary", SUMMARY_WORDS), ("body", BODY_WORDS)):
        n = _word_count(e[field])
        if not lo <= n <= hi:
            errors.append(f"{field} has {n} words, needs {lo} to {hi}")
    if "mixup" in e:
        n = _word_count(e["mixup"])
        if not MIXUP_WORDS[0] <= n <= MIXUP_WORDS[1]:
            errors.append(f"mixup has {n} words, needs {MIXUP_WORDS[0]} to {MIXUP_WORDS[1]}")
    rel = e["related"]
    if not isinstance(rel, list) or not 1 <= len(rel) <= 5 or len(set(rel)) != len(rel):
        errors.append("related must list 1 to 5 different concept ids")
    else:
        for r in rel:
            if r == e["id"] or r not in catalogue_ids:
                errors.append(f"related id {r!r} is not another catalogue concept")
    if "asof" in e and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(e["asof"])):
        errors.append("asof must be YYYY-MM-DD")
    for field in ("name", "summary", "body", "mixup"):
        if isinstance(e.get(field), str):
            errors += prose_violations(e[field])
    return errors


def load_glossary(gdir):
    """Returns (catalogue ids, entries in topic order, errors). Entries carry inlined svg."""
    gdir = Path(gdir)
    errors = []
    try:
        catalogue = json.loads((gdir / "catalogue.json").read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        return set(), [], [f"glossary catalogue: {e}"]
    ids = {c.get("id") for c in catalogue if isinstance(c, dict)}
    entries, seen = [], set()
    for key in TOPICS:
        path = gdir / f"{key}.json"
        if not path.exists():
            continue
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except ValueError as e:
            errors.append(f"glossary/{path.name}: not valid JSON ({e})")
            continue
        for e in items:
            cid = e.get("id", "?") if isinstance(e, dict) else "?"
            errs = validate_concept(e, key, ids) if isinstance(e, dict) else ["not an object"]
            if cid in seen:
                errs.append("duplicate concept id")
            seen.add(cid)
            if not errs and e.get("diagram"):
                svg_path = gdir / "diagrams" / f"{e['diagram']}.svg"
                if not svg_path.exists():
                    errs.append(f"diagram file {svg_path.name} is missing")
                else:
                    svg = svg_path.read_text(encoding="utf-8")
                    probs = svg_problems(svg)
                    errs += [f"diagram: {p}" for p in probs]
                    if not probs:
                        e = {**e, "svg": re.sub(r"\s*\n\s*", " ", svg).strip()}
            errors += [f"glossary/{path.name}:{cid}: {m}" for m in errs]
            if not errs:
                entries.append(e)
    return ids, entries, errors


def check_question_concepts(q, catalogue_ids, required):
    c = q.get("concepts")
    if c is None:
        return ["missing concepts (1 to 4 glossary ids)"] if required else []
    if not isinstance(c, list) or not 1 <= len(c) <= 4 or len(set(c)) != len(c):
        return ["concepts must list 1 to 4 different glossary ids"]
    return [f"concept {x!r} is not in the glossary catalogue" for x in c if x not in catalogue_ids]


# ---------------------------------------------------------------- main

def main(argv):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--content", default=str(ROOT / "content"))
    ap.add_argument("--out", default=str(ROOT / "data" / "bank.json"))
    ap.add_argument("--glossary", default=str(ROOT / "content" / "glossary"))
    ap.add_argument("--glossary-out", default=None, help="defaults to glossary.json next to --out")
    ap.add_argument("--no-checks", action="store_true")
    ap.add_argument("--require-concepts", action="store_true")
    args = ap.parse_args(argv)

    content = Path(args.content)
    errors, questions, seen = [], [], {}
    gdir = Path(args.glossary)
    has_glossary = (gdir / "catalogue.json").exists()
    catalogue_ids, entries = set(), []
    if has_glossary:
        catalogue_ids, entries, gerrs = load_glossary(gdir)
        errors += gerrs
    python = check_python()
    for key in TOPICS:
        path = content / f"{key}.json"
        if not path.exists():
            continue
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except ValueError as e:
            errors.append(f"{path.name}: not valid JSON ({e})")
            continue
        if not isinstance(items, list):
            errors.append(f"{path.name}: must hold a list of questions")
            continue
        for q in items:
            qid = q.get("id", "?") if isinstance(q, dict) else "?"
            if not isinstance(q, dict):
                errors.append(f"{path.name}:?: not an object")
                continue
            errs = validate_question(q, key)
            if has_glossary:
                errs += check_question_concepts(q, catalogue_ids, args.require_concepts)
            elif args.require_concepts:
                errs.append("missing glossary catalogue, so concepts cannot be checked")
            if qid in seen:
                errs.append(f"duplicate id, also in {seen[qid]}")
            seen[qid] = path.name
            if not errs and q.get("check") and not args.no_checks:
                try:
                    value = run_check(q["check"], python)
                    if not check_matches(q, value):
                        errs.append(f"check gave {value!r}, which does not match the answer")
                except CheckError as e:
                    errs.append(str(e))
            errors += [f"{path.name}:{qid}: {e}" for e in errs]
            questions.append(q)

    if errors:
        for e in errors:
            print(e)
        print(f"{len(errors)} error(s)")
        return 1

    ordered = [{k: v for k, v in q.items() if k != "check"} for q in order_bank(questions)]
    bank = {
        "version": 1,
        "built": datetime.date.today().isoformat(),
        "topics": [{"key": k, "title": t} for k, (_, t) in TOPICS.items()],
        "questions": ordered,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(bank, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    if has_glossary:
        gout = Path(args.glossary_out) if args.glossary_out else out.parent / "glossary.json"
        glossary = {"version": 1, "built": bank["built"], "topics": bank["topics"], "concepts": entries}
        gout.parent.mkdir(parents=True, exist_ok=True)
        gout.write_text(json.dumps(glossary, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
        missing = len(catalogue_ids - {e["id"] for e in entries})
        print(f"glossary: {len(entries)} entries, {sum(1 for e in entries if 'svg' in e)} diagrams, "
              f"{missing} catalogue concepts without an entry yet")
    counts = {}
    for q in questions:
        counts[q["topic"]] = counts.get(q["topic"], 0) + 1
    for k in TOPICS:
        if k in counts:
            print(f"{k:14} {counts[k]}")
    print(f"{'total':14} {len(questions)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
