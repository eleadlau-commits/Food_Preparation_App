// The grocery list: what to buy at the main shop and at the mid-week top-up, grouped by the
// part of the shop, with amounts rounded up to what you can buy. No screen code.
//
// groceryList(derived, recipes) → {
//   main:  [{ section, label, items: [{ key, id, name, amount, usedFor }] }],
//   staples: 'Rice, soy, mirin, …',
//   topUp: [{ key, id, name, amount, usedFor }],
// }
// `usedFor` has {day:N} placeholders for the week to fill in.

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function groceryList(derived, recipes) {
  const groups = { main: new Map(), topup: new Map() };
  const staples = [];
  for (const u of derived.uses) {
    const item = recipes.ingredient(u.id);
    if (!item) continue;
    if (u.source === 'staple' || u.source === 'fresh-made' || u.source === 'made') {
      if (u.source === 'staple' && !staples.includes(u.id)) staples.push(u.id);
      if (u.source !== 'staple' && !staples.includes('dashi-granules')) staples.push('dashi-granules');
      continue;
    }
    const where = u.source === 'topup' ? 'topup' : 'main';
    const map = groups[where];
    if (!map.has(u.id)) map.set(u.id, { id: u.id, item, qty: 0, uses: [] });
    const row = map.get(u.id);
    row.qty += u.qty;
    row.uses.push(u);
  }
  // Made things (dashi) need their granules.
  if (derived.batches.length && !staples.includes('dashi-granules')) staples.push('dashi-granules');

  const toItem = (where) => (row) => ({
    key: `${where}:${row.id}`,
    id: row.id,
    name: row.item.name,
    amount: row.item.section === 'pantry' && !['g', 'ml', 'pc'].includes(row.item.unit) ? 'small' : recipes.buyAmount(row.id, row.qty),
    usedFor: usedFor(row, recipes),
    section: row.item.section,
  });

  const mainItems = [...groups.main.values()].map(toItem('main'));
  const main = recipes.SECTIONS.map((s) => ({ section: s.id, label: s.label, items: mainItems.filter((i) => i.section === s.id) })).filter((g) => g.items.length);
  const order = Object.keys(recipes.INGREDIENTS);
  for (const g of main) g.items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const staplesLine = staples.sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((id) => recipes.ingredient(id).name);
  return {
    main,
    staples: staplesLine.length ? cap(staplesLine.join(', ')) : '',
    topUp: [...groups.topup.values()].map(toItem('topup')),
  };
}

// "Mon saba misoni", or for several dishes "Hoikoro 500 g, nikujaga 400 g" / "Tue, Thu, Fri".
function usedFor(row, recipes) {
  const dishes = [];
  for (const u of row.uses) {
    const found = dishes.find((d) => d.dish === u.dish);
    if (found) found.qty += u.qty;
    else dishes.push({ dish: u.dish, night: u.night, qty: u.qty });
  }
  if (dishes.length === 1) return `{day:${dishes[0].night}} ${dishes[0].dish.short.toLowerCase()}`;
  if (dishes.length <= 3) {
    const showAmounts = ['g', 'ml'].includes(row.item.unit) && row.item.section !== 'pantry';
    return cap(dishes.map((d) => `{day:${d.night}} ${d.dish.short.toLowerCase()}${showAmounts ? ` ${recipes.metric(d.qty, row.item.unit)}` : ''}`).join(', '));
  }
  return cap(dishes.map((d) => d.dish.short.toLowerCase()).join(', '));
}

// How many of the list's items are ticked.
export function progress(list, ticked) {
  const keys = [...list.main.flatMap((g) => g.items), ...list.topUp].map((i) => i.key);
  return { done: keys.filter((k) => ticked[k]).length, total: keys.length };
}
