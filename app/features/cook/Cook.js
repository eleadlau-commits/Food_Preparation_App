// Cook: the Cook tab. Each night's quick methods for the main, side and soup (with anything
// that couldn't be done in a prep session), how much rice, and the food-safety notes. Other
// features add to each night (slot 'cook.night', e.g. feedback) and below the nights (slot
// 'cook.sections', e.g. the lunch plan). Adds tonight's dinner to Today and page 5 of the
// printed plan.
//
// Slot 'cook.night': extras under one night. Item: { order, render(day) → element or null }.
// Slot 'cook.sections': sections below the nights. Item: { order, render() → element or null }.
//
// Saved data: none.

import { Feature, ui } from 'folio';

const { el } = ui;
const POT = '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20"/><path d="M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2"/>';

export const SAFETY = [
  ['Rice safety', 'pack leftover rice and dishes within an hour of dinner (spread out to cool), refrigerate, and eat the next day. Reheat only once.'],
  ['Food safety', 'cook chicken and mince until juices run clear (75 C inside). Keep pickles, potato salad and dashi refrigerated and use within the times given. Never refreeze thawed meat.'],
];

export default class Cook extends Feature {
  start() {
    this.week = this.use('week');
    this.defineSlot('cook.night', 'Extras under one night on the Cook tab. Item: { order, render(day) → element or null }.');
    this.defineSlot('cook.sections', 'Sections below the nights on the Cook tab. Item: { order, render() → element or null }.');
    this.add('views', {
      id: 'cook', label: 'Cook', icon: POT, order: 50,
      subtitle: () => 'With prep done, most nights take 20-30 minutes',
      mount: (c) => { this.box = el('div', { class: 'cook-view' }); c.append(this.box); },
      render: () => this.render(),
    });
    this.add('today.cards', { id: 'tonight', order: 10, render: (day) => this.tonight(day) });
    this.add('print.pages', { id: 'cook', order: 50, title: 'Nightly Cooking Notes', render: () => this.printPage() });
  }

  methods(n) {
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    const lines = [];
    for (const p of n.inline) lines.push(['Before you start', `${p.title}: ${this.week.words(p.text)}`]);
    if (n.main?.method) lines.push([n.main.short, n.main.method]);
    if (n.side?.method) lines.push([n.side.short, cap(n.side.method.replace(/^[^:]{1,30}:\s*/, ''))]);
    if (n.side && !n.side.method) lines.push([n.side.short, 'Made ahead: just serve.']);
    if (n.soup?.method) lines.push([n.soup.short, cap(n.soup.method.replace(/^[^:]{1,30}:\s*/, ''))]);
    const fresh = this.week.derived().uses.filter((u) => u.night === n.day && u.source === 'fresh-made');
    if (fresh.length) lines.push(['Dashi', 'Make what you need tonight with fresh granules.']);
    return lines;
  }

  riceText(n) {
    return n.rice > 0 ? `Cook ${n.rice} g rice: half for dinner, half for tomorrow's lunch.` : `No plain rice tonight (${n.riceNote || 'not needed'}).`;
  }

  render() {
    const d = this.week.derived();
    const today = this.week.today();
    const order = today == null ? d.nights : [...d.nights.slice(today), ...d.nights.slice(0, today)];
    this.box.replaceChildren(
      ...order.map((n) => this.nightCard(n, today)),
      ...this.slot('cook.sections').map((s) => s.render()).filter(Boolean),
      el('section', { class: 'panel cook-safety' }, SAFETY.map(([t, text]) => el('p', {}, el('b', {}, `${t}: `), text))));
  }

  nightCard(n, today) {
    const total = n.dishes.reduce((m, d) => Math.max(m, d.mins), 0) + (n.inline.length ? 15 : 0);
    return el('details', { class: `panel cook-night${n.day === today ? ' today' : ''}${n.main?.style === 'western' ? ' western' : ''}`, open: n.day === today || today == null && n.day === 0 },
      el('summary', {},
        el('span', { class: 'cook-day' }, n.day === today ? 'Tonight' : this.week.dayLong(n.day)),
        el('b', { class: 'cook-title' }, n.main?.name),
        el('span', { class: 'hint small' }, `About ${total} min · ${[n.side?.short, n.soup?.short].filter(Boolean).join(' · ')}`)),
      el('p', { class: 'cook-rice' }, this.riceText(n)),
      el('dl', { class: 'cook-methods' }, this.methods(n).map(([t, text]) => [el('dt', {}, t), el('dd', {}, text)])),
      ...this.slot('cook.night').map((x) => x.render(n.day)).filter(Boolean));
  }

  tonight(day) {
    const n = this.week.derived().nights[day];
    if (!n) return null;
    return el('button', { type: 'button', class: 'today-card today-hero', onclick: () => this.app.shell.selectView('cook') },
      el('span', { class: 'today-card-kicker' }, ui.icon(POT), ' Tonight'),
      el('b', { class: 'today-hero-title' }, n.main?.name),
      el('span', { class: 'today-card-line' }, [n.side?.name, n.soup?.name].filter(Boolean).join(' · ')),
      el('span', { class: 'today-card-line' }, this.riceText(n)));
  }

  printPage() {
    const d = this.week.derived();
    return el('div', {},
      el('p', { class: 'pr-sub' }, 'Quick methods for the mains and soups - with prep done, most nights take 20-30 minutes.'),
      el('table', { class: 'pr-table pr-notes' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Day'), el('th', {}, 'Main'), el('th', {}, 'Method'))),
        el('tbody', {}, d.nights.map((n) => el('tr', { class: n.main?.style === 'western' ? 'shade' : '' },
          el('td', {}, this.week.dayName(n.day)),
          el('td', {}, n.main?.short),
          el('td', {}, this.methods(n).map(([t, text]) => (t === n.main?.short ? `${text} ` : `${t}: ${text} `)).join('')))))));
  }
}
