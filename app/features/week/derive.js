// Works out everything that follows from a week of dinners: when each prep job happens, where
// every ingredient comes from (the main shop, the mid-week top-up, the freezer, the cupboard),
// the dashi batches, the rice, and the reminders. No screen code, so it's easy to test.
//
// Days are numbered from the main shop: day 0 is shop day, day 6 the last dinner.
//
// derive(nights, recipes, options) →
// {
//   nights: [{ day, main, side, soup, dishes, rice, riceNote, inline: [prep], problems: [text] }],
//   tasks:  [{ session, kind, title, text, mins, night?, dish? }]   prep jobs, by session day
//   uses:   [{ id, qty, dish, course, night, need, source }]        every ingredient line
//            source: 'main' | 'topup' | 'frozen' | 'staple' | 'made' | 'fresh-made'
//   batches:[{ session, id, qty, uses }]                            dashi and other made things
//   reminders: [{ day, when, text, kind }]
//   feasible: true if nothing is impossible
// }
//
// options: { topUp: day of the mid-week top-up and prep (default 2), scale: portions / 4 (default 1) }

export const DEFAULT_RICE = 300;

export function derive(nights, recipes, { topUp = 2, scale = 1 } = {}) {
  const sessions = topUp > 0 && topUp < 7 ? [0, topUp] : [0];
  const out = { nights: [], tasks: [], uses: [], batches: [], reminders: [], sessions, topUp, feasible: true };

  nights.forEach((n, day) => {
    if (!n) return;
    const night = { day, main: recipes.dish(n.main), side: recipes.dish(n.side), soup: recipes.dish(n.soup), inline: [], problems: [] };
    night.dishes = [night.main, night.side, night.soup].filter(Boolean);
    const rice = night.main && night.main.rice !== undefined ? night.main.rice : DEFAULT_RICE;
    night.rice = Math.round(rice * scale);
    night.riceNote = night.main?.riceNote || null;
    out.nights.push(night);

    for (const d of night.dishes) {
      const held = {};
      for (const p of d.prep || []) {
        const s = sessionFor(day, p, sessions);
        if (s == null) {
          if (p.lead) night.problems.push(`${d.short} needs ${p.lead} day${p.lead > 1 ? 's' : ''} ahead to ${p.title.toLowerCase()}`);
          else night.inline.push({ ...p, dish: d });
          continue;
        }
        out.tasks.push({ session: s, kind: p.lead ? 'marinate' : p.prefer === 'early' ? 'dressing' : 'ahead', title: p.title, text: fill(p.text, day), mins: p.mins || 10, night: day, dish: d });
        for (const id of p.holds || []) held[id] = s;
      }
      for (const r of d.reminders || []) out.reminders.push({ day: day + (r.offset || 0), when: r.when, text: r.text, kind: 'dish', dish: d });
      for (const line of recipes.lines(d)) {
        if (!line.item) continue;
        const need = held[line.id] ?? day;
        const use = { id: line.id, qty: line.qty * scale, unit: line.unit, dish: d, course: d.course, night: day, need, held: line.id in held };
        use.source = sourceOf(line.item, need, topUp);
        if (!use.source) night.problems.push(`${line.item.name} won't keep until ${need === day ? 'the night' : 'prep day'}`);
        out.uses.push(use);
      }
    }
    if (night.problems.length) out.feasible = false;
  });

  addFreezing(out, recipes);
  addBatches(out, recipes);
  addAromatics(out);
  out.tasks.sort((a, b) => a.session - b.session || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (a.night ?? -1) - (b.night ?? -1));
  out.reminders.sort((a, b) => a.day - b.day || (a.when === 'morning' ? -1 : 1) - (b.when === 'morning' ? -1 : 1));
  return out;
}

const ORDER = ['batch', 'marinate', 'freeze', 'aromatics', 'dressing', 'ahead'];

// The prep session a job goes in: the last one (or the first, for prefer: 'early') between
// `keeps` days before the night and `lead` days before it.
export function sessionFor(day, prep, sessions) {
  const ok = sessions.filter((s) => s >= day - (prep.keeps ?? 0) && s <= day - (prep.lead || 0));
  if (!ok.length) return null;
  return prep.prefer === 'early' ? ok[0] : ok[ok.length - 1];
}

// Where an ingredient needed on day `need` comes from, or null if it can't be fresh by then.
export function sourceOf(item, need, topUp) {
  if (item.section === 'staple') return 'staple';
  if (item.section === 'made') return 'made';
  if (item.section === 'pantry') return 'main';
  const main = need < item.life;
  const late = topUp > 0 && need >= topUp && need - topUp < item.life;
  if (item.lateBuy && late) return 'topup';
  if (main) return 'main';
  if (late) return 'topup';
  if (item.freeze) return 'frozen';
  return null;
}

const DAY_WORDS = ['{day}'];
const fill = (text, day) => DAY_WORDS.reduce((t, w) => t.split(w).join(`{day:${day}}`), text);

