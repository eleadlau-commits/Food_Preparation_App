// The ingredient catalogue: everything a dish can use, with how it's bought and how long it keeps.
//
// Each ingredient: {
//   name,            what the grocery list calls it
//   section,         the part of the shop: fish, meat (meat, eggs and dairy), veg (vegetables and fresh),
//                    pantry (cupboard things worth checking), staple (always in the cupboard: one "top up" line)
//   unit,            the unit dishes use for it: 'g', 'ml', 'pc' (pieces, or a fraction of one)
//   life,            days it keeps in the fridge after buying (day 0 = the day it's bought)
//   freeze?,         true if it can be frozen on shop day and thawed later
//   lateBuy?,        true for delicate things (mushrooms) that go on the mid-week top-up whenever they can
//   approx?,         grams per piece, shown as "4 (~500 g)"
//   pack?,           { size, label } it's sold in packs of `size` units: "1 kg bag (~8)"
//   tags?,           what it is, for diets and allergies: meat, pork, fish, dairy, egg, gluten, nuts, alcohol
//   share?,          true for a staple that's still worth showing in "How the ingredients are shared" (miso)
//   plural?,         the name for "4 pears" when it's counted, if different
// }

export const SECTIONS = [
  { id: 'fish', label: 'Fishmonger' },
  { id: 'meat', label: 'Meat, eggs & dairy' },
  { id: 'veg', label: 'Vegetables & fresh' },
  { id: 'pantry', label: 'Pantry (check before buying)' },
];

