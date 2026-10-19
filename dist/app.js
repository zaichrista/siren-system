(() => {
'use strict';

/* ───────────── helpers ───────────── */
const KEY = 'siren-system-v2'; // unchanged so existing diaries keep working
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const clone = o => JSON.parse(JSON.stringify(o));
const pad = n => String(n).padStart(2, '0');
const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso();
const parseDate = s => new Date(`${s}T12:00:00`);
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 864e5);
const pretty = s => parseDate(s).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
const weekStart = (s = today()) => { const d = parseDate(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const monthStart = (s = today()) => s.slice(0, 8) + '01';
const dow = (s = today()) => (parseDate(s).getDay() + 6) % 7; // Mon=0
const uid = p => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const ICONS = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  rituals: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
  plan: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
  journey: '<path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 21.700l8.800-8.700a5.200 5.200 0 0 0 0-7.400z"/>',
  reflect: '<path d="M12 20h9"/><path d="M16.5 3.5a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  reviews: '<path d="M21 12.800A9 9 0 1 1 11.200 3a7 7 0 0 0 9.800 9.800z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21L8 9l4-6 4 6z"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  science: '<path d="M4 19.500A2.500 2.500 0 0 1 6.500 17H20V3H6.500A2.500 2.500 0 0 0 4 5.500z"/><path d="M4 19.500A2.500 2.500 0 0 0 6.500 22H20v-5"/>',
  more: '<circle cx="5" cy="12" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="19" cy="12" r="1.300"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  drop: '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
  moon: '<path d="M21 12.800A9 9 0 1 1 11.200 3a7 7 0 0 0 9.800 9.800z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  walk: '<circle cx="13" cy="4.500" r="1.800"/><path d="M9 21l2.500-6-2-3 2-4 3 2 2.500.5M11.500 15L15 17l1 4M8 11l-2 3"/>',
  sunrise: '<path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.200 10.200l1.400 1.400M1 18h2M21 18h2M18.400 11.600l1.400-1.400M23 22H1M8 6l4-4 4 4"/>',
  sunset: '<path d="M17 18a5 5 0 0 0-10 0M12 9V2M4.200 10.200l1.400 1.400M1 18h2M21 18h2M18.400 11.600l1.400-1.400M23 22H1M16 5l-4 4-4-4"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.800 6.100C15.500 5 17 4.500 19 2c1 2 2 4.200 2 8 0 5.500-4.800 10-10 10z"/><path d="M2 21c0-3 1.900-5.500 5-6 3-.5 5-2.500 5-2.500"/>',
  edit: '<path d="M12 20h9"/><path d="M16.500 3.500a2.100 2.100 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'
};
const icon = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ───────────── content ───────────── */
const PILLARS = {
  Glow: { icon: 'sunrise', desc: 'Beauty & body care' },
  Power: { icon: 'walk', desc: 'Strength & nourishment' },
  Grace: { icon: 'leaf', desc: 'Presence & elegance' },
  Wisdom: { icon: 'science', desc: 'Curiosity & growth' },
  Devotion: { icon: 'journey', desc: 'Stillness & spirit' }
};
const SLOTS = { morning: { label: 'Morning', icon: 'sunrise' }, day: { label: 'Daytime', icon: 'today' }, evening: { label: 'Evening', icon: 'sunset' } };
const SLOT_ORDER = ['morning', 'day', 'evening'];

// Point values are the recovered originals (core checklist = 235 XP). `slot` is the suggested time of day.
const BASE = [
  { id: 'glow1', pillar: 'Glow', slot: 'morning', name: 'Gentle cleanse, moisturise & daytime SPF', sub: 'Keep the basics comfortable; actives are optional', xp: 10 },
  { id: 'glow2', pillar: 'Glow', slot: 'evening', name: 'Optional body moisturiser or soft body care', sub: 'Skip scrubbing if your skin feels sensitive', xp: 10 },
  { id: 'glow3', pillar: 'Glow', slot: 'morning', name: 'Hair, sun & getting-ready care', sub: 'Show up for your body with kindness', xp: 20 },
  { id: 'power1', pillar: 'Power', slot: 'day', name: 'Strength or joyful movement', sub: 'A walk, a session, a stretch, or rest when needed', xp: 30 },
  { id: 'power2', pillar: 'Power', slot: 'day', name: 'Nourish yourself for the day', sub: 'Satisfying food, with flexibility and no tracking', xp: 20 },
  { id: 'power3', pillar: 'Power', slot: 'evening', name: 'Recover in a way you need', sub: 'Water, sleep, a pause, or gentle movement', xp: 15 },
  { id: 'grace1', pillar: 'Grace', slot: 'day', name: 'Practise posture & grace', sub: 'Move through the day with presence', xp: 15 },
  { id: 'grace2', pillar: 'Grace', slot: 'day', name: 'A mindful pause between things', sub: 'One breath, one moment at a time', xp: 10 },
  { id: 'grace3', pillar: 'Grace', slot: 'morning', name: 'Get ready with intention', sub: 'Add one detail that delights you', xp: 10 },
  { id: 'wisdom1', pillar: 'Wisdom', slot: 'evening', name: 'Read something that feeds you', sub: 'A few pages count', xp: 25 },
  { id: 'wisdom2', pillar: 'Wisdom', slot: 'evening', name: 'Write to your future self', sub: 'Name the woman you are becoming', xp: 10 },
  { id: 'wisdom3', pillar: 'Wisdom', slot: 'day', name: 'Learn or make something', sub: 'Let curiosity have a little room', xp: 20 },
  { id: 'devotion1', pillar: 'Devotion', slot: 'day', name: 'Complete your Holy Hour', sub: 'A protected hour for your own becoming', xp: 15 },
  { id: 'devotion2', pillar: 'Devotion', slot: 'morning', name: 'Set a morning intention', sub: 'What would make today feel like yours?', xp: 10 },
  { id: 'devotion3', pillar: 'Devotion', slot: 'evening', name: 'Find a moment of gratitude', sub: 'Notice a small thing that held you', xp: 15 }
];
const PRESETS = {
  gentle: ['devotion2', 'glow1', 'power2'],
  balanced: ['devotion2', 'glow1', 'power1', 'power2', 'power3', 'wisdom2', 'devotion3'],
  full: BASE.map(q => q.id)
};
const PRESET_INFO = { gentle: ['Gentle · 3', 'Intention, skin basics, nourishment. The smallest day that still counts.'], balanced: ['Balanced · 7', 'Adds movement, recovery, a future-self note and gratitude.'], full: ['Full · 15', 'Every quest from the original handbook.'] };

const LEVELS = [['Pearl Dreamer', 0, 500], ['Blush Beginner', 500, 1200], ['Rose Ritualist', 1200, 2400], ['Siren in Bloom', 2400, 4000], ['Moonlit Muse', 4000, 6500], ['Velvet Visionary', 6500, 9500], ['The Siren', 9500, Infinity]];

const ROUTINES = {
  morning: {
    title: 'Morning ritual', icon: 'sunrise', cue: 'After I wake up and drink a glass of water', time: '07:30',
    lead: 'Pick the steps that help. The star marks your short version.',
    steps: [
      { id: 's0', n: 'Wake softly', d: 'Open the curtains and let in the day.' },
      { id: 's1', n: 'Water & nourishment', d: 'Have a drink and choose a satisfying breakfast.' },
      { id: 's2', n: 'Face & body care', d: 'Cleanse, moisturise, and use SPF.', core: true },
      { id: 's3', n: 'Move a little', d: 'Stretch, take a walk, or follow your energy.' },
      { id: 's4', n: 'Set an intention', d: 'Write one sentence about how you want to feel.', core: true },
      { id: 's5', n: 'Get dressed with care', d: 'Choose comfort and one detail you love.' }
    ]
  },
  evening: {
    title: 'Evening ritual', icon: 'sunset', cue: 'After I finish dinner and clear up', time: '21:00',
    lead: 'A closing moment is enough. The star marks your short version.',
    steps: [
      { id: 's0', n: 'Let the day settle', d: 'Lower the lights and set your phone aside.' },
      { id: 's1', n: 'Gentle cleanse', d: 'Remove the day and moisturise your skin.', core: true },
      { id: 's2', n: 'Body-care moment', d: 'Body oil, a warm shower, or a soft stretch.' },
      { id: 's3', n: 'Prepare with kindness', d: 'Set out one small thing for tomorrow.' },
      { id: 's4', n: 'Future-self note', d: 'Write one thing you did well today.' },
      { id: 's5', n: 'Rest & release', d: 'Choose a calming wind-down and let rest count.', core: true }
    ]
  },
  holy: {
    title: 'Holy Hour', icon: 'moon', cue: 'When my day’s main work is done', time: '',
    lead: 'An invitation, never a requirement. Choose one step or simply rest.',
    steps: [
      { id: 's0', n: 'Arrive', d: 'Settle somewhere comfortable; one minute is enough.', core: true },
      { id: 's1', n: 'Tend to your body', d: 'Choose a small act of care, or rest.' },
      { id: 's2', n: 'Feed your mind', d: 'Read a page, write a line, or make something.', core: true },
      { id: 's3', n: 'Reconnect', d: 'Notice one thing around you, or sit in stillness.' },
      { id: 's4', n: 'Set a loving direction', d: 'Choose one kind next step, if you want one.' }
    ]
  }
};
const MOVEMENT = [['MON', 'walk', 'A walk or a stretch'], ['TUE', 'rituals', 'Strength session'], ['WED', 'leaf', 'Rest or easy movement'], ['THU', 'walk', 'A comfortable walk'], ['FRI', 'today', 'Choose what feels good'], ['SAT', 'rituals', 'Strength or play'], ['SUN', 'moon', 'Rest & reset']].map(([d, i, t]) => ({ d, i, t }));
const MEALS = {
  breakfast: ['Yoghurt, fruit & granola', 'Eggs or beans on toast', 'Oats with nuts & berries'],
  lunch: ['Rice bowl with tofu or chicken & veg', 'Lentil soup with bread', 'Wrap with hummus, salad & a protein'],
  dinner: ['Pasta with a protein & vegetables', 'Salmon, potatoes & greens', 'Stir-fry with rice'],
  snack: ['Fruit & a handful of nuts', 'Cheese or hummus with crackers', 'Something you actually enjoy']
};
const CHALLENGE = ['Write one kind sentence to yourself.', 'Take a slow walk and notice the light.', 'Create a tiny morning ritual.', 'Read a page just for pleasure.', 'Choose a nourishing meal you enjoy.', 'Stretch in a way that feels lovely.', 'Write a note to future you.', 'Make a playlist for your becoming.', 'Take a screen-free moment outside.', 'Wear something that feels like you.', 'Practise your soft, steady posture.', 'Rest without needing to earn it.', 'Learn one small new thing.', 'Do your favourite body-care ritual.', 'Name one boundary that protects your peace.', 'Notice something your body did for you.', 'Enjoy a Holy Hour, at your own pace.', 'Make a space around you feel beautiful.', 'Tell yourself what you are proud of.', 'Choose joy in one ordinary moment.', 'Write your own Siren promise for tomorrow.'];
const REWARDS = [
  { id: 'bath', emoji: '🛁', name: 'Glow bath', desc: 'A long, lovely soak with your favourite scents.', cost: 8 },
  { id: 'playlist', emoji: '🎧', name: 'Playlist treat', desc: 'Make a soundtrack for this chapter of you.', cost: 5 },
  { id: 'mirror', emoji: '🪞', name: 'Mirror ritual', desc: 'A few minutes of affirmations and self-admiration.', cost: 6 },
  { id: 'double', emoji: '✨', name: 'Double-XP day', desc: 'A playful 2× quest XP celebration day.', cost: 18 },
  { id: 'flowers', emoji: '🌷', name: 'Fresh flowers', desc: 'Bring a little seasonal beauty home.', cost: 16 },
  { id: 'slow', emoji: '☕', name: 'Slow morning', desc: 'Protect an unhurried hour just for you.', cost: 12 },
  { id: 'book', emoji: '📚', name: 'A new chapter', desc: 'Choose a little bookish treat for your shelf.', cost: 20 },
  { id: 'custom', emoji: '🎀', name: 'Your own little treat', desc: 'Choose something personal that feels special.', cost: 10 }
];
const MOODS = [['Radiant', '🌟'], ['Soft', '🌸'], ['Tender', '☁️'], ['Wobbly', '🌙'], ['Hopeful', '✨']];
const PROMPTS = ['What felt like care today?', 'What made you feel most like yourself?', 'What small promise did you keep?', 'What are you ready to release?', 'What did your body do for you today?', 'What would future-you thank you for?'];
const THEMES = { blush: ['Blush', '#ebcdd3', '#f8eeea'], sage: ['Sage', '#bcc6b0', '#f0f1e8'], lilac: ['Lilac', '#cdc2de', '#f1ecf5'], moon: ['Moon', '#171219', '#2b2331'], custom: ['Custom', '#e7bec7', '#f4e8e8'] };
const MOVES = {
  home: { A: ['Chair squat', 'Incline push-up at a wall or sturdy counter', 'Backpack row, one side at a time', 'Glute bridge'], B: ['Supported step-up or sit-to-stand', 'Backpack hip hinge', 'Wall or counter push-up', 'Backpack row, one side at a time'] },
  bands: { A: ['Chair squat', 'Band chest press', 'Band row', 'Glute bridge'], B: ['Supported split squat', 'Band hip hinge', 'Band overhead press', 'Band row'] },
  weights: { A: ['Goblet squat with a comfortable weight', 'Dumbbell floor press', 'Dumbbell row', 'Glute bridge or weighted hip thrust'], B: ['Supported split squat', 'Dumbbell Romanian deadlift', 'Dumbbell overhead press', 'Dumbbell row'] },
  gym: { A: ['Leg press or comfortable squat', 'Chest press', 'Seated row', 'Hip thrust or glute bridge'], B: ['Leg press or supported split squat', 'Romanian deadlift machine or light dumbbells', 'Machine shoulder press', 'Seated row'] }
};

/* ───────────── data ───────────── */
function blank() {
  return {
    version: 2, name: 'Zai', onboarded: false, logs: {}, totalBonus: 0, bonusEvents: [], spentPearls: 0, rewards: clone(REWARDS), redeemed: [],
    customQuests: [], oneOffTasks: {}, supportNotes: {}, trainingSessions: [], trainingSetup: 'home', challengeStart: null, challengeDone: [],
    routineChecks: {}, journal: {}, reviews: {}, intentions: {}, intentionAsked: null,
    plan: [...PRESETS.gentle], slots: {}, tiny: false, miniRitual: false,
    routines: clone(ROUTINES), movement: clone(MOVEMENT), meals: clone(MEALS), vitals: {}, waterTarget: 8, weeklyTarget: 5, bedtime: '23:00', lastBackup: null,
    settings: { streak: false, calm: true, nightPrompt: true, theme: 'blush', custom: { paper: '#f4e8e8', surround: '#e7bec7', accent: '#86445d' }, textScale: 'normal', compact: false }
  };
}
function normalise(d) {
  const b = blank();
  if (!d || typeof d !== 'object') return b;
  const o = { ...b, ...d };
  for (const k of ['trainingSessions', 'customQuests', 'redeemed', 'bonusEvents', 'challengeDone', 'rewards']) if (!Array.isArray(o[k])) o[k] = b[k];
  for (const k of ['logs', 'oneOffTasks', 'supportNotes', 'routineChecks', 'journal', 'reviews', 'vitals', 'slots', 'intentions']) if (!o[k] || typeof o[k] !== 'object') o[k] = {};
  // plan: existing diaries start from the balanced set plus their own quests
  if (!Array.isArray(d.plan)) {
    o.plan = [...PRESETS.balanced, ...o.customQuests.map(q => q.id)];
    if (Object.keys(o.logs).length) o.onboarded = true;
  }
  o.routines = {};
  for (const k of Object.keys(ROUTINES)) {
    const r = { ...clone(ROUTINES[k]), ...((d.routines && d.routines[k]) || {}) };
    if (!Array.isArray(r.steps) || !r.steps.length) r.steps = clone(ROUTINES[k].steps);
    o.routines[k] = r;
  }
  // older diaries stored ritual progress by step position; steps now have ids
  for (const [k, v] of Object.entries(o.routineChecks)) o.routineChecks[k] = (Array.isArray(v) ? v : []).map(x => typeof x === 'number' ? 's' + x : x);
  if (!Array.isArray(o.movement) || o.movement.length !== 7) o.movement = clone(MOVEMENT);
  o.meals = { ...clone(MEALS), ...(d.meals || {}) };
  // settings (migrates the older "appearance" block)
  const s = { ...b.settings, ...(d.settings || {}) };
  const a = d.settings && d.settings.appearance;
  if (a && !(d.settings && d.settings.theme)) {
    const custom = (a.paper && a.paper.toLowerCase() !== '#f4e8e8') || (a.surround && a.surround.toLowerCase() !== '#e7bec7');
    s.theme = custom ? 'custom' : 'blush';
    s.custom = { ...b.settings.custom, paper: a.paper || b.settings.custom.paper, surround: a.surround || b.settings.custom.surround };
    s.textScale = a.textScale === 'large' ? 'large' : 'normal';
    s.compact = !!a.compact;
  }
  if (d.settings && d.settings.calm === undefined) s.calm = false;
  if (!o.bedtime) o.bedtime = '23:00';
  delete s.appearance;
  s.custom = { ...b.settings.custom, ...(s.custom || {}) };
  o.settings = s;
  return o;
}
function load() { try { return normalise(JSON.parse(localStorage.getItem(KEY))); } catch { return blank(); } }
let data = load();
let saveT;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { toast('Your browser storage is full. Please save a backup copy.'); }
}
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 400); }

