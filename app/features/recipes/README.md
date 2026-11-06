# Recipes

The recipe database that comes with the app. It has no screen: other features read it through the `recipes` service.

## What's in it

- `data/ingredients.js`: every ingredient, with the part of the shop it's in, the unit dishes use, how many days it keeps in the fridge (`life`), whether it can be frozen, how it's sold (`pack`, `approx`) and what it is for diets (`tags`).
- `data/mains.js`, `data/sides.js`, `data/soups.js`: the dishes, each for 4 portions (dinner for 2, tomorrow's lunch for 2). The first seven of each are the example week (2 November 2026); the rest are for swaps and new weeks.
- `data/soups.js` also has `MADE`: things made in a prep session and used all week (dashi, kombu dashi).

## A dish

| Field | Meaning |
|---|---|
| `id`, `name`, `short` | Its id, full name (menu) and short name (lists). |
| `course` | `main`, `side` or `soup`. |
| `style` | `japanese` or `western`. Western nights are shaded on the menu. |
| `goesWith` | Sides and soups: which mains they suit. Default: their own style. |
| `protein` | Mains: fish, pork, chicken, beef, tofu or veg (for variety). |
| `mins` | Cooking time on the night. |
| `rice` | Mains: grams of dry rice served with it (default 300); 0 for pasta nights or rice dishes, with `riceNote`. |
| `uses` | `[ingredient id, amount, unit?]`. The amount is in the ingredient's unit unless a unit is given (staples only). |
| `prep` | Jobs done in a prep session rather than on the night: `{ title, text, mins, keeps, lead?, prefer?, holds? }`. `keeps`: days it lasts once made. `lead`: at least this many days before the night (a marinade). `prefer: 'early'`: the first session that works (dressings), otherwise the last. `holds`: ingredients used up by this job, so they must be fresh on the prep day rather than the night. `{day}` in the text becomes the day it's for. |
| `reminders` | `{ when: 'morning' or 'evening', offset, text }`: a reminder `offset` days from the night. |
| `method` | How to cook it on the night. |
| `lunch` | Mains and sides: `{ pack?, tip? }` for the lunch plan, or `false` if it isn't packed. |

## How to check it works

Run `python build.py test`: `tests/data.test.js` checks every dish uses known ingredients and has what the planner needs.
