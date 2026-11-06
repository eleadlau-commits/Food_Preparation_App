// Print week: the printer button at the top. Opens the whole week as A4 pages (menu, grocery
// list, prep sessions, nightly notes and lunch plan), with a Print button that prints them or
// saves a PDF. Pages come from other features (slot 'print.pages').
//
// Slot 'print.pages': pages of the printed plan.
//   Item: { id, order, title (text or function), render() → element or null, join? (true: continue the previous page) }
//
// Saved data: none.

import { Feature, ui } from 'folio';

const { el } = ui;
const PRINTER = '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>';

export default class PrintWeek extends Feature {
  start() {
    this.defineSlot('print.pages', 'Pages of the printed plan. Item: { id, order, title (text or function), render() → element or null, join? }.');
    this.add('header.actions', { id: 'print', label: 'Print the week', icon: PRINTER, order: 10, onClick: () => this.open() });
    this.add('settings', { id: 'print', title: 'Print', order: 40, render: () => el('button', { type: 'button', class: 'btn small', onclick: () => { this.app.shell.closeSettings(); this.open(); } }, 'Print the week or save it as a PDF') });
  }

  pages() {
    const week = this.use('week');
    const household = this.use('household');
    const footer = week ? `Weekly Dinner Plan | w/c ${week.dateShort(0)} | ${household ? household.servingLine() : ''}` : 'Weekly Dinner Plan';
    const out = [];
    for (const item of this.slot('print.pages').items) {
      const body = this.slot('print.pages').run(item, (x) => x.render(), null);
      if (!body) continue;
      const title = typeof item.title === 'function' ? item.title() : item.title;
      if (item.join && out.length) { out[out.length - 1].body.append(el('h2', {}, title), body); continue; }
      out.push({ title, body: el('div', { class: 'pr-body' }, body) });
    }
    return out.map((p, i) => el('section', { class: 'pr-page' },
      el('h1', {}, p.title), p.body,
      el('footer', { class: 'pr-foot' }, el('span', {}, footer), el('span', {}, `Page ${i + 1}`))));
  }

  open() {
    const pages = this.pages();
    let root = document.getElementById('print-root');
    if (!root) { root = el('div', { id: 'print-root' }); document.body.append(root); }
    root.replaceChildren(...pages);
    if (!this.window) this.window = ui.dialog({ title: 'Print the week', className: 'pr-dialog' });
    // Inside a preview frame (such as a shared link) the browser won't print, so say so instead.
    const framed = (() => { try { return window.self !== window.top; } catch { return true; } })();
    this.window.setContent(
      el('div', { class: 'row pr-bar' },
        el('p', { class: 'hint' }, framed
          ? `${pages.length} A4 pages. Printing works in the app itself (open it from its own address, not this preview).`
          : `${pages.length} A4 pages. Print them, or choose "Save as PDF".`),
        framed ? null : el('button', { type: 'button', class: 'btn primary', onclick: () => window.print() }, 'Print')),
      el('div', { class: 'pr-preview' }, pages.map((p) => p.cloneNode(true))));
    this.window.open();
  }
}
