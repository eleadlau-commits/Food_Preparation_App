// Soups. They're for dinner only (not packed for lunch).

export const SOUPS = [
  {
    id: 'clear-soup-tofu', course: 'soup', style: 'japanese', mins: 10,
    name: 'Clear soup - tofu & wakame', short: 'Clear soup',
    uses: [['dashi', 800], ['tofu', 0.5], ['wakame', 1], ['soy', 0.3]],
    method: 'Clear soup: 800 ml dashi, tofu, wakame, 1 tsp soy, pinch salt.',
  },
  {
    id: 'cabbage-bacon-consomme', course: 'soup', style: 'western', mins: 15,
    name: 'Cabbage & bacon consommé', short: 'Consommé',
    uses: [['bacon', 4], ['onions', 1], ['cabbage', 0.25], ['stock-cubes', 2]],
    method: 'Consommé: fry 4 chopped bacon rashers, add 1 sliced onion and 1/4 shredded cabbage, 1 L water + 2 stock cubes, simmer 10 min, pepper.',
  },
  {
    id: 'kenchinjiru', course: 'soup', style: 'japanese', mins: 20,
    name: 'Kenchinjiru (tofu & root veg clear soup)', short: 'Kenchinjiru',
    uses: [['daikon', 0.33], ['carrots', 1], ['shiitake', 45], ['tofu', 0.5], ['dashi', 1000], ['soy', 2], ['sesame-oil', 1]],
    method: 'Kenchinjiru: fry 1/3 daikon, 1 carrot and 3 shiitake in sesame oil, crumble in the tofu, add 1 L dashi, simmer 10 min, 2 tbsp soy, salt.',
  },
  {
    id: 'corn-potage', course: 'soup', style: 'western', mins: 15,
    name: 'Corn potage', short: 'Corn potage',
    uses: [['onions', 1], ['butter', 15], ['creamed-corn', 1], ['stock-cubes', 1], ['milk', 400]],
    method: 'Corn potage: soften 1 onion in butter, add creamed corn + 300 ml water + 1 stock cube, simmer 5 min, add 400 ml milk, heat without boiling; blend if you like.',
  },
  {
    id: 'miso-soup-daikon', course: 'soup', style: 'japanese', mins: 10,
    name: 'Miso soup - daikon & wakame', short: 'Miso soup',
    uses: [['daikon', 0.33], ['dashi', 800], ['wakame', 1], ['miso', 3]],
    prep: [{
      title: 'Cut daikon for miso soup', mins: 5, keeps: 3, holds: ['daikon'],
      text: 'Cut the last 1/3 daikon into thin half-moons for {day}\'s soup and store in a water-covered box.',
    }],
    method: 'Miso soup: daikon simmered in 800 ml dashi 6 min, wakame, 3 tbsp miso.',
  },
  {
    id: 'clear-soup-wakame', course: 'soup', style: 'japanese', mins: 5,
    name: 'Clear soup - wakame & spring onion', short: 'Clear soup',
    uses: [['dashi', 800], ['soy', 0.3], ['wakame', 1], ['spring-onions', 0.25]],
    method: 'Clear soup: dashi, soy, salt, wakame, spring onion.',
  },
  {
    id: 'miso-soup-tofu', course: 'soup', style: 'japanese', mins: 10,
    name: 'Miso soup - tofu & wakame', short: 'Miso soup',
    uses: [['dashi', 800], ['tofu', 1], ['wakame', 1], ['miso', 3]],
    method: 'Miso soup: dashi, tofu, wakame, 3 tbsp miso.',
  },

  // Beyond the example week
  {
    id: 'kakitamajiru', course: 'soup', style: 'japanese', mins: 10,
    name: 'Kakitamajiru (egg-drop clear soup)', short: 'Egg-drop soup',
    uses: [['dashi', 800], ['soy', 1], ['eggs', 2], ['spring-onions', 0.25]],
    method: 'Egg-drop soup: bring 800 ml dashi + 1 tbsp soy + pinch salt to a simmer, thicken lightly with 1 tsp cornflour in water, drizzle in 2 beaten eggs while stirring slowly; spring onion.',
  },
  {
    id: 'tonjiru', course: 'soup', style: 'japanese', mins: 20,
    name: 'Tonjiru (pork & vegetable miso soup)', short: 'Tonjiru',
    uses: [['pork-belly', 150], ['daikon', 0.25], ['carrots', 1], ['onions', 1], ['dashi', 1000], ['miso', 4]],
    method: 'Tonjiru: fry 150 g pork, add daikon, carrot and onion, 1 L dashi, simmer 12 min, stir in 4 tbsp miso.',
  },
  {
    id: 'mushroom-miso-soup', course: 'soup', style: 'japanese', mins: 10,
    name: 'Mushroom miso soup (kombu dashi)', short: 'Mushroom miso soup',
    uses: [['kombu-dashi', 800], ['shiitake', 60], ['spring-onions', 0.25], ['miso', 3]],
    method: 'Mushroom miso soup: simmer sliced shiitake in 800 ml kombu dashi 4 min, stir in 3 tbsp miso; spring onion.',
  },
  {
    id: 'minestrone', course: 'soup', style: 'western', mins: 25,
    name: 'Quick minestrone', short: 'Minestrone',
    uses: [['onions', 1], ['carrots', 1], ['celery', 0.25], ['chopped-tomatoes', 1], ['stock-cubes', 1], ['olive-oil', 1]],
    method: 'Minestrone: soften diced onion, carrot and celery in olive oil, add the tomatoes, 800 ml water and a stock cube, simmer 15 min; a handful of small pasta for the last 8 min if you like.',
  },
  {
    id: 'leek-potato-soup', course: 'soup', style: 'western', mins: 25,
    name: 'Leek & potato soup', short: 'Leek & potato soup',
    uses: [['leeks', 2], ['potatoes', 400], ['butter', 20], ['stock-cubes', 1], ['milk', 200]],
    method: 'Leek & potato soup: soften 2 sliced leeks in butter, add 400 g diced potato, 800 ml stock, simmer 15 min, add 200 ml milk and blend.',
  },
  {
    id: 'kabocha-potage', course: 'soup', style: 'western', goesWith: ['western', 'japanese'], mins: 25,
    name: 'Kabocha potage', short: 'Kabocha potage',
    uses: [['kabocha', 400], ['onions', 1], ['butter', 15], ['stock-cubes', 1], ['milk', 300]],
    method: 'Kabocha potage: soften 1 onion in butter, add 400 g peeled kabocha, 400 ml water and a stock cube, simmer 15 min, add 300 ml milk and blend.',
  },
];

// Things made in a prep session and used through the week, rather than bought.
export const MADE = {
  dashi: {
    title: 'dashi',
    text: 'Dissolve dashi granules in {amount} hot water per the packet (or kombu + bonito). Cool and refrigerate in a jug.',
  },
  'kombu-dashi': {
    title: 'kombu dashi',
    text: 'Soak a 10 cm piece of kombu in {amount} cold water for 30 min, then warm until just simmering and lift the kombu out. Cool and refrigerate.',
  },
};
