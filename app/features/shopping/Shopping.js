// Shopping: the Shop tab. The grocery list for the main shop (by part of the shop, with a
// pantry check and one line of staples) and the mid-week top-up. Tick things off as you go;
// ticks are kept for each week. Adds a card to Today on shopping days, and page 2 of the
// printed plan.
//
// Saved data: 'ticked' → { 'YYYY-MM-DD': { 'main:mackerel': true, … } } (the last 4 weeks).

import { Feature, ui } from 'folio';
import { groceryList, progress } from './grocery.js';

const { el } = ui;
const BAG = '<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>';

export default class Shopping extends Feature {
  start() {
    this.week = this.use('week');
    this.recipes = this.use('recipes');
    this.ticks = this.storage.get('ticked', {});
    this.add('views', {
      id: 'shop', label: 'Shop', icon: BAG, order: 30,
      subtitle: () => { const p = progress(this.list(), this.ticked()); return `${p.done} of ${p.total} ticked`; },
      mount: (c) => { this.box = el('div', { class: 'shop-view' }); c.append(this.box); },
      render: () => this.render(),
    });
    this.add('today.cards', { id: 'shop', order: 20, render: (day) => this.todayCard(day) });
    this.add('print.pages', { id: 'shop', order: 20, title: 'Grocery List', render: () => this.printPage() });
  }

  list() { return groceryList(this.week.derived(), this.recipes); }
  ticked() { return this.ticks[this.week.plan().start] || {}; }

  tick(key, on) {
    const start = this.week.plan().start;
    const week = { ...(this.ticks[start] || {}), [key]: on };
    if (!on) delete week[key];
    const keep = Object.keys(this.ticks).filter((k) => k !== start).sort().slice(-3);
    this.ticks = { ...Object.fromEntries(keep.map((k) => [k, this.ticks[k]])), [start]: week };
    this.storage.set('ticked', this.ticks);
    this.refresh();
  }

  render() {
    const list = this.list();
    const ticked = this.ticked();
    const topUp = this.week.topUp();
    this.box.replaceChildren(
      el('p', { class: 'hint' }, topUp ? `A ${this.week.dayLong(0)} main shop and a small ${this.week.dayLong(topUp)} top-up so mushrooms and tofu stay fresh. Tick as you go.` : 'One main shop for the week. Tick as you go.'),
      el('section', { class: 'panel shop-list' },
        el('h2', { class: 'mise-h' }, `${this.week.dayLong(0)} shop`, el('small', {}, ` · ${this.week.dateShort(0)}`)),
        list.main.map((g) => [el('h3', { class: 'sub-head' }, g.label), el('ul', { class: 'shop-items' }, g.items.map((i) => this.row(i, ticked)))]),
        list.staples ? el('ul', { class: 'shop-items' }, this.row({ key: 'main:staples', name: list.staples, amount: 'top up', usedFor: 'All week' }, ticked)) : null),
      list.topUp.length ? el('section', { class: 'panel shop-list' },
        el('h2', { class: 'mise-h' }, `${this.week.dayLong(topUp)} top-up`, el('small', {}, ` · ${this.week.dateShort(topUp)}`)),
        el('ul', { class: 'shop-items' }, list.topUp.map((i) => this.row(i, ticked)))) : null,
      el('button', { type: 'button', class: 'link-btn', onclick: () => this.clearTicks() }, 'Untick everything'));
  }

  row(item, ticked) {
    const on = !!ticked[item.key];
    return el('li', { class: on ? 'done' : '' },
      el('label', { class: 'shop-item' },
        el('input', { type: 'checkbox', checked: on, onchange: (e) => this.tick(item.key, e.target.checked) }),
        el('span', { class: 'shop-name' }, item.name, el('small', {}, this.week.words(item.usedFor))),
        el('span', { class: 'shop-amount' }, item.amount)));
  }

  clearTicks() {
    const start = this.week.plan().start;
    this.ticks = { ...this.ticks, [start]: {} };
    this.storage.set('ticked', this.ticks);
    this.refresh();
  }

  todayCard(day) {
    const topUp = this.week.topUp();
    if (day !== 0 && day !== topUp) return null;
    const list = this.list();
    const ticked = this.ticked();
    const items = day === 0 ? list.main.flatMap((g) => g.items) : list.topUp;
    if (!items.length) return null;
    const done = items.filter((i) => ticked[i.key]).length;
    return el('button', { type: 'button', class: 'today-card', onclick: () => this.app.shell.selectView('shop') },
      el('span', { class: 'today-card-kicker' }, day === 0 ? 'Main shop today' : 'Top-up shop today'),
      el('b', {}, `${done} of ${items.length} things ticked`),
      el('span', { class: 'today-card-line' }, items.filter((i) => !ticked[i.key]).slice(0, 4).map((i) => i.name.replace(/\s*\(.*\)$/, '')).join(', ')));
  }

  printPage() {
    const list = this.list();
    const topUp = this.week.topUp();
    const table = (rows, heading) => el('table', { class: 'pr-table pr-shop' },
      el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'Item'), el('th', {}, 'Amount'), el('th', {}, 'Used for'))),
      el('tbody', {}, rows));
    const line = (i) => el('tr', {}, el('td', { class: 'pr-box' }, '☐'), el('td', {}, i.name), el('td', {}, i.amount), el('td', {}, this.week.words(i.usedFor)));
    const mainRows = list.main.flatMap((g) => [el('tr', { class: 'pr-group' }, el('td', {}, ''), el('td', { colspan: 3 }, g.label)), ...g.items.map(line)]);
    if (list.staples) mainRows.push(line({ name: list.staples, amount: 'top up', usedFor: 'All week' }));
    return el('div', {},
      el('p', { class: 'pr-sub' }, topUp ? `A ${this.week.dayLong(0)} main shop and a small ${this.week.dayLong(topUp)} top-up so mushrooms and tofu stay fresh. Tick as you go.` : 'One main shop. Tick as you go.'),
      el('h2', {}, `${this.week.dayLong(0)} shop`),
      table(mainRows),
      list.topUp.length ? [el('h2', {}, `${this.week.dayLong(topUp)} top-up`), table(list.topUp.map(line))] : null);
  }
}