/* ───────────── quests & scoring ───────────── */
const ui = { page: 'today', routine: 'morning', edit: false, review: 'weekly', open: null, support: null, meal: null, prompt: 0, journalSaved: 0 };
const getLog = (day = today()) => data.logs[day] || { done: [] };
const ensureLog = (day = today()) => data.logs[day] || (data.logs[day] = { done: [] });
function questList(day = today()) {
  return [
    ...BASE.map(q => ({ ...q, slot: data.slots[q.id] || q.slot, ...(q.id === 'devotion2' && data.intentions[today()] ? { sub: 'Already chosen: “' + data.intentions[today()].text + '” Tap to hold it.' } : {}) })),
    ...data.customQuests.map(q => ({ ...q, sub: q.sub || 'A little ritual, chosen by you', slot: data.slots[q.id] || q.slot || 'day', custom: true })),
    ...(data.oneOffTasks[day] || []).map(q => ({ ...q, sub: 'Just for today', slot: q.slot || 'day', oneOff: true }))
  ];
}
const questById = id => questList().find(q => q.id === id) || Object.values(data.oneOffTasks).flat().find(q => q.id === id);
function questPoints(day = today()) { const done = getLog(day).done; return questList(day).filter(q => done.includes(q.id)).reduce((n, q) => n + q.xp, 0); }
const totalQuestXP = () => Object.keys(data.logs).reduce((s, d) => s + questPoints(d), 0);
const availablePearls = () => Math.max(0, Math.floor(totalQuestXP() / 25) - data.spentPearls);
const dailyBonus = (day = today()) => data.bonusEvents.filter(e => e.date === day).reduce((s, e) => s + e.xp, 0);
const totalXP = () => totalQuestXP() + data.totalBonus;
const activeDays = () => Object.keys(data.logs).filter(d => getLog(d).done.length > 0).sort();
function streak() {
  const days = new Set(activeDays()); let cur = today();
  if (!days.has(cur)) { cur = addDays(cur, -1); if (!days.has(cur)) return 0; }
  let n = 0; while (days.has(cur)) { n++; cur = addDays(cur, -1); } return n;
}
function streakAt(day) { const days = new Set(activeDays()); let n = 0; while (days.has(day)) { n++; day = addDays(day, -1); } return n; }
function levelInfo() {
  const xp = totalXP();
  let i = LEVELS.findIndex(l => xp < l[2]);
  if (i < 0) i = LEVELS.length - 1;
  const l = LEVELS[i], pct = l[2] === Infinity ? 100 : Math.min(100, (xp - l[1]) / (l[2] - l[1]) * 100);
  return { i, name: l[0], xp, pct, next: l[2] };
}
function planIds() { const ids = new Set(questList().map(q => q.id)); return data.plan.filter(id => ids.has(id)); }
function visibleQuests(day = today()) {
  const done = getLog(day).done, set = new Set(data.plan), top = new Set(data.plan.slice(0, 3));
  let list = questList(day).filter(q => q.oneOff || set.has(q.id) || done.includes(q.id));
  if (isTiny(day)) list = list.filter(q => q.oneOff || top.has(q.id) || done.includes(q.id));
  const rank = q => q.oneOff ? -1 : (data.plan.indexOf(q.id) < 0 ? 999 : data.plan.indexOf(q.id));
  return list.sort((a, b) => rank(a) - rank(b));
}
function maybeAward(day) {
  const done = getLog(day).done, ids = planIds();
  if (ids.length && ids.every(id => done.includes(id)) && !data.bonusEvents.some(e => e.id === 'perfect:' + day)) {
    data.bonusEvents.push({ id: 'perfect:' + day, date: day, xp: 50, label: 'Whole plan' }); data.totalBonus += 50;
    toast(data.settings.calm ? 'Your whole plan is done ✨' : 'Your whole plan is done · +50 bonus XP ✨');
  }
  const s = streakAt(day);
  if (s > 0 && s % 7 === 0 && !data.bonusEvents.some(e => e.id === 'streak:' + day)) {
    data.bonusEvents.push({ id: 'streak:' + day, date: day, xp: 100, label: `${s}-day streak` }); data.totalBonus += 100;
    toast(data.settings.calm ? `${s} days of showing up ♡` : `${s} days of showing up! +100 XP ♡`);
  }
}
function toggleQuest(id) {
  if (id === 'devotion2' && !getLog().done.includes(id) && !intentionFor(today())) return intentionModal(today(), { markDone: true });
  const d = ensureLog(), at = d.done.indexOf(id), completing = at < 0;
  if (completing) d.done.push(id); else d.done.splice(at, 1);
  maybeAward(today()); save();
  if (completing && navigator.vibrate) try { navigator.vibrate(12); } catch {}
  const vis = visibleQuests(), allDone = vis.length && vis.every(q => d.done.includes(q.id));
  render(completing && allDone ? 'celebrate' : '');
  if (completing && allDone && !d.celebrated) { d.celebrated = true; save(); if (!$('.toast.show')) toast(isTiny() ? 'Tiny day complete. That counts. ♡' : 'Day complete. Rest well, you showed up. ✨'); }
}

/* ───────────── theme ───────────── */
const lum = hex => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
function applyTheme() {
  const s = data.settings, h = document.documentElement, st = h.style;
  h.dataset.theme = s.theme; h.dataset.text = s.textScale; document.body.classList.toggle('compact', !!s.compact); document.body.classList.toggle('calm', !!s.calm);
  const props = ['--paper', '--canvas', '--accent', '--ink', '--on-accent', '--gold'];
  if (s.theme === 'custom') {
    const c = s.custom; st.setProperty('--paper', c.paper); st.setProperty('--canvas', c.surround); st.setProperty('--accent', c.accent);
    st.setProperty('--ink', lum(c.paper) > .4 ? '#2d2127' : '#f3e8ec'); st.setProperty('--on-accent', lum(c.accent) > .4 ? '#1f1519' : '#fff');
    st.setProperty('--gold', lum(c.paper) > .4 ? '#9b7435' : '#dcbd83');
  } else props.forEach(p => st.removeProperty(p));
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = getComputedStyle(h).getPropertyValue('--canvas').trim() || '#ebcdd3';
}

