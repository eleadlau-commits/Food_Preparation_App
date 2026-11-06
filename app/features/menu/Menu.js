// Menu: the Week tab. The week's dinners (main, side, soup, with Western nights shaded), the
// buttons to plan a new week, and "How the ingredients are shared". Tap a night to swap a dish,
// lock the night so new plans keep it, or move it to another day.
//
// Adds the first page of the printed plan (slot 'print.pages').
//
// Saved data: none (the plan is the week feature's).

import { Feature, ui } from 'folio';
import { sharedRows, fishNotes } from './shared.js';

const { el } = ui;
const COURSES = [['main', 'Main'], ['side', 'Side'], ['soup', 'Soup']];
const LOCK = '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';

export default class Menu extends Feature {
  start() {
    this.week = this.use('week');
    this.recipes = this.use('recipes');
    this.add('views', {
      id: 'week',
      label: 'Week',
      icon: 'calendar',
      order: 20,
      subtitle: () => this.week.range(),
      mount: (container) => { this.box = el('div', { class: 'menu-view' }); container.append(this.box); },
      render: () => this.render(),
    });
    this.add('print.pages', { id: 'menu', order: 10, title: 'Weekly Dinner Menu', render: () => this.printPage() });
  }

  render() {
    const plan = this.week.plan();
    const d = this.week.derived();
    this.box.replaceChildren(
      this.intro(plan),
      el('div', { class: 'menu-nights' }, d.nights.map((n) => this.nightCard(n, plan))),
      el('p', { class: 'hint small menu-rice' }, this.riceLine(d)),
      this.actions(),
      this.sharedSection(d));
  }

  intro(plan) {
    const words = { example: 'The example week', generated: 'Planned for you', edited: 'Your plan' };
    const household = this.use('household');
    return el('div', { class: 'menu-intro' },
      el('span', { class: 'menu-tag' }, words[plan.from] || 'Your plan'),
      el('span', { class: 'hint small' }, household ? `${household.portions()} portions per dish: ${household.servingLine()}` : '4 portions per dish'));
  }

  nightCard(n, plan) {
    const day = n.day;
    const western = n.main?.style === 'western';
    const today = this.week.today() === day;
    return el('button', {
      type: 'button',
      class: `menu-night${western ? ' western' : ''}${today ? ' today' : ''}`,
      onclick: () => this.openNight(day),
      'aria-label': `${this.week.dayLong(day)}: ${n.main?.name}. Change`,
    },
      el('span', { class: 'menu-day' }, el('b', {}, this.week.dayName(day)), el('small', {}, this.week.dateShort(day).split(' ').slice(1).join(' '))),
      el('span', { class: 'menu-dishes' },
        el('span', { class: 'menu-main' }, n.main?.name || '—'),
        el('span', { class: 'menu-extras' }, [n.side?.short, n.soup?.short].filter(Boolean).join(' · ')),
        n.problems.length ? el('span', { class: 'menu-problem' }, n.problems[0]) : null),
      el('span', { class: 'menu-flags' },
        plan.locked[day] ? el('span', { class: 'menu-lock', title: 'Locked' }, ui.icon(LOCK)) : null,
        western ? el('span', { class: 'menu-western' }, 'Western') : null));
  }

  riceLine(d) {
    const rice = d.nights.filter((n) => n.rice > 0);
    const none = d.nights.filter((n) => !n.rice).map((n) => `${this.week.dayName(n.day)} (${n.riceNote || 'no rice'})`);
    const grams = rice[0]?.rice || 300;
    return `Served with steamed short-grain rice (~${grams} g dry rice per night: half for dinner, half packed for lunch).${none.length ? ` No plain rice ${none.join(', ')}.` : ''} Western nights are shaded.`;
  }

  actions() {
    const plan = this.week.plan();
    const locks = plan.locked.filter(Boolean).length;
    return el('div', { class: 'menu-actions' },
      el('button', { type: 'button', class: 'btn primary', onclick: () => { if (this.week.generate()) ui.toast(locks ? `New plan, keeping ${locks} locked night${locks > 1 ? 's' : ''}` : 'Here\'s a new plan for this week'); } },
        ui.icon('refresh'), locks ? ' Plan again (keep locked)' : ' Plan this week for me'),
      el('button', { type: 'button', class: 'btn', onclick: () => { if (this.week.nextWeek()) ui.toast('Next week is planned'); } }, 'Plan next week'),
      plan.from !== 'example' ? el('button', { type: 'button', class: 'link-btn', onclick: () => this.week.useExample() }, 'Back to the example week') : null);
  }

