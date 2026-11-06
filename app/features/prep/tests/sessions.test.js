import { test, assert } from 'folio/testing';
import * as recipes from '../../recipes/rules.js';
import { derive, words } from '../../week/derive.js';
import { EXAMPLE_WEEK } from '../../week/example.js';
import { sessions, remindersOn } from '../sessions.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const say = (t) => words(t, (d) => DAYS[d]);
const derived = derive(EXAMPLE_WEEK, recipes, {});
const [monday, wednesday] = sessions(derived);

test('two prep sessions, Monday and Wednesday', () => {
  assert.equal(monday.day, 0);
  assert.equal(wednesday.day, 2);
});

test('Monday makes dashi, marinates the cod, freezes the meat, makes the dressings', () => {
  const titles = monday.tasks.map((t) => say(t.title));
  assert.equal(titles[0], 'Make dashi batch 1 (2.5 L)');
  assert.ok(titles.includes('Marinate the cod (saikyo-zuke)'));
  assert.ok(titles.includes('Portion and freeze the meat'));
  assert.ok(titles.includes('Soy-sesame dressing'));
  assert.ok(titles.includes('Goma-ae dressing'));
  assert.ok(monday.mins >= 60 && monday.mins <= 100, `about 75 minutes, got ${monday.mins}`);
});

test('Wednesday shapes the hambagu and makes the sides for later', () => {
  const titles = wednesday.tasks.map((t) => say(t.title));
  assert.equal(titles[0], 'Make dashi batch 2 (3 L)');
  for (const t of ['Shape the hambagu', 'Japanese potato salad', 'Cucumber asazuke', 'Daikon & carrot namasu']) assert.ok(titles.includes(t), t);
});

test('thaw reminders go the morning before', () => {
  assert.ok(remindersOn(derived, 3).some((r) => say(r.text) === "Move Fri's pork belly to the fridge"));
  assert.ok(remindersOn(derived, 4).some((r) => say(r.text) === "Move Sat's chicken thighs to the fridge"));
  assert.ok(wednesday.reminders.some((r) => /soak 450 g rice/.test(r.text)));
});