/* ───────────── small UI utils ───────────── */
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 3000); }
let modalClose = null;
function openModal({ title, sub = '', body, submit = 'Save', onSubmit, cancel = 'Cancel', onClose = null }) {
  modalClose = onClose;
  $('#modalBody').innerHTML = `<h2 id="modalTitle">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}<form id="modalForm">${body}<div class="modal-actions">${cancel ? `<button type="button" class="btn ghost" id="modalCancel">${cancel}</button>` : ''}<button class="btn" type="submit">${submit}</button></div></form>`;
  $('#modalBackdrop').classList.add('show');
  $('#modalCancel') && ($('#modalCancel').onclick = closeModal);
  $('#modalForm').onsubmit = e => { e.preventDefault(); if (onSubmit(new FormData(e.target)) !== false) { modalClose = null; closeModal(); } };
  setTimeout(() => $('#modal input[type=text],#modal input[type=number]')?.focus(), 60);
}
function closeModal() { $('#modalBackdrop').classList.remove('show'); if (modalClose) { const f = modalClose; modalClose = null; f(); } }
function setMenu(open) { $('#sidebar').classList.toggle('open', open); $('#backdrop').hidden = !open; $('#moreBtn').setAttribute('aria-expanded', String(open)); }
async function download(name, text, type) {
  // On iPad (especially from the Home Screen) the share sheet is the reliable way to save or send a file
  try { const f = new File([text], name, { type }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(new Blob([text], { type })), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 800); }
function exportData() { data.lastBackup = today(); save(); download(`siren-diary-${today()}.json`, JSON.stringify(data, null, 2), 'application/json'); toast('Backup saved ↗ Keep it somewhere safe.'); if (ui.page === 'settings') render(); }
const windDown = () => { const [h, m] = data.bedtime.split(':').map(Number), x = ((h * 60 + m - 45) % 1440 + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
const timeLabel = t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`; };
const currentSlot = () => { const h = new Date().getHours(); return h < 11 ? 'morning' : h < 17 ? 'day' : 'evening'; };
const slotOptions = sel => SLOT_ORDER.map(s => `<option value="${s}"${s === sel ? ' selected' : ''}>${SLOTS[s].label}</option>`).join('');
const pillarOptions = sel => Object.keys(PILLARS).map(p => `<option${p === sel ? ' selected' : ''}>${p}</option>`).join('');

/* ───────────── tomorrow's intention ───────────── */
const VIBES = {
  Soft: ['A soft day. Go gently, finish less, notice more.', 'Tomorrow I will move gently and be kind to myself.'],
  Focused: ['A focused day. One thing at a time, starting with the card below.', 'Tomorrow I will finish one important thing first.'],
  Radiant: ['A radiant day. Dress for it, stand tall, take up space.', 'Tomorrow I will walk in like I belong there.'],
  Slow: ['A slow day. Just your top three, and that is plenty.', 'Tomorrow I will keep it simple and rest when I need to.'],
  Bold: ['A bold day. Begin the thing you have been putting off, small first.', 'Tomorrow I will do the brave small thing.']
};
const intentionFor = (day = today()) => data.intentions[day] || null;
const isTiny = (day = today()) => data.tiny || (day === today() && intentionFor(day)?.vibe === 'Slow');
// which day the nightly prompt is for: tomorrow once the evening ritual time has passed, or today if it's the small hours
function nightTarget() {
  if (!data.settings.nightPrompt) return null;
  const now = new Date(), h = now.getHours(), mins = h * 60 + now.getMinutes(), [eh, em] = (data.routines.evening.time || '21:00').split(':').map(Number);
  if (h < 4) return today();
  return mins >= eh * 60 + em ? addDays(today(), 1) : null;
}
function intentionModal(target, { markDone = false, night = false } = {}) {
  const cur = intentionFor(target) || {}, isToday = target === today();
  openModal({
    title: isToday ? 'Set today’s intention' : 'Set tomorrow’s intention',
    sub: isToday ? 'Name how you want today to feel. One sentence is enough.' : 'Decide tonight how you want tomorrow to feel. It becomes the first thing you see in the morning and sets the tone of your day.',
    submit: 'Set it', cancel: night ? 'Not tonight' : 'Cancel',
    onClose: night ? () => { data.intentionAsked = today(); save(); } : null,
    body: `<label class="lbl">The feeling</label><div class="vibes">${Object.keys(VIBES).map(v => `<label class="vibe"><input type="radio" name="vibe" value="${v}" ${(cur.vibe || 'Soft') === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div>
      <label class="lbl" for="iText">In one sentence</label><input class="inp" id="iText" name="text" type="text" maxlength="120" value="${esc(cur.text || '')}" placeholder="${esc(VIBES[cur.vibe || 'Soft'][1])}" autocomplete="off">
      <p class="hint" style="margin-top:8px">Pick “Slow” and tomorrow automatically becomes a Tiny day.</p>`,
    onSubmit: f => {
      const vibe = f.get('vibe') || 'Soft', text = String(f.get('text')).trim() || VIBES[vibe][1];
      data.intentions[target] = { text, vibe, set: new Date().toISOString() };
      if (isToday && markDone) { const d = ensureLog(); if (!d.done.includes('devotion2')) d.done.push('devotion2'); maybeAward(today()); }
      save(); render(); toast(isToday ? 'Intention set ✿' : 'Tomorrow is set. Sleep well ✨');
    }
  });
  $$('input[name=vibe]').forEach(r => r.addEventListener('change', () => { const t = $('#iText'); if (t && !t.value) t.placeholder = VIBES[r.value][1]; }));
}
function maybeNightPrompt() {
  if (!data.onboarded || $('#modalBackdrop').classList.contains('show') || data.intentionAsked === today()) return;
  const t = nightTarget();
  if (t && !intentionFor(t)) intentionModal(t, { night: true });
}

/* ───────────── pages ───────────── */
function weekDots() {
  const start = weekStart(), act = new Set(activeDays()), t = today();
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => { const d = addDays(start, i); return `<span class="dot ${act.has(d) ? 'on' : ''} ${d === t ? 'now' : ''}" title="${d}">${act.has(d) ? icon('check', 16) : l}</span>`; }).join('');
}
const weekCount = () => { const s = weekStart(), t = today(); return activeDays().filter(d => d >= s && d <= t).length; };

function nudgeText() {
  const act = activeDays(), t = today();
  if (act.includes(t)) return '';
  const prev = act.filter(d => d < t).pop();
  if (!prev) return `<div class="nudge">Start with one small thing. A two-minute version counts as a real start.</div>`;
  const gap = daysBetween(prev, t);
  if (gap === 2) return `<div class="nudge">Yesterday was quiet, and that’s completely fine. One tiny thing today keeps your rhythm going. Missing a single day barely matters; missing twice is the habit-breaker to avoid.</div>`;
  if (gap >= 3) return `<div class="nudge">Fresh page. There’s no catching up and nothing to make up for. ${isTiny() ? 'Your Tiny day is on: three things, that’s all.' : '<button class="link-btn" data-act="tiny">Switch on a Tiny day</button> to begin with just three things.'}</div>`;
  return '';
}

function intentionCard(t) {
  const cur = intentionFor(t), tom = intentionFor(addDays(t, 1));
  if (cur) return `<section class="intent" aria-label="Today’s intention"><div class="eyebrow">Today’s intention · ${esc(cur.vibe)}</div><p class="intent-text">“${esc(cur.text)}”</p><button class="link-btn" data-act="intent-edit" data-d="${t}">Change</button></section>`;
  if (!tom && nightTarget() === addDays(t, 1)) return `<section class="intent"><div class="eyebrow">Tonight</div><p class="intent-text">How do you want tomorrow to feel?</p><button class="btn small" data-act="intent-edit" data-d="${addDays(t, 1)}">Set tomorrow’s intention</button></section>`;
  if (tom) return `<section class="intent quiet"><div class="eyebrow">Tomorrow · ${esc(tom.vibe)}</div><p class="intent-text">“${esc(tom.text)}”</p><button class="link-btn" data-act="intent-edit" data-d="${addDays(t, 1)}">Change</button></section>`;
  return '';
}
function renderToday() {
  const t = today(), now = new Date(), hr = now.getHours(), done = getLog(t).done, items = visibleQuests(t), left = items.filter(q => !done.includes(q.id)), cs = currentSlot();
  const greet = hr < 5 ? 'Still up' : hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const xpToday = questPoints(t) + dailyBonus(t);
  // next up: current slot first, then later slots, then earlier ones
  const order = [...SLOT_ORDER.slice(SLOT_ORDER.indexOf(cs)), ...SLOT_ORDER.slice(0, SLOT_ORDER.indexOf(cs))];
  const next = order.map(s => left.find(q => q.slot === s)).find(Boolean) || null;
  if (!ui.open) ui.open = new Set(['slot:' + cs]);
  const mood = (data.journal[t] || {}).mood || '', v = data.vitals[t] || {}, water = v.water || 0, sleep = v.sleep;
  const mv = data.movement[dow()];
  const row = q => `<li class="task ${done.includes(q.id) ? 'done' : ''}"><button class="task-main" data-act="toggle" data-id="${q.id}" aria-pressed="${done.includes(q.id)}"><span class="check">${icon('check', 16)}</span><span class="task-text"><b>${esc(q.name)}</b>${q.sub ? `<small>${esc(q.sub)}</small>` : ''}</span><span class="xp">+${q.xp}</span></button>${q.oneOff ? `<button class="task-del" data-act="del-task" data-id="${q.id}" aria-label="Remove ${esc(q.name)}">${icon('x', 18)}</button>` : ''}</li>`;
  const slots = SLOT_ORDER.map(s => {
    const qs = items.filter(q => q.slot === s); if (!qs.length) return '';
    const n = qs.filter(q => done.includes(q.id)).length;
    return `<details class="slot" data-key="slot:${s}" ${ui.open.has('slot:' + s) ? 'open' : ''}><summary>${icon(SLOTS[s].icon, 22)}<b>${SLOTS[s].label}</b><small>${n} of ${qs.length}</small></summary><ul class="tasks">${qs.map(row).join('')}</ul></details>`;
  }).join('');
  const rm = Object.entries(data.routines).map(([k, r]) => {
    const steps = ritualSteps(k), c = (data.routineChecks[t + ':' + k] || []).filter(id => steps.some(s => s.id === id)).length;
    const isNow = (k === 'morning' && cs === 'morning') || (k === 'evening' && cs === 'evening') || (k === 'holy' && cs === 'day');
    return `<button class="rmini ${isNow ? 'now' : ''}" data-act="go-ritual" data-r="${k}">${icon(r.icon, 24)}<b>${r.title}</b><small>${r.time ? timeLabel(r.time) + ' · ' : ''}${c} of ${steps.length} done</small></button>`;
  }).join('');
  const pct = items.length ? Math.round(items.filter(q => done.includes(q.id)).length / items.length * 100) : 0;
  const backupOld = activeDays().length >= 2 && (!data.lastBackup || daysBetween(data.lastBackup, t) > 7);

  return `
  <div class="hello"><div class="eyebrow">${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
    <h1>${greet}, ${esc(data.name || 'lovely')}.</h1>
    <p>${left.length ? (intentionFor(t) ? VIBES[intentionFor(t).vibe][0] : isTiny() ? 'A Tiny day: just these few things.' : 'One thing at a time. Start with the card below.') : items.length ? 'Everything you chose is done. Anything else is a bonus.' : 'Add a few things to your day in My plan.'}</p></div>
  ${intentionCard(t)}
  <div class="week"><div class="dots" role="img" aria-label="Days active this week">${weekDots()}</div><small>${weekCount()} of ${data.weeklyTarget} days this week${data.settings.streak && streak() > 1 ? ` · ${streak()}-day run` : ''}</small></div>
  ${nudgeText()}
  ${next ? `<section class="next" aria-label="Next up"><div class="eyebrow">Next up · ${SLOTS[next.slot].label.toLowerCase()}</div><h2>${esc(next.name)}</h2><p>${esc(next.sub || '')}</p>
      <div class="actions"><button class="btn" data-act="toggle" data-id="${next.id}">${icon('check', 18)} Done</button><span class="xp">+${next.xp} XP</span>${!data.tiny ? '' : ''}</div></section>`
    : items.length ? `<section class="next ${ui.celebrate ? 'celebrate' : ''}"><div class="eyebrow">Today</div><h2>All done. Beautifully.</h2><p>Rest counts too. Your reflection is a lovely way to close the day.</p><div class="actions"><button class="btn" data-act="goto" data-page-target="journal">Write a line ${icon('reflect', 18)}</button></div></section>` : ''}
  <div class="progress-line"><span>${items.filter(q => done.includes(q.id)).length} / ${items.length}</span><div class="bar"><i style="width:${pct}%"></i></div><span class="xpt">${xpToday} XP</span></div>

  <div class="row-between" style="margin-top:6px"><div class="eyebrow">How are you arriving?</div></div>
  <div class="moods" role="group" aria-label="Mood">${MOODS.map(([m, e]) => `<button class="mood ${mood === m ? 'on' : ''}" data-act="mood" data-mood="${m}" aria-pressed="${mood === m}"><span>${e}</span>${m}</button>`).join('')}</div>

  <div class="row-between" style="margin-top:26px"><h2 class="sec" style="margin:0">Your day</h2><button class="text-btn" data-act="tiny">${data.tiny ? 'Show my full plan' : intentionFor(t)?.vibe === 'Slow' ? 'Slow day: top three' : 'Make it a Tiny day'}</button></div>
  ${slots || '<p class="empty">Nothing planned yet.</p>'}
  <form class="add-row" id="quickAdd"><input id="quickInput" maxlength="60" aria-label="Add a task for today" placeholder="Add something for today…" autocomplete="off"><button class="btn small" type="submit">${icon('plus', 16)} Add</button></form>

  <div class="rituals-mini">${rm}</div>
  <div class="split">
    <div class="card vital">${icon('drop', 26)}<div><b>${water} / ${data.waterTarget}</b><small>glasses of water</small></div><div class="stepper"><button class="icon-btn sm" data-act="water" data-d="-1" aria-label="One less glass">${icon('minus', 16)}</button><button class="icon-btn sm" data-act="water" data-d="1" aria-label="One more glass">${icon('plus', 16)}</button></div></div>
    <div class="card vital">${icon('moon', 26)}<div><b>${sleep != null ? sleep + ' h' : '–'}</b><small>last night’s sleep</small></div><div class="stepper"><button class="icon-btn sm" data-act="sleep" data-d="-0.5" aria-label="Less sleep">${icon('minus', 16)}</button><button class="icon-btn sm" data-act="sleep" data-d="0.5" aria-label="More sleep">${icon('plus', 16)}</button></div></div>
  </div>
  <p class="one-line">${icon(mv.i, 20)}<span>Movement today: <b>${esc(mv.t)}</b></span></p>

  <details class="support" data-key="support" ${ui.open.has('support') ? 'open' : ''}><summary>${icon('leaf', 24)}<span><b>Anxious, overwhelmed or stuck?</b><small>A quiet reset with a few choices</small></span></summary>
    <div class="support-body"><p>Nothing here needs fixing all at once. Choose what feels comfortable, or close this and carry on.</p>
      <div class="opts"><button class="opt ${ui.support === 'ground' ? 'on' : ''}" data-act="support" data-mode="ground">Ground through my senses</button><button class="opt ${ui.support === 'breathe' ? 'on' : ''}" data-act="support" data-mode="breathe">Gentle breathing</button><button class="opt ${ui.support === 'worry' ? 'on' : ''}" data-act="support" data-mode="worry">Put a worry on paper</button></div>
      <div id="supportDetail">${supportDetail()}</div>
      <p><a href="https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/" target="_blank" rel="noopener">NHS anxiety support ↗</a></p>
      <p class="hint" style="margin-top:8px">This is a self-care prompt, not treatment. If anxiety is making daily life hard, a GP or mental health professional can help.</p><p class="hint" style="margin-top:8px"><b>If you feel unsafe or in crisis, you don’t have to wait.</b> Call your local emergency number. In the UK and Ireland, Samaritans are free on 116 123 any time, and NHS 111 can direct you to help. In the US, call or text 988.</p></div></details>
  ${backupOld ? `<p class="hint" style="margin-top:18px">Your diary lives only on this device. <button class="link-btn" data-act="export">Save a backup copy</button> so it can never be lost.</p>` : ''}`;
}

function supportDetail() {
  const saved = data.supportNotes[today()] || {};
  if (ui.support === 'ground') return `<div class="detail"><h3>Come back to what is here</h3><p>Press your feet gently into the floor. Look around and name five things you can see, then notice a few points where your body is supported. You can stop at any point, or just name one thing.</p></div>`;
  if (ui.support === 'breathe') return `<div class="detail"><h3>Let the breath stay easy</h3><p>If focusing on your breath feels okay, breathe in gently and out gently. You might count from 1 to 5 each way, only as far as is comfortable. No deep breaths or breath-holding needed. If this feels uncomfortable, switch to grounding.</p></div>`;
  if (ui.support === 'worry') return `<div class="detail"><h3>Put the worry somewhere outside your head</h3><p>Writing a worry down makes it easier to look at one thing at a time. Is there one small, practical step? If not, you can leave it here for now.</p>
    <label class="lbl" for="wWorry">What’s on your mind?</label><textarea class="inp" id="wWorry" rows="3" placeholder="As little or as much as you want.">${esc(saved.worry || '')}</textarea>
    <label class="lbl" for="wNext">One small next step, if there is one</label><input class="inp" id="wNext" type="text" maxlength="120" placeholder="It can also wait" value="${esc(saved.nextStep || '')}">
    <label class="lbl" for="wPlan">If I feel stuck again, I can…</label><input class="inp" id="wPlan" type="text" maxlength="120" placeholder="Choose one small response" value="${esc(saved.plan || '')}">
    <p style="margin-top:12px"><button class="btn small" data-act="save-worry">Save privately on this device</button><span class="saved" id="worrySaved">Saved</span></p></div>`;
  return '';
}

/* rituals & body */
const ritualSteps = k => { const r = data.routines[k]; if (!data.miniRitual) return r.steps; const core = r.steps.filter(s => s.core); return core.length ? core : r.steps.slice(0, 2); };
function renderRituals() {
  if (!ui.open) ui.open = new Set();
  const k = ui.routine, r = data.routines[k], checks = data.routineChecks[today() + ':' + k] || [], steps = ui.edit ? r.steps : ritualSteps(k), setup = data.trainingSetup || 'home';
  const weekSess = data.trainingSessions.filter(s => s.date >= weekStart() && s.date <= today());
  const stepRow = s => `<li class="step ${checks.includes(s.id) ? 'done' : ''}"><button class="task-main" data-act="step" data-id="${s.id}" aria-pressed="${checks.includes(s.id)}"><span class="check">${icon('check', 16)}</span><span class="task-text"><b>${esc(s.n)}${s.core ? '<span class="star" title="In your short version">★</span>' : ''}</b><small>${esc(s.d)}</small></span></button></li>`;
  const editRow = s => `<li class="step-edit"><input class="inp" data-field="n" data-id="${s.id}" value="${esc(s.n)}" maxlength="50" aria-label="Step name"><label class="hint" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-field="core" data-id="${s.id}" ${s.core ? 'checked' : ''}> ★</label><button class="icon-btn sm" data-act="step-del" data-id="${s.id}" aria-label="Delete step">${icon('x', 16)}</button><input class="inp d" data-field="d" data-id="${s.id}" value="${esc(s.d)}" maxlength="100" aria-label="Step detail"></li>`;
  const mealSlots = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snack']];
  return `
  <div class="page-head"><div class="eyebrow">Routine · body · nourishment</div><h1>Rituals &amp; body</h1><p>Attach each ritual to something you already do. That small link is what makes it stick.</p></div>
  <div class="tabs" role="tablist">${Object.entries(data.routines).map(([key, rr]) => `<button class="tab ${key === k ? 'on' : ''}" role="tab" aria-selected="${key === k}" data-act="tab-routine" data-r="${key}">${rr.title}</button>`).join('')}</div>
  <div class="card">
    <div class="cue">${icon('cal', 26)}<p><b>When:</b> ${esc(r.cue)}${r.time ? ` <span class="hint">· ${timeLabel(r.time)}</span>` : ''}<br><span class="hint">“${esc(r.cue)}, I will do this ritual.”</span></p><button class="btn ghost small" data-act="cue-edit">${icon('edit', 16)} Change</button></div>
    ${k === 'evening' && data.bedtime ? `<p class="hint">Wind-down starts around <b>${timeLabel(windDown())}</b> so you can be asleep near ${timeLabel(data.bedtime)}. Regular sleep and wake times help your mood and energy; change your bedtime in Settings.</p>` : ''}
    <p class="hint">${esc(r.lead)}</p>
    <ul class="steps">${steps.map(ui.edit ? editRow : stepRow).join('')}</ul>
    ${ui.edit ? `<button class="btn ghost small" data-act="step-add">${icon('plus', 16)} Add a step</button>` : ''}
    <div class="foot-line"><span>${ui.edit ? 'Changes save automatically.' : `${checks.filter(id => steps.some(s => s.id === id)).length} of ${steps.length} done · no XP, just care`}</span>
      <span><label class="hint" style="margin-right:12px"><input type="checkbox" class="sw" style="vertical-align:middle;margin-right:8px" data-act="mini" ${data.miniRitual ? 'checked' : ''}>Short version</label><button class="text-btn" data-act="edit-routine" style="display:inline">${ui.edit ? 'Done editing' : 'Edit steps'}</button>${ui.edit ? '' : '<button class="text-btn" data-act="reset-routine" style="display:inline">Reset today</button>'}</span></div>
  </div>
  <div class="row-between"><div><h2 class="sec">Calendar reminders</h2><p class="sec-sub">Add your ritual times to your calendar so your phone nudges you. Set times by choosing “Change” above.</p></div><button class="btn ghost" data-act="ics">${icon('download', 18)} Add to calendar</button></div>

  <h2 class="sec">Build strength at your pace</h2>
  <p class="sec-sub">A two-day full-body starting point. Leave a day or two between sessions. One set is a fine start; two is a good next step.</p>
  <div class="row-between"><select class="inp inp-sm" id="trainSetup" aria-label="Your setup" style="max-width:340px">${[['home', 'At home · bodyweight & a sturdy chair'], ['bands', 'Resistance bands'], ['weights', 'Dumbbells or household weights'], ['gym', 'Gym machines or free weights']].map(([v, l]) => `<option value="${v}"${v === setup ? ' selected' : ''}>${l}</option>`).join('')}</select><span class="hint">${weekSess.length} session${weekSess.length === 1 ? '' : 's'} this week · aim for 2, no streak</span></div>
  ${['A', 'B'].map((id, i) => { const dn = weekSess.some(s => s.workout === id); return `<details class="wk" data-key="wk:${id}" ${ui.open.has('wk:' + id) ? 'open' : ''}><summary><div><div class="eyebrow">Session ${id}</div><h3>${i ? 'Hinge · legs · push · pull' : 'Squat · push · pull · bridge'}</h3></div><span class="state ${dn ? 'ok' : ''}">${dn ? '✓ Done this week' : 'Open'}</span></summary><div class="wk-body"><p class="hint">For each move: 1–2 comfortable sets of 6–12 controlled repetitions. Rest as long as you need. Stop while you could still do a few more.</p><ol>${MOVES[setup][id].map(m => `<li>${m}</li>`).join('')}</ol><p class="hint">When the top of the range feels steady, add a few reps or a little more resistance next time.</p><button class="btn ${dn ? '' : 'ghost'}" data-act="train" data-w="${id}">${dn ? '✓ Logged this week' : 'Log session ' + id}</button></div></details>`; }).join('')}

  <div class="row-between"><div><h2 class="sec">Your weekly movement menu</h2><p class="sec-sub">Flexible by design: swap, soften or rest whenever your body asks.</p></div><button class="btn ghost small" data-act="move-edit">${icon('edit', 16)} Edit week</button></div>
  <div class="week-menu">${data.movement.map((m, i) => `<div class="wday ${i === dow() ? 'now' : ''}"><b>${m.d}</b>${icon(m.i, 22)}<small>${esc(m.t)}</small></div>`).join('')}</div>
  <p class="safety">Any comfortable movement counts. The <a href="https://www.who.int/initiatives/behealthy/physical-activity" target="_blank" rel="noopener">WHO guideline</a> is a flexible long-term direction, not a pass/fail test.</p>

  <h2 class="sec">Nourish</h2>
  <p class="sec-sub">Decide once, eat easily. Keep a few go-to meals you enjoy so a hungry moment never becomes a decision. No tracking, no calorie counting.</p>
  <div class="card">${mealSlots.map(([key, label]) => `<div class="meal"><div class="row-between"><h3>${label}</h3><button class="text-btn" data-act="meal-suggest" data-m="${key}">${icon('shuffle', 16)} Pick for me</button></div>${ui.meal && ui.meal[key] ? `<p class="pick">${esc(ui.meal[key])}</p>` : ''}<div class="chips">${(data.meals[key] || []).map((m, i) => `<span class="mchip">${esc(m)}<button data-act="meal-del" data-m="${key}" data-i="${i}" aria-label="Remove ${esc(m)}">${icon('x', 14)}</button></span>`).join('')}</div><form class="add-row" data-meal-form="${key}"><input maxlength="60" placeholder="Add a ${label.toLowerCase()} idea" aria-label="Add a ${label.toLowerCase()} idea"><button class="btn small" type="submit">Add</button></form></div>`).join('')}</div>
  <details class="wk" data-key="fuel" ${ui.open.has('fuel') ? 'open' : ''}><summary><div><div class="eyebrow">Fuel &amp; recover</div><h3>Care that supports a strong body</h3></div><span class="state">Read</span></summary><div class="wk-body"><p>Eat regularly enough to feel supported. Build satisfying meals from foods you enjoy: a protein food, a carbohydrate, produce when available, and fats or sauces that make it satisfying. The balance can happen across the day or week; no meal needs to be perfect.</p><p style="margin-top:8px">After a session, have your next normal meal or snack when it suits you. Rest, sleep and easy movement are part of training. Your body needs enough food and recovery to adapt.</p><div class="detail"><b>A gentle check-in</b><p>What would help me feel nourished and steady today?</p></div></div></details>
  <p class="safety">Stop for sharp or unusual pain. If you have an injury or health condition, are pregnant or recently postpartum, ask a qualified professional for advice tailored to you. Body-fat percentage is not a score in this app; a suitable range depends on the individual and belongs in a conversation with a clinician if medically relevant.</p>`;
}

/* plan */
function renderPlan() {
  const ids = planIds(), all = questList(), inPlan = new Set(ids), xp = ids.reduce((n, id) => n + (all.find(q => q.id === id)?.xp || 0), 0);
  const row = (q, i) => `<li class="plan-row"><span class="num ${i < 3 ? 'tiny' : ''}" title="${i < 3 ? 'Shown on Tiny days' : ''}">${i + 1}</span><span class="task-text"><b>${esc(q.name)}</b><small>${q.pillar}<span class="xpt"> · +${q.xp} XP</span></small></span><select data-act="slot" data-id="${q.id}" aria-label="Time of day for ${esc(q.name)}">${slotOptions(q.slot)}</select>${i > 0 ? `<button class="icon-btn sm" data-act="plan-up" data-id="${q.id}" aria-label="Move up">${icon('up', 16)}</button>` : ''}<button class="icon-btn sm" data-act="plan-remove" data-id="${q.id}" aria-label="Remove from my day">${icon('x', 16)}</button></li>`;
  return `
  <div class="page-head"><div class="eyebrow">Design your day</div><h1>My plan</h1><p>Fewer, better things beat a long list. Choose what your day is made of; you can change it any time.</p></div>
  <div class="presets">${Object.entries(PRESET_INFO).map(([k, [t]]) => `<button class="btn ghost small" data-act="preset" data-p="${k}">${t}</button>`).join('')}</div>
  <p class="hint" style="margin-top:8px">${Object.values(PRESET_INFO).map(v => v[1]).join(' ')}</p>
  <div class="row-between"><h2 class="sec">In my day <span class="badge">${ids.length}<span class="xpt"> · ${xp} XP</span></span></h2></div>
  <p class="sec-sub">The first three are your <b>Tiny day</b>. Use ↑ to promote the ones that matter most. Choose the time of day each one appears.</p>
  <ul class="tasks">${ids.map((id, i) => row(all.find(q => q.id === id), i)).join('') || '<p class="empty">Nothing yet. Choose one below.</p>'}</ul>
  <div class="row-between"><h2 class="sec">Library</h2><button class="btn small" data-act="custom-add">${icon('plus', 16)} Create your own</button></div>
  ${Object.entries(PILLARS).map(([p, v]) => { const qs = all.filter(q => q.pillar === p && !q.oneOff); return `<div class="pillar-h">${icon(v.icon, 24)}<h3>${p}</h3><small>${v.desc}</small></div>${qs.map(q => `<div class="plan-row"><span class="task-text"><b>${esc(q.name)}</b><small>${esc(q.sub)}<span class="xpt"> · +${q.xp} XP</span></small></span>${q.custom ? `<button class="icon-btn sm" data-act="custom-edit" data-id="${q.id}" aria-label="Edit">${icon('edit', 16)}</button><button class="icon-btn sm" data-act="custom-del" data-id="${q.id}" aria-label="Delete">${icon('x', 16)}</button>` : ''}${inPlan.has(q.id) ? `<span class="badge">In my day</span>` : `<button class="btn ghost small" data-act="plan-add" data-id="${q.id}">${icon('plus', 14)} Add</button>`}</div>`).join('')}`; }).join('')}
  <p class="safety xpt">Scoring is unchanged: the full original checklist is 235 XP, and finishing everything in <i>your</i> plan earns +50 bonus XP once a day. Nothing is ever taken away for a missed day.</p>`;
}

/* journal */
function renderJournal() {
  const t = today(), j = data.journal[t] || {}, entries = Object.entries(data.journal).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10);
  return `
  <div class="page-head"><div class="eyebrow">A page that belongs to you</div><h1>Reflections</h1><p>A few lines is plenty. Writing things down helps you notice what’s working.</p></div>
  <div class="card"><div class="row-between"><h2 style="font-size:1.5rem">${pretty(t)}</h2><span class="hint">Private on this device<span class="saved" id="jSaved">· saved</span></span></div>
    <label class="lbl">How are you arriving?</label>
    <div class="moods" role="group">${MOODS.map(([m, e]) => `<button class="mood ${j.mood === m ? 'on' : ''}" data-act="journal-mood" data-mood="${m}" aria-pressed="${j.mood === m}"><span>${e}</span>${m}</button>`).join('')}</div>
    <label class="lbl" for="jText">What would you like to remember?</label>
    <div class="prompt" id="jPrompt">${PROMPTS[(new Date().getDate() + ui.prompt) % PROMPTS.length]}</div>
    <textarea class="inp" id="jText" rows="6" placeholder="A win, a feeling, something your body did for you…">${esc(j.text || '')}</textarea>
    <p style="margin-top:10px"><button class="text-btn" data-act="prompt">Another prompt ↻</button></p></div>
  <h2 class="sec">Recent pages</h2>
  ${entries.length ? entries.map(([d, e]) => `<div class="entry"><b>${e.mood ? esc(e.mood) + ' day' : 'A page to keep'}</b><small>${pretty(d)}</small><p>${esc(e.text || 'A quiet check-in.')}</p></div>`).join('') : '<p class="empty">Your first page is waiting whenever you are ready.</p>'}`;
}

