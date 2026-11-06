// The lunch plan: each dinner is packed for the next day's lunch. No screen code.
// lunchPlan(derived) → [{ day (the lunch's day, 1-7), from (the dinner's day), what, tip }]

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function lunchPlan(derived) {
  return derived.nights.map((n) => {
    const main = n.main;
    if (!main) return null;
    const packMain = main.lunch?.pack || main.short;
    const parts = [packMain];
    if (n.side && n.side.lunch !== false) parts.push(n.side.lunch?.pack || n.side.short.toLowerCase());
    const hasRice = n.rice > 0 && !main.lunch?.noRice && !/rice/i.test(packMain);
    if (hasRice) parts.push('rice');
    const tips = [main.lunch?.tip, n.side?.lunch?.tip].filter(Boolean);
    let what = parts.join(' + ');
    if (/over rice/i.test(packMain) && parts.length === 2) what = `${packMain} + ${parts[1]}`;
    return { day: n.day + 1, from: n.day, what: cap(what), tip: tips.join('; ') };
  }).filter(Boolean);
}
