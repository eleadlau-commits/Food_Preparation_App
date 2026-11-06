// Sample data for the automatic tests (`python build.py test`). Only used in test builds: it
// runs before the features start. The household is set up (so the welcome window doesn't open)
// and the example week starts yesterday, so Today, reminders and feedback all have something.

export default function seed(app) {
  const area = (name) => app.storage.area(name);
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const pad = (n) => String(n).padStart(2, '0');
  const start = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  area('household').set('settings', { people: 2, shopDay: d.getDay(), topUpGap: 2, diet: 'none', allergies: [], dislikes: [], maxMins: 0, westernNights: 2, setUp: true });
  area('week').set('plan', {
    start,
    nights: [
      { main: 'saba-misoni', side: 'kabocha-nimono', soup: 'clear-soup-tofu' },
      { main: 'pear-gorgonzola-rigatoni', side: 'rocket-pear-salad', soup: 'cabbage-bacon-consomme' },
      { main: 'cod-saikyo-yaki', side: 'goma-ae', soup: 'kenchinjiru' },
      { main: 'hambagu', side: 'potato-salad', soup: 'corn-potage' },
      { main: 'hoikoro', side: 'cucumber-asazuke', soup: 'miso-soup-daikon' },
      { main: 'takikomi-gohan', side: 'chawanmushi', soup: 'clear-soup-wakame' },
      { main: 'nikujaga', side: 'namasu', soup: 'miso-soup-tofu' },
    ],
    locked: [false, false, false, true, false, false, false],
    seed: 0,
    from: 'example',
  });
  area('shopping').set('ticked', { [start]: { 'main:mackerel': true, 'main:cod': true } });
  area('tastes').set('ratings', { [`${start}:0`]: { main: 'saba-misoni', side: 'kabocha-nimono', soup: 'clear-soup-tofu', rating: 'liked', reason: null, at: 1 } });
}
