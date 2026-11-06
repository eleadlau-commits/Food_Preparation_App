# Mise (built with Folio)

**Mise** is a meal-prep planner: one week of dinners (main, side, soup, cooked as 4 portions so half is tomorrow's lunch), with the shopping list, prep sessions, thaw reminders, cooking notes and lunch plan worked out from recipe data. Product plan: https://claude.ai/artifact/4egf4rR5tDw7vv8aYcLAE2. The reference is the example week PDF (Monday 2 November 2026) in the project files.

It's built with **Folio** (`folio/`, copied from the owner's Mobile Durham app, the `timetable` repository): every feature is a folder in `app/features/` and `python build.py` assembles the app. **Read `folio/README.md` before changing anything.**

## Who you're working with

The owner isn't a developer. They describe what they want, and Claude builds it, and they've given Claude full control including merging. Explain in plain English what changed and how to try it.

**Never change the Mobile Durham (`timetable`) repository**; read it for reference only.

## How to work on it

1. **New feature? New folder.** `python build.py new-feature <id> --requires week`. Don't grow an existing feature for something new.
2. **Connect through slots, services and events**, never by importing another feature's files (tests may import other features' rule files to use the real recipe data).
3. **Handle missing features**: `this.use()` can return null and slots can be empty.
4. **Rules go in small files without screen code**, with tests in `tests/*.test.js`: `recipes/rules.js`, `week/derive.js` and `week/plan.js` (the engine), `menu/shared.js`, `shopping/grocery.js`, `prep/sessions.js`, `lunches/rules.js`, `tastes/rules.js`, `household/rules.js`.
5. **Run `python build.py test`** and fix everything before merging. It includes the whole-app test (on the views in `app/app.json`'s `testViews`) and the delete-a-folder test.
6. **Check it in a browser** with `python build.py serve --test` (sample data from `app/tests/seed.js`).
7. **Keep the example week working**: tests check the example's shopping list, prep sessions, shared ingredients and lunch plan against the PDF. If a recipe change breaks them, the change is probably wrong.
8. **Update the docs**: the feature's `README.md`, and `README.md` for anything people see.

## Slots, services and events

| Name | Kind | Owner | Used by |
|---|---|---|---|
| `recipes` | service | recipes | everything |
| `household` | service; event `household:changed` | household | week, menu, print-week |
| `week` | service; event `week:changed` | week | the tabs, lunches, tastes, print-week |
| `tastes` | service | tastes | week (scoring) |
| `today.cards` | slot | today | prep, cook, lunches, shopping, tastes |
| `cook.night`, `cook.sections` | slots | cook | tastes, lunches |
| `print.pages` | slot | print-week | menu, shopping, prep, cook, lunches |

## Recipes

Dishes are in `app/features/recipes/data/`. Each is written for 4 portions; see `app/features/recipes/README.md` for every field. Recipes must be original or licensed (it's meant to be a commercial app). Shelf lives (`life`) drive the whole schedule, so keep them realistic.

## Branches and merging

Name branches `claude/` plus a few words (`claude/recipe-packs`). Open a pull request, let the tests pass, then merge. Every push to `main` runs `.github/workflows/build.yml`: tests, then the web version to GitHub Pages.

## Folio changes made here

Folio is at 1.12.0: `app.json` can set `"accounts": false` (no account button or Account row) and `testViews` (the views the whole-app test starts on). See the end of `folio/README.md`.
