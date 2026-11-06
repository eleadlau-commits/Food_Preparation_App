// "How the ingredients are shared": ingredients that go into more than one dish this week, and
// a note on when the fish is bought and cooked. No screen code.

const SECTION_ORDER = ['meat', 'fish', 'staple', 'veg', 'made'];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// rows: [{ id, label, where }] — `where` uses {day:N} placeholders for the week to fill in.
export function sharedRows(derived, recipes, { limit = 12 } = {}) {
  const byId = new Map();
  for (const u of derived.uses) {
    const item = recipes.ingredient(u.id);
    if (!item || item.section === 'pantry') continue;
    if ((item.section === 'staple' || item.section === 'made') && !item.share) continue;
    if (!byId.has(u.id)) byId.set(u.id, []);
    byId.get(u.id).push(u);
  }
  const rows = [];
  for (const [id, uses] of byId) {
    const dishes = new Set(uses.map((u) => u.dish.id));
    if (dishes.size < 2) continue;
    const item = recipes.ingredient(id);
    let label = item.name.replace(/\s*\(.*\)$/, '');
    let where;
    if (item.section === 'made') {
      const batches = derived.batches.filter((b) => b.id === id);
      label = `${cap(label)} (${batches.map((b) => recipes.metric(b.qty, 'ml')).join(' + ')})`;
      where = batches.map((b) => `{day:${b.session}} batch: ${b.uses.map((u) => `{day:${u.night}} ${u.dish.short.toLowerCase()}`).join(', ')}`).join('. ');
      const fresh = uses.filter((u) => u.source === 'fresh-made');
      if (fresh.length) where += `. ${fresh.map((u) => `{day:${u.night}} ${u.dish.short.toLowerCase()}`).join(', ')}: fresh granules.`;
    } else {
      const total = uses.reduce((n, u) => n + u.qty, 0);
      if (item.section === 'staple') label = `${cap(label)}`;
      else label = `${label} (${item.unit === 'g' || item.unit === 'ml' ? recipes.metric(total, item.unit) : Math.ceil(total - 0.05)})`;
      const parts = uses.map((u) => {
        const amount = item.section === 'staple' ? null : recipes.useAmount(id, u.qty);
        return `${u.dish.short} ({day:${u.night}}${amount ? `, ${amount}` : ''})`;
      });
      where = parts.join(' · ');
      const frozen = uses.filter((u) => u.source === 'frozen');
      if (frozen.length) {
        const bags = new Set(frozen.map((u) => u.night)).size;
        where += `. Frozen on {day:0}${bags > 1 ? ` in ${bags} bags` : ''}.`;
      }
      const topped = uses.filter((u) => u.source === 'topup');
      if (topped.length && topped.length < uses.length) where += `. Part bought at the {day:${derived.topUp}} top-up.`;
    }
    const protein = (item.tags || []).some((t) => t === 'meat' || t === 'fish') && item.section !== 'made' && item.section !== 'pantry';
    rows.push({ id, label, where, count: dishes.size, section: item.section, protein });
  }
  rows.sort((a, b) => (b.protein - a.protein) || b.count - a.count || SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section));
  return rows.slice(0, limit);
}

// One sentence per fish dish: when it's bought, how it's kept, when it's cooked.
export function fishNotes(derived, recipes) {
  const notes = [];
  for (const u of derived.uses) {
    const item = recipes.ingredient(u.id);
    if (item?.section !== 'fish') continue;
    const bought = u.source === 'topup' ? derived.topUp : 0;
    const name = cap(item.name.split(/[ (]/)[0].toLowerCase());
    if (u.held) {
      const task = derived.tasks.find((t) => t.dish === u.dish && t.session === u.need);
      notes.push(`${name} bought {day:${bought}} and goes straight into the ${task ? task.title.replace(/\s*\(.*\)$/, '').toLowerCase().replace(/^marinate the \w+/, 'marinade') : 'prep'}${u.dish.note ? ` (${u.dish.note.replace(/^The /, 'the ').replace(/\.$/, '')})` : ''}; cooked {day:${u.night}}.`);
    } else if (bought === u.night) {
      notes.push(`${name} bought {day:${bought}}, cooked that night.`);
    } else {
      notes.push(`${name} bought {day:${bought}}, cooked {day:${u.night}}.`);
    }
  }
  return notes;
}
