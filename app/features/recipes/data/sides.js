// Sides. `goesWith` says which mains a side suits (japanese, western); default: its own style.

export const SIDES = [
  {
    id: 'kabocha-nimono', course: 'side', style: 'japanese', mins: 20,
    name: 'Kabocha nimono (simmered squash)', short: 'Kabocha nimono',
    uses: [['kabocha', 800], ['dashi', 300], ['sugar', 2], ['mirin', 2], ['soy', 2]],
    prep: [{
      title: 'Kabocha nimono', mins: 20, keeps: 1, holds: ['kabocha'],
      text: 'Cut the kabocha into 4 cm chunks, skin on, bevel the edges. Simmer skin-down in 300 ml dashi + 2 tbsp sugar + 2 tbsp mirin + 2 tbsp soy under a foil drop-lid for 12-15 min until a skewer goes in easily. Let it cool in the liquid. Half for dinner, half for the next day\'s lunch.',
    }],
    lunch: { pack: 'kabocha nimono' },
  },
  {
    id: 'rocket-pear-salad', course: 'side', style: 'western', goesWith: ['western'], mins: 5,
    name: 'Rocket & pear salad, soy-sesame dressing', short: 'Rocket & pear salad',
    uses: [['rocket', 100], ['pears', 1], ['soy', 2], ['rice-vinegar', 2], ['sesame-oil', 1], ['honey', 1], ['sesame', 0.3]],
    prep: [{
      title: 'Soy-sesame dressing', mins: 3, keeps: 6, prefer: 'early',
      text: 'For the {day} salad: 2 tbsp soy, 2 tbsp rice vinegar, 1 tbsp sesame oil, 1 tsp honey, 1 tsp toasted sesame. Jar it.',
    }],
    method: 'Salad: rocket, the 4th pear, soy-sesame dressing.',
    lunch: false,
  },
  {
    id: 'goma-ae', course: 'side', style: 'japanese', mins: 10,
    name: 'Green bean goma-ae', short: 'Green bean goma-ae',
    uses: [['green-beans', 300], ['sesame', 4], ['soy', 1.5], ['sugar', 1.5]],
    prep: [{
      title: 'Goma-ae dressing', mins: 5, keeps: 6, prefer: 'early',
      text: 'For {day}: 4 tbsp ground toasted sesame, 1.5 tbsp soy, 1.5 tbsp sugar. Jar it.',
    }],
    method: 'Goma-ae: boil green beans 3 min, cool, cut, toss with dressing.',
    lunch: { pack: 'green bean goma-ae' },
  },
  {
    id: 'potato-salad', course: 'side', style: 'japanese', goesWith: ['japanese', 'western'], mins: 30,
    name: 'Japanese potato salad', short: 'Japanese potato salad',
    uses: [['potatoes', 600], ['carrots', 1], ['eggs', 2], ['rice-vinegar', 1], ['cucumbers', 1], ['kewpie', 5]],
    prep: [{
      title: 'Japanese potato salad', mins: 30, keeps: 3, holds: ['potatoes', 'carrots', 'eggs', 'cucumbers'],
      text: 'For {day}, keeps 3 days. Boil 600 g peeled potato chunks with 1 diced carrot until soft (~15 min); hard-boil 2 eggs alongside. Drain, steam dry, roughly mash and season with 1 tbsp rice vinegar + salt while warm. Cool. Add 1 thinly sliced cucumber (salted 5 min and squeezed), the chopped eggs and 5 tbsp Kewpie mayo; black pepper.',
    }],
    lunch: { pack: 'potato salad', tip: 'potato salad in a separate pot' },
  },
  {
    id: 'cucumber-asazuke', course: 'side', style: 'japanese', mins: 5,
    name: 'Cucumber asazuke (quick pickle)', short: 'Cucumber asazuke',
    uses: [['cucumbers', 2], ['ginger', 10], ['rice-vinegar', 1]],
    prep: [{
      title: 'Cucumber asazuke', mins: 5, keeps: 3, holds: ['cucumbers'],
      text: 'For {day}. Cut 2 cucumbers into chunky batons. Rub with 1.5 tsp salt, add ginger matchsticks and 1 tbsp rice vinegar, bag, press out the air and refrigerate.',
    }],
    lunch: { pack: 'cucumber asazuke' },
  },
  {
    id: 'chawanmushi', course: 'side', style: 'japanese', mins: 25,
    name: 'Chawanmushi (savoury egg custard)', short: 'Chawanmushi',
    uses: [['eggs', 3], ['dashi', 450], ['soy', 0.3], ['mirin', 0.3], ['chicken-thigh', 100], ['shiitake', 30]],
    method: 'Chawanmushi: whisk 3 eggs into 450 ml cool dashi + 1 tsp soy + 1 tsp mirin + pinch salt, strain into 4 mugs over 100 g chicken and 2 sliced shiitake, cover with foil, steam on very low 12-15 min until just set.',
    lunch: { pack: 'chawanmushi', tip: 'chawanmushi is nice cold' },
  },
  {
    id: 'namasu', course: 'side', style: 'japanese', mins: 15,
    name: 'Daikon & carrot namasu', short: 'Daikon & carrot namasu',
    uses: [['daikon', 0.33], ['carrots', 2], ['rice-vinegar', 4], ['sugar', 2]],
    prep: [{
      title: 'Daikon & carrot namasu', mins: 15, keeps: 7, holds: ['daikon', 'carrots'],
      text: 'For {day}, keeps a week. Julienne 1/3 daikon and 2 carrots, toss with 1 tsp salt, wait 10 min, squeeze hard. Dress with 4 tbsp rice vinegar + 2 tbsp sugar + pinch of salt.',
    }],
    lunch: { pack: 'namasu' },
  },

  // Beyond the example week
  {
    id: 'spinach-ohitashi', course: 'side', style: 'japanese', mins: 10,
    name: 'Spinach ohitashi', short: 'Spinach ohitashi',
    uses: [['spinach', 300], ['dashi', 60], ['soy', 1], ['mirin', 1], ['sesame', 1]],
    method: 'Ohitashi: blanch 300 g spinach 30 s, cool in cold water, squeeze, cut into 4 cm lengths. Pour over 60 ml dashi with 1 tbsp soy and 1 tbsp mirin; sesame on top.',
    lunch: { pack: 'spinach ohitashi' },
  },
  {
    id: 'sunomono', course: 'side', style: 'japanese', mins: 10,
    name: 'Cucumber & wakame sunomono', short: 'Sunomono',
    uses: [['cucumbers', 2], ['wakame', 1], ['rice-vinegar', 3], ['sugar', 1], ['sesame', 0.5]],
    prep: [{
      title: 'Cucumber & wakame sunomono', mins: 10, keeps: 2, holds: ['cucumbers'],
      text: 'For {day}. Slice 2 cucumbers thinly, salt 5 min and squeeze. Soak 1 tbsp wakame 5 min and drain. Dress with 3 tbsp rice vinegar + 1 tbsp sugar + pinch of salt; sesame on top.',
    }],
    lunch: { pack: 'sunomono' },
  },
  {
    id: 'kinpira-carrot', course: 'side', style: 'japanese', mins: 15,
    name: 'Kinpira carrot (sweet-soy stir-fry)', short: 'Kinpira carrot',
    uses: [['carrots', 3], ['sesame-oil', 1], ['soy', 1.5], ['mirin', 1.5], ['sugar', 0.5], ['sesame', 1]],
    prep: [{
      title: 'Kinpira carrot', mins: 15, keeps: 4, holds: ['carrots'],
      text: 'For {day}, keeps 4 days. Julienne 3 carrots, stir-fry in 1 tbsp sesame oil 3 min, add 1.5 tbsp soy, 1.5 tbsp mirin and 1/2 tbsp sugar and cook until dry. Sesame on top.',
    }],
    lunch: { pack: 'kinpira carrot' },
  },
  {
    id: 'hiyayakko', course: 'side', style: 'japanese', mins: 5,
    name: 'Hiyayakko (chilled tofu, ginger & spring onion)', short: 'Hiyayakko',
    uses: [['silken-tofu', 1], ['ginger', 10], ['spring-onions', 0.25], ['soy', 1]],
    method: 'Hiyayakko: cut a block of chilled silken tofu into 4, top with grated ginger, spring onion and a little soy.',
    lunch: false,
  },
  {
    id: 'sesame-broccoli', course: 'side', style: 'japanese', goesWith: ['japanese', 'western'], mins: 10,
    name: 'Broccoli with sesame & soy', short: 'Sesame broccoli',
    uses: [['broccoli', 1], ['sesame', 2], ['soy', 1], ['sesame-oil', 0.5]],
    method: 'Broccoli: boil the florets 2 min, drain, toss with 2 tbsp ground sesame, 1 tbsp soy and a few drops of sesame oil.',
    lunch: { pack: 'sesame broccoli' },
  },
  {
    id: 'green-salad', course: 'side', style: 'western', mins: 5,
    name: 'Little gem & cherry tomato salad, mustard dressing', short: 'Green salad',
    uses: [['lettuce', 2], ['cherry-tomatoes', 200], ['olive-oil', 3], ['mustard', 1], ['lemon', 0.5]],
    method: 'Salad: little gem leaves and halved cherry tomatoes, dressed with 3 tbsp olive oil, 1 tsp mustard, a squeeze of lemon and salt.',
    lunch: false,
  },
  {
    id: 'garlic-greens', course: 'side', style: 'western', mins: 8,
    name: 'Garlic green beans', short: 'Garlic green beans',
    uses: [['green-beans', 300], ['garlic', 2], ['butter', 15]],
    method: 'Green beans: boil 3 min, drain, toss in a pan with 15 g butter and 2 sliced garlic cloves for 1 min.',
    lunch: { pack: 'garlic green beans' },
  },
];