  sharedSection(d) {
    const rows = sharedRows(d, this.recipes);
    const fish = fishNotes(d, this.recipes);
    return el('section', { class: 'panel menu-shared' },
      el('h2', { class: 'mise-h' }, 'How the ingredients are shared'),
      rows.length ? el('dl', {}, rows.map((r) => [el('dt', {}, r.label), el('dd', {}, this.week.words(r.where))])) : el('p', { class: 'hint' }, 'Nothing is shared between dishes this week.'),
      fish.length ? el('p', { class: 'hint small' }, el('b', {}, 'Fish freshness: '), fish.map((t) => this.week.words(t)).join(' ')) : null);
  }

  // The window for one night: swap each dish, lock it, or move it to another day.
  openNight(day) {
    if (!this.window) this.window = ui.dialog({ title: '', className: 'menu-dialog' });
    this.fillNight(day);
    this.window.open();
  }

  fillNight(day, course = null) {
    const plan = this.week.plan();
    const n = this.week.derived().nights[day];
    this.window.setTitle(this.week.dateLong(day));
    const lock = el('div', { class: 'row menu-lockrow' },
      el('span', {}, el('b', {}, 'Lock this night'), el('br'), el('small', { class: 'hint' }, 'New plans keep it as it is.')),
      ui.toggle({ checked: plan.locked[day], label: 'Lock this night', onChange: (on) => { this.week.lock(day, on); this.fillNight(day, course); } }));
    const dishes = COURSES.map(([c, label]) => {
      const d = n[c];
      const open = course === c;
      return el('div', { class: `menu-course${open ? ' open' : ''}` },
        el('div', { class: 'menu-course-head' },
          el('span', {}, el('small', { class: 'label' }, label), el('br'), el('b', {}, d?.name || '—'), d ? el('small', { class: 'hint' }, ` · ${d.mins} min`) : null),
          el('button', { type: 'button', class: 'btn small', onclick: () => this.fillNight(day, open ? null : c) }, open ? 'Close' : 'Swap')),
        open ? this.alternatives(day, c) : null);
    });
    const move = el('label', { class: 'field' },
      el('span', { class: 'label' }, 'Cook it on another day'),
      ui.select([['', 'Swap with…'], ...[0, 1, 2, 3, 4, 5, 6].filter((i) => i !== day).map((i) => [String(i), `${this.week.dayLong(i)}: ${this.week.derived().nights[i].main?.short}`])],
        { value: '', onChange: (v) => { if (v !== '') { this.week.move(day, Number(v)); this.fillNight(Number(v)); ui.toast('Swapped days'); } } }));
    this.window.setContent(
      n.problems.length ? el('p', { class: 'error' }, n.problems.join('. ')) : null,
      el('div', { class: 'menu-courses' }, dishes),
      lock,
      move);
  }

  alternatives(day, course) {
    const list = this.week.alternatives(day, course).slice(0, 8);
    if (!list.length) return el('p', { class: 'hint small' }, 'No other dishes fit your settings.');
    return el('ul', { class: 'list menu-alts' }, list.map((a) => el('li', {},
      el('button', {
        type: 'button', class: 'menu-alt', disabled: !a.fits,
        onclick: () => { this.week.swap(day, course, a.dish.id); this.fillNight(day); ui.toast(`${a.dish.short} it is`); },
      },
        el('span', {}, el('b', {}, a.dish.name), el('br'), el('small', { class: 'hint' }, a.fits ? `${a.dish.mins} min${a.dish.style === 'western' ? ' · Western' : ''}` : 'Won\'t keep fresh until this day')),
        ui.icon('right')))));
  }

  // Page 1 of the printed plan: the menu table, then how the ingredients are shared.
  printPage() {
    const d = this.week.derived();
    const household = this.use('household');
    const rows = sharedRows(d, this.recipes, { limit: 9 });
    const fish = fishNotes(d, this.recipes);
    return el('div', {},
      el('p', { class: 'pr-sub' }, `${this.week.range()} | ${household ? `${household.portions()} portions per dish: ${household.servingLine()}` : ''}`),
      el('table', { class: 'pr-table' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Day'), el('th', {}, 'Main'), el('th', {}, 'Side'), el('th', {}, 'Soup'))),
        el('tbody', {}, d.nights.map((n) => el('tr', { class: n.main?.style === 'western' ? 'shade' : '' },
          el('td', {}, this.week.dayName(n.day)), el('td', {}, n.main?.name), el('td', {}, n.side?.name), el('td', {}, n.soup?.name))))),
      el('p', { class: 'pr-note' }, this.riceLine(d)),
      el('h2', {}, 'How the ingredients are shared'),
      el('table', { class: 'pr-table' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Ingredient'), el('th', {}, 'Where it goes'))),
        el('tbody', {}, rows.map((r) => el('tr', {}, el('td', {}, r.label), el('td', {}, this.week.words(r.where)))))),
      fish.length ? el('p', { class: 'pr-note' }, el('b', {}, 'Fish freshness: '), fish.map((t) => this.week.words(t)).join(' ')) : null);
  }
}
