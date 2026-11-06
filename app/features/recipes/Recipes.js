// Recipes: the recipe database that comes with the app (mains, sides, soups and the ingredient
// catalogue, in data/), offered to other features as the 'recipes' service. It has no screen.
//
// Service 'recipes': { dish(id), ingredient(id), dishesOf(course), all, lines(dish), allows(dish, household),
//   goesWith(dish), tagsOf(dish), buyAmount(id, qty), useAmount(id, qty), metric(qty, unit), SECTIONS, MADE, DIETS, ALLERGIES }
//
// Saved data: none.

import { Feature } from 'folio';
import * as rules from './rules.js';

export default class Recipes extends Feature {
  start() {
    this.provide('recipes', { ...rules, all: rules.DISHES });
  }
}
