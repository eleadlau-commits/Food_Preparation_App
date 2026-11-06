import { test, assert } from 'folio/testing';
import * as recipes from '../../recipes/rules.js';
import { derive, words } from '../../week/derive.js';
import { EXAMPLE_WEEK } from '../../week/example.js';
import { sharedRows, fishNotes } from '../shared.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const say = (t) => words(t, (d) => DAYS[d]);
const derived = derive(EXAMPLE_WEEK, recipes, {});

test('the example week shares pork belly between hoikoro and nikujaga, frozen in two bags', () => {
  const pork = sharedRows(derived, recipes).find((r) => r.id === 'pork-belly');
  assert.equal(pork.label, 'Thin-sliced pork belly (900 g)');
  assert.equal(say(pork.where), 'Hoikoro (Fri, 500 g) · Nikujaga (Sun, 400 g). Frozen on Mon in 2 bags.');
});

test('dashi comes in two batches', () => {
  const dashi = sharedRows(derived, recipes).find((r) => r.id === 'dashi');
  assert.equal(dashi.label, 'Dashi (2.5 L + 3 L)');
});

test('fish notes say when it is bought and cooked', () => {
  const notes = fishNotes(derived, recipes).map(say);
  assert.equal(notes[0], 'Mackerel bought Mon, cooked that night.');
  assert.match(notes[1], /^Cod bought Mon and goes straight into the marinade/);
  assert.match(notes[1], /cooked Wed\.$/);
});