/* journey */
function renderJourney() {
  const started = !!data.challengeStart, done = new Set(data.challengeDone), count = done.size;
  const ach = [
    ['sunrise', 'First bloom', 'Complete your first quest', totalQuestXP() > 0],
    ['today', 'Seven sunrises', 'Reach a seven-day run', streak() >= 7],
    ['gem', 'Pearl keeper', 'Gather 10 pearls', availablePearls() >= 10],
    ['check', 'Whole plan', 'Finish everything in your plan', data.bonusEvents.some(e => ['Whole plan', 'Every core quest', 'Perfect Glow Day'].includes(e.label))],
    ['moon', 'Holy Hour', 'Complete your Holy Hour', Object.keys(data.routineChecks).some(k => k.endsWith(':holy') && data.routines.holy.steps.every(s => (data.routineChecks[k] || []).includes(s.id)))],
    ['journey', '21 gentle days', 'Finish the 21-day journey', count >= 21],
    ['reflect', 'Words to keep', 'Save a reflection', Object.keys(data.journal).length > 0],
    ['rituals', 'A new level', 'Reach Siren in Bloom', levelInfo().i >= 3]
  ];
  const shownAch = data.settings.calm ? ach.filter(a => !['Pearl keeper', 'A new level'].includes(a[1])) : ach;
  return `
  <div class="page-head"><div class="eyebrow">21 days of self-enchantment</div><h1>A little closer to yourself</h1><p>Twenty-one small invitations. They don’t need to be in order or on consecutive days; your pace is the right pace.</p></div>
  <div class="card hero"><div class="orbit">${count}</div><div style="flex:1;min-width:200px"><div class="eyebrow">Your journey</div><h2>${started ? `Day ${Math.min(21, count + 1)} of your becoming` : 'Begin whenever you are ready'}</h2><p class="hint">${started ? `Started ${pretty(data.challengeStart)}.` : 'Tap any day to begin.'}</p><div class="bar"><i style="width:${count / 21 * 100}%"></i></div><small class="hint">${count} / 21 days</small></div>${started ? '' : '<button class="btn" data-act="challenge-start">Begin my journey</button>'}</div>
  <div class="days">${CHALLENGE.map((p, i) => `<button class="day ${done.has(i) ? 'done' : ''}" data-act="challenge" data-i="${i}" aria-pressed="${done.has(i)}"><b>Day ${i + 1}</b>${done.has(i) ? `<span class="tick">${icon('check', 18)}</span>` : ''}<p>${p}</p></button>`).join('')}</div>
  <h2 class="sec">Little stars you’ve gathered</h2><div class="ach">${shownAch.map(a => `<div class="a ${a[3] ? 'on' : ''}">${icon(a[0], 26)}<div><b>${a[1]}</b><small>${a[3] ? 'Gathered with care' : a[2]}</small></div></div>`).join('')}</div>`;
}

