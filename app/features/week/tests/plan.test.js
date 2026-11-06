import { test, assert } from 'folio/testing';
import * as recipes from '../../recipes/rules.js';
import { weights } from '../../tastes/rules.js';
import { derive } from '../derive.js';
import { generate, schedule, alternatives, possibleDays } from '../plan.js';
import { EXAMPLE_WEEK } from '../example.js';
import { lastWeekday, dayIndex, range, addDays } from '../dates.js';

const allIds = (nights) => nights.flatMap((n) => [n.main, n.side, n.soup]);

test('the example week works by the rules', () => {
  const d = derive(EXAMPLE_WEEK, recipes, {});
  assert.ok(d.feasible, JSON.stringify(d.nights.map((n) => n.problems)));
  assert.deepEqual(d.sessions, [0, 2]);
});

test('meat that won\'t keep is frozen, mushrooms wait for the top-up', () => {
  const d = derive(EXAMPLE_WEEK, recipes, {});
  const src = (id, night) => d.uses.find((u) => u.id === id && u.night === night).source;
  assert.equal(src('pork-belly', 4), 'frozen');
  assert.equal(src('chicken-thigh', 5), 'frozen');
  assert.equal(src('mackerel', 0), 'main');
  assert.equal(src('cod', 2), 'main');
  assert.equal(src('shiitake', 5), 'topup');
});

test('mackerel can\'t wait until Friday', () => {
  const nights = [];
  nights[4] = EXAMPLE_WEEK[0];
  assert.equal(derive(nights, recipes, {}).feasible, false);
  assert.ok(!possibleDays(EXAMPLE_WEEK[0], recipes, { topUp: 2 }).includes(4));
});

test('generated weeks have no repeats and every perishable keeps until it is used', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const week = generate({ recipes, seed });
    assert.ok(week, `seed ${seed} made a week`);
    assert.equal(week.length, 7);
    const mains = week.map((n) => n.main);
    assert.equal(new Set(mains).size, 7, `repeat in ${mains}`);
    const d = derive(week, recipes, {});
    assert.ok(d.feasible, `seed ${seed}: ${JSON.stringify(d.nights.map((n) => n.problems))}`);
    for (const u of d.uses) {
      const item = recipes.ingredient(u.id);
      if (u.source === 'main') assert.ok(item.section === 'pantry' || u.need < item.life, `${u.id} on day ${u.need}`);
      if (u.source === 'topup') assert.ok(u.need - 2 < item.life, `${u.id} on day ${u.need}`);
    }
  }
});

test('the planner aims for the number of Western nights asked for', () => {
  for (const westernNights of [0, 2]) {
    const week = generate({ recipes, seed: 5, household: { westernNights } });
    assert.equal(week.filter((n) => recipes.dish(n.main).style === 'western').length, westernNights);
  }
});

test('a vegetarian household gets a full vegetarian week', () => {
  const week = generate({ recipes, seed: 3, household: { diet: 'vegetarian' } });
  assert.ok(week);
  for (const id of allIds(week)) assert.ok(recipes.allows(recipes.dish(id), { diet: 'vegetarian' }), id);
});

test('locked nights stay where they are', () => {
  const locked = [];
  locked[3] = EXAMPLE_WEEK[3];
  const week = generate({ recipes, seed: 9, locked });
  assert.deepEqual(week[3], EXAMPLE_WEEK[3]);
  assert.equal(new Set(week.map((n) => n.main)).size, 7);
});

test('last week\'s dinners aren\'t repeated', () => {
  const lastWeek = EXAMPLE_WEEK.map((n) => n.main);
  const week = generate({ recipes, seed: 2, lastWeek });
  for (const n of week) assert.ok(!lastWeek.includes(n.main), n.main);
});

test('the schedule keeps the example\'s fish early', () => {
  const week = schedule(EXAMPLE_WEEK, recipes, { topUp: 2 });
  assert.ok(week);
  const day = (id) => week.findIndex((n) => n.main === id);
  assert.ok(day('saba-misoni') === 0 || day('saba-misoni') === 2, 'mackerel bought fresh on a shopping day');
});

test('someone who skips every fish dish stops seeing fish within 2 weeks', () => {
  const ratings = {};
  let at = 0;
  let lastWeek = [];
  let week;
  for (let w = 0; w < 3; w++) {
    const tastes = { weight: (id) => weights(ratings)[id] || 0 };
    week = generate({ recipes, seed: `fish${w}`, tastes, lastWeek });
    week.forEach((n, i) => {
      const fish = recipes.dish(n.main).protein === 'fish';
      ratings[`${w}:${i}`] = { ...n, rating: fish ? 'skipped' : 'liked', reason: fish ? 'didnt-like' : null, at: at++ };
    });
    lastWeek = week.map((n) => n.main);
  }
  assert.equal(week.filter((n) => recipes.dish(n.main).protein === 'fish').length, 0);
});

test('alternatives only offer dishes that fit the day', () => {
  const alts = alternatives(EXAMPLE_WEEK, 4, 'main', { recipes });
  assert.ok(alts.length > 3);
  assert.ok(!alts.some((a) => EXAMPLE_WEEK.some((n) => n.main === a.dish.id)));
  const salmon = alts.find((a) => a.dish.id === 'salmon-teriyaki');
  assert.equal(salmon.fits, false); // fresh salmon won't keep until Friday
});

test('dates', () => {
  assert.equal(lastWeekday(1, new Date(2026, 10, 5)), '2026-11-02');
  assert.equal(lastWeekday(1, new Date(2026, 10, 2)), '2026-11-02');
  assert.equal(dayIndex('2026-11-02', new Date(2026, 10, 4)), 2);
  assert.equal(range('2026-11-02'), 'Monday 2 November - Sunday 8 November 2026');
  assert.equal(addDays('2026-11-02', 7), '2026-11-09');
});
