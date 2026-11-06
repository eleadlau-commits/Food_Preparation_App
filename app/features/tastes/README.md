# Feedback

After each dinner: **Liked it**, **Okay** or **Skipped**, with an optional reason (didn't like it, took too long, no time tonight). It shows under each night on the Cook tab once that night has come, and Today asks about last night's dinner.

What it learns (`rules.js`): liked raises the dishes' weight, skipped lowers it, "didn't like it" lowers it more, "no time tonight" doesn't count against the dish, and older ratings count for less. The planner (week feature) adds each dish's weight to its score through the `tastes` service. **Settings → What you like** shows what it has learned and can forget it.

**Uses:** cook, recipes, week (at run time). **Saves:** `ratings`.
