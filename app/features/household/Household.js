// Household: who's eating and how they shop. The first time the app opens it asks a few
// questions (how many people, shop day, diet); everything can be changed later in Settings.
//
// Service 'household': { get() → settings, set(patch), portions(), scale(), filter(), servingLine(), WEEKDAYS }
// Event 'household:changed' (settings) whenever something changes.
//
// Saved data: 'settings' → see DEFAULTS in rules.js.

import { Feature, ui } from 'folio';
import { DEFAULTS, WEEKDAYS, withDefaults, portions, scale, filter, servingLine } from './rules.js';

const { el } = ui;

export default class Household extends Feature {
  start() {
    this.settings = withDefaults(this.storage.get('settings', null));
    this.provide('household', {
      get: () => this.settings,
      set: (patch) => this.set(patch),
      portions: () => portions(this.settings),
      scale: () => scale(this.settings),
      filter: () => filter(this.settings),
      servingLine: () => servingLine(this.settings),
      WEEKDAYS,
    });
    this.add('settings', { id: 'household', title: 'Your household', order: 10, render: () => this.form() });
    this.on('app:ready', () => { if (!this.settings.setUp) this.welcome(); });
  }

  set(patch) {
    this.settings = { ...this.settings, ...patch };
    this.storage.set('settings', this.settings);
    this.emit('household:changed', this.settings);
    if (this.welcomeBox?.isOpen) this.fillWelcome();
    this.app.shell.refreshSettings?.();
    this.refresh();
  }

  // The settings form, used in Settings and in the first-time window.
  form() {
    const recipes = this.use('recipes');
    const s = this.settings;
    const number = (key, label, min, max, hint) => el('label', { class: 'field' },
      el('span', { class: 'label' }, label),
      el('input', { type: 'number', min, max, value: s[key], inputmode: 'numeric', onchange: (e) => this.set({ [key]: clamp(Number(e.target.value), min, max) }) }),
      hint ? el('span', { class: 'hint small' }, hint) : null);
    const choose = (key, label, options, hint) => el('label', { class: 'field' },
      el('span', { class: 'label' }, label),
      ui.select(options, { value: String(s[key]), onChange: (v) => this.set({ [key]: isNaN(Number(v)) ? v : Number(v) }) }),
      hint ? el('span', { class: 'hint small' }, hint) : null);
    const allergyBoxes = (recipes?.ALLERGIES || []).map((a) => el('label', { class: 'check hh-chip' },
      el('input', { type: 'checkbox', checked: s.allergies.includes(a.id), onchange: (e) => this.set({ allergies: e.target.checked ? [...s.allergies, a.id] : s.allergies.filter((x) => x !== a.id) }) }),
      a.label));
    const fresh = recipes ? Object.entries(recipes.INGREDIENTS).filter(([, i]) => ['fish', 'meat', 'veg'].includes(i.section)).sort((a, b) => a[1].name.localeCompare(b[1].name)) : [];
    return el('div', { class: 'stack hh-form' },
      number('people', 'People', 1, 8, 'Each dinner is cooked for them, plus their lunch the next day.'),
      choose('shopDay', 'Main shop and prep day', WEEKDAYS.map((d, i) => [String(i), d])),
      choose('topUpGap', 'Top-up shop and second prep', [['2', '2 days later'], ['3', '3 days later'], ['0', 'No top-up']],
      'A small shop for mushrooms and tofu, and a second prep session.'),
      recipes ? choose('diet', 'Diet', recipes.DIETS.map((d) => [d.id, d.label])) : null,
      el('div', { class: 'field' }, el('span', { class: 'label' }, 'Allergies and things to avoid'), el('div', { class: 'hh-chips' }, allergyBoxes)),
      fresh.length ? el('div', { class: 'field' },
        el('span', { class: 'label' }, 'Dislikes'),
        el('div', { class: 'hh-chips' },
          s.dislikes.map((id) => el('button', { type: 'button', class: 'hh-chip on', title: 'Remove', onclick: () => this.set({ dislikes: s.dislikes.filter((x) => x !== id) }) }, recipes.INGREDIENTS[id]?.name || id, ' ×')),
          ui.select([['', 'Add an ingredient…'], ...fresh.filter(([id]) => !s.dislikes.includes(id)).map(([id, i]) => [id, i.name])],
            { value: '', onChange: (v) => v && this.set({ dislikes: [...s.dislikes, v] }) }))) : null,
      choose('maxMins', 'Longest cooking time on a weeknight', [['0', 'No limit'], ['20', '20 minutes'], ['30', '30 minutes'], ['40', '40 minutes']]),
      choose('westernNights', 'Western nights a week', [0, 1, 2, 3, 4].map((n) => [String(n), String(n)])),
      el('p', { class: 'hint small' }, 'New settings apply when you plan a new week or tap Plan again on the Week tab. Shopping amounts change straight away.'));
  }

  welcome() {
    this.welcomeBox = ui.dialog({ title: 'Welcome to Mise', className: 'hh-welcome', onClose: () => this.set({ setUp: true }) });
    this.fillWelcome();
    this.welcomeBox.open();
  }

  fillWelcome() {
    const box = this.welcomeBox;
    box.setContent(
      el('p', { class: 'hh-lead' }, 'One week of dinners that double as tomorrow\'s lunch, with the shopping list and prep plan worked out for you.'),
      el('p', { class: 'hint' }, 'A few questions first. You can change any of them later in Settings.'),
      this.form(),
      el('button', { type: 'button', class: 'btn primary block', onclick: () => box.close() }, 'Start planning'));
  }
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? Math.round(n) : lo));

export { DEFAULTS };
