// Today: the tab the app opens on. Today's date and day of the plan, then cards from other
// features: reminders (thaw the meat), tonight's dinner, today's lunch, the shop or prep
// session if it's today, and last night's feedback. Before or after the plan's week it offers
// to plan the next one.
//
// Slot 'today.cards': cards on Today. Item: { id, order, render(day) → element or null }, where
// day is today's day of the plan (0-6).
//
// Saved data: none.

import { Feature, ui } from 'folio';

const { el } = ui;

export default class Today extends Feature {
  start() {
    this.week = this.use('week');
    this.defineSlot('today.cards', 'Cards on the Today tab. Item: { id, order, render(day) → element or null }, day = today\'s day of the plan (0-6).');
    this.add('views', {
      id: 'today', label: 'Today', icon: 'home', order: 10, start: true, darkHead: true,
      subtitle: () => this.subtitle(),
      mount: (c) => { this.box = el('div', { class: 'today-view' }); c.append(this.box); },
      render: () => this.render(),
    });
  }

  subtitle() {
    const i = this.week.todayIndex();
    if (i >= 0 && i < 7) return `${this.week.dateLong(i)} · day ${i + 1} of your plan`;
    return this.week.range();
  }

  render() {
    const i = this.week.todayIndex();
    if (i < 0 || i > 6) {
      this.box.replaceChildren(this.outside(i));
      return;
    }
    const cards = this.slot('today.cards').map((c) => c.render(i)).filter(Boolean);
    this.box.replaceChildren(...(cards.length ? cards : [ui.missing('Nothing planned for today.')]), this.weekStrip(i));
  }

  // Before the plan starts, or after it ends.
  outside(i) {
    const before = i < 0;
    return el('div', { class: 'today-card today-hero' },
      el('span', { class: 'today-card-kicker' }, before ? 'Coming up' : 'This plan has finished'),
      el('b', { class: 'today-hero-title' }, before ? `Your plan starts ${this.week.dateLong(0)}` : 'Time to plan the next week'),
      el('span', { class: 'today-card-line' }, before ? 'Have a look at the Week tab and the shopping list before shop day.' : 'It avoids this week\'s dinners and learns from your ratings.'),
      before ? el('button', { type: 'button', class: 'btn', onclick: () => this.app.shell.selectView('week') }, 'See the week')
        : el('button', { type: 'button', class: 'btn primary', onclick: () => this.week.nextWeek() }, 'Plan next week'));
  }

  // The week at a glance: a dot per day, today filled.
  weekStrip(today) {
    const d = this.week.derived();
    return el('button', { type: 'button', class: 'today-strip', onclick: () => this.app.shell.selectView('week'), 'aria-label': 'Open the week' },
      d.nights.map((n) => el('span', { class: `today-strip-day${n.day === today ? ' on' : ''}${n.day < today ? ' past' : ''}` },
        el('b', {}, this.week.dayName(n.day).slice(0, 2)),
        el('small', {}, n.main?.short || ''))));
  }
}
