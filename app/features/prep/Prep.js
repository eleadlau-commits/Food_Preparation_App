// Prep: the Prep tab. One card per prep session (shop day, and the top-up day): about how long
// it takes, the numbered jobs, and the reminders until the next session (moving meat from the
// freezer to the fridge, soaking rice). Adds today's reminders and prep to Today, and pages 3
// and 4 of the printed plan.
//
// Saved data: 'done' → { 'YYYY-MM-DD': { 'session:index': true } } (jobs ticked off, last 4 weeks).

import { Feature, ui } from 'folio';
import { sessions, remindersOn } from './sessions.js';

const { el } = ui;
const KNIFE = '<path d="M3 21l9-9"/><path d="M12 12l7.5-7.5a2.1 2.1 0 0 1 3 3L15 15l-3-3z"/>';

export default class Prep extends Feature {
  start() {
    this.week = this.use('week');
    this.done = this.storage.get('done', {});
    this.add('views', {
      id: 'prep', label: 'Prep', icon: KNIFE, order: 40,
      subtitle: () => sessions(this.week.derived()).map((s) => `${this.week.dayName(s.day)} ~${s.mins} min`).join(' · '),
      mount: (c) => { this.box = el('div', { class: 'prep-view' }); c.append(this.box); },
      render: () => this.render(),
    });
    this.add('today.cards', { id: 'reminders', order: 5, render: (day) => this.remindersCard(day) });
    this.add('today.cards', { id: 'prep', order: 15, render: (day) => this.prepCard(day) });
    [0, 1].forEach((i) => this.add('print.pages', {
      id: `prep-${i}`, order: 30 + i,
      title: () => `${this.week.dayLong(this.sessionDay(i) ?? 0)} Prep`,
      render: () => this.printPage(i),
    }));
  }

  sessionDay(i) { return this.week.derived().sessions[i] ?? null; }

  ticked() { return this.done[this.week.plan().start] || {}; }
  toggle(key, on) {
    const start = this.week.plan().start;
    const week = { ...(this.done[start] || {}) };
    if (on) week[key] = true; else delete week[key];
    const keep = Object.keys(this.done).filter((k) => k !== start).sort().slice(-3);
    this.done = { ...Object.fromEntries(keep.map((k) => [k, this.done[k]])), [start]: week };
    this.storage.set('done', this.done);
    this.refresh();
  }

  coverText(s) {
    const [a, b] = s.covers;
    const covers = a === b ? this.week.dayName(a) : `${this.week.dayName(a)}-${this.week.dayName(b)}`;
    const freezes = s.tasks.some((t) => t.kind === 'freeze');
    return `About ${s.mins} minutes, done around ${this.week.today() === s.day ? 'tonight\'s' : `${this.week.dayLong(s.day)}'s`} dinner. Covers ${covers}${freezes ? ' and freezes what\'s needed later' : ''}.`;
  }

  render() {
    const list = sessions(this.week.derived());
    const ticked = this.ticked();
    this.box.replaceChildren(...list.map((s) => el('section', { class: `panel prep-session${this.week.today() === s.day ? ' today' : ''}` },
      el('h2', { class: 'mise-h' }, `${this.week.dayLong(s.day)} prep`, el('small', {}, ` · ${this.week.dateShort(s.day)}`)),
      el('p', { class: 'hint' }, this.coverText(s)),
      el('ol', { class: 'prep-tasks' }, s.tasks.map((t, i) => {
        const key = `${s.day}:${i}:${t.title}`;
        const on = !!ticked[key];
        return el('li', { class: on ? 'done' : '' },
          el('label', { class: 'prep-task' },
            el('input', { type: 'checkbox', checked: on, onchange: (e) => this.toggle(key, e.target.checked), 'aria-label': `Done: ${t.title}` }),
            el('span', {}, el('b', {}, this.week.words(t.title)), el('span', { class: 'prep-text' }, this.week.words(t.text)))));
      })),
      s.reminders.length ? this.reminderTable(s.reminders) : null)));
    if (!list.length) this.box.append(ui.missing('No prep this week.'));
  }

  reminderTable(reminders) {
    return el('div', { class: 'prep-reminders' },
      el('h3', { class: 'sub-head' }, 'Reminders'),
      el('ul', {}, reminders.map((r) => el('li', { class: r.kind === 'thaw' ? 'thaw' : '' },
        el('span', {}, this.week.words(r.text)),
        el('b', {}, `${this.week.dayName(r.day)} ${r.when}`)))));
  }

  remindersCard(day) {
    const list = remindersOn(this.week.derived(), day);
    if (!list.length) return null;
    return el('div', { class: 'today-card today-remind' },
      el('span', { class: 'today-card-kicker' }, ui.icon('bell'), ' Reminders today'),
      el('ul', {}, list.map((r) => el('li', {}, el('b', {}, r.when === 'morning' ? 'Morning: ' : 'Evening: '), this.week.words(r.text)))));
  }

  prepCard(day) {
    const s = sessions(this.week.derived()).find((x) => x.day === day);
    if (!s || !s.tasks.length) return null;
    const ticked = this.ticked();
    const done = s.tasks.filter((t, i) => ticked[`${s.day}:${i}:${t.title}`]).length;
    return el('button', { type: 'button', class: 'today-card', onclick: () => this.app.shell.selectView('prep') },
      el('span', { class: 'today-card-kicker' }, 'Prep session today'),
      el('b', {}, `About ${s.mins} minutes · ${done} of ${s.tasks.length} done`),
      el('span', { class: 'today-card-line' }, s.tasks.map((t) => this.week.words(t.title).replace(/\s*\(.*\)$/, '')).join(', ')));
  }

  printPage(i) {
    const day = this.sessionDay(i);
    const s = day == null ? null : sessions(this.week.derived()).find((x) => x.day === day);
    if (!s) return null;
    return el('div', {},
      el('p', { class: 'pr-sub' }, this.coverText(s).replace(/around .*?dinner/, `alongside ${this.week.dayLong(s.day)} dinner`)),
      s.tasks.map((t, n) => el('div', { class: 'pr-step' }, el('h3', {}, `${n + 1}. ${this.week.words(t.title)}`), el('p', {}, this.week.words(t.text)))),
      s.reminders.length ? el('table', { class: 'pr-table' },
        el('thead', {}, el('tr', {}, el('th', {}, 'Reminder'), el('th', {}, 'When'))),
        el('tbody', {}, s.reminders.map((r) => el('tr', {}, el('td', {}, this.week.words(r.text)), el('td', {}, `${this.week.dayName(r.day)} ${r.when}`))))) : null);
  }
}
