// Rules about recipes that don't need the screen: looking things up, diets, and writing amounts.

import { INGREDIENTS, SECTIONS } from './data/ingredients.js';
import { MAINS } from './data/mains.js';
import { SIDES } from './data/sides.js';
import { SOUPS, MADE } from './data/soups.js';

export { INGREDIENTS, SECTIONS, MADE };
export const DISHES = [...MAINS, ...SIDES, ...SOUPS];
const BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

export const dish = (id) => BY_ID[id] || null;
export const ingredient = (id) => INGREDIENTS[id] || null;
export const dishesOf = (course) => DISHES.filter((d) => d.course === course);

// A dish's ingredient lines as objects: [{ id, qty, unit, item }]. Staple units can differ
// from the catalogue's (a staple is never added up), so the line keeps its own.
export function lines(d) {
  return (d.uses || []).map(([id, qty, unit]) => ({ id, qty, unit: unit || INGREDIENTS[id]?.unit, item: INGREDIENTS[id] }));
}

// Everything a dish is, for diets and allergies: the tags of all its ingredients.
export function tagsOf(d) {
  const tags = new Set();
  for (const { item } of lines(d)) for (const t of item?.tags || []) tags.add(t);
  return tags;
}

// The diets people can choose, as the tags each one rules out.
export const DIETS = [
  { id: 'none', label: 'Everything', excludes: [] },
  { id: 'pescatarian', label: 'Pescatarian', excludes: ['meat', 'pork'] },
  { id: 'no-pork', label: 'No pork', excludes: ['pork'] },
  { id: 'vegetarian', label: 'Vegetarian', excludes: ['meat', 'pork', 'fish'] },
];
export const ALLERGIES = [
  { id: 'dairy', label: 'Dairy' }, { id: 'egg', label: 'Egg' }, { id: 'gluten', label: 'Gluten' },
  { id: 'nuts', label: 'Nuts' }, { id: 'fish', label: 'Fish' }, { id: 'alcohol', label: 'Alcohol' },
];

// True if a dish fits a household: its diet, allergies and dislikes (ingredient ids), and the
// longest it's willing to cook on a weeknight.
export function allows(d, { diet = 'none', allergies = [], dislikes = [], maxMins = 0 } = {}) {
  const tags = tagsOf(d);
  const ruledOut = [...(DIETS.find((x) => x.id === diet)?.excludes || []), ...allergies];
  if (ruledOut.some((t) => tags.has(t))) return false;
  if (lines(d).some((l) => dislikes.includes(l.id))) return false;
  if (maxMins && d.course === 'main' && d.mins > maxMins) return false;
  return true;
}

// Which mains a side or soup goes with.
export const goesWith = (d) => d.goesWith || [d.style];

// ---- Amounts -------------------------------------------------------------------------------

const round = (n, step) => Math.round(n / step) * step;
const trim = (n) => String(Number(n.toFixed(2)));

// "600 g", "1.2 kg", "150 ml", "1 L"
export function metric(qty, unit) {
  if (unit === 'g') return qty >= 1000 ? `${trim(round(qty, 100) / 1000)} kg` : `${round(qty, qty >= 100 ? 10 : 5) || qty} g`;
  if (unit === 'ml') return qty >= 1000 ? `${trim(round(qty, 100) / 1000)} L` : `${round(qty, qty >= 100 ? 10 : 5) || qty} ml`;
  return `${trim(qty)} ${unit}`;
}

// How a grocery-list amount reads, for an ingredient and a total in its unit, rounded up to
// what you can buy: "4 (~500 g)", "1 kg bag (~8)", "2 bunches", "1.2 kg".
export function buyAmount(id, qty) {
  const item = INGREDIENTS[id];
  if (!item) return trim(qty);
  if (item.pack) {
    const packs = Math.max(1, Math.ceil(qty / item.pack.size - 0.05));
    if (item.pack.label === 'bunch') return packs === 1 ? '1 bunch' : `${packs} ${item.plural || 'bunches'}`;
    return packs === 1 ? item.pack.label : `${packs} × ${item.pack.label}`;
  }
  if (item.unit === 'pc') {
    const n = Math.max(1, Math.ceil(qty - 0.05));
    const count = item.plural && !item.approx ? `${n} ${n === 1 ? item.plural.replace(/e?s$/, '') : item.plural}` : String(n);
    if (item.approx) return item.plural ? `${n} ${n === 1 ? 'block' : item.plural} (~${metric(n * item.approx, 'g')})` : `${n} (~${metric(n * item.approx, 'g')})`;
    return count;
  }
  if (item.unit === 'g' || item.unit === 'ml') return metric(qty, item.unit);
  return 'small';
}

// How much of an ingredient one dish uses, for "Hoikoro (Fri, 500 g)". Null if it's a vague amount.
export function useAmount(id, qty) {
  const item = INGREDIENTS[id];
  if (!item) return null;
  if (item.unit === 'g' || item.unit === 'ml') return metric(qty, item.unit);
  if (item.unit === 'pc') {
    if (item.approx) return `${qty < 1 ? FRACTIONS[trim(qty)] || trim(qty) : trim(qty)} (~${metric(qty * item.approx, 'g')})`;
    if (qty < 1) return FRACTIONS[trim(qty)] || trim(qty);
    return trim(qty);
  }
  return null;
}
const FRACTIONS = { '0.25': '1/4', '0.5': '1/2', '0.33': '1/3', '0.75': '3/4', '0.3': '1/3' };
