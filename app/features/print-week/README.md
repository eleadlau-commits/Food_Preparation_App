# Print week

The printer button at the top opens the whole week as A4 pages, like the example PDF, with a **Print** button (or "Save as PDF" in the print window). Also in **Settings → Print**.

Pages come from other features through the slot `print.pages` (`{ id, order, title, render(), join? }`):

| Page | From |
|---|---|
| 1. Weekly Dinner Menu (and how the ingredients are shared) | Week menu |
| 2. Grocery List | Shopping |
| 3-4. Shop-day and top-up-day prep | Prep |
| 5. Nightly Cooking Notes, then the Lunch Plan on the same page | Cook, Lunches |

**Uses:** week, household. **Saves:** nothing.