export const INGREDIENTS = {
  // Fishmonger
  mackerel: { name: 'Mackerel fillets', section: 'fish', unit: 'pc', life: 1, approx: 125, tags: ['fish'] },
  cod: { name: 'Cod (or hake) fillets, skin-on', section: 'fish', unit: 'pc', life: 1, approx: 150, tags: ['fish'] },
  salmon: { name: 'Salmon fillets', section: 'fish', unit: 'pc', life: 1, approx: 130, tags: ['fish'] },

  // Meat, eggs & dairy
  'pork-belly': { name: 'Thin-sliced pork belly', section: 'meat', unit: 'g', life: 2, freeze: true, tags: ['meat', 'pork'] },
  'pork-loin': { name: 'Thin-sliced pork loin', section: 'meat', unit: 'g', life: 2, freeze: true, tags: ['meat', 'pork'] },
  'mixed-mince': { name: 'Beef & pork mince (or 300 g each)', section: 'meat', unit: 'g', life: 1, freeze: true, tags: ['meat', 'pork'] },
  'beef-mince': { name: 'Beef mince', section: 'meat', unit: 'g', life: 1, freeze: true, tags: ['meat'] },
  'pork-mince': { name: 'Pork mince', section: 'meat', unit: 'g', life: 1, freeze: true, tags: ['meat', 'pork'] },
  'beef-thin': { name: 'Thin-sliced beef', section: 'meat', unit: 'g', life: 2, freeze: true, tags: ['meat'] },
  'chicken-thigh': { name: 'Boneless chicken thighs', section: 'meat', unit: 'g', life: 2, freeze: true, tags: ['meat'] },
  bacon: { name: 'Smoked bacon rashers', section: 'meat', unit: 'pc', life: 7, freeze: true, tags: ['meat', 'pork'] },
  eggs: { name: 'Eggs', section: 'meat', unit: 'pc', life: 21, pack: { size: 6, label: '6' }, tags: ['egg'] },
  gorgonzola: { name: 'Gorgonzola dolce', section: 'meat', unit: 'g', life: 10, tags: ['dairy'] },
  parmesan: { name: 'Parmesan', section: 'meat', unit: 'g', life: 28, tags: ['dairy'] },
  cream: { name: 'Double cream', section: 'meat', unit: 'ml', life: 5, pack: { size: 150, label: '150 ml' }, tags: ['dairy'] },
  milk: { name: 'Whole milk', section: 'meat', unit: 'ml', life: 7, pack: { size: 568, label: '1 pint' }, tags: ['dairy'] },

  // Vegetables & fresh
  kabocha: { name: 'Kabocha (or butternut squash)', section: 'veg', unit: 'g', life: 14, pack: { size: 800, label: '1 small (~800 g)' } },
  pears: { name: 'Pears (Conference, just ripe)', section: 'veg', unit: 'pc', life: 5 },
  rocket: { name: 'Rocket', section: 'veg', unit: 'g', life: 3, pack: { size: 100, label: '1 bag (~100 g)' } },
  cabbage: { name: 'White / sweetheart cabbage', section: 'veg', unit: 'pc', life: 10, pack: { size: 1, label: '1 medium' } },
  potatoes: { name: 'Potatoes (floury, e.g. Maris Piper)', section: 'veg', unit: 'g', life: 21 },
  carrots: { name: 'Carrots', section: 'veg', unit: 'pc', life: 14, pack: { size: 8, label: '1 kg bag (~8)' } },
  daikon: { name: 'Daikon (mooli)', section: 'veg', unit: 'pc', life: 10, pack: { size: 1, label: '1 (~1 kg)' } },
  onions: { name: 'Onions', section: 'veg', unit: 'pc', life: 30 },
  'green-beans': { name: 'Green beans', section: 'veg', unit: 'g', life: 4 },
  cucumbers: { name: 'Cucumbers', section: 'veg', unit: 'pc', life: 5 },
  'green-peppers': { name: 'Green peppers', section: 'veg', unit: 'pc', life: 7 },
  'spring-onions': { name: 'Spring onions', section: 'veg', unit: 'pc', life: 6, pack: { size: 1, label: 'bunch' }, plural: 'bunches' },
  ginger: { name: 'Fresh ginger', section: 'veg', unit: 'g', life: 21 },
  garlic: { name: 'Garlic', section: 'veg', unit: 'pc', life: 30, pack: { size: 10, label: '1 bulb' } },
  tofu: { name: 'Firm tofu', section: 'veg', unit: 'pc', life: 5, approx: 300, plural: 'blocks' },
  'silken-tofu': { name: 'Silken tofu', section: 'veg', unit: 'pc', life: 5, approx: 300, plural: 'blocks' },
  shiitake: { name: 'Fresh shiitake', section: 'veg', unit: 'g', life: 4, lateBuy: true },
  'chestnut-mushrooms': { name: 'Chestnut mushrooms', section: 'veg', unit: 'g', life: 3, lateBuy: true },
  spinach: { name: 'Spinach', section: 'veg', unit: 'g', life: 3, lateBuy: true },
  broccoli: { name: 'Broccoli', section: 'veg', unit: 'pc', life: 5, plural: 'heads' },
  leeks: { name: 'Leeks', section: 'veg', unit: 'pc', life: 10 },
  'cherry-tomatoes': { name: 'Cherry tomatoes', section: 'veg', unit: 'g', life: 7 },
  lettuce: { name: 'Little gem lettuce', section: 'veg', unit: 'pc', life: 5, plural: 'heads' },
  lemon: { name: 'Lemon', section: 'veg', unit: 'pc', life: 14, plural: 'lemons' },
  celery: { name: 'Celery', section: 'veg', unit: 'pc', life: 14, pack: { size: 1, label: '1 head' } },
  'sweet-potato': { name: 'Sweet potatoes', section: 'veg', unit: 'g', life: 21 },

  // Pantry: worth checking before buying
  rigatoni: { name: 'Rigatoni (or penne)', section: 'pantry', unit: 'g', life: 365, tags: ['gluten'] },
  spaghetti: { name: 'Spaghetti', section: 'pantry', unit: 'g', life: 365, tags: ['gluten'] },
  arborio: { name: 'Risotto rice', section: 'pantry', unit: 'g', life: 365 },
  walnuts: { name: 'Walnuts', section: 'pantry', unit: 'g', life: 90, tags: ['nuts'] },
  'creamed-corn': { name: 'Creamed sweetcorn', section: 'pantry', unit: 'pc', life: 365, pack: { size: 1, label: '1 tin (418 g)' } },
  'chopped-tomatoes': { name: 'Chopped tomatoes', section: 'pantry', unit: 'pc', life: 365, plural: 'tins' },
  'stock-cubes': { name: 'Stock cubes', section: 'pantry', unit: 'pc', life: 365 },
  panko: { name: 'Panko', section: 'pantry', unit: 'g', life: 180, tags: ['gluten'] },
  ketchup: { name: 'Ketchup', section: 'pantry', unit: 'tbsp', life: 180 },
  worcestershire: { name: 'Worcestershire sauce', section: 'pantry', unit: 'tbsp', life: 365, tags: ['fish'] },
  'brown-sauce': { name: 'Brown sauce (e.g. HP)', section: 'pantry', unit: 'tbsp', life: 365 },
  kewpie: { name: 'Kewpie mayo', section: 'pantry', unit: 'tbsp', life: 90, tags: ['egg'] },
  doubanjiang: { name: 'Doubanjiang (optional)', section: 'pantry', unit: 'tsp', life: 365 },
  'curry-roux': { name: 'Japanese curry roux', section: 'pantry', unit: 'pc', life: 365, pack: { size: 1, label: '1 box' }, tags: ['gluten'] },
  'chickpeas': { name: 'Chickpeas', section: 'pantry', unit: 'pc', life: 365, plural: 'tins' },
  noodles: { name: 'Yakisoba noodles', section: 'pantry', unit: 'pc', life: 30, plural: 'nests', tags: ['gluten'] },
  bread: { name: 'Crusty bread', section: 'pantry', unit: 'pc', life: 3, pack: { size: 1, label: '1 loaf' }, tags: ['gluten'] },
  'coconut-milk': { name: 'Coconut milk', section: 'pantry', unit: 'pc', life: 365, plural: 'tins' },

  // Staples: always in the cupboard, one "top up" line on the list
  rice: { name: 'Rice', section: 'staple', unit: 'g', life: 365 },
  soy: { name: 'soy', section: 'staple', unit: 'tbsp', life: 365, tags: ['gluten'] },
  mirin: { name: 'mirin', section: 'staple', unit: 'tbsp', life: 365, tags: ['alcohol'] },
  sake: { name: 'sake', section: 'staple', unit: 'tbsp', life: 365, tags: ['alcohol'] },
  miso: { name: 'miso', section: 'staple', unit: 'tbsp', life: 180, share: true },
  'dashi-granules': { name: 'dashi', section: 'staple', unit: 'tsp', life: 365, tags: ['fish'] },
  kombu: { name: 'kombu', section: 'staple', unit: 'pc', life: 365 },
  wakame: { name: 'wakame', section: 'staple', unit: 'tbsp', life: 365 },
  'rice-vinegar': { name: 'rice vinegar', section: 'staple', unit: 'tbsp', life: 365 },
  sesame: { name: 'sesame seeds', section: 'staple', unit: 'tbsp', life: 365 },
  'sesame-oil': { name: 'sesame oil', section: 'staple', unit: 'tbsp', life: 365 },
  butter: { name: 'butter', section: 'staple', unit: 'g', life: 30, tags: ['dairy'] },
  honey: { name: 'honey', section: 'staple', unit: 'tsp', life: 365 },
  sugar: { name: 'sugar', section: 'staple', unit: 'tbsp', life: 365 },
  oil: { name: 'oil', section: 'staple', unit: 'tbsp', life: 365 },
  flour: { name: 'flour', section: 'staple', unit: 'tbsp', life: 365, tags: ['gluten'] },
  'olive-oil': { name: 'olive oil', section: 'staple', unit: 'tbsp', life: 365 },
  mustard: { name: 'mustard', section: 'staple', unit: 'tsp', life: 365 },

  // Made in the prep sessions, not bought (see the dashi rules in the week feature)
  dashi: { name: 'Dashi', section: 'made', unit: 'ml', life: 4, tags: ['fish'], share: true },
  'kombu-dashi': { name: 'Kombu dashi', section: 'made', unit: 'ml', life: 4, share: true },
};
