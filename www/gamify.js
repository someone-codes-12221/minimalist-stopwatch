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
    catalyst: { id: 'catalyst', name: 'Catalyst', cls: 'synergy', glyph: '✦', desc: 'Boosts adjacent 4-way Cubes by +50% (+15%/tier).', base: 0.5 }
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
      } else if (type === 'kill') {
        [440, 554, 659, 880].forEach((f, idx) => {
          const o = sfxCtx.createOscillator(), gn = sfxCtx.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(f, now + idx * 0.06);
          gn.gain.setValueAtTime(0.08, now + idx * 0.06);
          gn.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
          o.connect(gn); gn.connect(sfxCtx.destination);
          o.start(now + idx * 0.06); o.stop(now + idx * 0.06 + 0.3);
        });
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
      return { kind, name: 'Monolith', hp, maxHp: hp, atk: Math.round(12 * scale), armor: Math.round(8 * scale), burn: 0, gimmick: `Heavy Armor (${Math.round(8 * scale)} blocked)` };
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
    return { kind: 'boss', name: 'Stronghold Warden', hp, maxHp: hp, atk: Math.round(19 * scale), armor: Math.round(6 * scale), burn: 0, gimmick: 'Multi-session Boss · Vault loot' };
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
      perkPoints: 1, perks: {}
    };
  }

  let R = null;
  try { R = JSON.parse(localStorage.getItem(REALM_KEY)); } catch (_) {}
  if (!R || !R.map || !R.skills) R = defaultRealm();
  function saveR() { localStorage.setItem(REALM_KEY, JSON.stringify(R)); }

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
    R.map.forEach(n => { if (n.cleared) { set.add(n.id); n.edges.forEach(e => set.add(e)); } });
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

    const parts = [];
    if (newCharges > 0) parts.push(`+${newCharges} Charge`); if (newDrafts > 0) parts.push(`+${newDrafts} Draft`);
    if (newShards > 0) parts.push(`+${newShards} Shards`); if (mins >= 45) parts.push('Overcharged'); if (parts.length) showToast(parts.join(' · ')); }  function updateRealmBadge() { const btn = document.getElementById('realmBtn'); if (btn) btn.classList.toggle('has-badge', R.drafts > 0 \vert{}\vert{} R.perkPoints > 0); }  // ---------- Animated Auto-Clash 3x3 Synergy Engine ---------- let isClashing = false;  async function runGridClash(isTestDummy) { if (isClashing) return; const node = R.map.find(n => n.id === R.selectedNode); if (!isTestDummy) { if (!node \vert{}\vert{} (node.type !== 'hostile' && node.type !== 'boss') \vert{}\vert{} node.cleared) return; if (R.charges < 1) { showToast('Need 1 Battle Charge (Study 15m)'); return; } R.charges--; const strikeBtn = document.getElementById('strikeBtn'); if (strikeBtn) strikeBtn.disabled = true; }  isClashing = true; const logEl = document.getElementById('clashLog'); const battleCard = document.getElementById('battleCard'); const enemyVis = document.getElementById('enemyVisual'); const miniGrid = document.getElementById('miniGrid'); const tallyDmgEl = document.getElementById('tallyDmg'); const tallyShdEl = document.getElementById('tallyShd'); const tallyHealEl = document.getElementById('tallyHeal');  const appendLog = (html) => { if (!logEl) return; const div = document.createElement('div'); div.innerHTML = html; logEl.appendChild(div); logEl.scrollTop = logEl.scrollHeight; }; if (logEl) logEl.innerHTML = '';  const overMult = 1 + (R.overcharge \vert{}\vert{} 0) + (R.overcharge > 0 && hasPerk('d2') ? 0.15 : 0); const powerMult = getBasePowerMult() * overMult; const strikeMult = 1 + (hasPerk('d1') ? 0.18 : 0) + (hasPerk('d4') ? 0.30 : 0); const wardMult = 1 + (hasPerk('m1') ? 0.20 : 0); const critChance = (hasPerk('o1') ? 0.15 : 0) + (hasPerk('o3') ? 0.20 : 0);  let totalDmg = 0, totalBurn = 0, totalShield = hasPerk('m4') ? 12 : 0, totalHeal = 0, hasReflect = false; const updateTallies = () => { if (tallyDmgEl) tallyDmgEl.textContent = `⚔ ${totalDmg}`;
      if (tallyShdEl) tallyShdEl.textContent = `⬡ ${totalShield}`; if (tallyHealEl) tallyHealEl.textContent = `✚ ${totalHeal}`;
    };
    updateTallies();

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

      const slotEl = document.querySelector(`[data-clash-idx="${idx}"]`); if (slotEl) slotEl.classList.add('firing');  if (c.type === 'spike' \vert{}\vert{} c.type === 'ember' \vert{}\vert{} c.type === 'shatter') { let d = Math.round(def.base * mult * strikeMult); if (c.type === 'shatter' && R.overcharge > 0) d = Math.round(d * 1.8); totalDmg += d; playSfx('strike'); vibrate(14); if (enemyVis) { spawnSlash(enemyVis, false); spawnFloat(enemyVis, `-${d}`, 'dmg');
          enemyVis.classList.remove('hit'); void enemyVis.offsetWidth; enemyVis.classList.add('hit');
        } else if (slotEl) {
          spawnFloat(slotEl, `-${d}`, 'dmg'); } if (c.type === 'ember') { const b = Math.round(def.burn * mult * (hasPerk('d3') ? 1.4 : 1)); totalBurn += b; appendLog(`${labelPrefix}<span class="hl">Ember</span> → <span class="dmg">${d} DMG</span> + <span class="syn">${b} Burn</span>`); } else { appendLog(`${labelPrefix}<span class="hl">${def.name}</span> → <span class="dmg">${d} DMG</span>`); } lastFired = { type: c.type, tier: c.tier, idx }; } else if (c.type === 'aegis' \vert{}\vert{} c.type === 'reflect') { const sh = Math.round(def.base * mult * wardMult); totalShield += sh; if (c.type === 'reflect') hasReflect = true; playSfx('ward'); vibrate(8); if (miniGrid) { miniGrid.classList.add('shield-flash'); spawnFloat(miniGrid, `+${sh} SHD`, 'shd');
          setTimeout(() => miniGrid.classList.remove('shield-flash'), 260);
        } else if (slotEl) {
          spawnFloat(slotEl, `+${sh} SHD`, 'shd'); } appendLog(`${labelPrefix}<span class="hl">${def.name}</span> → <span class="shd">+${sh} Shield</span>`);
        lastFired = { type: c.type, tier: c.tier, idx };
      } else if (c.type === 'mend') {
        const h = Math.round(def.base * mult * (hasPerk('m3') ? 1.35 : 1));
        totalHeal += h;
        playSfx('ward'); vibrate(8);
        spawnFloat(miniGrid || slotEl, `+${h} HP`, 'heal'); appendLog(`${labelPrefix}<span class="hl">Mend</span> → <span class="win">+${h} HP</span>`);
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
      appendLog(`<span class="win">DUMMY RESULT: ${totalDmg} DMG · ${totalShield} Shield · ${totalHeal} Heal</span>`); isClashing = false; return; }  // Apply Volley to Enemy const en = node.enemy; const armorIgnore = hasPerk('o4') ? 1 : (hasPerk('o2') ? 0.5 : 0); const effArmor = Math.round((en.armor \vert{}\vert{} 0) * (1 - armorIgnore)); const netDmg = Math.max(1, totalDmg - effArmor); en.burn = (en.burn \vert{}\vert{} 0) + totalBurn; const burnTick = en.burn; en.hp = Math.max(0, en.hp - netDmg - burnTick); R.overcharge = 0; if (totalHeal > 0) R.runHp = Math.min(getMaxHp(), R.runHp + totalHeal);  const hpBar = document.getElementById('enemyHpFill'); const hpText = document.getElementById('enemyHpText'); if (hpBar) hpBar.style.width = Math.round((en.hp / en.maxHp) * 100) + '\%'; if (hpText) hpText.textContent = `HP ${en.hp}/${en.maxHp}`; if (burnTick > 0 && enemyVis) spawnFloat(enemyVis, `🔥 -${burnTick}`, 'syn');
    appendLog(`<span class="hl">Volley landed: <span class="dmg">${netDmg}</span>${burnTick ? ` + ${burnTick} Burn` : ''}${effArmor ? ` (${effArmor} Armor)` : ''}.</span>`); await wait(360);  if (en.hp <= 0) { playSfx('kill'); vibrate([30, 50, 40]); if (enemyVis) enemyVis.classList.add('shatter'); await wait(520); node.cleared = true; const shardDrop = node.type === 'boss' ? 35 : 12; R.shards += shardDrop; if (node.type === 'boss') { R.drafts += 2; R.zone++; R.zoneBuff = 0; R.runHp = getMaxHp(); R.map = buildZoneMap(R.zone); R.selectedNode = 1; showToast(`ZONE ${R.zone} UNLOCKED! +${shardDrop} Shards · +2 Drafts`); } else { showToast(`${en.name} Defeated! +${shardDrop} Shards`); } } else { // Enemy Counterattack Lunge if (enemyVis) { enemyVis.classList.remove('lunge'); void enemyVis.offsetWidth; enemyVis.classList.add('lunge'); } await wait(160); const totalIncoming = en.atk * (en.hits \vert{}\vert{} 1); const blocked = Math.min(totalShield, totalIncoming); const hpLoss = Math.max(0, totalIncoming - blocked); R.runHp = Math.max(0, R.runHp - hpLoss);  if (hpLoss > 0) { playSfx('hit'); vibrate(30); if (battleCard) { battleCard.classList.remove('shake'); void battleCard.offsetWidth; battleCard.classList.add('shake'); } if (miniGrid) spawnFloat(miniGrid, `-${hpLoss} HP`, 'dmg');
      } else {
        playSfx('ward'); vibrate(12);
        if (miniGrid) { miniGrid.classList.add('shield-flash'); spawnFloat(miniGrid, 'BLOCKED', 'shd'); }
      }
      appendLog(`${en.name} strikes (${totalIncoming}) → <span class="shd">${blocked} blocked</span>, <span class="dmg">-${hpLoss} HP</span>.`);  if (hasReflect && blocked > 0) { await wait(240); const refDmg = Math.round(blocked * (hasPerk('m2') ? 0.85 : 0.6)); en.hp = Math.max(1, en.hp - refDmg); if (enemyVis) { spawnSlash(enemyVis, false); spawnFloat(enemyVis, `REFLECT -${refDmg}`, 'shd'); }
        appendLog(`<span class="shd">Reflect bounced ${refDmg} DMG back!</span>`);
      }

      if (R.runHp <= 0) {
        R.runHp = getMaxHp(); R.selectedNode = 0;
        showToast('Respawned at Camp (Full HP · Zero items lost)');
      }
      await wait(380);
    }

    saveR();
    isClashing = false;
    renderRealm();
  }

  // ---------- UI Rendering ----------
  let activeTab = 'map', selectedSlot = null, activeConst = 'endurance';

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
        if (isClashing) return;
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
    const keys = Object.keys(CUBE_DEFS), picks = [];
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
      <div class="res-pill clickable" id="openDraftPill"><div class="res-val">${R