// Meat that won't keep until it's needed is portioned and frozen on shop day, then moved to the
// fridge the morning before the night (or the same morning, if a prep session uses it).
function addFreezing(out, recipes) {
  const frozen = out.uses.filter((u) => u.source === 'frozen');
  if (!frozen.length) return;
  // One bag per ingredient and night: chicken for Saturday's rice and custard goes in one bag.
  const bags = [];
  for (const u of frozen) {
    const bag = bags.find((b) => b.id === u.id && b.night === u.night);
    if (bag) { bag.uses.push(u); bag.qty += u.qty; bag.need = Math.min(bag.need, u.need); bag.held ||= u.held; }
    else bags.push({ id: u.id, night: u.night, qty: u.qty, need: u.need, held: u.held, uses: [u] });
  }
  const lines = bags.map((b) => {
    const item = recipes.ingredient(b.id);
    const what = b.uses.length > 1
      ? b.uses.map((u) => `${recipes.useAmount(u.id, u.qty)} ${u.dish.short.toLowerCase()}`).join(' / ')
      : b.uses[0].dish.short.toLowerCase();
    const notes = [...new Set(b.uses.map((u) => u.dish.freezeNote).filter(Boolean))];
    return `${recipes.useAmount(b.id, b.qty)} ${item.name.toLowerCase()} for {day:${b.night}} (${what})${notes.length ? `, ${notes.join(', ')}` : ''}`;
  });
  out.tasks.push({
    session: 0, kind: 'freeze', title: 'Portion and freeze the meat', mins: 10,
    text: `Flat bags, labelled with the day: ${lines.join('; ')}. Freeze ${bags.length === 1 ? 'it' : `all ${bags.length}`}.`,
  });
  for (const b of bags) {
    const day = b.held ? b.need : b.need - 1;
    out.reminders.push({ day: Math.max(day, 0), when: 'morning', kind: 'thaw', text: `Move {day:${b.night}}'s ${shortName(recipes.ingredient(b.id).name)} to the fridge` });
  }
}

const shortName = (name) => name.replace(/^(thin-sliced|boneless|smoked)\s+/i, '').replace(/\s*\(.*\)$/, '').toLowerCase();

// Things made ahead (dashi): each session makes enough for the days until the next session
// (including it, as that session's own dinner comes before the new batch is ready), as long as
// it keeps. Anything else is made fresh on the night.
function addBatches(out, recipes) {
  const made = out.uses.filter((u) => u.source === 'made');
  const ids = [...new Set(made.map((u) => u.id))];
  for (const id of ids) {
    const item = recipes.ingredient(id);
    const covered = new Set();
    out.sessions.forEach((s, i) => {
      const next = out.sessions[i + 1] ?? 99;
      const mine = made.filter((u) => u.id === id && !covered.has(u) && u.need >= s && u.need <= next && u.need - s < item.life);
      if (!mine.length) return;
      mine.forEach((u) => covered.add(u));
      const total = mine.reduce((n, u) => n + u.qty, 0);
      const qty = Math.ceil(total / 500) * 500;
      const batchNo = out.batches.filter((b) => b.id === id).length + 1;
      out.batches.push({ session: s, id, qty, uses: mine, no: batchNo });
      const def = recipes.MADE[id] || { title: item.name.toLowerCase(), text: '' };
      const amount = recipes.metric(qty, 'ml');
      const what = groupUses(mine, recipes);
      out.tasks.push({
        session: s, kind: 'batch', mins: 10, made: id,
        title: `Make ${def.title} batch ${batchNo} (${amount})`,
        text: `${def.text.replace('{amount}', amount)} For ${what}.`,
      });
    });
    for (const u of made) if (!covered.has(u)) u.source = 'fresh-made';
  }
}

function groupUses(uses, recipes) {
  return uses.map((u) => `{day:${u.night}} ${u.dish.short.toLowerCase()} (~${recipes.metric(u.qty, 'ml')})`).join(', ');
}

// Ginger, garlic and spring onion used on three or more nights are prepped in one go on shop day.
const AROMATICS = ['ginger', 'garlic', 'spring-onions'];
function addAromatics(out) {
  const nights = new Set(out.uses.filter((u) => AROMATICS.includes(u.id)).map((u) => u.night));
  if (nights.size < 3) return;
  out.tasks.push({
    session: 0, kind: 'aromatics', title: 'Aromatics jar', mins: 10,
    text: 'Grate most of the ginger (keep a thumb for matchsticks) and 4 garlic cloves; keep the ginger under a little sake. Slice 1 bunch of spring onions into a paper-towel-lined box. Keeps 5-6 days.',
  });
}

// "{day:3}" placeholders become day names; the week feature passes its own namer.
export function words(text, dayName) {
  return String(text).replace(/\{day:(-?\d+)\}/g, (_, d) => dayName(Number(d)));
}
