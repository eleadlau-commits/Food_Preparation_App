// The household's settings and what follows from them. No screen code.

export const DEFAULTS = {
  people: 2,          // dinner for this many, plus their lunch the next day
  shopDay: 1,         // day of the week of the main shop and first prep: 0 Sunday … 6 Saturday (Monday, as in the example)
  topUpGap: 2,        // days after the main shop for the top-up shop and second prep (0: no top-up)
  diet: 'none',       // see DIETS in the recipes feature
  allergies: [],      // tags that rule dishes out: dairy, egg, gluten, nuts, fish, alcohol
  dislikes: [],       // ingredient ids
  maxMins: 0,         // longest cooking time on the night for a main (0: no limit)
  westernNights: 2,   // how many Western nights a week
  setUp: false,       // the first-time questions have been answered
};

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const withDefaults = (saved) => ({ ...DEFAULTS, ...(saved || {}) });

// Each dish is written for 4 portions (2 dinners + 2 lunches); a household of n needs 2n.
export const portions = (h) => Math.max(1, h.people) * 2;
export const scale = (h) => portions(h) / 4;

// What the planner's filter needs from the settings.
export const filter = (h) => ({ diet: h.diet, allergies: h.allergies, dislikes: h.dislikes, maxMins: h.maxMins, westernNights: h.westernNights });

// "Dinner for 2 + next-day lunch for 2"
export const servingLine = (h) => `dinner for ${h.people} + next-day lunch for ${h.people}`;