/* reviews */
function renderReviews() {
  const t = today(), weekly = ui.review === 'weekly', start = weekly ? weekStart() : monthStart();
  const dates = []; for (let d = start; d <= t; d = addDays(d, 1)) dates.push(d);
  const act = dates.filter(d => getLog(d).done.length > 0), xp = dates.reduce((s, d) => s + questPoints(d) + dailyBonus(d), 0), qn = act.reduce((s, d) => s + getLog(d).done.length, 0);
  const byId = {}; questList().forEach(q => byId[q.id] = q);
  const counts = Object.fromEntries(Object.keys(PILLARS).map(p => [p, 0]));
  act.forEach(d => getLog(d).done.forEach(id => { const q = byId[id]; if (q && counts[q.pillar] != null) counts[q.pillar]++; }));
  const maxC = Math.max(1, ...Object.values(counts));
  const water = dates.map(d => data.vitals[d]?.water).filter(x => x != null), sleep = dates.map(d => data.vitals[d]?.sleep).filter(x => x != null);
  const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1).replace(/\.0$/, '') : '–';
  const planN = Math.max(1, planIds().length);
  let chart;
  if (weekly) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i)), vals = days.map(d => d <= t ? questPoints(d) : 0), mx = Math.max(1, ...vals);
    chart = `<div class="bars" role="img" aria-label="XP per day">${days.map((d, i) => `<div class="bar-col"><i style="height:${vals[i] / mx * 100}%;${vals[i] ? '' : 'opacity:.25'}"></i><span>${'MTWTFSS'[i]}</span></div>`).join('')}</div>`;
  } else {
    const lead = dow(start), cells = dates.map(d => { const n = getLog(d).done.length, l = n >= planN ? 3 : n >= planN / 2 ? 2 : n > 0 ? 1 : 0; return `<i class="${l ? 'l' + l : ''}" title="${d}">${+d.slice(8)}</i>`; });
    chart = `<div class="heat">${'<span></span>'.repeat(lead)}${cells.join('')}</div>`;
  }
  const low = Object.entries(counts).sort((a, b) => a[1] - b[1])[0], suggestion = act.length ? questList().find(q => q.pillar === low[0] && !planIds().includes(q.id) && !q.oneOff) : null;
  const key = ui.review + ':' + start, obj = data.reviews[key] || {};
  return `
  <div class="page-head"><div class="eyebrow">Pause, notice, celebrate</div><h1>Your reviews</h1><p>A review isn’t a report card. It’s a moment to see what’s working and adjust your plan.</p></div>
  <div class="tabs"><button class="tab ${weekly ? 'on' : ''}" data-act="review-tab" data-p="weekly">This week</button><button class="tab ${!weekly ? 'on' : ''}" data-act="review-tab" data-p="monthly">This month</button></div>
  <div class="stats"><div class="stat"><b>${act.length}</b><small>days you showed up</small></div><div class="stat xpt"><b>${xp}</b><small>XP gathered</small></div><div class="stat"><b>${qn}</b><small>promises kept</small></div><div class="stat"><b>${avg(water)} · ${avg(sleep)}</b><small>avg water · sleep (h)</small></div></div>
  <div class="card"><div class="eyebrow">${weekly ? 'Activity by day' : 'Your month'}</div>${chart}</div>
  <div class="card"><div class="eyebrow">Where your care went</div>${Object.entries(PILLARS).map(([p, v]) => `<div class="pbar"><span style="display:flex;gap:8px;align-items:center;color:var(--accent)">${icon(v.icon, 18)}<span style="color:var(--ink)">${p}</span></span><div class="bar"><i style="width:${counts[p] / maxC * 100}%"></i></div><small>${counts[p]}</small></div>`).join('')}
    ${suggestion ? `<div class="insight"><p><b>${low[0]}</b> got the least attention. Want to try “${esc(suggestion.name)}”?</p><button class="btn small" data-act="plan-add" data-id="${suggestion.id}" data-back="reviews">Add to my plan</button></div>` : ''}</div>
  <div class="card"><div class="eyebrow">A moment to notice</div>
    <label class="lbl" for="rEasy">What felt easiest to return to?</label><textarea class="inp" id="rEasy" rows="2" data-review-field="easy">${esc(obj.easy || '')}</textarea>
    <label class="lbl" for="rRoom">What would you like more room for?</label><textarea class="inp" id="rRoom" rows="2" data-review-field="room">${esc(obj.room || '')}</textarea>
    <label class="lbl" for="rProud">What are you proud of?</label><textarea class="inp" id="rProud" rows="2" data-review-field="proud">${esc(obj.proud || '')}</textarea>
    <p class="hint" style="margin-top:8px">Saves automatically.</p></div>`;
}

