// Learning from feedback. Each rated dinner moves its dishes' weights: liked up, skipped down,
// with the reason sharpening it. The planner adds weight × 2 to a dish's score. No screen code.

export const RATINGS = [
  { id: 'liked', label: 'Liked it' },
  { id: 'okay', label: 'Okay' },
  { id: 'skipped', label: 'Skipped' },
];
export const REASONS = [
  { id: 'didnt-like', label: "Didn't like it" },
  { id: 'too-long', label: 'Took too long' },
  { id: 'no-time', label: 'No time tonight' },
];

const MAIN = { liked: 1, okay: 0, skipped: -1 };
const REASON = { 'didnt-like': -1.5, 'too-long': -0.5, 'no-time': 1 }; // "no time" isn't the dish's fault

// weights(ratings) → { dishId: weight between -3 and 3 }. Older ratings count for less.
export function weights(ratings) {
  const w = {};
  const list = Object.values(ratings).sort((a, b) => (a.at || 0) - (b.at || 0));
  list.forEach((r, i) => {
    const age = list.length - 1 - i;
    const fade = Math.pow(0.9, age);
    let change = (MAIN[r.rating] ?? 0) + (r.rating === 'skipped' ? REASON[r.reason] ?? 0 : 0);
    if (r.rating !== 'skipped' && r.reason === 'too-long') change -= 0.5;
    if (r.main) w[r.main] = (w[r.main] || 0) + change * fade;
    for (const id of [r.side, r.soup]) if (id) w[id] = (w[id] || 0) + change * 0.5 * fade;
  });
  for (const k of Object.keys(w)) w[k] = Math.max(-3, Math.min(3, w[k]));
  return w;
}
