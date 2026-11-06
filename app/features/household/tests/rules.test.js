import { test, assert } from 'folio/testing';
import { withDefaults, portions, scale, servingLine } from '../rules.js';

test('a household of two gets the 4-portion format', () => {
  const h = withDefaults({});
  assert.equal(portions(h), 4);
  assert.equal(scale(h), 1);
  assert.equal(servingLine(h), 'dinner for 2 + next-day lunch for 2');
});

test('portions scale with the household', () => {
  assert.equal(scale(withDefaults({ people: 3 })), 1.5);
  assert.equal(portions(withDefaults({ people: 1 })), 2);
});

test('the main shop is on Monday unless changed', () => {
  assert.equal(withDefaults({}).shopDay, 1);
  assert.equal(withDefaults({ shopDay: 0 }).shopDay, 0);
});