/* shop */
function renderRewards() {
  const p = availablePearls();
  return `
  <div class="page-head"><div class="eyebrow">The Pearl shop</div><h1>Little treats, lovingly earned</h1><p>Pearls celebrate your effort. Your wellbeing never has to be earned; these are playful extras that make your rituals feel special.</p></div>
  <div class="card wallet">${icon('gem', 34)}<div><strong>${p}</strong> <span class="hint">pearls</span></div><span class="hint" style="margin-left:auto">1 pearl for every 25 quest XP.<br>Bonus XP is celebrated separately.</span></div>
  <div class="row-between"><h2 class="sec">Rewards for the shelf</h2><button class="btn small" data-act="reward-add">${icon('plus', 16)} Add a treat</button></div>
  <div class="shop">${data.rewards.map(r => `<article class="item"><div class="em">${esc(r.emoji)}</div><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p><div class="foot"><b>✧ ${r.cost}</b><span>${String(r.id).startsWith('reward-') ? `<button class="text-btn" data-act="reward-del" data-id="${r.id}">Remove</button>` : ''}<button class="btn ghost small" data-act="buy" data-id="${r.id}">Choose</button></span></div></article>`).join('')}</div>
  <h2 class="sec">Redeemed treats</h2>${data.redeemed.length ? data.redeemed.slice().reverse().map(r => `<div class="redeemed">${esc(r.emoji)} <b>${esc(r.name)}</b><small>${pretty(r.date)} · ${r.cost} pearls</small></div>`).join('') : '<p class="empty">Your treat memories will live here.</p>'}`;
}

/* science */
const SCIENCE = [
  { t: 'Missing a day barely matters', s: 'Moderate', c: 'In a study of 96 volunteers forming a daily habit, the median time to “automaticity” was about 66 days (range 18–254), and missing a single opportunity did not materially affect the process.', a: 'No punishing streaks. Missed days are just quiet days, and a “never miss twice” nudge brings you back.', cav: 'Small, early study of mostly students. Treat 66 days as a rough median, not a deadline.', link: ['Lally et al., 2010', 'https://doi.org/10.1002/ejsp.674'] },
  { t: 'Tie it to a cue: “When X, I will Y”', s: 'Strong', c: 'A meta-analysis of 94 tests found that specifying when and where you will act (implementation intentions) improves goal attainment, with a medium-to-large effect (d ≈ 0.65).', a: 'Every ritual has a cue (“After I drink my water…”) and an optional calendar reminder.', cav: 'd is a standardised effect, not “65% more likely”. Effects are smaller for very complex goals.', link: ['Gollwitzer & Sheeran, 2006', 'https://doi.org/10.1016/S0065-2601(06)38002-1'] },
  { t: 'Fresh starts help', s: 'Moderate', c: 'People are more likely to pursue goals after “temporal landmarks” such as a new week, month or birthday, because the past feels like a different period.', a: 'Weekly rhythm resets every Monday, and after a gap the app offers a fresh page instead of a guilt trip.', cav: 'Mostly observational data plus experiments; the size varies by context.', link: ['Dai, Milkman & Riis, 2014', 'https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf'] },
  { t: 'Small wins fuel motivation', s: 'Moderate', c: 'A diary study of 238 employees (~12,000 entries) found that perceived progress, even small, was the strongest driver of a good “inner work life”.', a: 'One “Next up” card, a progress bar and a tiny-day mode make progress visible and quick.', cav: 'Workplace research, not fitness research; applied here by analogy.', link: ['Amabile & Kramer, HBS', 'https://hbswk.hbs.edu/item/6685.html'] },
  { t: 'Choice and ownership last longer', s: 'Strong', c: 'Self-determination theory shows motivation is more durable when people feel autonomy, competence and connection, rather than pressure.', a: 'You choose the plan, the times, the steps, the meals, the colours and the pace. Nothing is mandatory.', cav: 'A broad framework; effects differ by person and behaviour.', link: ['Ryan & Deci, 2000', 'https://doi.org/10.1037/0003-066X.55.1.68'] },
  { t: 'Be kind after a slip', s: 'Moderate', c: 'Self-compassion is linked to taking responsibility and trying again, while harsh self-criticism is linked to giving up.', a: 'Gentle wording throughout, no point loss, and a support space for hard moments.', cav: 'Much of the evidence is correlational.', link: ['Review: self-compassion', 'https://pubmed.ncbi.nlm.nih.gov/33749936/'] },
  { t: 'Strength training, twice a week', s: 'Strong', c: 'A meta-analysis found training each muscle group at least twice a week produced greater muscle gains than once. Later work suggests total weekly volume is what really matters.', a: 'Two simple full-body sessions with options for home, bands, weights or gym.', cav: 'Frequency and volume are tangled; two sessions is a practical way to reach enough volume.', link: ['Schoenfeld et al., 2016', 'https://pubmed.ncbi.nlm.nih.gov/27102172/'] },
  { t: 'Daily sunscreen protects skin', s: 'Strong', c: 'In a randomised trial of 903 adults followed for 4.5 years, daily sunscreen users showed less skin ageing than people who used it only when they chose.', a: 'SPF is part of the very first skin quest and the morning ritual.', cav: 'Measured on hand skin texture in a sunny Australian population.', link: ['Hughes et al., 2013', 'https://doi.org/10.7326/0003-4819-158-11-201306040-00002'] },
  { t: 'Eat enough to support training', s: 'Strong', c: 'Persistently low energy availability harms health and performance, which is why nourishment comes before any “diet” thinking here. No tracking, no food rules.', a: 'Meal ideas are personal and flexible; there is no calorie or weight tracking.', cav: 'Needs differ. A dietitian can tailor advice, especially with a medical condition.', link: ['IOC consensus (BJSM)', 'https://bjsm.bmj.com/content/57/17/1073'] },
  { t: 'Flexible movement beats perfect plans', s: 'Strong', c: 'The WHO recommends accumulating regular moderate activity across the week, plus muscle-strengthening on two or more days, with flexibility in how you do it.', a: 'A weekly movement menu you can edit, and rest days built in.', cav: 'Guidelines are population-level; individual needs vary.', link: ['WHO physical activity', 'https://www.who.int/initiatives/behealthy/physical-activity'] }
];
function renderScience() {
  return `
  <div class="page-head"><div class="eyebrow">Evidence behind the design</div><h1>Why it works</h1><p>Every feature here maps to published research. Strength labels reflect how robust the evidence is, not how big your results will be.</p></div>
  <div class="callout"><b>An honest note.</b> No app or study can guarantee a glow-up. What research <i>can</i> do is tell us which habits are most likely to stick and which beauty and health basics have the strongest support. This system is built around those, so your odds are as good as they can be. Consistency beats intensity.</div>
  ${SCIENCE.map(x => `<article class="card sci"><div class="eyebrow">Evidence <span class="strength">${x.s}</span></div><h3>${x.t}</h3><p class="claim">${x.c}</p><p class="app">In the app: ${x.a}</p><p class="cav">Caveat: ${x.cav} · <a href="${x.link[1]}" target="_blank" rel="noopener">${x.link[0]} ↗</a></p></article>`).join('')}
  <h2 class="sec">More reading</h2>
  <ul class="links"><li><a href="https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/" target="_blank" rel="noopener">NHS: gentle breathing for stress</a></li><li><a href="https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/tackling-your-worries/" target="_blank" rel="noopener">NHS: worry time and problem solving</a></li><li><a href="https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101" target="_blank" rel="noopener">American Academy of Dermatology: gentle cleansing</a></li><li><a href="https://acsm.org/science-spotlight-acsm-releases-new-position-stand-on-resistance-training/" target="_blank" rel="noopener">ACSM: resistance-training position stand</a></li><li><a href="https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/" target="_blank" rel="noopener">NHS Eatwell Guide</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/28698222/" target="_blank" rel="noopener">Protein supplementation and resistance training: systematic review</a></li><li><a href="https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety" target="_blank" rel="noopener">NCCIH: mindfulness benefits and limits</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/25965276/" target="_blank" rel="noopener">Meta-analysis: if-then plans and goal follow-through</a></li><li><a href="https://www.nice.org.uk/guidance/cg113/chapter/Recommendations" target="_blank" rel="noopener">NICE: anxiety care and support options</a></li></ul>
  <p class="safety">This app offers self-care prompts and general information. It is not medical advice, diagnosis or treatment.</p>`;
}

