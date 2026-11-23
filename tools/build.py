"""Validate ML Daily question files and write the bank the app loads.

Usage: python tools/build.py [--content DIR] [--out FILE] [--no-checks]
Standard library only. Answer checks run in tools/.venv when it exists.
"""
import re

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


def parse_number(s):
    s = str(s).strip().replace(",", "").replace(" ", "")
    if s.endswith("%"):
        s = s[:-1]
    if not s:
        return None
    try:
        if "/" in s:
            a, b = s.split("/", 1)
            b = float(b)
            if b == 0:
                return None
            return float(a) / b
        return float(s)
    except ValueError:
        return None


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
