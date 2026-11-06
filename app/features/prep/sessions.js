// The prep sessions: what to do on shop day and on the top-up day, how long it takes, and the
// reminders until the next session. No screen code.

// sessions(derived) → [{ day, tasks, mins, covers: [first, last], reminders }]
export function sessions(derived) {
  return derived.sessions.map((day, i) => {
    const next = derived.sessions[i + 1];
    const tasks = derived.tasks.filter((t) => t.session === day);
    const mins = roundTo5(tasks.reduce((n, t) => n + (t.mins || 10), 0));
    const reminders = derived.reminders.filter((r) => (next == null ? r.day >= day : (r.day >= day && r.day < next) || (r.day === next && r.when === 'morning')));
    const nights = tasks.filter((t) => t.night != null).map((t) => t.night);
    const covers = [day, next == null ? 6 : Math.max(next - 1, ...nights)];
    return { day, tasks, mins, covers, reminders, last: next == null };
  }).filter((s) => s.tasks.length || s.reminders.length);
}

const roundTo5 = (n) => Math.max(5, Math.round(n / 5) * 5);

// Today's reminders, morning first.
export const remindersOn = (derived, day) => derived.reminders.filter((r) => r.day === day);
