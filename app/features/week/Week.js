// Week: the planning engine and the current week's plan. It has no tab of its own; the Today,
// Week, Shop, Prep and Cook tabs all draw from its service.
//
// derive.js works out prep sessions, where each ingredient comes from, dashi batches and
// reminders; plan.js picks dishes and puts them on days. Both are tested in tests/.
//
// Service 'week': {
//   plan()                  { start: 'YYYY-MM-DD', nights: [7 × { main, side, soup }], locked: [7 × bool], seed, from }
//   derived()               everything derive() works out, for the household's portions and top-up day
//   words(text)             turns {day:N} placeholders into day names
//   dayName(i), dayLong(i), dateLong(i), dateShort(i), range(), today() (0-6 or null), topUp()
//   generate()              a new plan for the same week (locked nights stay)
//   nextWeek()              a new plan for the week after
//   useExample()            back to the example week
//   lock(day, on), swap(day, course, dishId), alternatives(day, course), move(from, to)
// }
// Event 'week:changed' whenever the plan changes.
//
// Saved data: 'plan' → as above; 'history' → [{ start, mains: [ids] }] (the last 4 weeks).

import { Feature, ui } from 'folio';
import { derive, words } from './derive.js';
import { generate, alternatives, schedule } from './plan.js';
import { EXAMPLE_WEEK } from './example.js';
import * as dates from './dates.js';

export default class Week extends Feature {
  start() {
    this.recipes = this.use('recipes');
    this.household = this.use('household');
    this.saved = this.storage.get('plan', null);
    if (!this.saved) this.saved = this.example(this.thisWeekStart());
    this.history = this.storage.get('history', []);
    this.cache = null;

    this.provide('week', {
      plan: () => this.saved,
      derived: () => this.derived(),
      words: (text) => words(text, (i) => dates.shortDay(this.saved.start, i)),
      dayName: (i) => dates.shortDay(this.saved.start, i),
      dayLong: (i) => dates.longDay(this.saved.start, i),
      dateLong: (i) => dates.longDate(this.saved.start, i),
      dateShort: (i) => dates.shortDate(this.saved.start, i),
      range: () => dates.range(this.saved.start),
      today: () => { const i = dates.dayIndex(this.saved.start); return i >= 0 && i < 7 ? i : null; },
      todayIndex: () => dates.dayIndex(this.saved.start),
      topUp: () => this.topUp(),
      generate: () => this.generate(),
      nextWeek: () => this.nextWeek(),
      useExample: () => this.save(this.example(this.saved.start)),
      lock: (day, on) => this.lock(day, on),
      swap: (day, course, id) => this.swap(day, course, id),
      alternatives: (day, course) => this.alternativesFor(day, course),
      move: (from, to) => this.move(from, to),
    });
    this.on('household:changed', () => { this.cache = null; });
  }

  settings() { return this.household?.get() || { shopDay: 1, topUpGap: 2, people: 2 }; }
  topUp() { return this.settings().topUpGap ?? 2; }
  scale() { return this.household?.scale() ?? 1; }
  thisWeekStart() { return dates.lastWeekday(this.settings().shopDay ?? 1); }

  example(start) {
    return { start, nights: EXAMPLE_WEEK.map((n) => ({ ...n })), locked: new Array(7).fill(false), seed: 0, from: 'example' };
  }

  derived() {
    if (!this.cache) this.cache = derive(this.saved.nights, this.recipes, { topUp: this.topUp(), scale: this.scale() });
    return this.cache;
  }

  save(plan) {
    this.saved = plan;
    this.cache = null;
    this.storage.set('plan', plan);
    this.emit('week:changed', plan);
    this.refresh();
  }

  lockedNights() { return this.saved.nights.map((n, i) => (this.saved.locked[i] ? n : null)); }

  options() {
    return {
      recipes: this.recipes,
      household: this.household?.filter() || {},
      tastes: this.use('tastes'),
      topUp: this.topUp(),
      scale: this.scale(),
    };
  }

  generate(start = this.saved.start, keepLocks = true) {
    const locked = keepLocks ? this.lockedNights() : [];
    const lastWeek = this.history.length ? this.history[this.history.length - 1].mains : [];
    const seed = `${start}:${(this.saved.seed || 0) + 1}:${Date.now() % 100000}`;
    const nights = generate({ ...this.options(), locked, lastWeek, seed });
    if (!nights) {
      ui.toast('Not enough dishes fit your settings for a full week. Try fewer restrictions in Settings.');
      return false;
    }
    this.save({ start, nights, locked: keepLocks ? this.saved.locked.slice() : new Array(7).fill(false), seed: (this.saved.seed || 0) + 1, from: 'generated' });
    return true;
  }

  nextWeek() {
    this.history = [...this.history, { start: this.saved.start, mains: this.saved.nights.map((n) => n.main) }].slice(-4);
    this.storage.set('history', this.history);
    // The week after this plan, or this week if the plan is old.
    const next = dates.addDays(this.saved.start, 7);
    const now = this.thisWeekStart();
    return this.generate(next > now ? next : now, false);
  }

  lock(day, on) {
    const locked = this.saved.locked.slice();
    locked[day] = on;
    this.save({ ...this.saved, locked });
  }

  alternativesFor(day, course) {
    return alternatives(this.saved.nights, day, course, this.options());
  }

  // Swap one dish. A new main that doesn't suit the side or soup gets ones that do.
  swap(day, course, id) {
    const nights = this.saved.nights.map((n) => ({ ...n }));
    nights[day][course] = id;
    if (course === 'main') {
      const main = this.recipes.dish(id);
      for (const c of ['side', 'soup']) {
        const cur = this.recipes.dish(nights[day][c]);
        if (cur && !this.recipes.goesWith(cur).includes(main.style)) {
          const alt = alternatives(nights, day, c, this.options()).find((a) => a.fits);
          if (alt) nights[day][c] = alt.dish.id;
        }
      }
    }
    this.save({ ...this.saved, nights, from: 'edited' });
  }

  // Swap two nights' days, e.g. to cook Thursday's dinner on Tuesday.
  move(from, to) {
    const nights = this.saved.nights.slice();
    [nights[from], nights[to]] = [nights[to], nights[from]];
    const locked = this.saved.locked.slice();
    [locked[from], locked[to]] = [locked[to], locked[from]];
    this.save({ ...this.saved, nights, locked, from: 'edited' });
  }

  // Put the same dinners on the days that keep them freshest (locked nights stay).
  reorder() {
    const best = schedule(this.saved.nights, this.recipes, { topUp: this.topUp(), scale: this.scale() }, this.lockedNights());
    if (best) this.save({ ...this.saved, nights: best, from: 'edited' });
    return !!best;
  }
}
