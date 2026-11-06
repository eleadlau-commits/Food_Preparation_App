// Tastes: feedback after each dinner, and what the planner learns from it. Under each night on
// the Cook tab: Liked it, Okay or Skipped (with a reason). Today asks about last night's dinner.
// The planner reads the weights through the 'tastes' service.
//
// Service 'tastes': { weight(dishId) → -3…3, rating(start, day) }
//
// Saved data: 'ratings' → { 'YYYY-MM-DD:day': { main, side, soup, rating, reason, at } }

import { Feature, ui } from 'folio';
import { RATINGS, REASONS, weights } from './rules.js';

const { el } = ui;

export default class Tastes extends Feature {
  start() {
    this.ratings = this.storage.get('ratings', {});
    this.weights = weights(this.ratings);
    this.provide('tastes', {
      weight: (id) => this.weights[id] || 0,
      rating: (start, day) => this.ratings[`${start}:${day}`] || null,
    });
    this.add('cook.night', { order: 50, render: (day) => this.buttons(day) });
    this.add('today.cards', { id: 'last-night', order: 30, render: (day) => this.lastNight(day) });
    this.add('settings', { id: 'tastes', title: 'What you like', order: 30, render: () => this.settings() });
  }

  key(day) { return `${this.use('week').plan().start}:${day}`; }

  rate(day, rating, reason = null) {
    const n = this.use('week').plan().nights[day];
    this.ratings = { ...this.ratings, [this.key(day)]: { ...n, rating, reason, at: Date.now() } };
    this.storage.set('ratings', this.ratings);
    this.weights = weights(this.ratings);
    if (rating === 'liked') ui.toast('Noted. You\'ll see it again.');
    if (reason === 'didnt-like') ui.toast('Noted. It won\'t come up as often.');
    this.refresh();
  }

  buttons(day) {
    const week = this.use('week');
    if (!week) return null;
    const today = week.todayIndex();
    if (today < day) return null; // only once it's been cooked
    const r = this.ratings[this.key(day)];
    return el('div', { class: 'taste-row' },
      el('span', { class: 'hint small' }, 'How was it?'),
      el('div', { class: 'seg taste-seg' }, RATINGS.map((x) => el('button', {
        type: 'button', class: r?.rating === x.id ? 'on' : '', 'aria-pressed': String(r?.rating === x.id), onclick: () => this.rate(day, x.id),
      }, x.label))),
      r?.rating === 'skipped' || r?.rating === 'okay' ? el('div', { class: 'taste-reasons' }, REASONS.filter((x) => r.rating === 'skipped' || x.id === 'too-long').map((x) => el('button', {
        type: 'button', class: `taste-chip${r.reason === x.id ? ' on' : ''}`, onclick: () => this.rate(day, r.rating, x.id),
      }, x.label))) : null);
  }

  lastNight(day) {
    if (day < 1) return null;
    const week = this.use('week');
    if (this.ratings[this.key(day - 1)]) return null;
    const n = week.derived().nights[day - 1];
    return el('div', { class: 'today-card' },
      el('span', { class: 'today-card-kicker' }, 'Last night'),
      el('b', {}, `How was the ${n.main?.short.toLowerCase()}?`),
      this.buttons(day - 1));
  }

  settings() {
    const recipes = this.use('recipes');
    const liked = Object.entries(this.weights).filter(([, w]) => w > 0.4).sort((a, b) => b[1] - a[1]);
    const less = Object.entries(this.weights).filter(([, w]) => w < -0.4).sort((a, b) => a[1] - b[1]);
    const names = (list) => list.map(([id]) => recipes?.dish(id)?.short || id).join(', ');
    return el('div', { class: 'stack' },
      el('p', { class: 'hint' }, 'Rate dinners on the Cook tab and new plans favour what you liked.'),
      liked.length ? el('p', {}, el('b', {}, 'More of: '), names(liked)) : null,
      less.length ? el('p', {}, el('b', {}, 'Less of: '), names(less)) : null,
      Object.keys(this.ratings).length ? el('button', { type: 'button', class: 'btn small', onclick: () => { this.ratings = {}; this.weights = {}; this.storage.set('ratings', {}); this.refresh(); this.app.shell.refreshSettings(); } }, 'Forget my ratings') : null);
  }
}
