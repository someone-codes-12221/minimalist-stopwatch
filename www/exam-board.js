/* === CHRONO EXAM BOARD ===
   Independent module for upcoming tests, result history, and syllabus tracking.
   Data is stored separately from the stopwatch and ChronoRealm saves.
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'chrono_exam_board_v1';

  const SYLLABUS = {
    Physics: [
      'Units & Dimensions', 'Vectors', 'Kinematics', 'Laws of Motion',
      'Work, Energy & Power', 'Centre of Mass', 'Rotational Motion',
      'Gravitation', 'Properties of Matter', 'Thermal Physics',
      'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves',
      'Electrostatics', 'Current Electricity', 'Magnetism', 'EMI & AC',
      'Optics', 'Modern Physics'
    ],
    Chemistry: [
      'Mole Concept', 'Atomic Structure', 'Periodic Table', 'Chemical Bonding',
      'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox', 'Hydrogen',
      's-Block', 'p-Block', 'Organic Chemistry Basics', 'Hydrocarbons',
      'Solutions', 'Electrochemistry', 'Chemical Kinetics',
      'Coordination Compounds', 'd/f Block', 'Carbonyl Compounds', 'Biomolecules'
    ],
    Maths: [
      'Sets & Relations', 'Functions', 'Trigonometry', 'Quadratic Equations',
      'Complex Numbers', 'Sequences & Series', 'Permutations & Combinations',
      'Binomial Theorem', 'Straight Lines', 'Circles', 'Conic Sections', 'Limits',
      'Continuity & Differentiability', 'Differentiation',
      'Application of Derivatives', 'Indefinite Integration',
      'Definite Integration', 'Differential Equations', 'Vectors',
      '3D Geometry', 'Probability'
    ]
  };

  function readData() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        done: raw.done && typeof raw.done === 'object' ? raw.done : {},
        tests: Array.isArray(raw.tests) ? raw.tests : [],
        upcoming: Array.isArray(raw.upcoming) ? raw.upcoming : []
      };
    } catch (_) {
      return { done: {}, tests: [], upcoming: [] };
    }
  }

  function saveData(data, toast) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (_) {
      if (typeof toast === 'function') toast('Could not save Exam Board data on this device.');
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function daysUntil(dateString, today) {
    const target = new Date(dateString + 'T00:00:00');
    const current = new Date(today + 'T00:00:00');
    if (Number.isNaN(target.getTime())) return null;
    return Math.max(0, Math.ceil((target - current) / 86400000));
  }

  function renderExamBoard(body, rerender, toast) {
    if (!body) return;

    const data = readData();
    const subjects = Object.keys(SYLLABUS);
    const totalChapters = subjects.reduce((sum, subject) => sum + SYLLABUS[subject].length, 0);
    const completedChapters = Object.values(data.done).filter(Boolean).length;
    const validResults = data.tests.filter(test =>
      Number.isFinite(Number(test.score)) &&
      Number.isFinite(Number(test.max)) &&
      Number(test.max) > 0
    );
    const average = validResults.length
      ? validResults.reduce((sum, test) => sum + Number(test.score) / Number(test.max) * 100, 0) / validResults.length
      : 0;
    const today = localDateKey(new Date());

    body.innerHTML = `
      <section class="exam-overview">
        <div><small>SYLLABUS</small><strong>${completedChapters}/${totalChapters}</strong><span>chapters completed</span></div>
        <div><small>TEST AVERAGE</small><strong>${validResults.length ? average.toFixed(1) + '%' : '—'}</strong><span>${validResults.length} tests logged</span></div>
        <div><small>UPCOMING</small><strong>${data.upcoming.length}</strong><span>planned tests</span></div>
      </section>

      <section class="exam-panel">
        <h3>Upcoming tests</h3>
        <form id="exam-upcoming-form" class="exam-form">
          <input name="title" maxlength="60" placeholder="Test name" autocomplete="off" required>
          <input name="date" type="date" min="${today}" required>
          <button class="exam-action" type="submit">Add test</button>
        </form>
        <div class="exam-list">
          ${data.upcoming.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map(test => {
            const remaining = daysUntil(String(test.date || ''), today);
            return `<div class="exam-row">
              <span><b>${escapeHtml(test.title)}</b><small>${escapeHtml(test.date)} · ${remaining === null ? 'Date unavailable' : remaining + ' days left'}</small></span>
              <button type="button" data-exam-remove-up="${escapeHtml(test.id)}" aria-label="Remove test">×</button>
            </div>`;
          }).join('') || '<p class="exam-empty">No tests scheduled yet.</p>'}
        </div>
      </section>

      <section class="exam-panel">
        <h3>Log a test result</h3>
        <form id="exam-score-form" class="exam-form exam-score-form">
          <input name="title" maxlength="60" placeholder="Test name" autocomplete="off" required>
          <select name="subject">
            <option>Full Test</option><option>Physics</option><option>Chemistry</option><option>Maths</option>
          </select>
          <input name="score" type="number" min="0" step="any" placeholder="Score" required>
          <input name="max" type="number" min="0.01" step="any" placeholder="Max marks" required>
          <button class="exam-action" type="submit">Save result</button>
        </form>
        <div class="exam-list">
          ${data.tests.slice().reverse().slice(0, 12).map(test => {
            const score = Number(test.score);
            const max = Number(test.max);
            const percentage = Number.isFinite(score) && Number.isFinite(max) && max > 0
              ? (score / max * 100).toFixed(1) + '%' : '—';
            return `<div class="exam-row">
              <span><b>${escapeHtml(test.title)}</b><small>${escapeHtml(test.subject)} · ${escapeHtml(test.score)}/${escapeHtml(test.max)} · ${percentage}</small></span>
              <button type="button" data-exam-remove-test="${escapeHtml(test.id)}" aria-label="Remove result">×</button>
            </div>`;
          }).join('') || '<p class="exam-empty">Your test history will appear here.</p>'}
        </div>
      </section>

      <section class="exam-panel">
        <h3>Syllabus tracker</h3>
        <p class="exam-hint">Tap a chapter when you have completed its study and practice.</p>
        ${subjects.map(subject => {
          const chapters = SYLLABUS[subject];
          const done = chapters.filter(chapter => data.done[subject + '|' + chapter]).length;
          return `<details class="exam-subject" ${subject === 'Physics' ? 'open' : ''}>
            <summary><span>${subject}</span><small>${done}/${chapters.length}</small></summary>
            <div class="exam-progress"><i style="width:${done / chapters.length * 100}%"></i></div>
            <div class="exam-chapters">
              ${chapters.map(chapter => {
                const key = subject + '|' + chapter;
                return `<label><input type="checkbox" data-exam-chapter="${escapeHtml(key)}" ${data.done[key] ? 'checked' : ''}><span>${escapeHtml(chapter)}</span></label>`;
              }).join('')}
            </div>
          </details>`;
        }).join('')}
      </section>
    `;

    const upcomingForm = body.querySelector('#exam-upcoming-form');
    upcomingForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const title = form.elements.namedItem('title').value.trim();
      const date = form.elements.namedItem('date').value;
      if (!title || !date || date < today) {
        if (typeof toast === 'function') toast('Enter a test name and a valid future date.');
        return;
      }
      data.upcoming.push({ id: Date.now().toString(36), title, date });
      if (saveData(data, toast) && typeof rerender === 'function') rerender();
    });

    const scoreForm = body.querySelector('#exam-score-form');
    scoreForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const title = form.elements.namedItem('title').value.trim();
      const score = Number(form.elements.namedItem('score').value);
      const max = Number(form.elements.namedItem('max').value);
      if (!title || !Number.isFinite(score) || !Number.isFinite(max) || max <= 0 || score < 0 || score > max) {
        if (typeof toast === 'function') toast('Check the score and maximum marks.');
        return;
      }
      data.tests.push({
        id: Date.now().toString(36),
        title,
        subject: form.elements.namedItem('subject').value,
        score,
        max,
        date: today
      });
      if (saveData(data, toast) && typeof rerender === 'function') rerender();
    });

    body.querySelectorAll('[data-exam-chapter]').forEach(input => {
      input.addEventListener('change', () => {
        data.done[input.dataset.examChapter] = input.checked;
        if (saveData(data, toast) && typeof rerender === 'function') rerender();
      });
    });

    body.querySelectorAll('[data-exam-remove-up]').forEach(button => {
      button.addEventListener('click', () => {
        data.upcoming = data.upcoming.filter(test => String(test.id) !== button.dataset.examRemoveUp);
        if (saveData(data, toast) && typeof rerender === 'function') rerender();
      });
    });

    body.querySelectorAll('[data-exam-remove-test]').forEach(button => {
      button.addEventListener('click', () => {
        data.tests = data.tests.filter(test => String(test.id) !== button.dataset.examRemoveTest);
        if (saveData(data, toast) && typeof rerender === 'function') rerender();
      });
    });
  }

  window.ChronoExamBoard = {
    render: renderExamBoard,
    syllabus: SYLLABUS
  };
})();
