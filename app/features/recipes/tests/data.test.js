import { test, assert } from 'folio/testing';
import { DISHES, INGREDIENTS, dish, dishesOf, allows, buyAmount, useAmount, metric } from '../rules.js';

test('every dish uses known ingredients', () => {
  for (const d of DISHES) for (const [id] of d.uses) assert.ok(INGREDIENTS[id], `${d.id} uses unknown ${id}`);
});

test('dish ids are unique and every dish has the basics', () => {
  const ids = new Set();
  for (const d of DISHES) {
    assert.ok(!ids.has(d.id), `duplicate ${d.id}`);
    ids.add(d.id);
    assert.ok(['main', 'side', 'soup'].includes(d.course), d.id);
    assert.ok(['japanese', 'western'].includes(d.style), d.id);
    assert.ok(d.name && d.short && d.mins > 0, d.id);
    if (d.course === 'main') assert.ok(d.lunch && d.lunch.tip && d.method, `${d.id} needs a method and lunch tip`);
    for (const p of d.prep || []) assert.ok(p.title && p.text && p.keeps >= 0, `${d.id} prep`);
    for (const h of (d.prep || []).flatMap((p) => p.holds || [])) assert.ok(d.uses.some(([id]) => id === h), `${d.id} holds ${h} but doesn't use it`);
  }
});

test('there are enough dishes to plan a varied week', () => {
  assert.ok(dishesOf('main').length >= 14);
  assert.ok(dishesOf('side').length >= 10);
  assert.ok(dishesOf('soup').length >= 10);
});

test('diets and allergies rule dishes out', () => {
  assert.equal(allows(dish('hoikoro'), { diet: 'vegetarian' }), false);
  assert.equal(allows(dish('pear-gorgonzola-rigatoni'), { diet: 'vegetarian' }), true);
  assert.equal(allows(dish('pear-gorgonzola-rigatoni'), { allergies: ['nuts'] }), false);
  assert.equal(allows(dish('hoikoro'), { diet: 'no-pork' }), false);
  assert.equal(allows(dish('saba-misoni'), { dislikes: ['mackerel'] }), false);
  assert.equal(allows(dish('takikomi-gohan'), { maxMins: 30 }), false);
});

test('amounts read like the example list', () => {
  assert.equal(buyAmount('mackerel', 4), '4 (~500 g)');
  assert.equal(buyAmount('carrots', 7), '1 kg bag (~8)');
  assert.equal(buyAmount('potatoes', 1200), '1.2 kg');
  assert.equal(buyAmount('cabbage', 1), '1 medium');
  assert.equal(buyAmount('spring-onions', 1.5), '2 bunches');
  assert.equal(buyAmount('tofu', 1), '1 block (~300 g)');
  assert.equal(buyAmount('pears', 4), '4');
  assert.equal(useAmount('pork-belly', 500), '500 g');
  assert.equal(useAmount('cabbage', 0.25), '1/4');
  assert.equal(metric(2500, 'ml'), '2.5 L');
});
