# Household

Who's eating and how they shop. The first time the app opens, a welcome window asks the questions below; they're also in **Settings → Your household**.

| Setting | Default | What it changes |
|---|---|---|
| People | 2 | Shopping amounts: each dish is written for 4 portions (2 dinners + 2 lunches) and scaled. |
| Main shop and prep day | Monday | Day 1 of the plan: the big shop and the first prep session. |
| Top-up shop and second prep | 2 days later | When delicate things are bought and the second prep happens; "No top-up" plans around one shop. |
| Diet, allergies, dislikes | none | Dishes the planner never picks. |
| Longest cooking time | no limit | Mains that take longer aren't picked. |
| Western nights a week | 2 | How many Western nights the planner aims for. |

**Service `household`:** `get()`, `set(patch)`, `portions()`, `scale()`, `filter()`, `servingLine()`. **Event** `household:changed`.

**Saved on the phone:** `settings`.

Rules are in `rules.js`, tested in `tests/rules.test.js`.
