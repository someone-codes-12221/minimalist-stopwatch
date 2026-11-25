/* === THE REALM: CUBE CHAOS + SKYRIM CONSTELLATION ENGINE (v5.1) === */
(function () {
  const REALM_KEY = 'chrono_realm_v1';

  const CUBE_DEFS = {
    spike:    { id: 'spike',    name: 'Spike',    cls: 'strike',  glyph: '▲', desc: 'Deals raw Strike damage.', base: 14 },
    ember:    { id: 'ember',    name: 'Ember',    cls: 'strike',  glyph: '◈', desc: 'Deals damage + stacks Burn each turn.', base: 9, burn: 6 },
    shatter:  { id: 'shatter',  name: 'Shatter',  cls: 'strike',  glyph: '❖', desc: 'Heavy hit; +80% damage when Overcharged.', base: 12 },
    aegis:    { id: 'aegis',    name: 'Aegis',    cls: 'ward',    glyph: '⬡', desc: 'Generates Shield to block counterattacks.', base: 14 },
    reflect:  { id: 'reflect',  name: 'Reflect',  cls: 'ward',    glyph: '◫', desc: 'Grants Shield + bounces 60% blocked dmg back.', base: 10 },
    mend:     { id: 'mend',     name: 'Mend',     cls: 'ward',    glyph: '✚', desc: 'Restores Run HP during the clash.', base: 10 },
    prism:    { id: 'prism',    name: 'Prism',    cls: 'synergy', glyph: '◇', desc: 'Triggers Cubes directly ABOVE & BELOW again.', base: 1 },
    echo:     { id: 'echo',     name: 'Echo',     cls: 'synergy', glyph: '◎', desc: 'Copies the previous fired Cube in the grid.', base: 1 },
    catalyst: { id: 'catalyst', name: 'Catalyst', cls: 'synergy', glyph: '✦', desc: 'Boosts adjacent 4-way Cubes by +50% (+15%/tier).', base: 0.5 },
    frost: { id: 'frost', name: 'Frost', cls: 'strike', glyph: '❄', desc: 'Deals damage and chills the enemy, reducing its next counterattack by 25%.', base: 11, unlock: { metric: 'minutes', target: 180, label: 'Study 3 hours total' } },
    rupture: { id: 'rupture', name: 'Rupture', cls: 'strike', glyph: '⌁', desc: 'Deals damage and permanently strips 2 enemy Armor this fight.', base: 10, unlock: { metric: 'minutes', target: 600, label: 'Study 10 hours total' } },
    siphon: { id: 'siphon', name: 'Siphon', cls: 'strike', glyph: '⟡', desc: 'Deals damage and restores HP equal to 30% of its damage.', base: 8, unlock: { metric: 'sessions', target: 20, label: 'Complete 20 saved sessions' } },
    conduit: { id: 'conduit', name: 'Conduit', cls: 'synergy', glyph: '⌘', desc: 'Empowers the next Strike or Ward cube by 25%.', base: 0, unlock: { metric: 'subjects', target: 3, label: 'Study 3 different subjects' } }
  };

  const CONSTELLATIONS = {
    endurance: {
      name: 'Endurance', rule: 'Levels from total minutes studied',
      nodes: [
        { id: 'e1', name: 'Iron Core',   desc: '+20 Max Run HP',         x: 50, y: 78, req: null },
        { id: 'e2', name: 'Heavy Pulse', desc: '+15% Base Grid Power',   x: 26, y: 48, req: 'e1' },
        { id: 'e3', name: 'Resilience',  desc: '+30 Max Run HP',         x: 74, y: 48, req: 'e1' },
        { id: 'e4', name: 'Titan Frame', desc: '+25% Base Grid Power',   x: 50, y: 18, req: 'e2' }
      ]
    },
    depth: {
      name: 'Depth', rule: 'Levels from minutes past the 45m mark',
      nodes: [
        { id: 'd1', name: 'Deep Edge',   desc: '+18% Strike Cube dmg',   x: 50, y: 78, req: null },
        { id: 'd2', name: 'Surge',       desc: 'Overcharge +15% stronger', x: 26, y: 48, req: 'd1' },
        { id: 'd3', name: 'Cinder',      desc: '+40% Burn damage',       x: 74, y: 48, req: 'd1' },
        { id: 'd4', name: 'Abyssal Hit', desc: '+30% Strike Cube dmg',   x: 50, y: 18, req: 'd2' }
      ]
    },
    momentum: {
      name: 'Momentum', rule: 'Levels from starting a new block within 25m',
      nodes: [
        { id: 'm1', name: 'Bastion',     desc: '+20% Ward Shield gain',  x: 50, y: 78, req: null },
        { id: 'm2', name: 'Mirror',      desc: 'Reflect bounces +25%',   x: 26, y: 48, req: 'm1' },
        { id: 'm3', name: 'Renewal',     desc: '+35% Mend healing',      x: 74, y: 48, req: 'm1' },
        { id: 'm4', name: 'Aegis Wall',  desc: 'Start fights w/ 12 Shield', x: 50, y: 18, req: 'm2' }
      ]
    },
    versatility: {
      name: 'Versatility', rule: 'Levels from studying 2+ subjects in a day',
      nodes: [
        { id: 'v1', name: 'Harmonic',    desc: 'Catalyst aura +15%',     x: 50, y: 78, req: null },
        { id: 'v2', name: 'Resonance',   desc: 'Echo fires at 120% power', x: 26, y: 48, req: 'v1' },
        { id: 'v3', name: 'Scavenger',   desc: '+25% Obsidian Shards',   x: 74, y: 48, req: 'v1' },
        { id: 'v4', name: 'Singularity', desc: 'Prism buffs re-triggers +20%', x: 50, y: 18, req: 'v2' }
      ]
    },
    overclock: {
      name: 'Overclock', rule: 'Levels from Overtime minutes past a Sprint',
      nodes: [
        { id: 'o1', name: 'Keen Edge',   desc: '+15% Crit chance (1.5x)', x: 50, y: 78, req: null },
        { id: 'o2', name: 'Piercer',     desc: 'Ignore 50% Enemy Armor', x: 26, y: 48, req: 'o1' },
        { id: 'o3', name: 'Overdrive',   desc: '+20% Crit chance',       x: 74, y: 48, req: 'o1' },
        { id: 'o4', name: 'True Strike', desc: 'Ignore 100% Enemy Armor', x: 50, y: 18, req: 'o2' }
      ]
    }
  };

  // ---------- Synthesized Combat SFX ----------
  let sfxCtx = null;
  function playSfx(type) {
    try {
      if (!sfxCtx) sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (sfxCtx.state === 'suspended') sfxCtx.resume();
      const now = sfxCtx.currentTime;
      const osc = sfxCtx.createOscillator();
      const g = sfxCtx.createGain();
      osc.connect(g); g.connect(sfxCtx.destination);

      if (type === 'strike') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.11);
        g.gain.setValueAtTime(0.11, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.13);
      } else if (type === 'ward') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'synergy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.15);
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now); osc.stop(now + 0.17);
      } else if (type === 'crit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
        g.gain.setValueAtTime(0.09, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now); osc.stop(now + 0.19);
      } else if (type === 'kill' || type === 'reward') {
        const notes = type === 'reward' ? [523, 659, 784, 1047] : [440, 554, 659, 880];
        notes.forEach((f, idx) => {
          const o = sfxCtx.createOscillator(), gn = sfxCtx.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(f, now + idx * (type === 'reward' ? 0.085 : 0.06));
          const start = now + idx * (type === 'reward' ? 0.085 : 0.06);
          gn.gain.setValueAtTime(type === 'reward' ? 0.055 : 0.08, start);
          gn.gain.exponentialRampToValueAtTime(0.001, start + (type === 'reward' ? 0.38 : 0.28));
          o.connect(gn); gn.connect(sfxCtx.destination);
          o.start(start); o.stop(start + (type === 'reward' ? 0.4 : 0.3));
        });
      } else if (type === 'tap' || type === 'tab') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'tab' ? 620 : 430, now);
        osc.frequency.exponentialRampToValueAtTime(type === 'tab' ? 820 : 360, now + 0.045);
        g.gain.setValueAtTime(0.022, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.start(now); osc.stop(now + 0.06);
      }
    } catch (_) {}
  }

  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (_) {} }
  function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

  function spawnFloat(container, text, cls) {
    if (!container) return;
    const el = document.createElement('div');
    el.className = `float-pop ${cls}`;
    el.textContent = text;
    el.style.left = (42 + Math.random() * 18) + '%';
    container.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function spawnSlash(container, isCrit) {
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'slash-vfx';
    wrap.innerHTML = `<div class="slash-line ${isCrit ? 'crit' : ''}"></div>`;
    container.appendChild(wrap);
    setTimeout(() => wrap.remove(), 320);
  }

  const ZONE_THEMES = [
    { name: 'Ashen March', subtitle: 'A scorched frontier of broken fortresses', boss: 'Cinder Tyrant', bossGimmick: 'Heavy armor · Burning counterstrike', rule: 'Ashfall: take 4 scorch damage after each enemy counterattack.' },
    { name: 'Drowned Archive', subtitle: 'A sunken library guarded by restless echoes', boss: 'The Drowned Scribe', bossGimmick: 'High vitality · Leeching tide', rule: 'Leeching tide: enemies recover 3% of their maximum HP after attacking.' },
    { name: 'Thornwild', subtitle: 'An overgrown maze that fights back', boss: 'Briar Colossus', bossGimmick: 'Rapid attacks · Regrows between volleys', rule: 'Overgrowth: every second enemy counterattack restores 4% of its maximum HP.' },
    { name: 'Hollow Crown', subtitle: 'A fallen kingdom under a watchful curse', boss: 'The Hollow Regent', bossGimmick: 'Escalating attack · Royal guard', rule: 'Royal guard: enemies gain 1 armor after each counterattack, up to +6.' },
    { name: 'Starfall Citadel', subtitle: 'A fortress carved from fallen stars', boss: 'Astral Devourer', bossGimmick: 'Balanced elite · Heavy final blow', rule: 'Falling star: every third enemy counterattack deals 8 extra damage.' }
  ];

  function getZoneTheme(zone) { return ZONE_THEMES[(Math.max(1, zone) - 1) % ZONE_THEMES.length]; }

  function buildZoneMap(zone) {
    const s = 1 + (zone - 1) * 0.32;
    const cycle = (zone - 1) % 5;
    const packs = [
      ['phantom', 'monolith', 'swarm', 'monolith', 'phantom'],
      ['leech', 'wraith', 'swarm', 'leech', 'wraith'],
      ['swarm', 'reaver', 'thorn', 'reaver', 'thorn'],
      ['hexcaller', 'monolith', 'wraith', 'hexcaller', 'reaver'],
      ['wraith', 'reaver', 'hexcaller', 'thorn', 'monolith']
    ][cycle];
    const theme = getZoneTheme(zone);
    return [
      { id: 0, x: 14, y: 50, type: 'start', name: 'Camp', cleared: true, edges: [1, 2] },
      { id: 1, x: 34, y: 26, type: 'hostile', enemy: makeEnemy(packs[0], s), cleared: false, edges: [0, 3, 4] },
      { id: 2, x: 34, y: 74, type: 'hostile', enemy: makeEnemy(packs[1], s), cleared: false, edges: [0, 4, 5] },
      { id: 3, x: 56, y: 20, type: 'shrine', name: 'Waystone', buff: '+12% Grid Power (Zone)', cleared: false, edges: [1, 6] },
      { id: 4, x: 56, y: 50, type: 'hostile', enemy: makeEnemy(packs[2], s * 1.08), cleared: false, edges: [1, 2, 6, 7, 9] },
      { id: 5, x: 56, y: 80, type: 'vault', name: 'Relic Vault', cleared: false, edges: [2, 7] },
      { id: 6, x: 75, y: 34, type: 'hostile', enemy: makeEnemy(packs[3], s * 1.25), cleared: false, edges: [3, 4, 8] },
      { id: 7, x: 75, y: 66, type: 'hostile', enemy: makeEnemy(packs[4], s * 1.25), cleared: false, edges: [4, 5, 8] },
      { id: 8, x: 90, y: 50, type: 'boss', enemy: makeEnemy('boss', s * 1.6, zone), cleared: false, edges: [6, 7] },
      { id: 9, x: 70, y: 92, type: 'boss', isSecretBoss: true, name: 'The Veilbound Warden', enemy: makeEnemy('boss', s * 1.9, zone), cleared: false, edges: [4] }
    ];
  }

  function makeEnemy(kind, scale, zone = R && R.zone || 1) {
    const stats = {
      monolith: ['Monolith', 84, 14, 8, 'Heavy armor · Crushing slam every third counterattack'],
      phantom: ['Phantom', 60, 20, 0, 'Rotating phase guard · stronger every second counterattack'],
      swarm: ['Swarm', 72, 10, 0, 'Strikes twice every turn · protects its corners'],
      wraith: ['Wraith', 68, 16, 2, 'Balanced pressure · relentless counterattacks'],
      reaver: ['Reaver', 72, 12, 3, 'Two quick strikes · bypasses 25% Shield every second turn'],
      thorn: ['Thorn Stalker', 92, 12, 5, 'Regrows after striking · rotating root guard'],
      hexcaller: ['Hexcaller', 74, 14, 2, 'Attack grows after every counterstrike · shifting columns'],
      leech: ['Tide Leech', 84, 11, 2, 'Diagonal ward · steals back health after striking']
    };
    if (kind === 'boss') {
      const bosses = [
        ['Cinder Tyrant', 178, 23, 9, 'Phase II: crushing cinder waves · heavy armor'],
        ['The Drowned Scribe', 198, 20, 6, 'Phase II: stronger leeching tide · rotating veil'],
        ['Briar Colossus', 210, 19, 8, 'Phase II: rapid regrowth · rotating root guard'],
        ['The Hollow Regent', 190, 23, 10, 'Phase II: escalating attack and armor'],
        ['Astral Devourer', 220, 24, 9, 'Phase II: double strikes · shield-piercing starfall']
      ];
      const b = bosses[(Math.max(1, zone) - 1) % bosses.length];
      const hp = Math.round(b[1] * scale);
      return { kind: 'boss', name: b[0], hp, maxHp: hp, atk: Math.round(b[2] * scale), armor: Math.round(b[3] * scale), baseArmor: Math.round(b[3] * scale), burn: 0, turns: 0, phase: 1, gimmick: b[4], bossStyle: (zone - 1) % 5 };
    }
    const d = stats[kind] || stats.monolith;
    const hp = Math.round(d[1] * scale);
    return {
      kind, name: d[0], hp, maxHp: hp, atk: Math.round(d[2] * scale),
      armor: Math.round(d[3] * scale), baseArmor: Math.round(d[3] * scale), burn: 0, turns: 0,
      hits: kind === 'swarm' || kind === 'reaver' ? 2 : 1,
      gimmick: d[4]
    };
  }

  function defaultRealm() {
    const c1 = { uid: 'c_1', type: 'spike', tier: 1 };
    const c2 = { uid: 'c_2', type: 'aegis', tier: 1 };
    const c3 = { uid: 'c_3', type: 'prism', tier: 1 };
    return {
      charges: 2, drafts: 1, shards: 15, overcharge: 0,
      remChargeMin: 0, remDraftMin: 0, remShardMin: 0,
      totalStudyMins: 0, lastSessionTs: 0,
      runHp: 100, zone: 1, zoneBuff: 0, selectedNode: 1,
      map: buildZoneMap(1),
      inventory: [c1, c2, c3],
      grid: [null, 'c_1', null, null, 'c_3', null, null, 'c_2', null],
      skills: {
        endurance: { xp: 0, lvl: 1 }, depth: { xp: 0, lvl: 1 },
        momentum: { xp: 0, lvl: 1 }, versatility: { xp: 0, lvl: 1 }, overclock: { xp: 0, lvl: 1 }
      },
      perkPoints: 1, perks: {},
      bestiary: {}, studyCubeClaims: {}, studySessionCount: 0, surgeArmed: false, combatRulesVersion: 2
    };
  }

  let R = null;
  try { R = JSON.parse(localStorage.getItem(REALM_KEY)); } catch (_) {}
  if (!R || !R.map || !R.skills) R = defaultRealm();
  function saveR() { localStorage.setItem(REALM_KEY, JSON.stringify(R)); }
  if (!R.achievementClaims || typeof R.achievementClaims !== 'object') R.achievementClaims = {};
  if (!Number.isFinite(R.combatWins)) R.combatWins = 0;
  if (!Number.isFinite(R.bossWins)) R.bossWins = 0;
  if (!Number.isFinite(R.cubesDrafted)) R.cubesDrafted = 0;
  if (!Array.isArray(R.equippedRelics)) R.equippedRelics = [];
  if (!R.bestiary || typeof R.bestiary !== 'object' || Array.isArray(R.bestiary)) R.bestiary = {};
  if (!R.studyCubeClaims || typeof R.studyCubeClaims !== 'object' || Array.isArray(R.studyCubeClaims)) R.studyCubeClaims = {};
  if (!Number.isFinite(R.studySessionCount)) R.studySessionCount = 0;
  if (typeof R.surgeArmed !== 'boolean') R.surgeArmed = false;
  if (!Number.isFinite(R.combatRulesVersion)) R.combatRulesVersion = 0;
  if (R.combatRulesVersion < 2) {
    const tuneSavedEnemy = enemy => {
      if (!enemy || typeof enemy !== 'object') return;
      const oldMax = Math.max(1, Number(enemy.maxHp) || Number(enemy.hp) || 1);
      const oldHp = Math.max(0, Number(enemy.hp) || 0);
      const isBoss = enemy.kind === 'boss';
      const hpScale = isBoss ? 1.10 : 1.18;
      const attackScale = isBoss ? 1.10 : 1.14;
      enemy.maxHp = Math.round(oldMax * hpScale);
      enemy.hp = Math.min(enemy.maxHp, Math.round(enemy.maxHp * Math.min(1, oldHp / oldMax)));
      enemy.atk = Math.max(1, Math.round((Number(enemy.atk) || 1) * attackScale));
      if (!Number.isFinite(enemy.baseArmor)) enemy.baseArmor = Number(enemy.armor) || 0;
      if (!Number.isFinite(enemy.turns)) enemy.turns = 0;
      if (isBoss && !Number.isFinite(enemy.phase)) enemy.phase = 1;
    };
    if (Array.isArray(R.map)) R.map.forEach(node => tuneSavedEnemy(node && node.enemy));
    if (R.worldEvent && R.worldEvent.node) tuneSavedEnemy(R.worldEvent.node.enemy);
    R.combatRulesVersion = 2;
    saveR();
  }
  // Add the optional side-route to existing saves without replacing their current map.
  if ((R.zone || 1) >= 2 && Array.isArray(R.map) && !R.map.some(n => n.isSecretBoss)) {
    const scale = 1 + ((R.zone || 1) - 1) * 0.32;
    R.map.push({ id: R.map.length, x: 70, y: 92, type: 'boss', isSecretBoss: true,
      name: 'The Veilbound Warden', enemy: makeEnemy('boss', scale * 1.9, R.zone || 1),
      cleared: false, edges: [4] });
    const central = R.map.find(n => n.id === 4);
    if (central && !central.edges.includes(R.map.length - 1)) central.edges.push(R.map.length - 1);
    saveR();
  }

  function hasPerk(id) { return !!R.perks[id]; }
  function getMaxHp() { return 100 + (hasPerk('e1') ? 20 : 0) + (hasPerk('e3') ? 30 : 0); }
  function getBasePowerMult() {
    let m = 1 + Math.min(1.0, (R.totalStudyMins / 60) * 0.02) + (R.zoneBuff || 0);
    if (hasPerk('e2')) m += 0.15;
    if (hasPerk('e4')) m += 0.25;
    return m;
  }
  function getCubeByUid(uid) { return R.inventory.find(c => c.uid === uid) || null; }
  function getUnlockedNodes() {
    const set = new Set();
    R.map.forEach(n => {
      if (!n.cleared) return;
      set.add(n.id);
      n.edges.forEach(e => {
        const target = R.map[e];
        if (target && (!target.isSecretBoss || (R.bossWins || 0) >= 1)) set.add(e);
      });
    });
    return set;
  }

  function showToast(msg) {
    let t = document.getElementById('realmToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'realmToast'; t.className = 'realm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  // Rare, dismissible celebrations for genuinely notable milestones.
  function showLegendaryMoment(title, detail, emblem) {
    let layer = document.getElementById('legendaryMoment');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'legendaryMoment';
      layer.className = 'legendary-moment';
      layer.innerHTML = '<div class="legendary-card" role="dialog" aria-modal="true" aria-labelledby="legendaryTitle"><div class="legendary-emblem" aria-hidden="true"></div><div class="legendary-kicker">A MOMENT WORTH REMEMBERING</div><div class="legendary-title" id="legendaryTitle"></div><div class="legendary-detail"></div><button class="legendary-dismiss" type="button">Continue</button></div>';
      document.body.appendChild(layer);
      layer.querySelector('.legendary-dismiss').addEventListener('click', () => layer.classList.remove('open'));
      layer.addEventListener('click', e => { if (e.target === layer) layer.classList.remove('open'); });
    }
    layer.querySelector('.legendary-emblem').textContent = emblem || '✦';
    layer.querySelector('.legendary-title').textContent = title;
    layer.querySelector('.legendary-detail').textContent = detail;
    playSfx('reward');
    vibrate([18, 35, 24]);
    layer.classList.remove('open');
    void layer.offsetWidth;
    layer.classList.add('open');
  }
  function addSkillXp(key, amount) {
    if (amount <= 0) return;
    const sk = R.skills[key];
    sk.xp += amount;
    while (sk.xp >= sk.lvl * 45) { sk.xp -= sk.lvl * 45; sk.lvl++; R.perkPoints++; }
  }

  function onSessionSaved(info) {
    const mins = Math.max(0, info.durationMs / 60000);
    if (mins < 0.5) return;
    R.totalStudyMins += mins;
    R.studySessionCount = (R.studySessionCount || 0) + 1;

    R.remChargeMin += mins;
    const newCharges = Math.floor(R.remChargeMin / 15);
    R.remChargeMin %= 15; R.charges += newCharges;

    R.remDraftMin += mins;
    const newDrafts = Math.floor(R.remDraftMin / 30);
    R.remDraftMin %= 30; R.drafts += newDrafts;

    R.remShardMin += mins;
    let newShards = Math.floor(R.remShardMin / 2);
    R.remShardMin %= 2;
    if (hasPerk('v3')) newShards = Math.round(newShards * 1.25);
    R.shards += newShards;

    if (mins >= 90) R.overcharge = Math.max(R.overcharge, 0.5);
    else if (mins >= 45) R.overcharge = Math.max(R.overcharge, 0.25);

    addSkillXp('endurance', Math.round(mins));
    if (mins > 45) addSkillXp('depth', Math.round((mins - 45) * 1.8));
    if (R.lastSessionTs && (Date.now() - R.lastSessionTs) <= 25 * 60000) addSkillXp('momentum', Math.round(15 + mins * 0.6));
    if (info.subjectsTodayCount >= 2) addSkillXp('versatility', Math.round(18 + mins * 0.5));
    if (info.overtimeMs > 60000) addSkillXp('overclock', Math.round((info.overtimeMs / 60000) * 2.2));

    R.lastSessionTs = Date.now();
    saveR();
    updateRealmBadge();

    const milestoneSession = mins >= 120 ? ['Marathon Mind', 'A two-hour study session. That took real commitment.', '✧']
      : mins >= 90 ? ['Deep Focus', 'Ninety minutes of focused work. A serious effort.', '◇']
      : mins >= 45 ? ['The Long Vigil', 'Forty-five minutes of focused study. Keep building on it.', '✦'] : null;
    if (milestoneSession) showLegendaryMoment(milestoneSession[0], milestoneSession[1], milestoneSession[2]);
    else {
      const streak = getAchievementStats().streak;
      if ([3, 7, 14, 30].includes(streak)) showLegendaryMoment(streak + '-Day Study Streak', 'You showed up on consecutive days. Consistency is becoming a habit.', '✧');
    }

    const parts = [];
    if (newCharges > 0) parts.push(`+${newCharges} Charge`);
    if (newDrafts > 0) parts.push(`+${newDrafts} Draft`);
    if (newShards > 0) parts.push(`+${newShards} Shards`);
    if (mins >= 45) parts.push('Overcharged');
    if (parts.length) showToast(parts.join(' · '));
  }

  function updateRealmBadge() {
    if (!R.weeklyQuestClaims || typeof R.weeklyQuestClaims !== 'object') R.weeklyQuestClaims = {};
    const weeklyKeys = Object.keys(R.weeklyQuestClaims).sort();
    weeklyKeys.slice(0, Math.max(0, weeklyKeys.length - 12)).forEach(week => delete R.weeklyQuestClaims[week]);
    const btn = document.getElementById('realmBtn');
    if (btn) btn.classList.toggle('has-badge', R.drafts > 0 || R.perkPoints > 0);
  }

  // ---------- Animated Auto-Clash 3x3 Synergy Engine ----------
  let isClashing = false;

  async function runGridClash(isTestDummy) {
    if (isClashing) return;
    document.getElementById('realmBody')?.classList.remove('enemy-selection-static');
    const node = R.selectedNode === -1 && R.worldEvent ? R.worldEvent.node : R.map.find(n => n.id === R.selectedNode);
    if (!isTestDummy) {
      if (!node || (node.type !== 'hostile' && node.type !== 'boss') || node.cleared) return;
      const strikeBtn = document.getElementById('strikeBtn');
      if (strikeBtn) strikeBtn.disabled = true;
    }

    isClashing = true;
    const logEl = document.getElementById('clashLog');
    const battleCard = document.getElementById('battleCard');
    const enemyVis = document.getElementById('enemyVisual');
    const miniGrid = document.getElementById('miniGrid');
    const tallyDmgEl = document.getElementById('tallyDmg');
    const tallyShdEl = document.getElementById('tallyShd');
    const tallyHealEl = document.getElementById('tallyHeal');

    const appendLog = (html) => {
      if (!logEl) return;
      const div = document.createElement('div');
      div.innerHTML = html;
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    };
    if (logEl) logEl.innerHTML = '';

    const relicBonuses = getEquippedRelicBonuses();
    const overMult = 1 + (R.overcharge || 0) + (R.overcharge > 0 && hasPerk('d2') ? 0.15 : 0);
    const surgeActive = !isTestDummy && !!R.surgeArmed;
    const powerMult = getBasePowerMult() * overMult * (1 + relicBonuses.power) * (surgeActive ? 1.3 : 1);
    if (surgeActive) { R.surgeArmed = false; saveR(); }
    const strikeMult = (1 + (hasPerk('d1') ? 0.18 : 0) + (hasPerk('d4') ? 0.30 : 0)) * (1 + relicBonuses.strike);
    const wardMult = (1 + (hasPerk('m1') ? 0.20 : 0)) * (1 + relicBonuses.ward);
    const critChance = Math.min(0.6, (hasPerk('o1') ? 0.15 : 0) + (hasPerk('o3') ? 0.20 : 0) + relicBonuses.crit);

    let totalDmg = 0, totalBurn = 0, totalShield = hasPerk('m4') ? 12 : 0, totalHeal = 0, hasReflect = false;
    let chilledPower = 0, conduitCharges = 0;
    const updateTallies = () => {
      if (tallyDmgEl) tallyDmgEl.textContent = `⚔ ${totalDmg}`;
      if (tallyShdEl) tallyShdEl.textContent = `⬡ ${totalShield}`;
      if (tallyHealEl) tallyHealEl.textContent = `✚ ${totalHeal}`;
    };
    updateTallies();

    getGridSynergyInfo().labels.forEach(label => appendLog(`<span class="syn">✦ Grid combo: ${label}</span>`));

    const formationBonus = getGridSynergyInfo().bonuses.map(b => 1 + b);
    const adjBonus = Array(9).fill(1);
    for (let i = 0; i < 9; i++) {
      const c = getCubeByUid(R.grid[i]);
      if (c && c.type === 'catalyst') {
        const boost = 0.5 + (c.tier - 1) * 0.15 + (hasPerk('v1') ? 0.15 : 0);
        const r = Math.floor(i / 3), col = i % 3;
        [[r-1,col],[r+1,col],[r,col-1],[r,col+1]].forEach(([nr, nc]) => {
          if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) adjBonus[nr * 3 + nc] += boost;
        });
      }
    }

    let lastFired = null;

    async function fireSlot(idx, extraMult = 1, labelPrefix = '') {
      const c = getCubeByUid(R.grid[idx]);
      if (!c) return;
      const def = CUBE_DEFS[c.type];
      const tierMult = 1 + (c.tier - 1) * 0.45;
      const conduitBoost = c.type !== 'conduit' && def.cls !== 'synergy' && conduitCharges > 0 ? 1.25 : 1;
      if (conduitBoost > 1) conduitCharges--;
      const mult = powerMult * tierMult * adjBonus[idx] * formationBonus[idx] * extraMult * conduitBoost;

      const slotEl = document.querySelector(`[data-clash-idx="${idx}"]`);
      if (slotEl) slotEl.classList.add('firing');

      if (c.type === 'spike' || c.type === 'ember' || c.type === 'shatter' || c.type === 'frost' || c.type === 'rupture' || c.type === 'siphon') {
        let d = Math.round(def.base * mult * strikeMult);
        const tactic = !isTestDummy && node ? getEnemyTactic(node.enemy) : null;
        if (tactic && tactic.cells.includes(idx)) {
          d = Math.round(d * 0.6);
          appendLog(`<span class="syn">Enemy tactic weakens ${def.name} in this cell.</span>`);
        }
        if (c.type === 'shatter' && R.overcharge > 0) d = Math.round(d * 1.8);
        totalDmg += d;
        playSfx('strike'); vibrate(14);
        if (enemyVis) {
          spawnSlash(enemyVis, false);
          spawnFloat(enemyVis, `-${d}`, 'dmg');
          enemyVis.classList.remove('hit'); void enemyVis.offsetWidth; enemyVis.classList.add('hit');
        } else if (slotEl) {
          spawnFloat(slotEl, `-${d}`, 'dmg');
        }
        if (c.type === 'ember') {
          const b = Math.round(def.burn * mult * (hasPerk('d3') ? 1.4 : 1));
          totalBurn += b;
          appendLog(`${labelPrefix}<span class="hl">Ember</span> → <span class="dmg">${d} DMG</span> + <span class="syn">${b} Burn</span>`);
        } else if (c.type === 'frost') {
          chilledPower = Math.min(0.5, chilledPower + 0.25);
          appendLog(`${labelPrefix}<span class="hl">Frost</span> → <span class="dmg">${d} DMG</span> + <span class="syn">25% Chill</span>`);
        } else if (c.type === 'rupture') {
          if (!isTestDummy && node && node.enemy) node.enemy.armor = Math.max(0, (node.enemy.armor || 0) - 2);
          appendLog(`${labelPrefix}<span class="hl">Rupture</span> → <span class="dmg">${d} DMG</span> + <span class="syn">−2 Armor</span>`);
        } else if (c.type === 'siphon') {
          const drain = Math.max(1, Math.round(d * 0.3));
          totalHeal += drain;
          appendLog(`${labelPrefix}<span class="hl">Siphon</span> → <span class="dmg">${d} DMG</span> + <span class="win">+${drain} HP</span>`);
        } else {
          appendLog(`${labelPrefix}<span class="hl">${def.name}</span> → <span class="dmg">${d} DMG</span>`);
        }
        lastFired = { type: c.type, tier: c.tier, idx };
      } else if (c.type === 'aegis' || c.type === 'reflect') {
        const sh = Math.round(def.base * mult * wardMult);
        totalShield += sh;
        if (c.type === 'reflect') hasReflect = true;
        playSfx('ward'); vibrate(8);
        if (miniGrid) {
          miniGrid.classList.add('shield-flash');
          spawnFloat(miniGrid, `+${sh} SHD`, 'shd');
          setTimeout(() => miniGrid.classList.remove('shield-flash'), 260);
        } else if (slotEl) {
          spawnFloat(slotEl, `+${sh} SHD`, 'shd');
        }
        appendLog(`${labelPrefix}<span class="hl">${def.name}</span> → <span class="shd">+${sh} Shield</span>`);
        lastFired = { type: c.type, tier: c.tier, idx };
      } else if (c.type === 'mend') {
        const h = Math.round(def.base * mult * (hasPerk('m3') ? 1.35 : 1) * (1 + relicBonuses.heal));
        totalHeal += h;
        playSfx('ward'); vibrate(8);
        spawnFloat(miniGrid || slotEl, `+${h} HP`, 'heal');
        appendLog(`${labelPrefix}<span class="hl">Mend</span> → <span class="win">+${h} HP</span>`);
        lastFired = { type: 'mend', tier: c.tier, idx };
      } else if (c.type === 'prism') {
        playSfx('synergy'); vibrate([10, 25, 10]);
        spawnFloat(miniGrid || slotEl, '◇ PRISM ×2', 'syn');
        appendLog(`<span class="syn">◇ Prism</span> re-triggers Above & Below!`);
        await wait(220);
        if (slotEl) slotEl.classList.remove('firing');
        const pBonus = hasPerk('v4') ? 1.2 : 1.0;
        if (idx - 3 >= 0) await fireSlot(idx - 3, pBonus, '↳ ');
        if (idx + 3 < 9) await fireSlot(idx + 3, pBonus, '↳ ');
        return;
      } else if (c.type === 'echo' && lastFired) {
        playSfx('synergy'); vibrate(10);
        spawnFloat(miniGrid || slotEl, '◎ ECHO', 'syn');
        appendLog(`<span class="syn">◎ Echo</span> copies ${CUBE_DEFS[lastFired.type].name}!`);
        await wait(200);
        if (slotEl) slotEl.classList.remove('firing');
        await fireSlot(lastFired.idx, hasPerk('v2') ? 1.2 : 1.0, '↳ ');
        return;
      } else if (c.type === 'catalyst') {
        playSfx('synergy');
        spawnFloat(miniGrid || slotEl, '✦ BOOST', 'syn');
        appendLog(`<span class="syn">✦ Catalyst</span> empowering adjacent tiles.`);
      } else if (c.type === 'conduit') {
        conduitCharges = Math.min(3, conduitCharges + 1);
        playSfx('synergy');
        spawnFloat(miniGrid || slotEl, '⌘ LINK', 'syn');
        appendLog(`<span class="syn">⌘ Conduit</span> — next Strike or Ward fires at 125% power.`);
      }

      updateTallies();
      await wait(210);
      if (slotEl) slotEl.classList.remove('firing');
    }

    for (let i = 0; i < 9; i++) {
      if (R.grid[i]) await fireSlot(i);
    }

    // Crit Roll
    let isCrit = false;
    if (totalDmg > 0 && Math.random() < critChance) {
      isCrit = true;
      totalDmg = Math.round(totalDmg * 1.5);
      updateTallies();
      playSfx('crit'); vibrate([25, 30, 35]);
      if (battleCard) { battleCard.classList.remove('crit-flash'); void battleCard.offsetWidth; battleCard.classList.add('crit-flash'); }
      if (enemyVis) { spawnSlash(enemyVis, true); spawnFloat(enemyVis, `CRIT ${totalDmg}!`, 'crit'); }
      appendLog(`<span class="syn">★ OVERCLOCK CRIT! Final Volley: ${totalDmg} DMG</span>`);
      await wait(280);
    }

    if (isTestDummy) {
      appendLog(`<span class="win">DUMMY RESULT: ${totalDmg} DMG · ${totalShield} Shield · ${totalHeal} Heal</span>`);
      isClashing = false;
      return;
    }

    // Apply Volley to Enemy
    const en = node.enemy;
    const armorIgnore = hasPerk('o4') ? 1 : (hasPerk('o2') ? 0.5 : 0);
    const effArmor = Math.round((en.armor || 0) * (1 - armorIgnore));
    const netDmg = Math.max(1, totalDmg - effArmor);
    en.burn = (en.burn || 0) + totalBurn;
    const burnTick = en.burn;
    en.hp = Math.max(0, en.hp - netDmg - burnTick);
    R.overcharge = 0;
    if (totalHeal > 0) R.runHp = Math.min(getMaxHp(), R.runHp + totalHeal);

    const hpBar = document.getElementById('enemyHpFill');
    const hpText = document.getElementById('enemyHpText');
    if (hpBar) hpBar.style.width = Math.round((en.hp / en.maxHp) * 100) + '%';
    if (hpText) hpText.textContent = `HP ${en.hp}/${en.maxHp}`;
    if (burnTick > 0 && enemyVis) spawnFloat(enemyVis, `🔥 -${burnTick}`, 'syn');
    appendLog(`<span class="hl">Volley landed: <span class="dmg">${netDmg}</span>${burnTick ? ` + ${burnTick} Burn` : ''}${effArmor ? ` (${effArmor} Armor)` : ''}.</span>`);
    await wait(360);

    if (node.type === 'boss' && en.hp > 0 && (en.phase || 1) < 2 && en.hp <= en.maxHp * 0.55) {
      en.phase = 2;
      en.atk = Math.round(en.atk * 1.18);
      en.armor = Math.max(0, Math.round((en.armor || 0) * 0.8));
      if (en.bossStyle === 4) en.hits = 2;
      appendLog(`<span class="syn">PHASE II — ${en.name} reveals its true form. Attack rises; its guard changes.</span>`);
      showToast(`${en.name} · PHASE II`);
      const phaseEl = document.getElementById('enemyPhase');
      if (phaseEl) phaseEl.textContent = 'PHASE II';
    }

    if (en.hp <= 0) {
      playSfx('kill'); vibrate([30, 50, 40]);
      if (enemyVis) enemyVis.classList.add('shatter');
      await wait(520);
      node.cleared = true;
      R.combatWins = (R.combatWins || 0) + 1;
      if (node.type === 'boss') R.bossWins = (R.bossWins || 0) + 1;
      const trophyKey = node.type === 'boss' ? `boss:${en.name}` : `enemy:${en.kind}`;
      const previousKills = Number(R.bestiary[trophyKey]) || 0;
      R.bestiary[trophyKey] = previousKills + 1;
      const firstTrophy = previousKills === 0;
      if (firstTrophy) R.drafts += 1;
      const shardDrop = node.type === 'boss' ? 35 : 12;
      if (node.isWorldEvent) {
        R.worldEvent.completed = true;
        R.shards += R.worldEvent.rewardShards;
        R.drafts += R.worldEvent.rewardDrafts;
        showToast(`World Event cleared! +${R.worldEvent.rewardShards} Shards · +${R.worldEvent.rewardDrafts} Draft`);
        showLegendaryMoment('World Event Conquered', `${R.worldEvent.name} has been overcome. The Realm remembers.`, '✧');
      } else {
        R.shards += shardDrop;
      }
      if (node.isWorldEvent) {
        // Event rewards are handled above; the main zone map remains untouched.
      } else if (node.type === 'boss' && !node.isSecretBoss) {
        R.drafts += 2; R.zone++; R.zoneBuff = 0; R.runHp = getMaxHp();
        R.map = buildZoneMap(R.zone); R.selectedNode = 1;
        showToast(`ZONE ${R.zone} UNLOCKED! +${shardDrop} Shards · +2 Drafts${firstTrophy ? ' · Trophy +1 Draft' : ''}`);
        showLegendaryMoment('A New Realm Awaits', `The boss has fallen. Zone ${R.zone} is now open.`, '♛');
      } else if (node.isSecretBoss) {
        R.shards += 50; R.drafts += 1;
        showToast('Secret boss defeated · +50 Shards · +1 Draft');
        showLegendaryMoment('The Hidden Path Revealed', 'The Veilbound Warden has fallen. A hidden chapter is yours to explore.', '⌘');
      } else {
        showToast(`${en.name} Defeated! +${shardDrop} Shards${firstTrophy ? ' · Trophy +1 Draft' : ''}`);
      }
      if (firstTrophy) appendLog(`<span class="win">BESTIARY TROPHY RECORDED · ${en.name} · +1 Cube Draft</span>`);
    } else {
      // Enemy Counterattack Lunge
      if (enemyVis) { enemyVis.classList.remove('lunge'); void enemyVis.offsetWidth; enemyVis.classList.add('lunge'); }
      await wait(160);
      const attackTurn = (en.turns || 0) + 1;
      let totalIncoming = en.atk * (en.hits || 1);
      if (en.kind === 'monolith' && attackTurn % 3 === 0) totalIncoming = Math.round(totalIncoming * 1.45);
      if (en.kind === 'phantom' && attackTurn % 2 === 0) totalIncoming = Math.round(totalIncoming * 1.2);
      if (node.type === 'boss' && en.bossStyle === 0 && attackTurn % 2 === 0) totalIncoming = Math.round(totalIncoming * (en.phase >= 2 ? 1.35 : 1.2));
      const chillReduction = Math.min(0.5, chilledPower);
      const chilledIncoming = Math.max(0, Math.round(totalIncoming * (1 - chillReduction)));
      const bypassRatio = node.type === 'boss' && en.phase >= 2 && en.bossStyle === 4 && attackTurn % 2 === 0 ? 0.3
        : en.kind === 'reaver' && attackTurn % 2 === 0 ? 0.25 : 0;
      const bypass = Math.round(chilledIncoming * bypassRatio);
      const blockable = chilledIncoming - bypass;
      const blocked = Math.min(totalShield, blockable);
      const hpLoss = bypass + Math.max(0, blockable - blocked);
      R.runHp = Math.max(0, R.runHp - hpLoss);

      if (hpLoss > 0) {
        playSfx('hit'); vibrate(30);
        if (battleCard) { battleCard.classList.remove('shake'); void battleCard.offsetWidth; battleCard.classList.add('shake'); }
        if (miniGrid) spawnFloat(miniGrid, `-${hpLoss} HP`, 'dmg');
      } else {
        playSfx('ward'); vibrate(12);
        if (miniGrid) { miniGrid.classList.add('shield-flash'); spawnFloat(miniGrid, 'BLOCKED', 'shd'); }
      }
      appendLog(`${en.name} ${en.kind === 'monolith' && attackTurn % 3 === 0 ? 'CRUSHING SLAM' : 'strikes'} (${totalIncoming}) → <span class="shd">${blocked} blocked</span>${bypass ? ` · ${bypass} bypassed` : ''}, <span class="dmg">-${hpLoss} HP</span>${chillReduction ? ` · Chill −${Math.round(chillReduction * 100)}%` : ''}.`);

      // Each region adds one readable battlefield rule on top of enemy traits.
      en.turns = (en.turns || 0) + 1;
      const biome = (R.zone - 1) % 5;
      if (biome === 0) {
        R.runHp = Math.max(0, R.runHp - 4);
        appendLog(`<span class="syn">Ashfall scorches you for 4 extra damage.</span>`);
      } else if (biome === 1) {
        const tideHeal = Math.min(Math.ceil(en.maxHp * 0.03), en.maxHp - en.hp);
        en.hp += tideHeal;
        if (tideHeal) appendLog(`<span class="syn">The tide restores ${tideHeal} enemy HP.</span>`);
      } else if (biome === 2 && en.turns % 2 === 0) {
        const rootsHeal = Math.min(Math.ceil(en.maxHp * 0.04), en.maxHp - en.hp);
        en.hp += rootsHeal;
        if (rootsHeal) appendLog(`<span class="win">Overgrowth restores ${rootsHeal} enemy HP.</span>`);
      } else if (biome === 3) {
        const baseArmor = en.baseArmor == null ? (en.baseArmor = en.armor || 0) : en.baseArmor;
        en.armor = Math.min(baseArmor + 6, (en.armor || 0) + 1);
        appendLog(`<span class="syn">Royal Guard hardens: ${en.armor} armor.</span>`);
      } else if (biome === 4 && en.turns % 3 === 0) {
        const starDamage = 8;
        R.runHp = Math.max(0, R.runHp - starDamage);
        appendLog(`<span class="syn">A falling star hits for ${starDamage} unblocked damage.</span>`);
      }

      if (en.kind === 'hexcaller' || (node.type === 'boss' && en.bossStyle === 3)) {
        en.atk = Math.round(en.atk * 1.12);
        appendLog(`<span class="syn">${en.name} gathers power. Next attack: ${en.atk}.</span>`);
      }
      if (en.kind === 'thorn' || (node.type === 'boss' && en.bossStyle === 2)) {
        const regrowPct = node.type === 'boss' && en.phase >= 2 ? 0.08 : 0.04;
        const regrow = Math.min(Math.ceil(en.maxHp * regrowPct), en.maxHp - en.hp);
        en.hp += regrow;
        if (regrow) appendLog(`<span class="win">${en.name} regrows ${regrow} HP.</span>`);
      }
      if (en.kind === 'leech' || (node.type === 'boss' && en.bossStyle === 1)) {
        const drainPct = node.type === 'boss' && en.phase >= 2 ? 0.065 : 0.035;
        const stolen = Math.min(Math.ceil(en.maxHp * drainPct), en.maxHp - en.hp);
        en.hp += stolen;
        if (stolen) appendLog(`<span class="syn">${en.name} restores ${stolen} HP.</span>`);
      }

      if (hasReflect && blocked > 0) {
        await wait(240);
        const refDmg = Math.round(blocked * (hasPerk('m2') ? 0.85 : 0.6));
        en.hp = Math.max(1, en.hp - refDmg);
        if (enemyVis) { spawnSlash(enemyVis, false); spawnFloat(enemyVis, `REFLECT -${refDmg}`, 'shd'); }
        appendLog(`<span class="shd">Reflect bounced ${refDmg} DMG back!</span>`);
      }

      if (node.type === 'boss' && en.phase >= 2 && en.bossStyle === 0 && attackTurn % 2 === 0) {
        R.runHp = Math.max(0, R.runHp - 6);
        appendLog(`<span class="syn">Cinder wave burns for 6 additional HP.</span>`);
      }
      if (node.type === 'boss' && en.phase >= 2 && en.bossStyle === 3) {
        const baseArmor = en.baseArmor == null ? (en.baseArmor = en.armor || 0) : en.baseArmor;
        en.armor = Math.min(baseArmor + 10, (en.armor || 0) + 2);
        en.atk = Math.round(en.atk * 1.08);
        appendLog(`<span class="syn">Regent's decree: +2 Armor and rising attack (${en.atk}).</span>`);
      }
      if (R.runHp <= 0) {
        R.runHp = Math.max(1, Math.ceil(getMaxHp() * 0.65));
        en.hp = Math.min(en.maxHp, en.hp + Math.ceil(en.maxHp * 0.15));
        R.selectedNode = 0;
        appendLog(`<span class="dmg">Forced retreat. You return to camp at 65% HP; ${en.name} recovers 15% HP.</span>`);
        showToast('Forced retreat · Rest at Camp or rebuild your grid');
      }
      await wait(380);
    }

    saveR();
    isClashing = false;
    renderRealm();
  }

  // ---------- UI Rendering ----------
  let activeTab = 'map', activeJournalTab = 'missions', selectedSlot = null, activeConst = 'endurance';
  let skipNextRealmEntrance = false;

  function injectRealmDOM() {
    if (document.getElementById('realmOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'realmOverlay';
    overlay.className = 'realm-overlay';
    overlay.innerHTML = `<div class="realm-arrival-vfx" aria-hidden="true"><i></i><b></b></div>
      <div class="realm-head">
        <div class="realm-title">The Realm</div>
        <button class="mini-btn" id="realmCloseBtn">Close</button>
      </div>
      <div class="realm-res-bar" id="realmResBar"></div>
      <div class="realm-tabs">
        <button class="realm-tab active" data-rtab="map">Map</button>
        <button class="realm-tab" data-rtab="grid">3×3 Grid</button>
        <button class="realm-tab" data-rtab="stars">Constellations</button>
        <button class="realm-tab" data-rtab="journal">Journal</button>
        <button class="realm-tab" data-rtab="profile">Profile</button>
        <button class="realm-tab" data-rtab="relics">Relics</button>
        <button class="realm-tab" data-rtab="events">Events</button>
        <button class="realm-tab" data-rtab="atlas">Atlas</button>
      </div>
      <div class="realm-body" id="realmBody"></div>
    `;
    document.body.appendChild(overlay);

    const draftModal = document.createElement('div');
    draftModal.id = 'draftModal';
    draftModal.className = 'modal-wrap';
    draftModal.innerHTML = `
      <div class="modal-card">
        <div class="modal-title">Draft 1 of 3 Cubes</div>
        <div class="draft-choices" id="draftChoices"></div>
        <button class="btn btn-secondary" id="draftCancelBtn">Later</button>
      </div>
    `;
    document.body.appendChild(draftModal);

    document.getElementById('realmCloseBtn').addEventListener('click', closeRealm);
    document.getElementById('draftCancelBtn').addEventListener('click', () => draftModal.classList.remove('open'));

    // One delegated listener covers dynamically-rendered Realm controls without
    // touching the timer's separate interaction or session-saving paths.
    overlay.addEventListener('pointerdown', (event) => {
      const control = event.target.closest('button, .cube-slot, .inv-card, .map-node, .star-node, .relic-card, .atlas-region, .atlas-secret');
      if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return;
      playSfx(control.classList.contains('realm-tab') ? 'tab' : 'tap');
    }, { passive: true });

    overlay.querySelectorAll('.realm-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isClashing) return;
        activeTab = btn.dataset.rtab;
        overlay.querySelectorAll('.realm-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderRealm();
      });
    });
  }

  function openRealm() {
    injectRealmDOM();
    const overlay = document.getElementById('realmOverlay');
    renderRealm();
    overlay.classList.remove('realm-arriving');
    // Make the overlay visible first, then restart the arrival sequence from frame zero.
    overlay.classList.add('open');
    void overlay.offsetWidth;
    overlay.classList.add('realm-arriving');
    window.setTimeout(() => overlay.classList.remove('realm-arriving'), 1800);
  }

  function closeRealm() {
    const ov = document.getElementById('realmOverlay');
    if (ov) ov.classList.remove('open');
    updateRealmBadge();
  }

  function openDraftModal() {
    if (R.drafts < 1) { showToast('Study 30m to earn a Cube Draft'); return; }
    const keys = Object.keys(CUBE_DEFS).filter(key => isCubeUnlocked(CUBE_DEFS[key]));
    if (keys.length < 3) { showToast('More cube types unlock through study milestones'); return; }
    const picks = [];
    while (picks.length < 3) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      if (!picks.includes(k)) picks.push(k);
    }
    const wrap = document.getElementById('draftChoices');
    wrap.innerHTML = '';
    picks.forEach(k => {
      const d = CUBE_DEFS[k];
      const card = document.createElement('button');
      card.className = `draft-card ${d.cls}`;
      card.innerHTML = `
        <div style="font-size:24px;width:32px;text-align:center;">${d.glyph}</div>
        <div>
          <div style="font-size:13px;font-weight:500;color:var(--text);">${d.name} <span style="font-size:10px;color:var(--muted);text-transform:uppercase;">· ${d.cls}</span></div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;">${d.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        R.drafts--;
        R.cubesDrafted = (R.cubesDrafted || 0) + 1;
        R.inventory.push({ uid: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2,5), type: k, tier: 1 });
        saveR();
        document.getElementById('draftModal').classList.remove('open');
        renderRealm();
        showToast(`Drafted ${d.name} Cube!`);
      });
      wrap.appendChild(card);
    });
    document.getElementById('draftModal').classList.add('open');
  }

  function renderRealm() {
    const resBar = document.getElementById('realmResBar');
    resBar.innerHTML = `
      <div class="res-pill"><div class="res-val">${R.charges}</div><div class="res-lbl">Surge</div></div>
      <div class="res-pill clickable" id="openDraftPill"><div class="res-val">${R.drafts}</div><div class="res-lbl">Drafts</div></div>
      <div class="res-pill"><div class="res-val">${R.shards}</div><div class="res-lbl">Shards</div></div>
      <div class="res-pill"><div class="res-val">${R.runHp}/${getMaxHp()}</div><div class="res-lbl">Run HP</div></div>
    `;
    document.getElementById('openDraftPill').addEventListener('click', openDraftModal);

    const body = document.getElementById('realmBody');
    if (activeTab === 'map') renderMapTab(body);
    else if (activeTab === 'grid') renderGridTab(body);
    else if (activeTab === 'journal') {
      body.innerHTML = `
        <div class="journal-tabs" role="tablist" aria-label="Journal sections">
          <button class="journal-tab ${activeJournalTab === 'missions' ? 'active' : ''}" data-jtab="missions" role="tab" aria-selected="${activeJournalTab === 'missions'}">Daily</button>
          <button class="journal-tab ${activeJournalTab === 'quests' ? 'active' : ''}" data-jtab="quests" role="tab" aria-selected="${activeJournalTab === 'quests'}">Weekly</button>
          <button class="journal-tab ${activeJournalTab === 'achievements' ? 'active' : ''}" data-jtab="achievements" role="tab" aria-selected="${activeJournalTab === 'achievements'}">Achievements</button>
        </div>
        <div class="journal-content" id="journalContent"></div>`;
      const journalContent = document.getElementById('journalContent');
      if (activeJournalTab === 'missions') renderMissionsTab(journalContent);
      else if (activeJournalTab === 'quests') renderWeeklyQuestsTab(journalContent);
      else renderAchievementsTab(journalContent);
      body.querySelectorAll('[data-jtab]').forEach(btn => btn.addEventListener('click', () => {
        if (isClashing) return;
        activeJournalTab = btn.dataset.jtab;
        renderRealm();
      }));
    }
    else if (activeTab === 'profile') renderProfileTab(body);
    else if (activeTab === 'relics') renderRelicsTab(body);
    else if (activeTab === 'events') renderWorldEventsTab(body);
    else if (activeTab === 'atlas') renderWorldAtlasTab(body);
    else renderConstTab(body);

    // Map enemy selection should feel immediate; keep entrance motion for actual tab changes.
    if (skipNextRealmEntrance) {
      skipNextRealmEntrance = false;
      body.classList.remove('tab-enter');
      body.classList.add('enemy-selection-static');
    } else {
      body.classList.remove('enemy-selection-static');
      body.classList.remove('tab-enter');
      void body.offsetWidth;
      body.classList.add('tab-enter');
    }
  }

  // Daily mission progress is derived from the stopwatch's saved records.
  // It is never incremented from timer events, so edits/deletions stay accurate.
  function getDailyMissionProgress() {
    const today = (window.ChronoStudyData && window.ChronoStudyData.dateKey) || dateKey();
    const sessions = window.ChronoStudyData && window.ChronoStudyData.dateKey === today
      ? window.ChronoStudyData.sessions : [];
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    return {
      date: today,
      minutes: safeSessions.reduce((sum, s) => sum + Math.max(0, Number(s.duration) || 0), 0) / 60000,
      sessionCount: safeSessions.length,
      subjectCount: new Set(safeSessions.map(s => String(s.subject || 'General').trim()).filter(Boolean)).size
    };
  }

  function getMissionClaims(day) {
    if (!R.dailyMissionClaims || typeof R.dailyMissionClaims !== 'object') R.dailyMissionClaims = {};
    if (!Array.isArray(R.dailyMissionClaims[day])) R.dailyMissionClaims[day] = [];
    return R.dailyMissionClaims[day];
  }

  function renderMissionsTab(body) {
    const progress = getDailyMissionProgress();
    const claims = getMissionClaims(progress.date);
    const missions = [
      { id: 'focus', title: 'Deep Focus', detail: 'Record 45 minutes of study', current: progress.minutes, target: 45, unit: 'min', shards: 12, skill: 'endurance', xp: 12 },
      { id: 'sessions', title: 'Build Momentum', detail: 'Complete 2 study sessions', current: progress.sessionCount, target: 2, unit: 'sessions', shards: 10, skill: 'momentum', xp: 12 },
      { id: 'subjects', title: 'Scholar of Many Arts', detail: 'Study 2 different subjects', current: progress.subjectCount, target: 2, unit: 'subjects', shards: 10, skill: 'versatility', xp: 12 },
      { id: 'bonus', title: 'Beyond the Threshold', detail: 'Record 90 minutes today · Bonus', current: progress.minutes, target: 90, unit: 'min', shards: 20, skill: 'endurance', xp: 20, bonus: true }
    ];
    const cards = missions.map(m => {
      const done = m.current >= m.target;
      const claimed = claims.includes(m.id);
      const pct = Math.min(100, Math.round((m.current / m.target) * 100));
      const amount = m.unit === 'min' ? Math.floor(m.current) : m.current;
      return `<div class="mission-card ${m.bonus ? 'bonus' : ''}">
        <div class="mission-top"><div><div class="mission-title">${m.title}</div><div class="mission-detail">${m.detail}</div></div><div class="mission-reward">+${m.shards} ◈</div></div>
        <div class="mission-track"><div class="mission-fill" style="width:${pct}%"></div></div>
        <div class="mission-bottom"><span>${amount}/${m.target} ${m.unit}</span>
          ${claimed ? '<span class="mission-status">CLAIMED</span>' : done ? `<button class="mission-claim" data-mission-claim="${m.id}">Claim reward</button>` : '<span class="mission-status">IN PROGRESS</span>'}
        </div>
      </div>`;
    }).join('');
    body.innerHTML = `<div class="missions-heading"><div class="section-label">DAILY QUEST BOARD</div><div class="mission-date">${progress.date}</div><p>Progress comes from saved study sessions. Editing or deleting a session updates these goals.</p></div><div class="mission-list">${cards}</div>`;
    body.querySelectorAll('[data-mission-claim]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.missionClaim;
        const latest = getDailyMissionProgress();
        const mission = missions.find(m => m.id === id);
        if (!mission || latest.date !== progress.date || latest[mission.unit === 'min' ? 'minutes' : mission.unit === 'sessions' ? 'sessionCount' : 'subjectCount'] < mission.target) {
          showToast('Mission is not complete yet'); renderRealm(); return;
        }
        const ledger = getMissionClaims(latest.date);
        if (ledger.includes(id)) return;
        ledger.push(id);
        R.shards += mission.shards;
        addSkillXp(mission.skill, mission.xp);
        saveR(); updateRealmBadge(); renderRealm();
        showToast(`Mission claimed · +${mission.shards} Shards · +${mission.xp} Skill XP`);
      });
    });
  }


  // Weekly quests use a Monday-to-Sunday window in the device's local timezone.
  function getWeeklyQuestProgress() {
    const snapshot = window.ChronoStudyData || {};
    const today = dateKey();
    const todayDate = new Date(today + 'T12:00:00');
    const monday = new Date(todayDate);
    monday.setDate(monday.getDate() - ((todayDate.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const weekStart = dateKey(monday), weekEnd = dateKey(sunday);
    const rows = Array.isArray(snapshot.weekSessions) ? snapshot.weekSessions : [];
    const sessions = rows.filter(s => s && typeof s.date === 'string' && s.date >= weekStart && s.date <= weekEnd);
    return {
      weekStart, weekEnd,
      minutes: sessions.reduce((sum, s) => sum + Math.max(0, Number(s.duration) || 0), 0) / 60000,
      sessionCount: sessions.length,
      studyDays: new Set(sessions.map(s => s.date)).size,
      subjectCount: new Set(sessions.map(s => String(s.subject || 'General').trim()).filter(Boolean)).size
    };
  }

  function getWeeklyClaims(weekStart) {
    if (!R.weeklyQuestClaims || typeof R.weeklyQuestClaims !== 'object') R.weeklyQuestClaims = {};
    if (!Array.isArray(R.weeklyQuestClaims[weekStart])) R.weeklyQuestClaims[weekStart] = [];
    return R.weeklyQuestClaims[weekStart];
  }

  function renderWeeklyQuestsTab(body) {
    const p = getWeeklyQuestProgress();
    const claims = getWeeklyClaims(p.weekStart);
    const objectives = [
      { id: 'weekly_focus', title: 'The Long Vigil', detail: 'Study for 300 minutes this week', current: p.minutes, target: 300, unit: 'minutes', shards: 35, skill: 'endurance', xp: 30 },
      { id: 'weekly_sessions', title: 'Consistent Practice', detail: 'Complete 5 study sessions this week', current: p.sessionCount, target: 5, unit: 'sessions', shards: 25, skill: 'momentum', xp: 28 },
      { id: 'weekly_days', title: 'Return to the Realm', detail: 'Study on 3 different days', current: p.studyDays, target: 3, unit: 'days', shards: 30, skill: 'versatility', xp: 28 },
      { id: 'weekly_subjects', title: 'Well-Rounded Scholar', detail: 'Study 3 different subjects', current: p.subjectCount, target: 3, unit: 'subjects', shards: 25, skill: 'depth', xp: 25 }
    ];
    const objectiveCards = objectives.map(q => {
      const done = q.current >= q.target, claimed = claims.includes(q.id);
      const amount = q.unit === 'minutes' ? Math.floor(q.current) : q.current;
      const pct = Math.min(100, Math.round((q.current / q.target) * 100));
      return `<div class="mission-card">
        <div class="mission-top"><div><div class="mission-title">${q.title}</div><div class="mission-detail">${q.detail}</div></div><div class="mission-reward">+${q.shards} ◈</div></div>
        <div class="mission-track"><div class="mission-fill" style="width:${pct}%"></div></div>
        <div class="mission-bottom"><span>${amount}/${q.target} ${q.unit}</span>
          ${claimed ? '<span class="mission-status">CLAIMED</span>' : done ? `<button class="mission-claim" data-week-claim="${q.id}">Claim reward</button>` : '<span class="mission-status">IN PROGRESS</span>'}
        </div>
      </div>`;
    }).join('');

    const chain = [
      { id: 'chain_2', title: 'First Steps', detail: 'Study on 2 different days', target: 2, shards: 15, xp: 15, skill: 'momentum' },
      { id: 'chain_4', title: 'Steady Hand', detail: 'Study on 4 different days', target: 4, shards: 25, xp: 22, skill: 'endurance' },
      { id: 'chain_6', title: 'Week’s Resolve', detail: 'Study on 6 different days', target: 6, shards: 40, xp: 35, skill: 'versatility' }
    ];
    let chainUnlocked = true;
    const chainCards = chain.map(q => {
      const claimed = claims.includes(q.id), unlocked = chainUnlocked, done = p.studyDays >= q.target;
      if (!claimed) chainUnlocked = false;
      const pct = Math.min(100, Math.round((p.studyDays / q.target) * 100));
      return `<div class="mission-card ${unlocked ? '' : 'quest-locked'}">
        <div class="mission-top"><div><div class="mission-title">${q.title}</div><div class="mission-detail">${q.detail}${unlocked ? '' : ' · Complete the previous step first'}</div></div><div class="mission-reward">+${q.shards} ◈</div></div>
        <div class="mission-track"><div class="mission-fill" style="width:${pct}%"></div></div>
        <div class="mission-bottom"><span>${Math.min(p.studyDays, q.target)}/${q.target} days</span>
          ${claimed ? '<span class="mission-status">CLAIMED</span>' : !unlocked ? '<span class="mission-status">LOCKED</span>' : done ? `<button class="mission-claim" data-week-claim="${q.id}">Claim reward</button>` : '<span class="mission-status">IN PROGRESS</span>'}
        </div>
      </div>`;
    }).join('');

    body.innerHTML = `<div class="missions-heading"><div class="section-label">WEEKLY QUEST BOARD</div><div class="mission-date">${p.weekStart} — ${p.weekEnd}</div><p>Resets every Monday. Progress comes from saved sessions across this week.</p></div>
      <div class="section-label quest-section-label">WEEKLY OBJECTIVES</div><div class="mission-list">${objectiveCards}</div>
      <div class="section-label quest-section-label">QUEST CHAIN · THE SCHOLAR’S PATH</div><p class="quest-chain-note">Claim each step to unlock the next.</p><div class="mission-list">${chainCards}</div>`;

    body.querySelectorAll('[data-week-claim]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.weekClaim, latest = getWeeklyQuestProgress();
      if (latest.weekStart !== p.weekStart) { showToast('A new week has begun'); renderRealm(); return; }
      const ledger = getWeeklyClaims(latest.weekStart);
      if (ledger.includes(id)) return;
      const objective = objectives.find(q => q.id === id);
      const chainIndex = chain.findIndex(q => q.id === id);
      let reward = objective;
      if (chainIndex >= 0) {
        const previousClaimed = chainIndex === 0 || ledger.includes(chain[chainIndex - 1].id);
        if (!previousClaimed || latest.studyDays < chain[chainIndex].target) { showToast('Quest step is still locked'); return; }
        reward = chain[chainIndex];
      } else if (!objective || latest[objective.unit === 'minutes' ? 'minutes' : objective.unit === 'sessions' ? 'sessionCount' : objective.unit === 'days' ? 'studyDays' : 'subjectCount'] < objective.target) {
        showToast('Weekly quest is not complete yet'); return;
      }
      if (!reward) return;
      ledger.push(id); R.shards += reward.shards;
      addSkillXp(reward.skill, reward.xp);
      saveR(); updateRealmBadge(); renderRealm();
      showToast(`Quest claimed · +${reward.shards} Shards · +${reward.xp} Skill XP`);
    }));
  }


  // Permanent achievements. Progress is derived from saved study history plus
  // lifetime Realm counters; claiming a reward never changes the requirement.
  const ACHIEVEMENTS = [
    {id:'study_1h',cat:'Scholarship',name:'First Light',desc:'Study for 1 hour in total',metric:'minutes',target:60,reward:10},
    {id:'study_5h',cat:'Scholarship',name:'Kindled Mind',desc:'Study for 5 hours in total',metric:'minutes',target:300,reward:15},
    {id:'study_10h',cat:'Scholarship',name:'The Long Vigil',desc:'Study for 10 hours in total',metric:'minutes',target:600,reward:20},
    {id:'study_25h',cat:'Scholarship',name:'Keeper of Hours',desc:'Study for 25 hours in total',metric:'minutes',target:1500,reward:25},
    {id:'study_50h',cat:'Scholarship',name:'Deep Scholar',desc:'Study for 50 hours in total',metric:'minutes',target:3000,reward:35},
    {id:'study_100h',cat:'Scholarship',name:'Century of Focus',desc:'Study for 100 hours in total',metric:'minutes',target:6000,reward:50},
    {id:'sessions_1',cat:'Scholarship',name:'The Beginning',desc:'Save your first study session',metric:'sessions',target:1,reward:10},
    {id:'sessions_10',cat:'Scholarship',name:'Regular',desc:'Save 10 study sessions',metric:'sessions',target:10,reward:15},
    {id:'sessions_25',cat:'Scholarship',name:'Practitioner',desc:'Save 25 study sessions',metric:'sessions',target:25,reward:20},
    {id:'sessions_50',cat:'Scholarship',name:'Seasoned Student',desc:'Save 50 study sessions',metric:'sessions',target:50,reward:30},
    {id:'sessions_100',cat:'Scholarship',name:'A Hundred Returns',desc:'Save 100 study sessions',metric:'sessions',target:100,reward:45},
    {id:'sessions_250',cat:'Scholarship',name:'The Dedicated',desc:'Save 250 study sessions',metric:'sessions',target:250,reward:70},
    {id:'long_30',cat:'Scholarship',name:'Settled In',desc:'Complete a session of 30 minutes',metric:'longest',target:30,reward:10},
    {id:'long_45',cat:'Scholarship',name:'Beyond the Hourglass',desc:'Complete a session of 45 minutes',metric:'longest',target:45,reward:15},
    {id:'long_60',cat:'Scholarship',name:'Deep Work',desc:'Complete a session of 60 minutes',metric:'longest',target:60,reward:20},
    {id:'long_90',cat:'Scholarship',name:'Unbroken Hour',desc:'Complete a session of 90 minutes',metric:'longest',target:90,reward:25},
    {id:'long_120',cat:'Scholarship',name:'Marathon Mind',desc:'Complete a session of 120 minutes',metric:'longest',target:120,reward:35},
    {id:'days_3',cat:'Consistency',name:'Three Embers',desc:'Study on 3 different days',metric:'days',target:3,reward:15},
    {id:'days_7',cat:'Consistency',name:'Week of Resolve',desc:'Study on 7 different days',metric:'days',target:7,reward:20},
    {id:'days_14',cat:'Consistency',name:'Fortnight Flame',desc:'Study on 14 different days',metric:'days',target:14,reward:25},
    {id:'days_30',cat:'Consistency',name:'Month of Momentum',desc:'Study on 30 different days',metric:'days',target:30,reward:40},
    {id:'days_60',cat:'Consistency',name:'Steadfast',desc:'Study on 60 different days',metric:'days',target:60,reward:55},
    {id:'days_100',cat:'Consistency',name:'Unyielding',desc:'Study on 100 different days',metric:'days',target:100,reward:75},
    {id:'streak_3',cat:'Consistency',name:'Three-Day Spark',desc:'Reach a 3-day study streak',metric:'streak',target:3,reward:15},
    {id:'streak_7',cat:'Consistency',name:'Seven-Day Oath',desc:'Reach a 7-day study streak',metric:'streak',target:7,reward:25},
    {id:'streak_14',cat:'Consistency',name:'Two-Week Vow',desc:'Reach a 14-day study streak',metric:'streak',target:14,reward:40},
    {id:'streak_30',cat:'Consistency',name:'Month Without Fade',desc:'Reach a 30-day study streak',metric:'streak',target:30,reward:65},
    {id:'subjects_2',cat:'Mastery',name:'Two Paths',desc:'Study 2 different subjects',metric:'subjects',target:2,reward:10},
    {id:'subjects_3',cat:'Mastery',name:'Scholar of Many Arts',desc:'Study 3 different subjects',metric:'subjects',target:3,reward:15},
    {id:'subjects_5',cat:'Mastery',name:'Polymath',desc:'Study 5 different subjects',metric:'subjects',target:5,reward:25},
    {id:'subjects_8',cat:'Mastery',name:'Wide Horizons',desc:'Study 8 different subjects',metric:'subjects',target:8,reward:40},
    {id:'shards_100',cat:'Mastery',name:'Shard Collector',desc:'Hold 100 Obsidian Shards',metric:'shards',target:100,reward:10},
    {id:'shards_250',cat:'Mastery',name:'Shard Hoard',desc:'Hold 250 Obsidian Shards',metric:'shards',target:250,reward:20},
    {id:'shards_500',cat:'Mastery',name:'Obsidian Treasury',desc:'Hold 500 Obsidian Shards',metric:'shards',target:500,reward:35},
    {id:'skill_5',cat:'Mastery',name:'Awakening',desc:'Reach level 5 in any skill',metric:'skill',target:5,reward:20},
    {id:'skill_10',cat:'Mastery',name:'Adept',desc:'Reach level 10 in any skill',metric:'skill',target:10,reward:35},
    {id:'perks_1',cat:'Mastery',name:'First Constellation',desc:'Unlock a constellation perk',metric:'perks',target:1,reward:15},
    {id:'perks_5',cat:'Mastery',name:'Starbound',desc:'Unlock 5 constellation perks',metric:'perks',target:5,reward:30},
    {id:'cubes_1',cat:'The Realm',name:'Cube Awakened',desc:'Draft your first cube',metric:'drafts',target:1,reward:10},
    {id:'cubes_5',cat:'The Realm',name:'Growing Arsenal',desc:'Draft 5 cubes',metric:'drafts',target:5,reward:20},
    {id:'cubes_10',cat:'The Realm',name:'Cube Curator',desc:'Draft 10 cubes',metric:'drafts',target:10,reward:30},
    {id:'wins_1',cat:'The Realm',name:'First Blood',desc:'Win your first battle',metric:'wins',target:1,reward:15},
    {id:'wins_5',cat:'The Realm',name:'Path Cleared',desc:'Win 5 battles',metric:'wins',target:5,reward:25},
    {id:'wins_10',cat:'The Realm',name:'Veteran Delver',desc:'Win 10 battles',metric:'wins',target:10,reward:40},
    {id:'wins_25',cat:'The Realm',name:'Warden Breaker',desc:'Win 25 battles',metric:'wins',target:25,reward:60},
    {id:'boss_1',cat:'The Realm',name:'Warden Fall',desc:'Defeat your first zone boss',metric:'bosses',target:1,reward:25},
    {id:'boss_3',cat:'The Realm',name:'Realm Conqueror',desc:'Defeat 3 zone bosses',metric:'bosses',target:3,reward:50},
    {id:'zone_3',cat:'The Realm',name:'Beyond the First Gate',desc:'Reach zone 3',metric:'zone',target:3,reward:35},
    {id:'zone_5',cat:'The Realm',name:'Far-Roaming',desc:'Reach zone 5',metric:'zone',target:5,reward:60},
    {id:'grid_full',cat:'The Realm',name:'Perfect Formation',desc:'Fill all 9 cube grid slots',metric:'grid',target:9,reward:30}
  ];

  function getAchievementStats() {
    const rows = window.ChronoStudyData && Array.isArray(window.ChronoStudyData.allTimeSessions)
      ? window.ChronoStudyData.allTimeSessions : [];
    const minutes = rows.reduce((sum, s) => sum + Math.max(0, Number(s.duration) || 0), 0) / 60000;
    const days = [...new Set(rows.map(s => s.date).filter(Boolean))].sort();
    const subjects = new Set(rows.map(s => String(s.subject || 'General').trim()).filter(Boolean));
    let streak = 0, cursor = new Date();
    while (days.includes(dateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const skills = Object.values(R.skills || {}).map(s => Number(s.lvl) || 1);
    return {
      minutes, sessions: rows.length,
      longest: rows.reduce((max, s) => Math.max(max, (Number(s.duration) || 0) / 60000), 0),
      days: days.length, subjects: subjects.size, streak,
      shards: Number(R.shards) || 0, skill: Math.max(1, ...skills),
      perks: Object.keys(R.perks || {}).filter(k => R.perks[k]).length,
      drafts: Number(R.cubesDrafted) || 0, wins: Number(R.combatWins) || 0,
      bosses: Number(R.bossWins) || 0, zone: Number(R.zone) || 1,
      grid: (R.grid || []).filter(Boolean).length
    };
  }

  function getCombatStudyMetrics() {
    const rows = window.ChronoStudyData && Array.isArray(window.ChronoStudyData.allTimeSessions)
      ? window.ChronoStudyData.allTimeSessions : [];
    const recordMinutes = rows.reduce((sum, s) => sum + Math.max(0, Number(s.duration) || 0), 0) / 60000;
    return {
      minutes: Math.max(Number(R.totalStudyMins) || 0, recordMinutes),
      sessions: Math.max(Number(R.studySessionCount) || 0, rows.length),
      subjects: new Set(rows.map(s => String(s.subject || 'General').trim()).filter(Boolean)).size
    };
  }

  function isCubeUnlocked(def, stats) {
    if (!def || !def.unlock) return true;
    const metrics = stats || getCombatStudyMetrics();
    return Number(metrics[def.unlock.metric]) >= def.unlock.target;
  }

  function grantStudyCubeUnlocks() {
    if (!Array.isArray(R.inventory)) R.inventory = [];
    if (!R.studyCubeClaims || typeof R.studyCubeClaims !== 'object') R.studyCubeClaims = {};
    const metrics = getCombatStudyMetrics();
    const granted = [];
    Object.values(CUBE_DEFS).forEach(def => {
      if (!def.unlock || !isCubeUnlocked(def, metrics) || R.studyCubeClaims[def.id]) return;
      const uid = 'study_unlock_' + def.id;
      if (!R.inventory.some(c => c && c.uid === uid)) {
        R.inventory.push({ uid, type: def.id, tier: 1 });
      }
      R.studyCubeClaims[def.id] = true;
      granted.push(def.name);
    });
    return granted;
  }

  const PROFILE_TITLES = [
    {id:'newcomer',name:'The Initiate',desc:'Your journey begins here',unlock:s=>true},
    {id:'focused',name:'The Focused',desc:'Study for 5 total hours',unlock:s=>s.minutes>=300},
    {id:'scholar',name:'The Scholar',desc:'Study for 25 total hours',unlock:s=>s.minutes>=1500},
    {id:'vigilant',name:'The Vigilant',desc:'Build a 7-day study streak',unlock:s=>s.streak>=7},
    {id:'veteran',name:'Realm Veteran',desc:'Win 10 battles',unlock:s=>s.wins>=10},
    {id:'slayer',name:'Boss Slayer',desc:'Defeat 3 bosses',unlock:s=>s.bosses>=3},
    {id:'architect',name:'Grid Architect',desc:'Fill all 9 grid slots',unlock:s=>s.grid>=9},
    {id:'legend',name:'The Unyielding',desc:'Study for 100 total hours',unlock:s=>s.minutes>=6000}
  ];

  function getPlayerProgress(stats) {
    const xp = Math.floor(stats.minutes / 5) + stats.wins * 15 + stats.bosses * 50 + Object.values(R.achievementClaims || {}).filter(Boolean).length * 20;
    let level = 1, remaining = xp, needed = 100;
    while (remaining >= needed && level < 99) { remaining -= needed; level++; needed = 100 + (level - 1) * 50; }
    return {xp,level,remaining,needed};
  }

  function renderProfileTab(body) {
    const stats = getAchievementStats();
    const progress = getPlayerProgress(stats);
    const unlocked = PROFILE_TITLES.filter(t => t.unlock(stats));
    const selected = unlocked.find(t => t.id === R.selectedTitle) || unlocked[0];
    R.selectedTitle = selected.id;
    const frame = stats.bosses >= 5 ? 'ECLIPSE FRAME' : stats.minutes >= 1500 ? 'VIOLET FRAME' : stats.minutes >= 300 ? 'EMBER FRAME' : 'INITIATE FRAME';
    const pct = Math.min(100, Math.round(progress.remaining / progress.needed * 100));
    const bestiaryEntries = Object.entries(R.bestiary || {}).filter(([, kills]) => Number(kills) > 0).sort((a, b) => a[0].localeCompare(b[0]));
    const bestiaryTotal = bestiaryEntries.reduce((sum, [, kills]) => sum + Number(kills || 0), 0);
    const bestiaryHtml = bestiaryEntries.length ? bestiaryEntries.map(([key, kills]) => {
      const title = key.startsWith('boss:') ? key.slice(5) : key.replace(/^enemy:/, '').replace(/^./, ch => ch.toUpperCase());
      return `<div class="bestiary-card"><strong>${title}</strong><span>${kills} ${Number(kills) === 1 ? 'victory' : 'victories'}</span></div>`;
    }).join('') : '<div class="bestiary-empty">No trophies yet. Defeat an enemy for its first-record bounty.</div>';
    body.innerHTML = `
      <section class="player-profile">
        <div class="profile-card ${frame.toLowerCase().replace(/ /g,'-')}">
          <div class="profile-frame-label">${frame}</div>
          <div class="profile-avatar">✦</div>
          <div class="profile-kicker">CHRONOREALM ADVENTURER</div>
          <div class="profile-level">LEVEL ${progress.level}</div>
          <div class="profile-title">${selected.name}</div>
          <div class="profile-xp-track"><div style="width:${pct}%"></div></div>
          <div class="profile-xp-meta"><span>${progress.remaining} XP</span><span>${progress.needed} XP TO NEXT LEVEL</span></div>
        </div>
        <div class="profile-section-label">YOUR RECORD</div>
        <div class="profile-stat-grid">
          <div class="profile-stat"><strong>${Math.floor(stats.minutes/60)}h ${Math.floor(stats.minutes%60)}m</strong><span>STUDY TIME</span></div>
          <div class="profile-stat"><strong>${stats.sessions}</strong><span>SESSIONS</span></div>
          <div class="profile-stat"><strong>${stats.wins}</strong><span>BATTLES WON</span></div>
          <div class="profile-stat"><strong>${stats.bosses}</strong><span>BOSSES DEFEATED</span></div>
          <div class="profile-stat"><strong>${stats.streak}</strong><span>CURRENT STREAK</span></div>
          <div class="profile-stat"><strong>${stats.zone}</strong><span>HIGHEST ZONE</span></div>
        </div>
        <div class="profile-section-label">BESTIARY · ${bestiaryEntries.length} SPECIES · ${bestiaryTotal} VICTORIES</div>
        <div class="bestiary-grid">${bestiaryHtml}</div>
        <div class="profile-section-label">TITLE COLLECTION · ${unlocked.length}/${PROFILE_TITLES.length} UNLOCKED</div>
        <div class="profile-title-list">${PROFILE_TITLES.map(t => { const open=t.unlock(stats), active=t.id===selected.id; return `<button class="profile-title-option ${open?'':'locked'} ${active?'selected':''}" data-profile-title="${t.id}" ${open?'':'disabled'}><span class="profile-title-name">${open?'✦':'◇'} ${t.name}</span><span class="profile-title-desc">${open?t.desc:'LOCKED · '+t.desc}</span>${active?'<span class="profile-title-equipped">EQUIPPED</span>':''}</button>`; }).join('')}</div>
      </section>`;
    body.querySelectorAll('[data-profile-title]').forEach(btn => btn.addEventListener('click', () => {
      const choice = unlocked.find(t => t.id === btn.dataset.profileTitle);
      if (!choice) return;
      R.selectedTitle = choice.id; saveR(); renderRealm(); showToast(choice.name + ' equipped');
    }));
  }

  const RELIC_DEFS = [
    {id:'ember',name:'Ember Sigil',glyph:'✹',rarity:'Uncommon',desc:'+8% strike damage',unlock:s=>s.minutes>=60,requirement:'Study 1 hour',stat:'strike',value:0.08},
    {id:'aegis',name:'Aegis Crest',glyph:'⬡',rarity:'Uncommon',desc:'+10% shield strength',unlock:s=>s.wins>=3,requirement:'Win 3 battles',stat:'ward',value:0.10},
    {id:'hourglass',name:'Scholar’s Hourglass',glyph:'⌛',rarity:'Rare',desc:'+6% overall cube power',unlock:s=>s.minutes>=300,requirement:'Study 5 hours',stat:'power',value:0.06},
    {id:'star_lens',name:'Star Lens',glyph:'✧',rarity:'Rare',desc:'+5% critical chance',unlock:s=>s.zone>=2,requirement:'Reach Zone 2',stat:'crit',value:0.05},
    {id:'phoenix',name:'Phoenix Thread',glyph:'♨',rarity:'Epic',desc:'+12% healing from Mend cubes',unlock:s=>s.bosses>=1,requirement:'Defeat a boss',stat:'heal',value:0.12}
  ];
  function getUnlockedRelics() { const stats=getAchievementStats(); return RELIC_DEFS.filter(relic=>relic.unlock(stats)); }
  function getEquippedRelicBonuses() {
    const bonuses={strike:0,ward:0,power:0,crit:0,heal:0};
    const unlocked=getUnlockedRelics();
    R.equippedRelics=(Array.isArray(R.equippedRelics)?R.equippedRelics:[]).filter((id,i,a)=>a.indexOf(id)===i&&unlocked.some(r=>r.id===id)).slice(0,2);
    R.equippedRelics.forEach(id=>{const relic=RELIC_DEFS.find(r=>r.id===id);if(relic)bonuses[relic.stat]+=relic.value;});
    return bonuses;
  }
  function renderRelicsTab(body) {
    const unlocked=getUnlockedRelics(), stats=getAchievementStats();
    getEquippedRelicBonuses();
    body.innerHTML=`<section class="relic-workshop">
      <div class="relic-hero"><div class="relic-hero-mark">✧</div><div class="relic-hero-title">RELIC VAULT</div><div class="relic-hero-copy">Ancient keepsakes. Small advantages. Your build, your choice.</div>
      <div class="relic-slot-row">${[0,1].map(i=>{const relic=RELIC_DEFS.find(r=>r.id===R.equippedRelics[i]);return `<div class="relic-slot ${relic?'filled':''}"><span>${relic?relic.glyph:'◇'}</span><small>${relic?relic.name:'EMPTY SLOT'}</small></div>`;}).join('')}</div><div class="relic-slot-note">${R.equippedRelics.length}/2 RELICS EQUIPPED</div></div>
      <div class="relic-list-head"><span>RELIC COLLECTION</span><span>${unlocked.length}/${RELIC_DEFS.length} FOUND</span></div>
      <div class="relic-list">${RELIC_DEFS.map(relic=>{const open=relic.unlock(stats),active=R.equippedRelics.includes(relic.id);return `<article class="relic-card ${open?'':'locked'} ${active?'equipped':''}"><div class="relic-icon">${open?relic.glyph:'?'}</div><div class="relic-info"><strong>${open?relic.name:'Unknown Relic'}</strong><span class="relic-rarity">${open?relic.rarity:'UNDISCOVERED'}</span><p>${open?relic.desc:'Unlock: '+relic.requirement}</p></div><button class="mini-btn relic-action" data-relic="${relic.id}" ${!open||(!active&&R.equippedRelics.length>=2)?'disabled':''}>${active?'Unequip':open?'Equip':'Locked'}</button></article>`;}).join('')}</div>
      <div class="relic-footnote">Relics only change battle calculations. They do not affect study rewards, shard costs, or saved progress.</div></section>`;
    body.querySelectorAll('[data-relic]').forEach(btn=>btn.addEventListener('click',()=>{
      const id=btn.dataset.relic;if(!getUnlockedRelics().some(r=>r.id===id))return;
      if(R.equippedRelics.includes(id))R.equippedRelics=R.equippedRelics.filter(x=>x!==id);
      else if(R.equippedRelics.length<2)R.equippedRelics.push(id);else{showToast('Both relic slots are full. Unequip one first.');return;}
      saveR();renderRealm();showToast(RELIC_DEFS.find(r=>r.id===id).name+(R.equippedRelics.includes(id)?' equipped':' unequipped'));
    }));
  }
  const WORLD_EVENT_DEFS = [
    {id:'rift_hunt',name:'Rift Hunt',kind:'reaver',hp:1.18,atk:1.08,armor:2,shards:28,rule:'A fast hunter emerges from a widening rift. Two quick strikes; extra armor.'},
    {id:'emberfall',name:'Emberfall Trial',kind:'wraith',hp:1.08,atk:1.22,armor:0,shards:30,rule:'The ash storm empowers its attack. Prepare a strong Ward.'},
    {id:'iron_oath',name:'Iron Oath',kind:'monolith',hp:1.22,atk:1.05,armor:4,shards:32,rule:'A plated guardian with extra health and armor.'},
    {id:'tidebound',name:'Tidebound Pursuit',kind:'leech',hp:1.16,atk:1.12,armor:1,shards:32,rule:'A resilient leech with a punishing counterstrike.'},
    {id:'starfall',name:'Starfall Gauntlet',kind:'hexcaller',hp:1.12,atk:1.18,armor:2,shards:36,rule:'A hexcaller grows stronger after every counterattack.'}
  ];
  function getWorldEventRecord() {
    const today=dateKey();
    if(!R.worldEvent||R.worldEvent.date!==today){
      const day=Math.floor(new Date(today+'T00:00:00').getTime()/86400000);
      const def=WORLD_EVENT_DEFS[((day%WORLD_EVENT_DEFS.length)+WORLD_EVENT_DEFS.length)%WORLD_EVENT_DEFS.length];
      const enemy=makeEnemy(def.kind,1.12+Math.max(0,R.zone-1)*0.08,R.zone);
      enemy.hp=Math.round(enemy.hp*def.hp);enemy.maxHp=enemy.hp;enemy.atk=Math.round(enemy.atk*def.atk);enemy.armor+=def.armor;
      enemy.gimmick+=' · World Event';
      R.worldEvent={date:today,id:def.id,name:def.name,rule:def.rule,node:{id:-1,type:'hostile',isWorldEvent:true,cleared:false,enemy},rewardShards:def.shards+Math.max(0,R.zone-1)*2,rewardDrafts:1,completed:false};
      saveR();
    }
    return R.worldEvent;
  }
  const WORLD_REGIONS = [
    { name: 'Ashen March', detail: 'A scorched frontier of broken fortresses.', unlock: 1, emblem: '♨' },
    { name: 'Drowned Archive', detail: 'A sunken library guarded by restless echoes.', unlock: 2, emblem: '⌁' },
    { name: 'Thornwild', detail: 'An overgrown maze that fights back.', unlock: 3, emblem: '❧' },
    { name: 'Hollow Crown', detail: 'A fallen kingdom beneath a watchful curse.', unlock: 4, emblem: '♛' },
    { name: 'Starfall Citadel', detail: 'A fortress carved from fallen stars.', unlock: 5, emblem: '✧' }
  ];
  function renderWorldAtlasTab(body) {
    const regions = WORLD_REGIONS.map((region, index) => {
      const unlocked = R.zone >= region.unlock;
      const current = R.zone === region.unlock;
      return `<article class="atlas-region ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}">
        <div class="atlas-region-emblem">${unlocked ? region.emblem : '◇'}</div>
        <div class="atlas-region-copy"><div class="atlas-region-kicker">REGION 0${index + 1} · ${unlocked ? (current ? 'CURRENT REGION' : 'DISCOVERED') : 'SEALED'}</div><h3>${region.name}</h3><p>${region.detail}</p></div>
        <div class="atlas-region-state">${unlocked ? 'OPEN' : 'ZONE ' + region.unlock}</div>
      </article>`;
    }).join('');
    const secretOpen = (R.bossWins || 0) >= 1;
    const secretNode = R.map.find(n => n.isSecretBoss);
    const secretCleared = !!(secretNode && secretNode.cleared);
    body.innerHTML = `<section class="world-atlas">
      <div class="atlas-hero"><div class="atlas-kicker">CHRONOREALM · WORLD ATLAS</div><h2>The Known Realms</h2><p>Every fallen zone guardian opens the next region. The map also hides a dangerous side path for those who explore beyond the main road.</p><div class="atlas-progress"><span>REGION PROGRESS</span><strong>${Math.min(R.zone, 5)} / 5</strong></div><div class="atlas-progress-track"><i style="width:${Math.min(100, R.zone / 5 * 100)}%"></i></div></div>
      <div class="atlas-region-list">${regions}</div>
      <div class="atlas-secret ${secretOpen ? 'open' : 'sealed'}"><div class="atlas-secret-icon">${secretCleared ? '✓' : '⌘'}</div><div><div class="atlas-region-kicker">HIDDEN ROUTE · OPTIONAL BOSS</div><h3>${secretCleared ? 'Veilbound Warden defeated' : secretOpen ? 'The Veilbound Warden' : 'A path behind the veil'}</h3><p>${secretCleared ? 'The secret guardian has been defeated. Its reward is already yours.' : secretOpen ? 'A hidden node now appears on your Zone map, branching from the central route. Defeat it for bonus rewards.' : 'Defeat your first zone boss to reveal a secret route on the map.'}</p></div><span class="atlas-secret-state">${secretCleared ? 'CLEARED' : secretOpen ? 'REVEALED' : 'SEALED'}</span></div>
    </section>`;
  }

  function renderWorldEventsTab(body) {
    const event=getWorldEventRecord();
    const completed=!!event.completed;
    const enemy=event.node.enemy;
    body.innerHTML=`<section class="world-events">
      <div class="world-event-hero"><div class="world-event-kicker">THE REALM · DAILY ROTATION</div><div class="world-event-emblem">✧</div><h2>${event.name}</h2><p>${event.rule}</p><div class="world-event-reward"><span>✦ ${event.rewardShards} SHARDS</span><span>◇ ${event.rewardDrafts} DRAFT</span></div><div class="world-event-refresh">A new encounter arrives tomorrow.</div></div>
      <div class="world-event-enemy"><div><small>FEATURED ENCOUNTER</small><strong>${enemy.name}</strong><span>${enemy.hp}/${enemy.maxHp} HP · ${enemy.atk} ATK · ${enemy.armor} ARMOR</span></div><div class="world-event-status ${completed?'complete':''}">${completed?'CLEARED':'ACTIVE'}</div></div>
      <div class="world-event-note">${completed?'You have claimed today’s event rewards. Come back for the next rotation.':'A special encounter with its own enemy setup and bonus rewards. Your normal map progress is safe.'}</div>
      <button class="btn btn-primary world-event-enter" id="enterWorldEventBtn" ${completed?'disabled':''}>${completed?'Event Cleared':'Enter Encounter · Free'}</button>
    </section>`;
    const enter=document.getElementById('enterWorldEventBtn');
    if(enter)enter.addEventListener('click',()=>{if(isClashing||event.completed)return;R.selectedNode=-1;activeTab='map';document.querySelectorAll('.realm-tab').forEach(b=>b.classList.toggle('active',b.dataset.rtab==='map'));saveR();renderRealm();});
  }
  function renderAchievementsTab(body) {
    const stats = getAchievementStats();
    const claimed = R.achievementClaims;
    const unlocked = ACHIEVEMENTS.filter(a => stats[a.metric] >= a.target);
    const categories = ['Scholarship','Consistency','Mastery','The Realm'];
    const cards = categories.map(category => {
      const items = ACHIEVEMENTS.filter(a => a.cat === category).map(a => {
        const value = stats[a.metric], done = value >= a.target, paid = claimed[a.id] === true;
        const shown = a.metric === 'minutes' || a.metric === 'longest' ? Math.floor(value) : value;
        const current = Math.min(a.target, shown);
        const pct = Math.min(100, Math.round((value / a.target) * 100));
        return `<div class="achievement-card ${done ? 'unlocked' : ''} ${paid ? 'claimed' : ''}">
          <div class="achievement-icon">${paid ? '✦' : done ? '◇' : '◆'}</div>
          <div class="achievement-copy"><div class="achievement-name">${a.name}</div><div class="achievement-desc">${a.desc}</div>
            <div class="achievement-track"><div class="achievement-fill" style="width:${pct}%"></div></div>
            <div class="achievement-meta"><span>${current}/${a.target}</span><span>+${a.reward} ◈</span></div>
          </div>
          <div class="achievement-action">${paid ? '<span>CLAIMED</span>' : done ? `<button class="mission-claim" data-achievement-claim="${a.id}">Claim</button>` : '<span>LOCKED</span>'}</div>
        </div>`;
      }).join('');
      const count = ACHIEVEMENTS.filter(a => a.cat === category && claimed[a.id]).length;
      return `<section class="achievement-section"><div class="section-label">${category.toUpperCase()} · ${count}/${ACHIEVEMENTS.filter(a => a.cat === category).length} CLAIMED</div><div class="achievement-list">${items}</div></section>`;
    }).join('');
    body.innerHTML = `<div class="missions-heading"><div class="section-label">CHRONOREALM · ACHIEVEMENTS</div><div class="mission-date">${Object.keys(claimed).filter(k => claimed[k]).length} / ${ACHIEVEMENTS.length} CLAIMED</div><p>${unlocked.length} unlocked · Claim each milestone once for its shard reward. Your progress is based on saved study records and Realm milestones.</p></div>${cards}`;
    body.querySelectorAll('[data-achievement-claim]').forEach(btn => btn.addEventListener('click', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === btn.dataset.achievementClaim);
      if (!achievement) return;
      const latest = getAchievementStats();
      if (latest[achievement.metric] < achievement.target || claimed[achievement.id]) { showToast('Achievement is not ready'); renderRealm(); return; }
      claimed[achievement.id] = true;
      R.shards += achievement.reward;
      saveR(); updateRealmBadge(); renderRealm();
      showLegendaryMoment(achievement.name, `Milestone claimed · +${achievement.reward} Shards added to your stash.`, '✦');
      showToast(`Achievement claimed · +${achievement.reward} Shards`);
    }));
  }

  function enemySvg(kind) {
    if (kind === 'monolith') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#f5f5f7" stroke-width="1.6"><rect x="8" y="5" width="20" height="26" rx="2"/><line x1="8" y1="14" x2="28" y2="14"/><line x1="8" y1="22" x2="28" y2="22"/></svg>`;
    if (kind === 'phantom' || kind === 'wraith') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#64d2ff" stroke-width="1.6"><polygon points="18,4 32,18 18,32 4,18"/><circle cx="18" cy="18" r="4"/></svg>`;
    if (kind === 'swarm' || kind === 'reaver') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#ffd60a" stroke-width="1.6"><polygon points="12,8 18,18 6,18"/><polygon points="24,8 30,18 18,18"/><polygon points="18,19 24,29 12,29"/></svg>`;
    if (kind === 'thorn' || kind === 'leech') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#30d158" stroke-width="1.6"><path d="M18 3 L23 13 L33 18 L23 23 L18 33 L13 23 L3 18 L13 13 Z"/></svg>`;
    if (kind === 'hexcaller') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#bf8cff" stroke-width="1.6"><path d="M18 3 L31 11 L31 25 L18 33 L5 25 L5 11 Z"/><circle cx="18" cy="18" r="5"/></svg>`;
    return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#ff453a" stroke-width="1.7"><polygon points="18,3 33,12 28,31 8,31 3,12"/><polygon points="18,10 25,18 18,26 11,18"/></svg>`;
  }

  // Enemy guards rotate on later turns, so the same static grid is not always safe.
  function getEnemyTactic(en) {
    if (!en) return null;
    const turn = Math.max(0, en.turns || 0);
    const row = turn % 3, column = turn % 3;
    const rowCells = r => [r * 3, r * 3 + 1, r * 3 + 2];
    const colCells = c => [c, c + 3, c + 6];
    const tactics = {
      monolith: { label: 'Stoneguard · middle column weakens strikes by 40%', cells: [1, 4, 7] },
      phantom: { label: `Phase Veil · row ${row + 1} weakens strikes by 40%`, cells: rowCells(row) },
      swarm: { label: 'Swarm Screen · corner cells weaken strikes by 40%', cells: [0, 2, 6, 8] },
      reaver: { label: `Duelist Guard · column ${column + 1} weakens strikes by 40%`, cells: colCells(column) },
      thorn: { label: `Root Snare · row ${3 - row} weakens strikes by 40%`, cells: rowCells(2 - row) },
      leech: { label: turn % 2 ? 'Tidal Ward · counter-diagonal weakens strikes by 40%' : 'Tidal Ward · main diagonal weakens strikes by 40%', cells: turn % 2 ? [2, 4, 6] : [0, 4, 8] },
      hexcaller: { label: `Shifting Hex · column ${column + 1} weakens strikes by 40%`, cells: colCells(column) }
    };
    if (en.kind === 'boss') {
      const bosses = [
        { label: 'Tyrant Guard · middle column weakens strikes by 40%', cells: [1, 4, 7] },
        { label: `Scribe Veil · row ${((turn + 1) % 3) + 1} weakens strikes by 40%`, cells: rowCells((turn + 1) % 3) },
        { label: `Briar Roots · row ${3 - row} weakens strikes by 40%`, cells: rowCells(2 - row) },
        { label: `Regent Hex · column ${((column + (en.phase >= 2 ? 1 : 0)) % 3) + 1} weakens strikes by 40%`, cells: colCells((column + (en.phase >= 2 ? 1 : 0)) % 3) },
        { label: en.phase >= 2 ? 'Astral Ward · cross and corners weaken strikes by 40%' : 'Astral Ward · corners weaken strikes by 40%', cells: en.phase >= 2 ? [0, 2, 4, 6, 8] : [0, 2, 6, 8] }
      ];
      return bosses[(en.bossStyle || 0) % 5];
    }
    return tactics[en.kind] || null;
  }

  function getEnemyIntent(en) {
    if (!en) return 'NEXT: Unknown';
    const turn = (en.turns || 0) + 1;
    if (en.kind === 'boss') {
      const intents = (en.phase || 1) >= 2
        ? ['CINDER WAVE · heavy hit every second turn', 'LEECHING TIDE · restores more HP after striking', 'RAMPANT ROOTS · rapid regeneration', 'ROYAL DECREE · armor and attack escalate', 'STARFALL · double strike; every second turn pierces shields']
        : ['ARMORED SLAM · heavy counter every second turn', 'DRAINING TIDE · restores HP after striking', 'ROOT GUARD · regenerates after striking', 'ROYAL GUARD · hardens after striking', 'ASTRAL WARD · protected corners'];
      return 'PHASE ' + (en.phase || 1) + ' · ' + intents[(en.bossStyle || 0) % 5];
    }
    const intents = {
      monolith: turn % 3 === 0 ? 'CRUSHING SLAM · 45% stronger this turn' : 'STONE HAMMER · heavy counterattack',
      phantom: turn % 2 === 0 ? 'PHASE SURGE · 20% stronger this turn' : 'PHASE SHIFT · guard changes each turn',
      swarm: 'FLURRY · two strikes each turn',
      wraith: 'RELENTLESS STRIKE · balanced pressure',
      reaver: turn % 2 === 0 ? 'ARMOR-PIERCING LUNGE · bypasses 25% Shield' : 'DUAL LUNGE · two quick strikes',
      thorn: 'ROOT REGEN · restores HP after striking',
      leech: 'TIDAL DRAIN · steals HP after striking',
      hexcaller: 'HEX GROWTH · attack rises after each counter'
    };
    return 'NEXT: ' + (intents[en.kind] || 'COUNTERATTACK');
  }

  function renderMapTab(body) {
    const unlocked = getUnlockedNodes();
    const edgesHtml = [], seen = new Set();
    R.map.forEach(n => {
      n.edges.forEach(t => {
        const key = Math.min(n.id, t) + '-' + Math.max(n.id, t);
        if (seen.has(key)) return;
        seen.add(key);
        const tn = R.map[t];
        const open = unlocked.has(n.id) && unlocked.has(t);
        edgesHtml.push(`<line class="map-edge ${open ? 'open' : ''}" x1="${n.x}%" y1="${n.y}%" x2="${tn.x}%" y2="${tn.y}%"/>`);
      });
    });

    const nodesHtml = R.map.map(n => {
      const isVis = unlocked.has(n.id);
      const sym = n.type === 'start' ? '⌂' : n.type === 'shrine' ? '✦' : n.type === 'vault' ? '◈' : n.type === 'boss' ? '☠' : '⚔';
      const cls = `map-node ${n.type} ${n.cleared ? 'cleared' : ''} ${n.id === R.selectedNode ? 'selected' : ''} ${!isVis ? 'fog' : ''}`;
      return `<g class="${cls}" data-nid="${n.id}"><circle class="node-bg" cx="${n.x}%" cy="${n.y}%" r="14"/><text x="${n.x}%" y="${n.y}%">${n.cleared ? '✓' : sym}</text></g>`;
    }).join('');

    const node = R.selectedNode === -1 && R.worldEvent ? R.worldEvent.node : (R.map.find(n => n.id === R.selectedNode) || R.map[0]);
    let actionHtml = '';

    if (node.type === 'start') {
      actionHtml = `<div class="battle-card"><div class="enemy-name">Camp · Zone ${R.zone}</div><div class="enemy-gimmick">Every encounter is free. Spend a Surge Charge to empower one volley.</div><div class="camp-recovery">RUN HP · ${R.runHp}/${getMaxHp()}</div>${R.runHp < getMaxHp() ? `<button class="btn btn-secondary" id="restCampBtn" ${R.shards < 12 ? '' : ''}>${R.shards >= 12 ? 'Rest · 12 Shards' : 'Emergency Rest · 75% HP'}</button>` : '<div class="enemy-gimmick">You are fully rested.</div>'}</div>`;
    } else if (node.type === 'shrine') {
      actionHtml = `<div class="battle-card">
        <div class="enemy-name">${node.name}</div>
        <div class="enemy-gimmick">${node.buff}</div>
        ${node.cleared ? '<div class="enemy-gimmick" style="color:var(--green)">Shrine claimed.</div>' : '<button class="btn btn-primary" id="claimNodeBtn">Claim Shrine (Free)</button>'}
      </div>`;
    } else if (node.type === 'vault') {
      actionHtml = `<div class="battle-card">
        <div class="enemy-name">${node.name}</div>
        <div class="enemy-gimmick">Contains +1 Cube Draft & +20 Shards.</div>
        ${node.cleared ? '<div class="enemy-gimmick" style="color:var(--green)">Vault opened.</div>' : '<button class="btn btn-primary" id="claimNodeBtn">Open Vault (Free)</button>'}
      </div>`;
    } else {
      const en = node.enemy;
      const pct = Math.round((en.hp / en.maxHp) * 100);
      const tactic = getEnemyTactic(en);
      const miniSlotsHtml = R.grid.map((uid, idx) => {
        const c = getCubeByUid(uid);
        const guarded = tactic && tactic.cells.includes(idx) ? ' tactic-guarded' : '';
        if (!c) return `<div class="mini-slot${guarded}" data-clash-idx="${idx}">·</div>`;
        const d = CUBE_DEFS[c.type];
        return `<div class="mini-slot ${d.cls}${guarded}" data-clash-idx="${idx}">${d.glyph}</div>`;
      }).join('');

      actionHtml = `<div class="battle-card ${node.isWorldEvent ? 'world-event-battle' : ''}" id="battleCard">
        ${node.isWorldEvent ? `<div class="event-battle-tag">✧ DAILY WORLD EVENT · ${R.worldEvent.name}</div>` : ''}
        <div class="combat-stage">
          <div class="mini-grid-3x3" id="miniGrid">${miniSlotsHtml}</div>
          <div class="enemy-stage">
            <div class="enemy-header-row">
              <div class="enemy-visual idle" id="enemyVisual">${enemySvg(en.kind)}</div>
              <div class="enemy-info">
                <div class="enemy-name">${en.name} ${R.overcharge > 0 ? `<span class="milestone-pill" style="color:var(--amber)">+${Math.round(R.overcharge*100)}% OC</span>` : ''}</div>
                <div class="enemy-gimmick">${en.gimmick}</div>
                ${node.type === 'boss' ? `<div class="enemy-phase" id="enemyPhase">PHASE ${en.phase || 1}</div>` : ''}
                <div class="enemy-intent">${getEnemyIntent(en)}</div>
                ${tactic ? `<div class="enemy-tactic">${tactic.label}</div>` : ''}
              </div>
            </div>
            <div class="hp-track"><div class="hp-fill" id="enemyHpFill" style="width:${pct}%"></div></div>
            <div class="hp-meta"><span id="enemyHpText">HP ${en.hp}/${en.maxHp}</span><span>ATK ${en.atk}${en.hits ? '×' + en.hits : ''} · ARMOR ${en.armor || 0}</span></div>
          </div>
        </div>
        <div class="live-tallies">
          <span style="color:var(--red)" id="tallyDmg">⚔ 0</span>
          <span style="color:var(--blue)" id="tallyShd">⬡ 0</span>
          <span style="color:var(--green)" id="tallyHeal">✚ 0</span>
        </div>
        <div class="clash-log" id="clashLog"><div>Tap Strike to fire your 3×3 Grid in an Auto-Clash.</div></div>
        <div class="combat-action-row">
          <button class="btn btn-secondary" id="editGridQuickBtn">Edit Grid</button>
          <button class="btn btn-secondary" id="surgeBtn" ${R.charges < 1 && !R.surgeArmed ? 'disabled' : ''}>${R.surgeArmed ? 'Surge Armed · Cancel' : 'Arm Surge · 1 Charge'}</button>
          <button class="btn btn-primary" id="strikeBtn" ${node.cleared ? 'disabled' : ''}>${node.cleared ? 'Cleared' : 'Fight · Free'}</button>
        </div>
      </div>`;
    }

    const theme = getZoneTheme(R.zone);
    const clearedCount = R.map.filter(n => n.cleared).length;
    const visibleCount = unlocked.size;
    const biomeClass = ['ashen','drowned','thornwild','hollow','starfall'][(Math.max(1, R.zone) - 1) % 5];
    body.innerHTML = `
      <div class="map-canvas-wrap ${biomeClass}">
        <div class="map-topline"><span class="map-zone-tag">FIELD ATLAS <i>／</i> ZONE ${String(R.zone).padStart(2, '0')}</span><span class="map-power">POWER ×${getBasePowerMult().toFixed(2)}</span></div>
        <div class="map-zone-title">${theme.name}</div>
        <div class="map-zone-subtitle">${theme.subtitle}</div>
        <div class="map-zone-rule"><span class="map-rule-mark">✧</span>${theme.rule}</div>
        <div class="map-progress"><span>PATHFINDER'S RECORD</span><strong>${clearedCount} / ${R.map.length} CLEARED</strong><i><b style="width:${Math.round(clearedCount / Math.max(1, R.map.length) * 100)}%"></b></i></div>
        <svg class="map-svg" viewBox="0 0 300 150" preserveAspectRatio="none" role="img" aria-label="Zone exploration map">
          <defs>
            <linearGradient id="mapMist" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b77b" stop-opacity=".12"/><stop offset="1" stop-color="#8b79c9" stop-opacity=".015"/></linearGradient>
            <pattern id="mapDots" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#e7d4ad" opacity=".22"/></pattern>
          </defs>
          <rect width="300" height="150" fill="url(#mapDots)" opacity=".5"/>
          <path class="map-landform" d="M-8 105 Q28 62 62 92 T128 75 T198 88 T310 42 L310 160 L-8 160Z"/>
          <path class="map-ridge" d="M-5 118 Q36 82 72 107 T145 91 T220 103 T310 62"/>
          <path class="map-ridge secondary" d="M-5 129 Q36 93 72 118 T145 102 T220 114 T310 73"/>
          <circle class="map-compass" cx="276" cy="24" r="12"/><path class="map-compass-needle" d="M276 13 L279 25 L276 22 L273 25Z"/><text class="map-compass-n" x="276" y="8">N</text>
          <g class="map-route-halo">${edgesHtml.join('')}</g>${nodesHtml}
        </svg>
        <div class="map-legend"><span><i class="legend-dot cleared"></i> CLEARED</span><span><i class="legend-dot active"></i> DISCOVERED</span><span><i class="legend-dot sealed"></i> UNEXPLORED</span></div>
      </div>
      ${actionHtml}
    `;

    body.querySelectorAll('.map-node').forEach(el => {
      el.addEventListener('click', () => {
        if (isClashing) return;
        R.selectedNode = Number(el.dataset.nid);
        saveR();
        skipNextRealmEntrance = true;
        renderRealm();
      });
    });

    const restCampBtn = document.getElementById('restCampBtn');
    if (restCampBtn) restCampBtn.addEventListener('click', () => {
      if (R.runHp >= getMaxHp()) return;
      if (R.shards >= 12) { R.shards -= 12; R.runHp = getMaxHp(); saveR(); renderRealm(); showToast('Camp rest complete · Run HP restored'); return; }
      const recovery = Math.ceil(getMaxHp() * 0.75);
      if (R.runHp < recovery) { R.runHp = recovery; saveR(); renderRealm(); showToast('Emergency rest · Recovered to 75% HP'); }
      else showToast('You need 12 Shards for a full rest');
    });

    const claimBtn = document.getElementById('claimNodeBtn');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        node.cleared = true;
        if (node.type === 'shrine') { R.zoneBuff = (R.zoneBuff || 0) + 0.12; showToast('Shrine active: +12% Grid Power'); }
        if (node.type === 'vault') { R.drafts += 1; R.shards += 20; showToast('+1 Draft · +20 Shards'); }
        playSfx('synergy'); saveR(); renderRealm();
      });
    }
    const strikeBtn = document.getElementById('strikeBtn');
    if (strikeBtn) strikeBtn.addEventListener('click', () => runGridClash(false));
    const surgeBtn = document.getElementById('surgeBtn');
    if (surgeBtn) surgeBtn.addEventListener('click', () => {
      if (R.surgeArmed) { R.surgeArmed = false; R.charges++; saveR(); renderRealm(); showToast('Surge cancelled · Charge refunded'); return; }
      if (R.charges < 1) { showToast('Earn a Surge Charge with 15 minutes of study'); return; }
      R.charges--; R.surgeArmed = true; saveR(); renderRealm(); showToast('Surge armed · Next volley deals +30% power');
    });
    const quickGrid = document.getElementById('editGridQuickBtn');
    if (quickGrid) quickGrid.addEventListener('click', () => {
      if (isClashing) return;
      activeTab = 'grid';
      document.querySelectorAll('.realm-tab').forEach(b => b.classList.toggle('active', b.dataset.rtab === 'grid'));
      renderRealm();
    });
  }


  function getGridSynergyInfo() {
    const bonuses = Array(9).fill(0);
    const labels = [];
    const cubes = R.grid.map(uid => getCubeByUid(uid));
    const roleAt = idx => cubes[idx] ? CUBE_DEFS[cubes[idx].type].cls : null;
    const links = [];
    for (let i = 0; i < 9; i++) {
      if (!roleAt(i)) continue;
      const r = Math.floor(i / 3), c = i % 3;
      [[r + 1, c], [r, c + 1]].forEach(([nr, nc]) => {
        if (nr > 2 || nc > 2) return;
        const next = nr * 3 + nc;
        if (roleAt(i) === roleAt(next)) {
          bonuses[i] += 0.10;
          bonuses[next] += 0.10;
          links.push([i, next]);
        }
      });
    }
    const lines = [
      { cells:[0,1,2], name:'Top row' }, { cells:[3,4,5], name:'Middle row' },
      { cells:[6,7,8], name:'Bottom row' }, { cells:[0,3,6], name:'Left column' },
      { cells:[1,4,7], name:'Middle column' }, { cells:[2,5,8], name:'Right column' }
    ];
    lines.forEach(line => {
      const role = roleAt(line.cells[0]);
      const roles = new Set(line.cells.map(roleAt));
      if (role && line.cells.every(idx => roleAt(idx) === role)) {
        line.cells.forEach(idx => bonuses[idx] += 0.18);
        labels.push(line.name + ' ' + role + ' formation (+18%)');
      } else if (line.cells.every(idx => roleAt(idx)) && roles.size === 3) {
        line.cells.forEach(idx => bonuses[idx] += 0.12);
        labels.push(line.name + ' tactical triad (+12%)');
      }
    });
    [[0,4,8],[2,4,6]].forEach((cells, i) => {
      const role = roleAt(cells[0]);
      if (role && cells.every(idx => roleAt(idx) === role)) {
        cells.forEach(idx => bonuses[idx] += 0.22);
        labels.push((i === 0 ? 'Main' : 'Counter') + ' diagonal ' + role + ' combo (+22%)');
      }
    });
    for (let i = 0; i < 9; i++) bonuses[i] = Math.min(0.35, bonuses[i]);
    if (links.length) labels.unshift(links.length + ' adjacent ' + (links.length === 1 ? 'link' : 'links') + ' (+10% each, capped)');
    return { bonuses, labels, links };
  }

  function renderGridTab(body) {
    const synergy = getGridSynergyInfo();
    const studyMetrics = getCombatStudyMetrics();
    const unlockCardsHtml = Object.values(CUBE_DEFS).filter(def => def.unlock).map(def => {
      const value = Number(studyMetrics[def.unlock.metric]) || 0;
      const done = isCubeUnlocked(def, studyMetrics);
      const current = def.unlock.metric === 'minutes' ? Math.floor(value) + ' / ' + def.unlock.target + ' min'
        : Math.floor(value) + ' / ' + def.unlock.target + (def.unlock.metric === 'sessions' ? ' sessions' : ' subjects');
      const pct = Math.min(100, Math.round(value / def.unlock.target * 100));
      return `<article class="cube-unlock-card ${done ? 'unlocked' : 'locked'}"><div class="cube-unlock-head"><strong>${def.glyph} ${def.name}</strong><span>${done ? 'UNLOCKED' : 'LOCKED'}</span></div><p>${def.desc}</p><div class="cube-unlock-track"><i style="width:${pct}%"></i></div><small>${done ? 'Added to your collection' : def.unlock.label + ' · ' + current}</small></article>`;
    }).join('');
    const linkedSlots = new Set(synergy.links.flat());
    const gridHtml = R.grid.map((uid, idx) => {
      const c = getCubeByUid(uid);
      if (!c) {
        return `<div class="cube-slot ${selectedSlot === idx ? 'selected' : ''}" data-idx="${idx}" data-clash-idx="${idx}"><span style="color:var(--muted);font-size:18px;">+</span></div>`;
      }
      const d = CUBE_DEFS[c.type];
      return `<div class="cube-slot filled ${d.cls} ${selectedSlot === idx ? 'selected' : ''} ${linkedSlots.has(idx) ? 'synergy-linked' : ''} ${synergy.bonuses[idx] > 0.18 ? 'synergy-boosted' : ''}" data-idx="${idx}" data-clash-idx="${idx}">
        <span class="cube-tier">T${c.tier}</span>
        ${synergy.bonuses[idx] > 0 ? `<span class="cube-bonus">+${Math.round(synergy.bonuses[idx] * 100)}%</span>` : ''}
        <div class="cube-glyph">${d.glyph}</div>
        <div class="cube-name">${d.name}</div>
      </div>`;
    }).join('');

    let detailHtml = '<div class="cube-detail-bar"><span style="color:var(--muted)">Tap a grid slot to place, swap, or upgrade a Cube.</span></div>';
    if (selectedSlot !== null) {
      const c = getCubeByUid(R.grid[selectedSlot]);
      if (c) {
        const d = CUBE_DEFS[c.type];
        const cost = c.tier * 20;
        detailHtml = `<div class="cube-detail-bar">
          <div><strong>${d.name} (Tier ${c.tier})</strong><div style="color:var(--muted);font-size:10.5px;">${d.desc}</div></div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            ${c.tier < 3 ? `<button class="mini-btn" id="upgradeCubeBtn">Up (${cost}s)</button>` : ''}
            <button class="mini-btn" style="color:var(--red)" id="removeCubeBtn">Rem</button>
          </div>
        </div>`;
      }
    }

    const equippedSet = new Set(R.grid.filter(Boolean));
    const invHtml = R.inventory.map(c => {
      const d = CUBE_DEFS[c.type];
      const eq = equippedSet.has(c.uid);
      return `<div class="inv-card ${d.cls} ${eq ? 'equipped' : ''}" data-uid="${c.uid}">
        <div style="font-size:16px;">${d.glyph}</div>
        <div class="cube-name">${d.name} T${c.tier}</div>
        <div class="cube-stat">${eq ? 'Equipped' : d.cls}</div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <div class="grid-3x3">${gridHtml}</div>
      <div class="synergy-summary">${synergy.labels.length ? synergy.labels.map(label => `<span class="synergy-chip">${label}</span>`).join('') : 'Match cube roles side-by-side or complete a row, column, or diagonal to activate combos.'}</div>
      ${detailHtml}
      <div class="clash-log" id="clashLog"><div>Tap Test Grid anytime (0 Charges) to watch your synergy chain fire.</div></div>
      <div class="modal-btns">
        <button class="btn btn-secondary" id="testDummyBtn">Test Grid (Free)</button>
        <button class="btn btn-primary" id="draftFromGridBtn">Draft Cube (${R.drafts})</button>
      </div>
      <div class="sec-head"><span>Cube Inventory</span><span>Tap slot, then cube</span></div>
      <div class="inv-grid">${invHtml}</div>
      <div class="sec-head"><span>STUDY DISCOVERIES</span><span>Permanent cube unlocks</span></div>
      <div class="cube-unlock-grid">${unlockCardsHtml}</div>
      <div class="sec-head"><span>Shard Forge</span><span>${R.shards} ◈ available</span></div>
      <div class="shard-forge">
        <div class="cube-detail-bar">
          <div><strong>Surge Charge</strong><div style="color:var(--muted);font-size:10.5px;">Empower one volley by +30%. Battles themselves are always free.</div></div>
          <button class="mini-btn" id="buyChargeBtn" ${R.shards < 18 ? 'disabled' : ''}>18 ◈</button>
        </div>
        <div class="cube-detail-bar">
          <div><strong>Cube Draft</strong><div style="color:var(--muted);font-size:10.5px;">Choose one of three random Cubes</div></div>
          <button class="mini-btn" id="buyDraftBtn" ${R.shards < 45 ? 'disabled' : ''}>45 ◈</button>
        </div>
        <div style="color:var(--muted);font-size:10px;line-height:1.45;">Study earns optional Surge Charges every 15 minutes and Cube Drafts every 30 minutes. Encounters never require a charge.</div>
      </div>
    `;

    body.querySelectorAll('.cube-slot').forEach(el => {
      el.addEventListener('click', () => {
        if (isClashing) return;
        const idx = Number(el.dataset.idx);
        if (selectedSlot !== null && selectedSlot !== idx) {
          const tmp = R.grid[selectedSlot]; R.grid[selectedSlot] = R.grid[idx]; R.grid[idx] = tmp;
          selectedSlot = null; saveR();
        } else {
          selectedSlot = selectedSlot === idx ? null : idx;
        }
        renderRealm();
      });
    });

    body.querySelectorAll('.inv-card').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.uid;
        if (equippedSet.has(uid)) return;
        const target = selectedSlot !== null ? selectedSlot : R.grid.indexOf(null);
        if (target === -1) { showToast('Grid full — tap a slot to replace'); return; }
        R.grid[target] = uid; selectedSlot = null; saveR(); renderRealm();
      });
    });

    const upBtn = document.getElementById('upgradeCubeBtn');
    if (upBtn) upBtn.addEventListener('click', () => {
      const c = getCubeByUid(R.grid[selectedSlot]);
      const cost = c.tier * 20;
      if (R.shards < cost) { showToast(`Need ${cost} Shards`); return; }
      R.shards -= cost; c.tier++; playSfx('synergy');
      saveR(); renderRealm(); showToast(`${CUBE_DEFS[c.type].name} forged to Tier ${c.tier}!`);
    });
    const remBtn = document.getElementById('removeCubeBtn');
    if (remBtn) remBtn.addEventListener('click', () => {
      R.grid[selectedSlot] = null; selectedSlot = null; saveR(); renderRealm();
    });
    document.getElementById('testDummyBtn').addEventListener('click', () => runGridClash(true));
    document.getElementById('draftFromGridBtn').addEventListener('click', openDraftModal);
    document.getElementById('buyChargeBtn').addEventListener('click', () => {
      if (R.shards < 18) { showToast('Need 18 Shards'); return; }
      R.shards -= 18; R.charges++; saveR(); renderRealm();
      showToast('Surge Charge forged · −18 Shards');
    });
    document.getElementById('buyDraftBtn').addEventListener('click', () => {
      if (R.shards < 45) { showToast('Need 45 Shards'); return; }
      R.shards -= 45; R.drafts++; saveR(); renderRealm();
      showToast('Cube Draft forged · −45 Shards');
    });
  }

  function renderConstTab(body) {
    const cDef = CONSTELLATIONS[activeConst];
    const sk = R.skills[activeConst];
    const tabsHtml = Object.entries(CONSTELLATIONS).map(([k, v]) =>
      `<button class="const-pill ${k === activeConst ? 'active' : ''}" data-ck="${k}">${v.name} · L${R.skills[k].lvl}</button>`
    ).join('');

    const linesHtml = cDef.nodes.filter(n => n.req).map(n => {
      const p = cDef.nodes.find(x => x.id === n.req);
      const lit = hasPerk(n.id) && hasPerk(p.id);
      return `<line class="star-line ${lit ? 'lit' : ''}" x1="${p.x}%" y1="${p.y}%" x2="${n.x}%" y2="${n.y}%"/>`;
    }).join('');

    const starsHtml = cDef.nodes.map(n => {
      const lit = hasPerk(n.id);
      const avail = !lit && (!n.req || hasPerk(n.req)) && R.perkPoints > 0;
      return `<g class="star-node ${lit ? 'lit' : ''} ${avail ? 'avail' : ''}" data-pid="${n.id}">
        <circle cx="${n.x}%" cy="${n.y}%" r="12"/>
        <text x="${n.x}%" y="${n.y + 14}%">${n.name}</text>
      </g>`;
    }).join('');

    const listHtml = cDef.nodes.map(n => {
      const lit = hasPerk(n.id);
      const avail = !lit && (!n.req || hasPerk(n.req));
      return `<div class="cube-detail-bar" style="opacity:${lit || avail ? 1 : 0.45}">
        <div><strong>${n.name}</strong><div style="color:var(--muted);font-size:10.5px;">${n.desc}</div></div>
        ${lit ? '<span style="color:var(--blue);font-size:11px;">Unlocked</span>'
          : (avail ? `<button class="mini-btn" data-buy="${n.id}">Unlock (1 PT)</button>` : '<span style="color:var(--muted);font-size:10px;">Locked</span>')}
      </div>`;
    }).join('');

    body.innerHTML = `
      <div class="const-tabs">${tabsHtml}</div>
      <div class="cube-detail-bar">
        <div><strong>${cDef.name} · Level ${sk.lvl}</strong><div style="color:var(--muted);font-size:10.5px;">${cDef.rule} (${sk.xp}/${sk.lvl * 45} XP)</div></div>
        <span style="color:var(--amber);font-family:var(--font-clock);font-size:12px;">${R.perkPoints} PT</span>
      </div>
      <div class="star-canvas-wrap"><svg class="star-svg">${linesHtml}${starsHtml}</svg></div>
      <div style="display:flex;flex-direction:column;gap:7px;">${listHtml}</div>
    `;

    body.querySelectorAll('.const-pill').forEach(b => b.addEventListener('click', () => { activeConst = b.dataset.ck; renderRealm(); }));
    body.querySelectorAll('[data-buy], .star-node').forEach(el => {
      el.addEventListener('click', () => {
        const pid = el.dataset.buy || el.dataset.pid;
        const n = cDef.nodes.find(x => x.id === pid);
        if (!n || hasPerk(pid)) return;
        if (n.req && !hasPerk(n.req)) { showToast('Unlock connected star first'); return; }
        if (R.perkPoints < 1) { showToast('Level up any skill to earn Perk Points'); return; }
        R.perkPoints--; R.perks[pid] = true;
        if (pid === 'e1' || pid === 'e3') R.runHp = getMaxHp();
        playSfx('synergy'); saveR(); renderRealm(); showToast(`Unlocked ${n.name}!`);
      });
    });
  }


  window.ChronoRealm = { open: openRealm, onSessionSaved, updateBadge: updateRealmBadge, syncDailyStudySnapshot: (snapshot) => {
    window.ChronoStudyData = snapshot;
    const granted = grantStudyCubeUnlocks();
    if (granted.length) { saveR(); showToast('Study milestone unlocked: ' + granted.join(', ')); }
  } };
  document.addEventListener('DOMContentLoaded', () => {
    if (!R.dailyMissionClaims || typeof R.dailyMissionClaims !== 'object') R.dailyMissionClaims = {};
    const claimDays = Object.keys(R.dailyMissionClaims).sort();
    claimDays.slice(0, Math.max(0, claimDays.length - 45)).forEach(day => delete R.dailyMissionClaims[day]);
    const btn = document.getElementById('realmBtn');
    if (btn) btn.addEventListener('click', openRealm);
    const initialUnlocks = grantStudyCubeUnlocks();
    if (initialUnlocks.length) showToast('Study milestone unlocked: ' + initialUnlocks.join(', '));
    updateRealmBadge();
    saveR();
  });
})();