/* settings */
function renderSettings() {
  const s = data.settings, li = levelInfo();
  return `
  <div class="page-head"><div class="eyebrow">Make it yours</div><h1>Settings</h1><p>Everything saves as you change it.</p></div>
  <div class="card"><h2 style="font-size:1.5rem">Personalise</h2>
    <label class="lbl" for="setName">What should we call you?</label><input class="inp" id="setName" type="text" maxlength="30" value="${esc(data.name || '')}" placeholder="Lovely">
    <label class="lbl">Theme</label>
    <div class="swatches">${Object.entries(THEMES).map(([k, [n, c1, c2]]) => `<button class="sw-btn ${s.theme === k ? 'on' : ''}" data-act="theme" data-t="${k}" aria-pressed="${s.theme === k}"><i style="--c1:${k === 'custom' ? s.custom.surround : c1};--c2:${k === 'custom' ? s.custom.paper : c2}"></i>${n}</button>`).join('')}</div>
    ${s.theme === 'custom' ? `<div class="colors"><div><label class="lbl" for="cPaper">Paper</label><input type="color" id="cPaper" data-color="paper" value="${s.custom.paper}"></div><div><label class="lbl" for="cSurround">Background</label><input type="color" id="cSurround" data-color="surround" value="${s.custom.surround}"></div><div><label class="lbl" for="cAccent">Accent</label><input type="color" id="cAccent" data-color="accent" value="${s.custom.accent}"></div></div>` : ''}
    <label class="lbl">Text size</label>
    <div class="seg">${[['normal', 'Comfortable'], ['large', 'Larger'], ['xl', 'Largest']].map(([k, l]) => `<button class="${s.textScale === k ? 'on' : ''}" data-act="text" data-t="${k}" aria-pressed="${s.textScale === k}">${l}</button>`).join('')}</div>
    <div class="toggle" style="margin-top:16px"><div><b>Calm mode</b><small>Hide points, levels and pearls</small></div><input class="sw" type="checkbox" data-set="calm" ${s.calm ? 'checked' : ''}></div><div class="toggle"><div><b>Compact spacing</b><small>Fit more on screen</small></div><input class="sw" type="checkbox" data-set="compact" ${s.compact ? 'checked' : ''}></div></div>
  <div class="card"><h2 style="font-size:1.5rem">Rhythm</h2>
    <label class="lbl" for="setTarget">Days per week I’m aiming for</label><select class="inp" id="setTarget">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option${n === data.weeklyTarget ? ' selected' : ''}>${n}</option>`).join('')}</select><p class="hint" style="margin-top:6px">Five is a strong, realistic default. Rest days are part of it.</p>
    <label class="lbl" for="setWater">Daily water goal (glasses)</label><select class="inp" id="setWater">${[4, 5, 6, 7, 8, 9, 10, 12].map(n => `<option${n === data.waterTarget ? ' selected' : ''}>${n}</option>`).join('')}</select>
    <div class="toggle" style="margin-top:12px"><div><b>Nightly intention</b><small>After your evening ritual time, ask how you want tomorrow to feel</small></div><input class="sw" type="checkbox" data-set="nightPrompt" ${s.nightPrompt ? 'checked' : ''}></div>
    <div class="toggle"><div><b>Show my run of days</b><small>Counts active days in a row, with a 7-day bonus. Optional.</small></div><input class="sw" type="checkbox" data-set="streak" ${s.streak ? 'checked' : ''}></div></div>
  <div class="card"><h2 style="font-size:1.5rem">Ritual times</h2><p class="hint">Used for the cue on each ritual and for calendar reminders.</p>
    ${Object.entries(data.routines).map(([k, r]) => `<div class="time-row"><label for="t-${k}">${r.title}</label><input class="inp inp-sm" type="time" id="t-${k}" data-time="${k}" value="${r.time || ''}"></div>`).join('')}
    <div class="time-row"><label for="t-bed">Bedtime <span class="hint">(wind-down reminder 45 min before)</span></label><input class="inp inp-sm" type="time" id="t-bed" data-bedtime value="${data.bedtime || ''}"></div>
    <button class="btn ghost small" data-act="ics">${icon('download', 16)} Add to calendar</button></div>
  <div class="card xpt"><h2 style="font-size:1.5rem">Your level</h2><div class="level-card" style="margin-top:10px"><b>${li.name}</b><small>${li.xp.toLocaleString()} XP${li.next === Infinity ? '' : ` · ${(li.next - li.xp).toLocaleString()} to the next level`}</small><div class="bar"><i style="width:${li.pct}%"></i></div></div>
    <div class="ladder"><b>Seven-level ladder</b>${LEVELS.map(l => `<span>${l[0]} · ${l[1].toLocaleString()} XP</span>`).join('')}</div>
    <p class="hint" style="margin-top:10px">The original quest values and the 235 XP core checklist are preserved. Level thresholds, Pearl conversion and rewards are reconstructed defaults. XP is counted once per completion; no missed day removes XP or Pearls.</p></div>
  <div class="card"><h2 style="font-size:1.5rem">Your diary &amp; privacy</h2><p class="hint">Everything is stored only in this browser on this device. Save backups, and <b>add this page to your Home Screen</b> (Share → Add to Home Screen) so iPad Safari doesn’t clear it after inactivity.</p>
    <p class="hint" style="margin-top:6px">Last backup: ${data.lastBackup ? pretty(data.lastBackup) : 'never'}</p>
    <div class="settings-actions"><button class="btn ghost" data-act="export">${icon('download', 18)} Save a backup</button><button class="btn ghost" data-act="import">Restore from a backup</button><button class="btn danger" data-act="reset">Start fresh</button></div>
    <p class="hint">Starting fresh permanently clears everything saved in this browser.</p></div>
  <div class="card"><button class="btn ghost" data-act="onboard">Re-run the quick setup</button></div>`;
}

/* ───────────── render ───────────── */
const RENDERERS = { today: renderToday, rituals: renderRituals, plan: renderPlan, journal: renderJournal, journey: renderJourney, reviews: renderReviews, rewards: renderRewards, science: renderScience, settings: renderSettings };
function renderChrome() {
  $$('[data-icon]').forEach(el => { if (!el.firstChild) el.innerHTML = icon(el.dataset.icon, +el.dataset.size || 20); });
  $('#topDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  $('#pearlCount').textContent = availablePearls();
  $('#streakChip').textContent = `${weekCount()}/${data.weeklyTarget} this week`;
  const li = levelInfo();
  $('#levelCard').innerHTML = `<b>${li.name}</b><small>${li.xp.toLocaleString()} XP</small><div class="bar"><i style="width:${li.pct}%"></i></div>`;
  $$('.nav-item,.tabbar button[data-page]').forEach(b => { const on = b.dataset.page === ui.page; b.classList.toggle('active', on); b.classList.toggle('on', on); if (b.dataset.page) b.setAttribute('aria-current', on ? 'page' : 'false'); });
  const bottom = ['today', 'rituals', 'plan', 'journal'];
  $('#moreBtn').classList.toggle('on', !bottom.includes(ui.page));
  applyTheme();
}
function render(flag) {
  ui.celebrate = flag === 'celebrate';
  const page = $('#page-' + ui.page), y = window.scrollY;
  page.innerHTML = RENDERERS[ui.page]();
  $$('.page').forEach(p => p.classList.toggle('active', p === page));
  renderChrome();
  if (flag) window.scrollTo(0, y);
}
function nav(page, { scroll = true } = {}) {
  if (!RENDERERS[page]) page = 'today';
  ui.page = page; setMenu(false); render();
  try { history.replaceState(null, '', '#' + page); } catch {}
  if (scroll) window.scrollTo({ top: 0 });
}

/* ───────────── modals ───────────── */
function cueModal() {
  const r = data.routines[ui.routine];
  openModal({ title: r.title, sub: 'Link it to something you already do. This is the single most useful thing you can set.', body: `<label class="lbl" for="mCue">When will you do it?</label><input class="inp" id="mCue" name="cue" type="text" maxlength="80" value="${esc(r.cue)}" placeholder="After I brush my teeth"><label class="lbl" for="mTime">Time (optional, for calendar reminders)</label><input class="inp" id="mTime" name="time" type="time" value="${r.time || ''}">`, onSubmit: f => { r.cue = String(f.get('cue')).trim() || r.cue; r.time = f.get('time') || ''; save(); render(); } });
}
function customModal(q) {
  openModal({ title: q ? 'Edit your quest' : 'A little ritual, chosen by you', body: `<label class="lbl" for="qName">Name</label><input class="inp" id="qName" name="name" type="text" maxlength="60" value="${esc(q?.name || '')}" placeholder="A small thing that feels like care"><label class="lbl" for="qPillar">Pillar</label><select class="inp" id="qPillar" name="pillar">${pillarOptions(q?.pillar)}</select><label class="lbl" for="qSlot">Time of day</label><select class="inp" id="qSlot" name="slot">${slotOptions(q?.slot || 'day')}</select><label class="lbl" for="qXp">XP (5–25)</label><input class="inp" id="qXp" name="xp" type="number" min="5" max="25" value="${q?.xp || 10}">`,
    onSubmit: f => { const name = String(f.get('name')).trim(); if (!name) { toast('Give it a name first ♡'); return false; } const v = { name, pillar: f.get('pillar'), slot: f.get('slot'), xp: Math.max(5, Math.min(25, +f.get('xp') || 10)) };
      if (q) Object.assign(data.customQuests.find(c => c.id === q.id), v); else { const id = uid('custom'); data.customQuests.push({ id, ...v }); data.plan.push(id); }
      save(); render(); toast(q ? 'Updated ✿' : 'Added to your plan ✿'); } });
}
function rewardModal() {
  openModal({ title: 'Add a little treat', body: `<label class="lbl" for="rName">What would feel lovely?</label><input class="inp" id="rName" name="name" type="text" maxlength="40"><label class="lbl" for="rEmoji">Emoji</label><input class="inp" id="rEmoji" name="emoji" type="text" maxlength="4" value="🎀"><label class="lbl" for="rCost">Pearl cost (1–100)</label><input class="inp" id="rCost" name="cost" type="number" min="1" max="100" value="10"><label class="lbl" for="rDesc">A note about it</label><input class="inp" id="rDesc" name="desc" type="text" maxlength="100">`,
    onSubmit: f => { const name = String(f.get('name')).trim(); if (!name) { toast('Name your treat first ♡'); return false; } data.rewards.push({ id: uid('reward'), name, emoji: f.get('emoji') || '🎀', cost: Math.max(1, Math.min(100, +f.get('cost') || 10)), desc: String(f.get('desc')).trim() || 'A little treat chosen by you.' }); save(); render(); } });
}
function moveModal() {
  openModal({ title: 'Your movement week', sub: 'Write whatever suits you. Rest is a perfectly good answer.', body: data.movement.map((m, i) => `<label class="lbl" for="mv${i}">${m.d}</label><input class="inp" id="mv${i}" name="m${i}" type="text" maxlength="40" value="${esc(m.t)}">`).join(''), onSubmit: f => { data.movement.forEach((m, i) => m.t = String(f.get('m' + i)).trim() || m.t); save(); render(); } });
}
function onboardModal(first) {
  openModal({ title: first ? 'Welcome to your glow-up' : 'Quick setup', sub: 'Thirty seconds. You can change all of this later.', cancel: first ? 'Skip for now' : 'Cancel',
    body: `<label class="lbl" for="oName">What should we call you?</label><input class="inp" id="oName" name="name" type="text" maxlength="30" value="${esc(data.name || '')}">
    <label class="lbl">How big should a day be?</label><div class="radio-cards">${Object.entries(PRESET_INFO).map(([k, [t, d]]) => `<label class="rc"><input type="radio" name="preset" value="${k}" ${k === 'gentle' ? 'checked' : ''}><b>${t}</b><small>${d}</small></label>`).join('')}</div>
    <label class="lbl" for="oMorn">Morning ritual time</label><input class="inp" id="oMorn" name="morn" type="time" value="${data.routines.morning.time || '07:30'}">
    <label class="lbl" for="oEve">Evening ritual time</label><input class="inp" id="oEve" name="eve" type="time" value="${data.routines.evening.time || '21:00'}"><label class="toggle" style="margin-top:14px"><span><b>Calm mode</b><small>Hide points, levels and pearls. Just the routine.</small></span><input class="sw" type="checkbox" name="calm" ${data.settings.calm ? 'checked' : ''}></label><p class="hint" style="margin-top:10px">Tip: on iPad, tap Share → Add to Home Screen so the app opens like any other and keeps your diary safe.</p>`,
    submit: 'Begin', onSubmit: f => { data.name = String(f.get('name')).trim() || 'lovely'; data.plan = [...PRESETS[f.get('preset')], ...data.customQuests.map(q => q.id)]; data.routines.morning.time = f.get('morn') || ''; data.routines.evening.time = f.get('eve') || ''; data.settings.calm = f.get('calm') === 'on'; data.onboarded = true; save(); render(); toast(`Welcome, ${data.name}. Start with the first card ♡`); } });
  if (first) $('#modalCancel').onclick = () => { data.onboarded = true; save(); closeModal(); };
}
function icsDownload() {
  const t = today().replace(/-/g, ''), stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, ''), esc2 = s => s.replace(/([,;\\])/g, '\\$1');
  const ev = Object.entries(data.routines).filter(([, r]) => r.time).map(([k, r]) => `BEGIN:VEVENT\r\nUID:siren-${k}@siren-system\r\nDTSTAMP:${stamp}\r\nDTSTART:${t}T${r.time.replace(':', '')}00\r\nDURATION:PT${k === 'holy' ? '30M' : '15M'}\r\nRRULE:FREQ=DAILY\r\nSUMMARY:${esc2(r.title)}\r\nDESCRIPTION:${esc2(r.cue)}\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${esc2(r.title)}\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT`);
  if (data.bedtime) { const [bh, bm] = data.bedtime.split(':').map(Number), m = ((bh * 60 + bm - 45) % 1440 + 1440) % 1440; ev.push(`BEGIN:VEVENT\r\nUID:siren-winddown@siren-system\r\nDTSTAMP:${stamp}\r\nDTSTART:${t}T${pad(Math.floor(m / 60))}${pad(m % 60)}00\r\nDURATION:PT45M\r\nRRULE:FREQ=DAILY\r\nSUMMARY:Wind down\r\nDESCRIPTION:Screens down, lights low. Sleep at ${data.bedtime}.\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Wind down\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT`); }
  if (!ev.length) { toast('Choose a time for a ritual first (Rituals → Change).'); return; }
  download('siren-rituals.ics', `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Siren System//EN\r\n${ev.join('\r\n')}\r\nEND:VCALENDAR\r\n`, 'text/calendar');
  toast('Open the file to add daily reminders to your calendar ✿');
}

