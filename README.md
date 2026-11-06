# Mise: the meal-prep planner (prototype)

**Mise** plans one week of dinners that double as tomorrow's lunch, then works out everything that follows: a tick-box shopping list split into a main shop and a mid-week top-up, two prep sessions, what to freeze and when to thaw it, nightly cooking notes and a lunch plan. It works offline and keeps everything on your phone.

The first week you see is the example week from `reference/example-weekly-plan-2026-11-02.pdf` (Monday 2 November 2026), rebuilt from recipe data: the shopping list, shared-ingredient table, prep sessions, reminders and lunch plan are all computed, not typed in.

## The tabs

| Tab | What's on it |
|---|---|
| **Today** (opens here) | Reminders (move the pork to the fridge), tonight's dinner, today's lunch, the shop or prep session if it's today, and "how was last night?". |
| **Week** | The seven dinners (main, side, soup; Western nights shaded). Tap a night to swap a dish, lock it, or move it to another day. **Plan this week for me** and **Plan next week**. How the ingredients are shared. |
| **Shop** | The main shop by part of the shop, a pantry check and a line of staples, then the top-up. Tick as you go. |
| **Prep** | Shop-day and top-up-day prep: numbered jobs to tick off, about how long they take, and the reminders until the next session. |
| **Cook** | Each night's quick methods and rice, Liked / Okay / Skipped feedback, the lunch plan, and food-safety notes. |

The printer button at the top prints the whole week as A4 pages (or saves a PDF), like the example. **Settings** (in the menu): people, shop day (Monday by default), top-up day, diet, allergies, dislikes, cooking time, Western nights, and what it has learned you like.

## How it plans

1. **Filter** dishes by diet, allergies, dislikes, cooking time, and last week's dinners.
2. **Score** them on shared fresh ingredients, your ratings, protein variety and the number of Western nights you asked for.
3. **Pick** seven mains, then a side and a soup that suit each.
4. **Schedule** them by trying every day order and keeping the freshest possible one: fish only on shopping days, as little frozen as possible, Western nights and the same protein not back to back.

Then it works out where every ingredient comes from (main shop, top-up, freezer), the prep jobs and when they happen (marinades at least a day ahead, sides within the days they keep), the dashi batches, and the reminders. Details: `app/features/week/README.md`.

## How it's built

It's built with **Folio** (copied from Mobile Durham and extended): every feature is a folder in `app/features/`, and `python build.py` assembles the app. Features talk only through slots, services and events, so deleting any folder leaves a working app. Read `folio/README.md` and `CLAUDE.md` before changing anything.

| Feature | What it does |
|---|---|
| `recipes` | The recipe database: 49 dishes (22 mains, 14 sides, 13 soups) and the ingredient catalogue (shelf life, packs, diet tags). |
| `household` | Who's eating and how they shop; the welcome questions. |
| `week` | The planning engine and the current plan. |
| `today`, `menu`, `shopping`, `prep`, `cook` | The five tabs. |
| `lunches` | The lunch plan. |
| `tastes` | Feedback and learning. |
| `print-week` | The printed week. |

## Try it

- **Online:** every change to `main` is tested and published to GitHub Pages (once Pages is on: **Settings → Pages → Source: GitHub Actions**).
- **On your computer:** `python build.py serve` (Python 3.9+), then open http://localhost:8000. Add `--test` for sample data.
- **Tests:** `python build.py test` (needs Chrome).
