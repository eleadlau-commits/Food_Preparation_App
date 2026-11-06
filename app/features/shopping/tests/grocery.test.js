import { test, assert } from 'folio/testing';
import * as recipes from '../../recipes/rules.js';
import { derive, words } from '../../week/derive.js';
import { EXAMPLE_WEEK } from '../../week/example.js';
import { groceryList, progress } from '../grocery.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const list = groceryList(derive(EXAMPLE_WEEK, recipes, {}), recipes);
const find = (id) => list.main.flatMap((g) => g.items).find((i) => i.id === id);

test('the example main shop matches the printed list', () => {
  assert.deepEqual(list.main.map((g) => g.label), ['Fishmonger', 'Meat, eggs & dairy', 'Vegetables & fresh', 'Pantry (check before buying)']);
  assert.equal(find('mackerel').amount, '4 (~500 g)');
  assert.equal(words(find('mackerel').usedFor, (d) => DAYS[d]), 'Mon saba misoni');
  assert.equal(find('pork-belly').amount, '900 g');
  assert.equal(find('potatoes').amount, '1.2 kg');
  assert.equal(find('cabbage').amount, '1 medium');
  assert.equal(find('eggs').amount, '6');
  assert.equal(find('onions').amount, '5');
});

test('mushrooms and Sunday tofu wait for the top-up', () => {
  const ids = list.topUp.map((i) => i.id);
  assert.ok(ids.includes('shiitake'));
  assert.ok(ids.includes('chestnut-mushrooms'));
  assert.ok(ids.includes('tofu'));
  assert.equal(list.topUp.find((i) => i.id === 'shiitake').amount, '160 g');
});

test('staples are one line', () => {
  assert.match(list.staples, /^Rice, soy, mirin, sake, miso, dashi/);
});

test('progress counts ticked items', () => {
  const p = progress(list, { 'main:mackerel': true });
  assert.equal(p.done, 1);
  assert.ok(p.total > 20);
});

test('a bigger household buys more', () => {
  const big = groceryList(derive(EXAMPLE_WEEK, recipes, { scale: 2 }), recipes);
  assert.equal(big.main.flatMap((g) => g.items).find((i) => i.id === 'pork-belly').amount, '1.8 kg');
});
