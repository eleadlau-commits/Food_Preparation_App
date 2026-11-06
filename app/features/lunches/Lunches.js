// Lunches: the lunch plan. Each dinner is cooked as 4 portions so half is packed for the next
// day's lunch. Adds the plan below the nights on the Cook tab, today's lunch to Today, and the
// lunch table to the printed plan.
//
// Saved data: none.

import { Feature, ui } from 'folio';
import { lunchPlan } from './rules.js';

const { el } = ui;

export default class Lunches extends Feature {
  start() {
    this.week = this.use('week');
    this.add('cook.sections', { order: 10, render: () => this.section() });
    this.add('today.cards', { id: 'lunch', order: 12, render: (day) => this.todayCard(day) });
    this.add('print.pages', { id: 'lunch', order: 55, title: 'Lunch Plan', render: () => this.printPage(), join: true });
  }

  plan() { return lunchPlan(this.week.derived()); }

  section() {
    return el('section', { class: 'panel lunch-plan' },
      el('h2', { class: 'mise-h' }, 'Lunch plan'),
      el('ul', {}, this.plan().map((l) => el('li', {},
        el('b', {}, this.week.dayName(l.day)),
        el('span', {}, l.what, l.tip ? el('small', {}, l.tip) : null)))));
  }

  todayCard(day) {
    const l = this.plan().find((x) => x.day === day);
    if (!l) return null;
    return el('div', { class: 'today-card' },
      el('span', { class: 'today-card-kicker' }, 'Lunch today'),
      el('b', {}, l.what),
      l.tip ? el('span', { class: 'today-card-line' }, l.tip) : null);
  }

  printPage() {
    return el('table', { class: 'pr-table' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Lunch'), el('th', {}, 'What to pack'), el('th', {}, 'Tip'))),
      el('tbody', {}, this.plan().map((l) => el('tr', {}, el('td', {}, this.week.dayName(l.day)), el('td', {}, l.what), el('td', {}, l.tip)))));
  }
}