/* ───────────── events ───────────── */
const ACTIONS = {
  toggle: el => toggleQuest(el.dataset.id),
  'del-task': el => { const t = today(); data.oneOffTasks[t] = (data.oneOffTasks[t] || []).filter(q => q.id !== el.dataset.id); const l = getLog(t); l.done = l.done.filter(x => x !== el.dataset.id); save(); render(); },
  mood: el => { const j = data.journal[today()] || (data.journal[today()] = {}); j.mood = j.mood === el.dataset.mood ? '' : el.dataset.mood; j.updated = new Date().toISOString(); save(); render(); },
  'journal-mood': el => ACTIONS.mood(el),
  water: el => { const t = today(), v = data.vitals[t] || (data.vitals[t] = {}); v.water = Math.max(0, Math.min(20, (v.water || 0) + +el.dataset.d)); save(); render('keep'); if (v.water === data.waterTarget && +el.dataset.d > 0) toast('Hydration goal reached 💧'); },
  sleep: el => { const t = today(), v = data.vitals[t] || (data.vitals[t] = {}); v.sleep = Math.max(0, Math.min(14, (v.sleep == null ? 7.5 : v.sleep + +el.dataset.d))); save(); render('keep'); },
  'intent-edit': el => intentionModal(el.dataset.d),
  tiny: () => { data.tiny = !data.tiny; save(); render(); toast(data.tiny ? 'Tiny day on: just your top three.' : 'Showing your full plan.'); },
  goto: el => nav(el.dataset.pageTarget),
  'go-ritual': el => { ui.routine = el.dataset.r; nav('rituals'); },
  support: el => { ui.support = el.dataset.mode; $('#supportDetail').innerHTML = supportDetail(); $$('.opt').forEach(o => o.classList.toggle('on', o === el)); },
  'save-worry': () => { data.supportNotes[today()] = { worry: $('#wWorry').value.trim(), nextStep: $('#wNext').value.trim(), plan: $('#wPlan').value.trim() }; save(); const m = $('#worrySaved'); m.classList.add('show'); setTimeout(() => m.classList.remove('show'), 2200); },
  'tab-routine': el => { ui.routine = el.dataset.r; ui.edit = false; render(); },
  step: el => { const k = today() + ':' + ui.routine, a = data.routineChecks[k] || []; data.routineChecks[k] = a.includes(el.dataset.id) ? a.filter(x => x !== el.dataset.id) : [...a, el.dataset.id]; save(); render('keep'); },
  'edit-routine': () => { ui.edit = !ui.edit; render(); },
  'step-add': () => { data.routines[ui.routine].steps.push({ id: uid('s'), n: 'New step', d: 'Describe it in a few words.' }); save(); render(); },
  'step-del': el => { const r = data.routines[ui.routine]; if (r.steps.length <= 1) return toast('Keep at least one step ♡'); r.steps = r.steps.filter(s => s.id !== el.dataset.id); save(); render(); },
  'reset-routine': () => { delete data.routineChecks[today() + ':' + ui.routine]; save(); render('keep'); },
  'cue-edit': cueModal,
  ics: icsDownload,
  train: el => { const id = el.dataset.w, wk = data.trainingSessions.filter(s => s.date >= weekStart() && s.date <= today()), ex = wk.find(s => s.workout === id); if (ex) data.trainingSessions = data.trainingSessions.filter(s => s !== ex); else data.trainingSessions.push({ date: today(), workout: id }); save(); render('keep'); toast(ex ? 'Session unlogged.' : 'Strength session kept ✿'); },
  'move-edit': moveModal,
  'meal-del': el => { data.meals[el.dataset.m].splice(+el.dataset.i, 1); save(); render('keep'); },
  'meal-suggest': el => { const l = data.meals[el.dataset.m] || []; if (!l.length) return toast('Add an idea first ♡'); ui.meal = ui.meal || {}; ui.meal[el.dataset.m] = l[Math.floor(Math.random() * l.length)]; render('keep'); },
  preset: el => { data.plan = [...PRESETS[el.dataset.p], ...data.customQuests.map(q => q.id).filter(id => !PRESETS[el.dataset.p].includes(id))]; save(); render('keep'); toast(`${PRESET_INFO[el.dataset.p][0]} day set ✿`); },
  'plan-add': el => { if (!data.plan.includes(el.dataset.id)) data.plan.push(el.dataset.id); save(); render('keep'); toast('Added to your day ✿'); },
  'plan-remove': el => { data.plan = data.plan.filter(id => id !== el.dataset.id); save(); render('keep'); },
  'plan-up': el => { const i = data.plan.indexOf(el.dataset.id); if (i > 0) { [data.plan[i - 1], data.plan[i]] = [data.plan[i], data.plan[i - 1]]; save(); render('keep'); } },
  'custom-add': () => customModal(),
  'custom-edit': el => customModal(data.customQuests.find(q => q.id === el.dataset.id)),
  'custom-del': el => { const id = el.dataset.id; if (!confirm('Remove this quest? Past completions of it will be removed too.')) return; data.customQuests = data.customQuests.filter(q => q.id !== id); data.plan = data.plan.filter(x => x !== id); Object.values(data.logs).forEach(l => l.done = l.done.filter(x => x !== id)); save(); render('keep'); },
  prompt: () => { ui.prompt++; $('#jPrompt').textContent = PROMPTS[(new Date().getDate() + ui.prompt) % PROMPTS.length]; },
  'review-tab': el => { ui.review = el.dataset.p; render(); },
  'challenge-start': () => { data.challengeStart = today(); save(); render(); toast('Your first gentle day begins now ♡'); },
  challenge: el => { if (!data.challengeStart) data.challengeStart = today(); const n = +el.dataset.i; data.challengeDone = data.challengeDone.includes(n) ? data.challengeDone.filter(x => x !== n) : [...data.challengeDone, n]; save(); render('keep'); },
  buy: el => { const r = data.rewards.find(x => x.id === el.dataset.id); if (!r) return; if (availablePearls() < r.cost) return toast(`You need ${r.cost - availablePearls()} more pearls for this treat ♡`); data.spentPearls += r.cost; data.redeemed.push({ name: r.name, emoji: r.emoji, cost: r.cost, date: today() }); save(); render('keep'); toast(`${r.name} is yours to enjoy ✨`); },
  'reward-add': rewardModal,
  'reward-del': el => { data.rewards = data.rewards.filter(r => r.id !== el.dataset.id); save(); render('keep'); },
  theme: el => { data.settings.theme = el.dataset.t; save(); render('keep'); },
  text: el => { data.settings.textScale = el.dataset.t; save(); render('keep'); },
  export: exportData,
  import: () => $('#importFile').click(),
  reset: () => { if (confirm('Start fresh? This permanently clears your quests, pearls, reflections and settings saved in this browser. Save a backup first if you might want them.')) { data = blank(); save(); ui.open = null; nav('today'); onboardModal(true); } },
  onboard: () => onboardModal(false),
  mini: el => { data.miniRitual = el.checked; save(); render('keep'); }
};
document.addEventListener('click', e => {
  const pg = e.target.closest('[data-page]');
  if (pg && !e.target.closest('[data-act]')) { e.preventDefault(); return nav(pg.dataset.page); }
  const a = e.target.closest('[data-act]');
  if (a && ACTIONS[a.dataset.act] && a.type !== 'checkbox') { const back = a.dataset.back; ACTIONS[a.dataset.act](a); if (back && a.dataset.act === 'plan-add') nav(back, { scroll: false }); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'mini') return ACTIONS.mini(el);
  if (el.dataset.act === 'slot') { data.slots[el.dataset.id] = el.value; save(); render('keep'); return; }
  if (el.id === 'trainSetup') { data.trainingSetup = el.value; save(); render('keep'); }
  if (el.id === 'setTarget') { data.weeklyTarget = +el.value; save(); renderChrome(); }
  if (el.id === 'setWater') { data.waterTarget = +el.value; save(); }
  if (el.dataset.set) { data.settings[el.dataset.set] = el.checked; save(); renderChrome(); if (el.dataset.set === 'calm') render('keep'); }
  if (el.dataset.bedtime !== undefined) { data.bedtime = el.value; save(); }
  if (el.dataset.time) { data.routines[el.dataset.time].time = el.value; save(); }
  if (el.dataset.color) { data.settings.custom[el.dataset.color] = el.value; save(); applyTheme(); }
  if (el.dataset.field === 'core') { const s = data.routines[ui.routine].steps.find(x => x.id === el.dataset.id); if (s) { s.core = el.checked; save(); } }
  if (el.id === 'importFile' && el.files[0]) {
    const f = el.files[0], rd = new FileReader();
    rd.onload = () => { try { const d = JSON.parse(rd.result); if (!d || d.version !== 2 || typeof d.logs !== 'object') throw 0; if (confirm('Restore this backup? It replaces what is currently saved on this device.')) { data = normalise(d); data.onboarded = true; save(); ui.open = null; nav('settings'); toast('Backup restored ✿'); } } catch { toast('That doesn’t look like a Siren diary backup.'); } el.value = ''; };
    rd.readAsText(f);
  }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'jText') { const t = today(), j = data.journal[t] || (data.journal[t] = {}); j.text = el.value; j.updated = new Date().toISOString(); saveSoon(); clearTimeout(ACTIONS.jt); ACTIONS.jt = setTimeout(() => { const s = $('#jSaved'); if (s) { s.classList.add('show'); setTimeout(() => s.classList.remove('show'), 1600); } }, 700); }
  if (el.id === 'setName') { data.name = el.value.trim() || 'lovely'; saveSoon(); }
  if (el.dataset.reviewField) { const key = ui.review + ':' + (ui.review === 'weekly' ? weekStart() : monthStart()), o = data.reviews[key] || (data.reviews[key] = {}); o[el.dataset.reviewField] = el.value; saveSoon(); }
  if (el.dataset.field === 'n' || el.dataset.field === 'd') { const s = data.routines[ui.routine].steps.find(x => x.id === el.dataset.id); if (s) { s[el.dataset.field] = el.value; saveSoon(); } }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'quickAdd') {
    e.preventDefault(); const inp = $('#quickInput'), name = inp.value.trim(); if (!name) return;
    const t = today(); data.oneOffTasks[t] = [...(data.oneOffTasks[t] || []), { id: 'task-' + t + '-' + Date.now(), name, pillar: 'Wisdom', xp: 10, slot: currentSlot() }];
    save(); ui.open = ui.open || new Set(); ui.open.add('slot:' + currentSlot()); render('keep'); toast(data.settings.calm ? 'Added for today ✨' : 'Added for today · +10 XP when done ✨'); $('#quickInput').focus();
  }
  const mf = e.target.dataset && e.target.dataset.mealForm;
  if (mf) { e.preventDefault(); const v = $('input', e.target).value.trim(); if (!v) return; (data.meals[mf] = data.meals[mf] || []).push(v); save(); render('keep'); $(`[data-meal-form="${mf}"] input`)?.focus(); }
});
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.key && ui.open) { d.open ? ui.open.add(d.dataset.key) : ui.open.delete(d.dataset.key); } }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); setMenu(false); } });
$('#moreBtn').onclick = () => setMenu(!$('#sidebar').classList.contains('open'));
$('#backdrop').onclick = () => setMenu(false);
$('#modalClose').onclick = closeModal;
$('#modalBackdrop').onclick = e => { if (e.target.id === 'modalBackdrop') closeModal(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden && hidden) setTimeout(maybeNightPrompt, 300); if (!document.hidden && !$('#modalBackdrop').classList.contains('show') && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render('keep'); });

/* ───────────── start ───────────── */
const start = (location.hash || '').slice(1);
ui.page = RENDERERS[start] ? start : 'today';
render('keep'); window.scrollTo(0, 0);
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});

// loading screen: a calm beat on first open, a quick one on reloads
const splash = $('#splash');
let seen = false; try { seen = sessionStorage.getItem('siren-splash') === '1'; sessionStorage.setItem('siren-splash', '1'); } catch {}
let hidden = false;
const hide = () => { if (hidden) return; hidden = true; splash.classList.add('done'); setTimeout(() => splash.remove(), 800); setTimeout(() => data.onboarded ? maybeNightPrompt() : onboardModal(true), 600); };
splash.addEventListener('click', hide);
setTimeout(hide, seen ? 500 : 2300);
})();
