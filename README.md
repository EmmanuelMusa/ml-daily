# ML Daily

Three AI and machine learning interview questions a day, plus review of the ones you missed.

Open it at **https://emmanuelmusa.github.io/ml-daily/** on a phone or a laptop.

## What is in it

- 500 questions across 14 topics: ML foundations, classic models, evaluation, data, deep learning, transformers and LLMs, LLM integration, agentic workflows, model optimization, MLOps, ML system design, math and statistics, responsible AI, and Python for ML.
- Five formats: multiple choice, select all, fill in the blank, worked numbers and explain questions you grade yourself.
- Every answer comes with a plain explanation and a "Going deeper" note.
- A glossary of 267 concepts, 41 with diagrams. Save any concept or your own term to read up on later.
- Reviews of misses after 1, 3, 7 and 21 days, a "Do more" button, and a Progress page with a practice calendar and topic mastery.

Progress stays in your browser. To use more than one device, either turn on sync in Settings or copy a progress code across. Sync keeps your progress in a secret Gist in your own GitHub account, using a token you make yourself. The site has no server, so your progress never goes anywhere else. Loading a progress code adds it to what the device already has. It never replaces it.

## How the questions were checked

Each question was written on its own, solved blind by a separate reviewer, and critiqued before it was added. Worked-number and code answers are proved by running code. Review notes are in `docs/content/reviews/`.

## Working on it

- `python tools/build.py` checks every question and glossary entry and writes `data/bank.json` and `data/glossary.json`.
- `node --test tests/` and `python -m unittest discover tests` run the tests.
- `python tools/serve.py` serves the site locally on port 4174.

Answer checks that use NumPy, pandas or scikit-learn run in `tools/.venv`, with the versions pinned in `tools/requirements-check.txt`.
