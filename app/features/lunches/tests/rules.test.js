import { test, assert } from 'folio/testing';
import * as recipes from '../../recipes/rules.js';
import { derive } from '../../week/derive.js';
import { EXAMPLE_WEEK } from '../../week/example.js';
import { lunchPlan } from '../rules.js';

const plan = lunchPlan(derive(EXAMPLE_WEEK, recipes, {}));

test('each dinner becomes the next day\'s lunch, as in the example', () => {
  assert.equal(plan.length, 7);
  assert.equal(plan[0].day, 1);
  assert.equal(plan[0].what, 'Mackerel misoni + kabocha nimono + rice');
  assert.equal(plan[1].what, 'Pear & gorgonzola rigatoni');
  assert.equal(plan[2].what, 'Cod saikyo-yaki + green bean goma-ae + rice');
  assert.equal(plan[3].what, 'Hambagu + potato salad + rice');
  assert.equal(plan[3].tip, 'Reheat the hambagu until piping hot; potato salad in a separate pot');
  assert.equal(plan[4].what, 'Hoikoro over rice + cucumber asazuke');
  assert.equal(plan[5].what, 'Takikomi gohan onigiri + chawanmushi');
  assert.equal(plan[6].what, 'Nikujaga + namasu + rice');
  assert.equal(plan[6].day, 7);
});
