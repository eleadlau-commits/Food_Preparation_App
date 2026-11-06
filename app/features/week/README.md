# Week

The planning engine and this week's plan. It has no tab: Today, Week, Shop, Prep and Cook draw from its `week` service.

## How a plan is made (`plan.js`)

1. **Filter**: dishes that fit the household (diet, allergies, dislikes, cooking time), and none of last week's mains.
2. **Score**: shared fresh ingredients with dishes already picked, the household's ratings (Feedback), variety of protein, and the number of Western nights asked for. A little randomness keeps weeks different.
3. **Pick** seven mains greedily, then a side and a soup for each that suit it.
4. **Schedule**: try every order of the seven nights and keep the freshest one that's possible: fish bought on a shopping day, the least frozen, Western nights and the same protein not back to back. If no order works, the hardest main is swapped and it tries again.

Locked nights (Week tab) stay on their day through all of this.

## What follows from a plan (`derive.js`)

- **Prep sessions** on the shop day (day 0) and the top-up day (day 2, or 3, or none). A dish's prep job goes in the last session that's within its `keeps` days (the first, for dressings), and at least its `lead` days ahead (marinades). A job with nowhere to go is done on the night.
- **Where each ingredient comes from**: the main shop if it keeps until it's needed, the top-up if it doesn't (mushrooms always wait for the top-up), otherwise frozen on shop day if it can be. Ingredients a prep job uses up are needed on the prep day, not the night.
- **Freezing**: one bag per ingredient and night, and a reminder to move it to the fridge the morning before (the same morning if a prep session uses it).
- **Dashi batches**: each session makes enough until the next session's dinner, as long as it keeps; the rest is made fresh.
- **Rice**: 300 g dry per night for 4 portions, scaled; none on pasta nights or when the main is the rice.
- **Reminders** from dishes (toast the walnuts, soak the rice).

The example week (2 November 2026, `example.js`) is the first plan anyone sees.

**Requires:** recipes. **Uses:** household, tastes. **Saves:** `plan`, `history` (the last 4 weeks' mains).
