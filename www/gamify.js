/* === THE REALM: CUBE CHAOS + SKYRIM CONSTELLATION ENGINE === */
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
    catalyst: { id: 'catalyst', name: 'Catalyst', cls: 'synergy', glyph: '✦', desc: 'Boosts adjacent 4-way Cubes by +50% (+15%/tier).', base: 0.5 }
  };

  const CONSTELLATIONS = {
    endurance: {
      name: 'Endurance', rule: 'Levels from total minutes studied',
      nodes: [
        { id: 'e1', name: 'Iron Core',   desc: '+20 Max Run HP',         x: 50, y: 80, req: null },
        { id: 'e2', name: 'Heavy Pulse', desc: '+15% Base Grid Power',   x: 28, y: 50, req: 'e1' },
        { id: 'e3', name: 'Resilience',  desc: '+30 Max Run HP',         x: 72, y: 50, req: 'e1' },
        { id: 'e4', name: 'Titan Frame', desc: '+25% Base Grid Power',   x: 50, y: 20, req: 'e2' }
      ]
    },
    depth: {
      name: 'Depth', rule: 'Levels from minutes past the 45m mark',
      nodes: [
        { id: 'd1', name: 'Deep Edge',   desc: '+18% Strike Cube dmg',   x: 50, y: 80, req: null },
        { id: 'd2', name: 'Surge',       desc: 'Overcharge +15% stronger', x: 30, y: 48, req: 'd1' },
        { id: 'd3', name: 'Cinder',      desc: '+40% Burn damage',       x: 70, y: 48, req: 'd1' },
        { id: 'd4', name: 'Abyssal Hit', desc: '+30% Strike Cube dmg',   x: 50, y: 18, req: 'd2' }
      ]
    },
    momentum: {
      name: 'Momentum', rule: 'Levels from starting a new block within 25m',
      nodes: [
        { id: 'm1', name: 'Bastion',     desc: '+20% Ward Shield gain',  x: 50, y: 80, req: null },
        { id: 'm2', name: 'Mirror',      desc: 'Reflect bounces +25%',   x: 28, y: 48, req: 'm1' },
        { id: 'm3', name: 'Renewal',     desc: '+35% Mend healing',      x: 72, y: 48, req: 'm1' },
        { id: 'm4', name: 'Aegis Wall',  desc: 'Start fights w/ 12 Shield', x: 50, y: 18, req: 'm2' }
      ]
    },
    versatility: {
      name: 'Versatility', rule: 'Levels from studying 2+ subjects in a day',
      nodes: [
        { id: 'v1', name: 'Harmonic',    desc: 'Catalyst aura +15%',     x: 50, y: 80, req: null },
        { id: 'v2', name: 'Resonance',   desc: 'Echo fires at 120% power', x: 28, y: 48, req: 'v1' },
        { id: 'v3', name: 'Scavenger',   desc: '+25% Obsidian Shards',   x: 72, y: 48, req: 'v1' },
        { id: 'v4', name: 'Singularity', desc: 'Prism buffs re-triggers +20%', x: 50, y: 18, req: 'v2' }
      ]
    },
    overclock: {
      name: 'Overclock', rule: 'Levels from Overtime minutes past a Sprint',
      nodes: [
        { id: 'o1', name: 'Keen Edge',   desc: '+15% Crit chance (1.5x)', x: 50, y: 80, req: null },
        { id: 'o2', name: 'Piercer',     desc: 'Ignore 50% Enemy Armor', x: 28, y: 48, req: 'o1' },
        { id: 'o3', name: 'Overdrive',   desc: '+20% Crit chance',       x: 72, y: 48, req: 'o1' },
        { id: 'o4', name: 'True Strike', desc: 'Ignore 100% Enemy Armor', x: 50, y: 18, req: 'o2' }
      ]
    }
  };

  function buildZoneMap(zone) {
    const s = 1 + (zone - 1) * 0.45;
    return [
      { id: 0, x: 14, y: 50, type: 'start', name: 'Camp', cleared: true, edges: [1, 2] },
      { id: 1, x: 34, y: 26, type: 'hostile', enemy: makeEnemy('phantom', s), cleared: false, edges: [0, 3, 4] },
      { id: 2, x: 34, y: 74, type: 'hostile', enemy: makeEnemy('monolith', s), cleared: false, edges: [0, 4, 5] },
      { id: 3, x: 56, y: 20, type: 'shrine', name: 'Obsidian Shrine', buff: '+12% Grid Power (Zone)', cleared: false, edges: [1, 6] },
      { id: 4, x: 56, y: 50, type: 'hostile', enemy: makeEnemy('swarm', s), cleared: false, edges: [1, 2, 6, 7] },
      { id: 5, x: 56, y: 80, type: 'vault', name: 'Cube Vault', cleared: false, edges: [2, 7] },
      { id: 6, x: 75, y: 34, type: 'hostile', enemy: makeEnemy('monolith', s * 1.25), cleared: false, edges: [3, 4, 8] },
      { id: 7, x: 75, y: 66, type: 'hostile', enemy: makeEnemy('phantom', s * 1.25), cleared: false, edges: [4, 5, 8] },
      { id: 8, x: 90, y: 50, type: 'boss', enemy: makeEnemy('boss', s * 1.6), cleared: false, edges: [6, 7] }
    ];
  }

  function makeEnemy(kind, scale) {
    if (kind === 'monolith') {
      const hp = Math.round(70 * scale);
      return { kind, name: 'Monolith', hp, maxHp: hp, atk: Math.round(12 * scale), armor: Math.round(8 * scale), burn: 0, gimmick: `Heavy Armor (${Math.round(8 * scale)} dmg blocked)` };
    }
    if (kind === 'phantom') {
      const hp = Math.round(52 * scale);
      return { kind, name: 'Phantom', hp, maxHp: hp, atk: Math.round(20 * scale), armor: 0, burn: 0, gimmick: 'High Attack · Bring Ward/Reflect' };
    }
    if (kind === 'swarm') {
      const hp = Math.round(64 * scale);
      return { kind, name: 'Swarm', hp, maxHp: hp, atk: Math.round(8 * scale), hits: 2, armor: 0, burn: 0, gimmick: 'Strikes twice every turn' };
    }
    const hp = Math.round(135 * scale);
    return { kind: 'boss', name: 'Stronghold Warden', hp, maxHp: hp, atk: Math.round(19 * scale), armor: Math.round(6 * scale), burn: 0, gimmick: 'Multi-session Boss · Drops Vault loot' };
  }

  function defaultRealm() {
    const c1 = { uid: 'c_1', type: 'spike', tier: 1 };
    const c2 = { uid: 'c_2', type: 'aegis', tier: 1 };
    const c3 = { uid: 'c_3', type: 'prism', tier: 1 };
    return {
      charges: 2,
      drafts: 1,
      shards: 15,
      overcharge: 0, // 0, 0.25, or 0.50
      remChargeMin: 0,
      remDraftMin: 0,
      remShardMin: 0,
      totalStudyMins: 0,
      lastSessionTs: 0,
      runHp: 100,
      zone: 1,
      zoneBuff: 0,
      selectedNode: 1,
      map: buildZoneMap(1),
      inventory: [c1, c2, c3],
      grid: [null, 'c_1', null, null, 'c_3', null, null, 'c_2', null],
      skills: {
        endurance: { xp: 0, lvl: 1 },
        depth: { xp: 0, lvl: 1 },
        momentum: { xp: 0, lvl: 1 },
        versatility: { xp: 0, lvl: 1 },
        overclock: { xp: 0, lvl: 1 }
      },
      perkPoints: 1,
      perks: {}
    };
  }

  let R = null;
  try { R = JSON.parse(localStorage.getItem(REALM_KEY)); } catch (_) {}
  if (!R || !R.map || !R.skills) R = defaultRealm();
  function saveR() { localStorage.setItem(REALM_KEY, JSON.stringify(R)); }

  // ---------- Helpers ----------
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
      if (n.cleared) {
        set.add(n.id);
        n.edges.forEach(e => set.add(e));
      }
    });
    return set;
  }

  function showToast(msg) {
    let t = document.getElementById('realmToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'realmToast';
      t.className = 'realm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function addSkillXp(key, amount) {
    if (amount <= 0) return;
    const sk = R.skills[key];
    sk.xp += amount;
    while (sk.xp >= sk.lvl * 45) {
      sk.xp -= sk.lvl * 45;
      sk.lvl++;
      R.perkPoints++;
    }
  }

  // ---------- Study Session Hook (Zero Distraction Penalties) ----------
  function onSessionSaved(info) {
    const mins = Math.max(0, info.durationMs / 60000);
    if (mins < 0.5) return;

    R.totalStudyMins += mins;

    // 1. Charges (every 15m), Drafts (every 30m), Shards (every 2m)
    R.remChargeMin += mins;
    const newCharges = Math.floor(R.remChargeMin / 15);
    R.remChargeMin %= 15;
    R.charges += newCharges;

    R.remDraftMin += mins;
    const newDrafts = Math.floor(R.remDraftMin / 30);
    R.remDraftMin %= 30;
    R.drafts += newDrafts;

    R.remShardMin += mins;
    let newShards = Math.floor(R.remShardMin / 2);
    R.remShardMin %= 2;
    if (hasPerk('v3')) newShards = Math.round(newShards * 1.25);
    R.shards += newShards;

    // 2. Overcharge for 45m+ / 90m+ blocks
    if (mins >= 90) R.overcharge = Math.max(R.overcharge, 0.5);
    else if (mins >= 45) R.overcharge = Math.max(R.overcharge, 0.25);

    // 3. Skyrim-style Behavioral Constellations
    addSkillXp('endurance', Math.round(mins));
    if (mins > 45) addSkillXp('depth', Math.round((mins - 45) * 1.8));
    if (R.lastSessionTs && (Date.now() - R.lastSessionTs) <= 25 * 60000) {
      addSkillXp('momentum', Math.round(15 + mins * 0.6));
    }
    if (info.subjectsTodayCount >= 2) addSkillXp('versatility', Math.round(18 + mins * 0.5));
    if (info.overtimeMs > 60000) addSkillXp('overclock', Math.round((info.overtimeMs / 60000) * 2.2));

    R.lastSessionTs = Date.now();
    saveR();
    updateRealmBadge();

    const parts = [];
    if (newCharges > 0) parts.push(`+${newCharges} Charge`);
    if (newDrafts > 0) parts.push(`+${newDrafts} Draft`);
    if (newShards > 0) parts.push(`+${newShards} Shards`);
    if (mins >= 45) parts.push('Overcharged');
    if (parts.length) showToast(parts.join(' · '));
  }

  function updateRealmBadge() {
    const btn = document.getElementById('realmBtn');
    if (btn) btn.classList.toggle('has-badge', R.drafts > 0 || R.perkPoints > 0);
  }

  // ---------- Auto-Clash 3x3 Synergy Engine ----------
  let isClashing = false;

  async function runGridClash(isTestDummy) {
    if (isClashing) return;
    const node = R.map.find(n => n.id === R.selectedNode);
    if (!isTestDummy) {
      if (!node || (node.type !== 'hostile' && node.type !== 'boss') || node.cleared) return;
      if (R.charges < 1) { showToast('Need 1 Battle Charge (Study 15m)'); return; }
      R.charges--;
    }

    isClashing = true;
    const logEl = document.getElementById('clashLog');
    const appendLog = (html) => {
      if (!logEl) return;
      const div = document.createElement('div');
      div.innerHTML = html;
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    };
    if (logEl) logEl.innerHTML = '';

    const overMult = 1 + (R.overcharge || 0) + (R.overcharge > 0 && hasPerk('d2') ? 0.15 : 0);
    const powerMult = getBasePowerMult() * overMult;
    const strikeMult = 1 + (hasPerk('d1') ? 0.18 : 0) + (hasPerk('d4') ? 0.30 : 0);
    const wardMult = 1 + (hasPerk('m1') ? 0.20 : 0);
    const critChance = (hasPerk('o1') ? 0.15 : 0) + (hasPerk('o3') ? 0.20 : 0);

    let totalDmg = 0;
    let totalBurn = 0;
    let totalShield = hasPerk('m4') ? 12 : 0;
    let totalHeal = 0;
    let hasReflect = false;

    // Pre-calculate Catalyst adjacency buffs
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
      const mult = powerMult * tierMult * adjBonus[idx] * extraMult;

      const slotEl = document.querySelector(`.cube-slot[data-idx="${idx}"]`);
      if (slotEl) {
        slotEl.classList.add('firing');
        await new Promise(res => setTimeout(res, 150));
        slotEl.classList.remove('firing');
      }

      if (c.type === 'spike') {
        const d = Math.round(def.base * mult * strikeMult);
        totalDmg += d;
        appendLog(`${labelPrefix}<span class="hl">Spike</span> → <span class="dmg">${d} DMG</span>`);
        lastFired = { type: 'spike', tier: c.tier, idx };
      } else if (c.type === 'ember') {
        const d = Math.round(def.base * mult * strikeMult);
        const b = Math.round(def.burn * mult * (hasPerk('d3') ? 1.4 : 1));
        totalDmg += d; totalBurn += b;
        appendLog(`${labelPrefix}<span class="hl">Ember</span> → <span class="dmg">${d} DMG</span> + <span class="syn">${b} Burn</span>`);
        lastFired = { type: 'ember', tier: c.tier, idx };
      } else if (c.type === 'shatter') {
        const ocBoost = R.overcharge > 0 ? 1.8 : 1;
        const d = Math.round(def.base * mult * strikeMult * ocBoost);
        totalDmg += d;
        appendLog(`${labelPrefix}<span class="hl">Shatter</span> → <span class="dmg">${d} DMG</span>`);
        lastFired = { type: 'shatter', tier: c.tier, idx };
      } else if (c.type === 'aegis') {
        const sh = Math.round(def.base * mult * wardMult);
        totalShield += sh;
        appendLog(`${labelPrefix}<span class="hl">Aegis</span> → <span class="shd">+${sh} Shield</span>`);
        lastFired = { type: 'aegis', tier: c.tier, idx };
      } else if (c.type === 'reflect') {
        const sh = Math.round(def.base * mult * wardMult);
        totalShield += sh; hasReflect = true;
        appendLog(`${labelPrefix}<span class="hl">Reflect</span> → <span class="shd">+${sh} Shield</span> (Reflect)`);
        lastFired = { type: 'reflect', tier: c.tier, idx };
      } else if (c.type === 'mend') {
        const h = Math.round(def.base * mult * (hasPerk('m3') ? 1.35 : 1));
        totalHeal += h;
        appendLog(`${labelPrefix}<span class="hl">Mend</span> → <span class="win">+${h} HP</span>`);
        lastFired = { type: 'mend', tier: c.tier, idx };
      } else if (c.type === 'prism') {
        appendLog(`<span class="syn">◇ Prism</span> re-triggers Above & Below!`);
        const pBonus = hasPerk('v4') ? 1.2 : 1.0;
        if (idx - 3 >= 0) await fireSlot(idx - 3, pBonus, '↳ ');
        if (idx + 3 < 9) await fireSlot(idx + 3, pBonus, '↳ ');
      } else if (c.type === 'echo' && lastFired) {
        appendLog(`<span class="syn">◎ Echo</span> copies ${CUBE_DEFS[lastFired.type].name}!`);
        await fireSlot(lastFired.idx, hasPerk('v2') ? 1.2 : 1.0, '↳ ');
      } else if (c.type === 'catalyst') {
        appendLog(`<span class="syn">✦ Catalyst</span> empowering adjacent tiles.`);
      }
    }

    for (let i = 0; i < 9; i++) {
      if (R.grid[i]) await fireSlot(i);
    }

    // Crit Roll
    if (totalDmg > 0 && Math.random() < critChance) {
      totalDmg = Math.round(totalDmg * 1.5);
      appendLog(`<span class="syn">★ OVERCLOCK CRIT! Total: ${totalDmg} DMG</span>`);
    }

    if (isTestDummy) {
      appendLog(`<span class="win">DUMMY RESULT: ${totalDmg} DMG · ${totalShield} Shield · ${totalHeal} Heal</span>`);
      isClashing = false;
      return;
    }

    // Apply to Real Enemy
    const en = node.enemy;
    const armorIgnore = hasPerk('o4') ? 1 : (hasPerk('o2') ? 0.5 : 0);
    const effArmor = Math.round((en.armor || 0) * (1 - armorIgnore));
    const netDmg = Math.max(1, totalDmg - effArmor);
    en.burn = (en.burn || 0) + totalBurn;
    const burnTick = en.burn;
    en.hp = Math.max(0, en.hp - netDmg - burnTick);
    R.overcharge = 0; // consumed

    if (totalHeal > 0) R.runHp = Math.min(getMaxHp(), R.runHp + totalHeal);

    const vis = document.getElementById('enemyVisual');
    if (vis) { vis.classList.remove('hit'); void vis.offsetWidth; vis.classList.add('hit'); }

    appendLog(`<span class="hl">Hit ${en.name} for <span class="dmg">${netDmg}</span>${burnTick ? ` + ${burnTick} Burn` : ''}${effArmor ? ` (${effArmor} Armor)` : ''}.</span>`);

    if (en.hp <= 0) {
      node.cleared = true;
      const shardDrop = node.type === 'boss' ? 35 : 12;
      R.shards += shardDrop;
      if (node.type === 'boss') {
        R.drafts += 2;
        R.zone++;
        R.zoneBuff = 0;
        R.runHp = getMaxHp();
        R.map = buildZoneMap(R.zone);
        R.selectedNode = 1;
        appendLog(`<span class="win">STRONGHOLD CLEARED! +${shardDrop} Shards, +2 Drafts → Entering Zone ${R.zone}!</span>`);
      } else {
        appendLog(`<span class="win">${en.name} defeated! +${shardDrop} Shards. Fog cleared.</span>`);
      }
    } else {
      // Enemy Counterattack
      const hits = en.hits || 1;
      let totalIncoming = en.atk * hits;
      const blocked = Math.min(totalShield, totalIncoming);
      const hpLoss = Math.max(0, totalIncoming - blocked);
      R.runHp = Math.max(0, R.runHp - hpLoss);
      appendLog(`${en.name} strikes (${totalIncoming}) → <span class="shd">${blocked} blocked</span>, <span class="dmg">-${hpLoss} HP</span>.`);

      if (hasReflect && blocked > 0) {
        const refDmg = Math.round(blocked * (hasPerk('m2') ? 0.85 : 0.6));
        en.hp = Math.max(1, en.hp - refDmg);
        appendLog(`<span class="shd">Reflect bounced ${refDmg} DMG back!</span>`);
      }

      if (R.runHp <= 0) {
        R.runHp = getMaxHp();
        R.selectedNode = 0;
        appendLog(`<span class="dmg">Run HP depleted — respawned at Camp with full HP. Zero items lost.</span>`);
      }
    }

    saveR();
    isClashing = false;
    renderRealm();
  }

  // ---------- UI Rendering ----------
  let activeTab = 'map';
  let selectedSlot = null;
  let activeConst = 'endurance';

  function injectRealmDOM() {
    if (document.getElementById('realmOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'realmOverlay';
    overlay.className = 'realm-overlay';
    overlay.innerHTML = `
      <div class="realm-head">
        <div class="realm-title">The Realm</div>
        <button class="mini-btn" id="realmCloseBtn">Close</button>
      </div>
      <div class="realm-res-bar" id="realmResBar"></div>
      <div class="realm-tabs">
        <button class="realm-tab active" data-rtab="map">Map & Battle</button>
        <button class="realm-tab" data-rtab="grid">3×3 Grid</button>
        <button class="realm-tab" data-rtab="stars">Constellations</button>
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
    overlay.querySelectorAll('.realm-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.rtab;
        overlay.querySelectorAll('.realm-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderRealm();
      });
    });
  }

  function openRealm() {
    injectRealmDOM();
    renderRealm();
    document.getElementById('realmOverlay').classList.add('open');
  }

  function closeRealm() {
    const ov = document.getElementById('realmOverlay');
    if (ov) ov.classList.remove('open');
    updateRealmBadge();
  }

  function openDraftModal() {
    if (R.drafts < 1) { showToast('Study 30m to earn a Cube Draft'); return; }
    const keys = Object.keys(CUBE_DEFS);
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
      <div class="res-pill"><div class="res-val">${R.charges}</div><div class="res-lbl">Charges</div></div>
      <div class="res-pill clickable" id="openDraftPill"><div class="res-val">${R.drafts}</div><div class="res-lbl">Drafts</div></div>
      <div class="res-pill"><div class="res-val">${R.shards}</div><div class="res-lbl">Shards</div></div>
      <div class="res-pill"><div class="res-val">${R.runHp}/${getMaxHp()}</div><div class="res-lbl">Run HP</div></div>
    `;
    document.getElementById('openDraftPill').addEventListener('click', openDraftModal);

    const body = document.getElementById('realmBody');
    if (activeTab === 'map') renderMapTab(body);
    else if (activeTab === 'grid') renderGridTab(body);
    else renderConstTab(body);
  }

  function enemySvg(kind) {
    if (kind === 'monolith') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#f5f5f7" stroke-width="1.6"><rect x="8" y="5" width="20" height="26" rx="2"/><line x1="8" y1="14" x2="28" y2="14"/><line x1="8" y1="22" x2="28" y2="22"/></svg>`;
    if (kind === 'phantom') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#64d2ff" stroke-width="1.6"><polygon points="18,4 32,18 18,32 4,18"/><circle cx="18" cy="18" r="4"/></svg>`;
    if (kind === 'swarm') return `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" stroke="#ffd60a" stroke-width="1.6"><polygon points="12,8 18,18 6,18"/><polygon points="24,8 30,18 18,18"/><polygon points="18,19 24,29 12,29"/></svg>`;
    return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#ff453a" stroke-width="1.7"><polygon points="18,3 33,12 28,31 8,31 3,12"/><polygon points="18,10 25,18 18,26 11,18"/></svg>`;
  }

  function renderMapTab(body) {
    const unlocked = getUnlockedNodes();
    const edgesHtml = [];
    const seen = new Set();
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
      return `<g class="${cls}" data-nid="${n.id}"><circle class="node-bg" cx="${n.x}%" cy="${n.y}%" r="15"/><text x="${n.x}%" y="${n.y}%">${n.cleared ? '✓' : sym}</text></g>`;
    }).join('');

    const node = R.map.find(n => n.id === R.selectedNode) || R.map[0];
    let actionHtml = '';

    if (node.type === 'start') {
      actionHtml = `<div class="battle-card"><div class="enemy-name">Camp · Zone ${R.zone}</div><div class="enemy-gimmick">Tap any lit node on the map to explore or fight.</div></div>`;
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
      actionHtml = `<div class="battle-card">
        <div class="battle-top">
          <div class="enemy-visual" id="enemyVisual">${enemySvg(en.kind)}</div>
          <div class="enemy-info">
            <div class="enemy-name">${en.name} ${R.overcharge > 0 ? `<span class="milestone-pill" style="color:var(--amber)">+${Math.round(R.overcharge*100)}% OC</span>` : ''}</div>
            <div class="enemy-gimmick">${en.gimmick}</div>
            <div class="hp-track"><div class="hp-fill" style="width:${pct}%"></div></div>
            <div class="hp-meta"><span>HP ${en.hp}/${en.maxHp}</span><span>ATK ${en.atk}${en.hits ? '×' + en.hits : ''}</span></div>
          </div>
        </div>
        <div class="clash-log" id="clashLog"><div>Arrange your 3×3 Grid and tap Strike to Auto-Clash.</div></div>
        <div class="modal-btns">
          <button class="btn btn-secondary" id="editGridQuickBtn">3×3 Grid</button>
          <button class="btn btn-primary" id="strikeBtn" ${node.cleared ? 'disabled' : ''}>${node.cleared ? 'Cleared' : 'Strike (1 Charge)'}</button>
        </div>
      </div>`;
    }

    body.innerHTML = `
      <div class="map-canvas-wrap">
        <div class="map-zone-tag">Zone ${R.zone} · Power ×${getBasePowerMult().toFixed(2)}</div>
        <svg class="map-svg">${edgesHtml.join('')}${nodesHtml}</svg>
      </div>
      ${actionHtml}
    `;

    body.querySelectorAll('.map-node').forEach(el => {
      el.addEventListener('click', () => {
        R.selectedNode = Number(el.dataset.nid);
        saveR();
        renderRealm();
      });
    });

    const claimBtn = document.getElementById('claimNodeBtn');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        node.cleared = true;
        if (node.type === 'shrine') { R.zoneBuff = (R.zoneBuff || 0) + 0.12; showToast('Shrine active: +12% Grid Power'); }
        if (node.type === 'vault') { R.drafts += 1; R.shards += 20; showToast('+1 Draft · +20 Shards'); }
        saveR(); renderRealm();
      });
    }
    const strikeBtn = document.getElementById('strikeBtn');
    if (strikeBtn) strikeBtn.addEventListener('click', () => runGridClash(false));
    const quickGrid = document.getElementById('editGridQuickBtn');
    if (quickGrid) quickGrid.addEventListener('click', () => {
      activeTab = 'grid';
      document.querySelectorAll('.realm-tab').forEach(b => b.classList.toggle('active', b.dataset.rtab === 'grid'));
      renderRealm();
    });
  }

  function renderGridTab(body) {
    const gridHtml = R.grid.map((uid, idx) => {
      const c = getCubeByUid(uid);
      if (!c) {
        return `<div class="cube-slot ${selectedSlot === idx ? 'selected' : ''}" data-idx="${idx}"><span style="color:var(--muted);font-size:18px;">+</span></div>`;
      }
      const d = CUBE_DEFS[c.type];
      return `<div class="cube-slot filled ${d.cls} ${selectedSlot === idx ? 'selected' : ''}" data-idx="${idx}">
        <span class="cube-tier">T${c.tier}</span>
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
      ${detailHtml}
      <div class="clash-log" id="clashLog"><div>Tap Test Grid anytime (0 Charges) to watch your synergy chain fire.</div></div>
      <div class="modal-btns">
        <button class="btn btn-secondary" id="testDummyBtn">Test Grid (Free)</button>
        <button class="btn btn-primary" id="draftFromGridBtn">Draft Cube (${R.drafts})</button>
      </div>
      <div class="sec-head"><span>Cube Inventory</span><span>Tap slot, then cube</span></div>
      <div class="inv-grid">${invHtml}</div>
    `;

    body.querySelectorAll('.cube-slot').forEach(el => {
      el.addEventListener('click', () => {
        const idx = Number(el.dataset.idx);
        if (selectedSlot !== null && selectedSlot !== idx) {
          const tmp = R.grid[selectedSlot];
          R.grid[selectedSlot] = R.grid[idx];
          R.grid[idx] = tmp;
          selectedSlot = null;
          saveR();
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
        R.grid[target] = uid;
        selectedSlot = null;
        saveR();
        renderRealm();
      });
    });

    const upBtn = document.getElementById('upgradeCubeBtn');
    if (upBtn) upBtn.addEventListener('click', () => {
      const c = getCubeByUid(R.grid[selectedSlot]);
      const cost = c.tier * 20;
      if (R.shards < cost) { showToast(`Need ${cost} Shards`); return; }
      R.shards -= cost; c.tier++;
      saveR(); renderRealm(); showToast(`${CUBE_DEFS[c.type].name} forged to Tier ${c.tier}!`);
    });
    const remBtn = document.getElementById('removeCubeBtn');
    if (remBtn) remBtn.addEventListener('click', () => {
      R.grid[selectedSlot] = null; selectedSlot = null; saveR(); renderRealm();
    });
    document.getElementById('testDummyBtn').addEventListener('click', () => runGridClash(true));
    document.getElementById('draftFromGridBtn').addEventListener('click', openDraftModal);
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
        <text x="${n.x}%" y="${n.y + 13}%">${n.name}</text>
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
        R.perkPoints--;
        R.perks[pid] = true;
        if (pid === 'e1' || pid === 'e3') R.runHp = getMaxHp();
        saveR(); renderRealm(); showToast(`Unlocked ${n.name}!`);
      });
    });
  }

  window.ChronoRealm = { open: openRealm, onSessionSaved, updateBadge: updateRealmBadge };
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('realmBtn');
    if (btn) btn.addEventListener('click', openRealm);
    updateRealmBadge();
  });
})();
