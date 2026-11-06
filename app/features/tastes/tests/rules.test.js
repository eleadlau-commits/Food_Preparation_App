import { test, assert } from 'folio/testing';
import { weights } from '../rules.js';

test('liked dishes go up, skipped ones go down', () => {
  const w = weights({
    a: { main: 'hoikoro', side: 'namasu', rating: 'liked', at: 1 },
    b: { main: 'saba-misoni', rating: 'skipped', reason: 'didnt-like', at: 2 },
  });
  assert.ok(w.hoikoro > 0);
  assert.ok(w.namasu > 0 && w.namasu < w.hoikoro);
  assert.ok(w['saba-misoni'] < -2);
});

test('no time tonight is not held against the dish', () => {
  const w = weights({ a: { main: 'nikujaga', rating: 'skipped', reason: 'no-time', at: 1 } });
  assert.equal(w.nikujaga, 0);
});

test('someone who skips every fish dish stops being offered fish', () => {
  const ratings = {};
  for (let i = 0; i < 4; i++) ratings[i] = { main: 'salmon-teriyaki', rating: 'skipped', reason: 'didnt-like', at: i };
  assert.equal(weights(ratings)['salmon-teriyaki'], -3);
});
