// Picking a week of dinners and putting them on the right days. No screen code.
//
//   generate({ recipes, household, tastes, locked, lastWeek, seed }) → nights (7 × { main, side, soup })
//   schedule(nights, recipes, options, locked) → the same nights in the best day order, or null
//   alternatives(nights, day, course, ...) → other dishes that could go there, best first
//
// The rules, from the product plan:
//   1. Filter: diet, allergies, dislikes, cooking time, and nothing from last week.
//   2. Score: shared ingredients with dishes already picked, what the household likes, variety
//      of protein, and the number of Western nights they asked for.
//   3. Pick the week greedily by score.
//   4. Schedule: try every day order and keep the one where food is freshest, least is frozen,
//      and Western nights and the same protein aren't next to each other. Impossible orders
//      (fish that won't keep, a marinade with no time) are never chosen.

import { derive } from './derive.js';

// A small seeded random number generator, so the same seed gives the same week.
export function random(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ingredients worth sharing: fresh things, not cupboard staples or made things.
const shareable = (recipes, d) => recipes.lines(d).filter((l) => l.item && ['fish', 'meat', 'veg'].includes(l.item.section)).map((l) => l.id);

function overlap(recipes, d, chosen) {
  const have = new Set(chosen.flatMap((c) => shareable(recipes, c)));
  return shareable(recipes, d).filter((id) => have.has(id)).length;
}

const weight = (tastes, d) => (tastes?.weight ? tastes.weight(d.id) : 0);

// Score one main against the mains already chosen.
function scoreMain(recipes, d, chosen, { tastes, westernTarget, rand }) {
  let score = overlap(recipes, d, chosen) * 1.2 + weight(tastes, d) * 2 + rand() * 2.5;
  const sameProtein = chosen.filter((c) => c.protein === d.protein).length;
  score -= sameProtein * sameProtein * 1.5;
  const western = chosen.filter((c) => c.style === 'western').length;
  const japanese = chosen.length - western;
  if (d.style === 'western' && western >= westernTarget) score -= 6;
  if (d.style === 'japanese' && japanese >= 7 - westernTarget) score -= 6;
  return score;
}

function scoreExtra(recipes, d, weekDishes, { tastes, rand }) {
  return overlap(recipes, d, weekDishes) * 1 + weight(tastes, d) * 2 + rand() * 2;
}

// Mains, sides or soups a household can have, best first for this week so far.
function candidates(recipes, course, household, exclude) {
  return recipes.dishesOf(course).filter((d) => recipes.allows(d, household) && !exclude.has(d.id));
}

// Pick a side and a soup for a main.
function pickExtras(recipes, main, used, weekDishes, ctx, household) {
  const pick = (course) => {
    const fits = (d) => recipes.goesWith(d).includes(main.style);
    let pool = candidates(recipes, course, household, used).filter(fits);
    if (!pool.length) pool = candidates(recipes, course, household, used);
    if (!pool.length) pool = candidates(recipes, course, household, new Set()).filter(fits);
    if (!pool.length) pool = candidates(recipes, course, household, new Set());
    if (!pool.length) return null;
    const best = pool.map((d) => [d, scoreExtra(recipes, d, weekDishes, ctx)]).sort((a, b) => b[1] - a[1])[0][0];
    used.add(best.id);
    weekDishes.push(best);
    return best.id;
  };
  return { side: pick('side'), soup: pick('soup') };
}

export function generate({ recipes, household = {}, tastes = null, locked = [], lastWeek = [], seed = 1, topUp = 2, scale = 1 }) {
  const rand = random(seed);
  const westernTarget = household.westernNights ?? 2;
  const ctx = { tastes, westernTarget, rand };
  const nights = Array.from({ length: 7 }, (_, i) => (locked[i] ? { ...locked[i] } : null));
  const used = new Set(nights.filter(Boolean).flatMap((n) => [n.main, n.side, n.soup]));
  const exclude = new Set([...used, ...lastWeek]);
  const banned = new Set();

  for (let attempt = 0; attempt < 25; attempt++) {
    const chosen = nights.filter(Boolean).map((n) => recipes.dish(n.main));
    const picks = [];
    const pool = candidates(recipes, 'main', household, new Set([...exclude, ...banned]));
    const relaxed = candidates(recipes, 'main', household, new Set([...used, ...banned]));
    const free = nights.filter((n) => !n).length;
    while (picks.length < free) {
      const avail = (pool.length - picks.length >= free - picks.length ? pool : relaxed).filter((d) => !picks.includes(d) && !chosen.includes(d));
      if (!avail.length) break;
      const best = avail.map((d) => [d, scoreMain(recipes, d, [...chosen, ...picks], ctx)]).sort((a, b) => b[1] - a[1])[0][0];
      picks.push(best);
    }
    if (picks.length < free) return null; // not enough dishes for this household

    const usedExtras = new Set(used);
    const weekDishes = [...chosen, ...picks];
    const draft = nights.map((n) => n);
    let k = 0;
    for (let i = 0; i < 7; i++) {
      if (draft[i]) continue;
      const main = picks[k++];
      draft[i] = { main: main.id, ...pickExtras(recipes, main, usedExtras, weekDishes, ctx, household) };
    }
    const order = schedule(draft, recipes, { topUp, scale }, locked);
    if (order) return order;
    // Nothing works: drop the main with the fewest possible days and try again.
    const worst = draft.map((n, i) => ({ n, i, days: locked[i] ? 99 : possibleDays(n, recipes, { topUp, scale }).length }))
      .sort((a, b) => a.days - b.days)[0];
    banned.add(worst.n.main);
  }
  return null;
}

// The days (0-6) a night could go on, on its own.
export function possibleDays(night, recipes, options) {
  return [0, 1, 2, 3, 4, 5, 6].filter((d) => nightCost(night, d, recipes, options) < Infinity);
}

// How good it is to cook this night on this day: lower is better, Infinity is impossible.
export function nightCost(night, day, recipes, options) {
  const nights = [];
  nights[day] = night;
  const r = derive(nights, recipes, options);
  if (!r.feasible) return Infinity;
  let cost = 0;
  for (const u of r.uses) {
    const item = recipes.ingredient(u.id);
    if (u.source === 'frozen') cost += 1.5;
    else if (u.source === 'topup') cost += 0.3 + (u.need - options.topUp) / item.life;
    else if (u.source === 'main' && item.section !== 'pantry') cost += (u.need / item.life) * (item.life <= 3 ? 3 : 1);
    else if (u.source === 'fresh-made') cost += 0.5;
  }
  cost += r.nights[0].inline.reduce((n, p) => n + (p.mins || 10) * 0.04, 0);
  return cost;
}

// Put the nights on the best days. Locked nights stay where they are.
export function schedule(nights, recipes, options = {}, locked = []) {
  const opts = { topUp: 2, scale: 1, ...options };
  const free = [0, 1, 2, 3, 4, 5, 6].filter((d) => !locked[d]);
  const moving = free.map((d) => nights[d]);
  const cost = moving.map((n) => [0, 1, 2, 3, 4, 5, 6].map((d) => (free.includes(d) ? nightCost(n, d, recipes, opts) : Infinity)));
  const lockedCost = [0, 1, 2, 3, 4, 5, 6].map((d) => (locked[d] ? nightCost(locked[d], d, recipes, opts) : 0));
  if (lockedCost.some((c) => c === Infinity)) return null;

  const main = (n) => recipes.dish(n.main);
  let best = null;
  let bestCost = Infinity;
  const week = nights.map((n, d) => (locked[d] ? locked[d] : null));
  const take = new Array(moving.length).fill(false);

  const adjacency = (w) => {
    let c = 0;
    for (let d = 1; d < 7; d++) {
      const a = main(w[d - 1]); const b = main(w[d]);
      if (a.style === 'western' && b.style === 'western') c += 2;
      if (a.protein === b.protein) c += 1;
    }
    return c;
  };

  const walk = (i, sum) => {
    if (sum >= bestCost) return;
    if (i === free.length) {
      const total = sum + adjacency(week);
      if (total < bestCost) { bestCost = total; best = week.slice(); }
      return;
    }
    const day = free[i];
    for (let m = 0; m < moving.length; m++) {
      if (take[m] || cost[m][day] === Infinity) continue;
      take[m] = true; week[day] = moving[m];
      walk(i + 1, sum + cost[m][day]);
      take[m] = false; week[day] = null;
    }
  };
  walk(0, lockedCost.reduce((a, b) => a + b, 0));
  return best;
}

// Other dishes that could replace the main, side or soup on one night, best first, each with
// whether it fits that day. Dishes already in the week are left out.
export function alternatives(nights, day, course, { recipes, household = {}, tastes = null, topUp = 2, scale = 1 }) {
  const night = nights[day];
  const inWeek = new Set(nights.flatMap((n, d) => (n ? [n.main, n.side, n.soup] : [])));
  const others = nights.filter((n, d) => n && d !== day).flatMap((n) => [n.main, n.side, n.soup]).map((id) => recipes.dish(id)).filter(Boolean);
  const main = recipes.dish(night.main);
  return recipes.dishesOf(course)
    .filter((d) => recipes.allows(d, household) && !inWeek.has(d.id))
    .filter((d) => course === 'main' || recipes.goesWith(d).includes(main.style))
    .map((d) => {
      const trial = { ...night, [course]: d.id };
      const c = nightCost(trial, day, recipes, { topUp, scale });
      return { dish: d, fits: c < Infinity, score: overlap(recipes, d, others) * 1.2 + weight(tastes, d) * 2 - (c === Infinity ? 100 : c * 0.5) };
    })
    .sort((a, b) => b.score - a.score);
}
