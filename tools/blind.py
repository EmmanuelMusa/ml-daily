"""Blind review helper for ML Daily questions.

python tools/blind.py strip <topic> [--content DIR] [--out DIR]
    Writes <out>/<topic>.json with only id, format, prompt and options.
    Options appear in the app's display order and keep their original index.

python tools/blind.py compare <topic> <answers.json> [--content DIR]
    Answers map id to a response: option index (mcq), list of indexes (multi),
    or a string (fill, numeric). Prints AGREE, DISAGREE, MISSING or SKIP per question.
Standard library only.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from build import normalize_fill, parse_number  # noqa: E402

MASK = 0xFFFFFFFF


def _fnv1a(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & MASK
    return h


def _mulberry32(seed):
    state = seed & MASK

    def rand():
        nonlocal state
        state = (state + 0x6D2B79F5) & MASK
        a = state
        t = ((a ^ (a >> 15)) * (1 | a)) & MASK
        t = ((t + (((t ^ (t >> 7)) * (61 | t)) & MASK)) & MASK) ^ t
        return ((t ^ (t >> 14)) & MASK) / 4294967296

    return rand


def option_order(qid, n):
    """Same permutation as optionOrder in assets/js/grade.js."""
    rand = _mulberry32(_fnv1a(str(qid)))
    order = list(range(n))
    for i in range(n - 1, 0, -1):
        j = int(rand() * (i + 1))
        order[i], order[j] = order[j], order[i]
    return order


def _load(topic, content):
    return json.loads((Path(content) / f"{topic}.json").read_text(encoding="utf-8"))


def strip(topic, content=ROOT / "content", out=ROOT / "scratch" / "blind"):
    items = []
    for q in _load(topic, content):
        item = {"id": q["id"], "format": q["format"], "prompt": q["prompt"]}
        if "options" in q:
            item["options"] = [{"index": i, "text": q["options"][i]}
                               for i in option_order(q["id"], len(q["options"]))]
        items.append(item)
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    path = out / f"{topic}.json"
    path.write_text(json.dumps(items, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def _agrees(q, r):
    fmt = q["format"]
    if fmt == "mcq":
        return r == q["answer"]
    if fmt == "multi":
        return isinstance(r, list) and set(r) == set(q["answer"])
    if fmt == "fill":
        return normalize_fill(r) in {normalize_fill(a) for a in [q["answer"], *q.get("accept", [])]}
    if fmt == "numeric":
        v = parse_number(r)
        return v is not None and abs(v - q["answer"]) <= q["tolerance"] + 1e-12
    return False


def compare(topic, answers_path, content=ROOT / "content"):
    answers = json.loads(Path(answers_path).read_text(encoding="utf-8"))
    for q in _load(topic, content):
        qid = q["id"]
        if q["format"] == "open":
            print(f"SKIP {qid}")
        elif qid not in answers:
            print(f"MISSING {qid}")
        elif _agrees(q, answers[qid]):
            print(f"AGREE {qid}")
        else:
            print(f"DISAGREE {qid}: reviewer={answers[qid]!r} key={q['answer']!r}")
    return 0


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("strip")
    s.add_argument("topic")
    s.add_argument("--content", default=str(ROOT / "content"))
    s.add_argument("--out", default=str(ROOT / "scratch" / "blind"))
    c = sub.add_parser("compare")
    c.add_argument("topic")
    c.add_argument("answers")
    c.add_argument("--content", default=str(ROOT / "content"))
    args = ap.parse_args(argv)
    if args.cmd == "strip":
        print(strip(args.topic, args.content, args.out))
        return 0
    return compare(args.topic, args.answers, args.content)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
