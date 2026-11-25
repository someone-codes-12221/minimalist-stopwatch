/* === CHRONO SYLLABUS TRACKER ===
   Chapter-by-chapter study checklist. Existing Exam Board progress is migrated
   from the old chapter-complete flags without deleting the user's saved data.
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'chrono_exam_board_v1';
  const CHECKLIST = [
    { id: 'step1', label: 'STEP 1', detail: 'Learn the theory and understand the concepts' },
    { id: 'step2', label: 'STEP 2', detail: 'Study notes, formulas and solved examples' },
    { id: 'step3', label: 'STEP 3', detail: 'Complete practice questions' },
    { id: 'pyqs', label: 'PYQs', detail: 'Solve previous-year questions' }
  ];

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
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) {}
    const data = {
      steps: raw.steps && typeof raw.steps === 'object' ? raw.steps : {},
      // Retain older fields in case a user still has an older build open.
      done: raw.done && typeof raw.done === 'object' ? raw.done : {},
      tests: Array.isArray(raw.tests) ? raw.tests : [],
      upcoming: Array.isArray(raw.upcoming) ? raw.upcoming : []
    };

    // One-time migration: an old completed chapter becomes fully checked.
    if (!raw.steps) {
      Object.keys(SYLLABUS).forEach(subject => SYLLABUS[subject].forEach(chapter => {
        const key = subject + '|' + chapter;
        if (data.done[key]) data.steps[key] = { step1: true, step2: true, step3: true, pyqs: true };
      }));
    }
    return data;
  }

  function saveData(data, toast) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (_) {
      if (typeof toast === 'function') toast('Could not save syllabus progress on this device.');
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderExamBoard(body, rerender, toast) {
    if (!body) return;
    const data = readData();
    const subjects = Object.keys(SYLLABUS);
    const totalChapters = subjects.reduce((n, s) => n + SYLLABUS[s].length, 0);
    const totalTasks = totalChapters * CHECKLIST.length;
    let completedTasks = 0;
    let completedChapters = 0;

    subjects.forEach(subject => SYLLABUS[subject].forEach(chapter => {
      const checks = data.steps[subject + '|' + chapter] || {};
      const count = CHECKLIST.filter(item => !!checks[item.id]).length;
      completedTasks += count;
      if (count === CHECKLIST.length) completedChapters++;
    }));

    const overall = totalTasks ? completedTasks / totalTasks * 100 : 0;
    body.innerHTML = `
      <section class="exam-overview syllabus-overview">
        <div><small>CHAPTERS DONE</small><strong>${completedChapters}/${totalChapters}</strong><span>fully completed</span></div>
        <div><small>CHECKLIST</small><strong>${completedTasks}/${totalTasks}</strong><span>tasks completed</span></div>
        <div><small>OVERALL</small><strong>${overall.toFixed(0)}%</strong><span>syllabus progress</span></div>
      </section>
      <section class="exam-panel syllabus-panel">
        <div class="syllabus-heading">
          <div><h3>Your syllabus</h3><p class="exam-hint">Open a subject, choose a chapter, and tick off each stage.</p></div>
        </div>
        <div class="syllabus-total-progress"><i style="width:${overall}%"></i></div>
        ${subjects.map((subject, index) => {
          const chapters = SYLLABUS[subject];
          const subjectTasks = chapters.reduce((n, chapter) => {
            const checks = data.steps[subject + '|' + chapter] || {};
            return n + CHECKLIST.filter(item => !!checks[item.id]).length;
          }, 0);
          const subjectTotal = chapters.length * CHECKLIST.length;
          const subjectDone = chapters.filter(chapter => {
            const checks = data.steps[subject + '|' + chapter] || {};
            return CHECKLIST.every(item => !!checks[item.id]);
          }).length;
          return `
            <details class="exam-subject syllabus-subject" ${index === 0 ? 'open' : ''}>
              <summary>
                <span>${subject}</span>
                <small>${subjectDone}/${chapters.length} chapters · ${Math.round(subjectTasks / subjectTotal * 100)}%</small>
              </summary>
              <div class="exam-progress"><i style="width:${subjectTasks / subjectTotal * 100}%"></i></div>
              <div class="syllabus-chapter-list">
                ${chapters.map(chapter => {
                  const key = subject + '|' + chapter;
                  const checks = data.steps[key] || {};
                  const done = CHECKLIST.filter(item => !!checks[item.id]).length;
                  const isComplete = done === CHECKLIST.length;
                  return `
                    <details class="syllabus-chapter" ${done > 0 && !isComplete ? 'data-in-progress="true"' : ''}>
                      <summary>
                        <span class="syllabus-chapter-name">${escapeHtml(chapter)}</span>
                        <span class="syllabus-chapter-count ${isComplete ? 'is-complete' : ''}">${done}/4</span>
                      </summary>
                      <div class="syllabus-checklist">
                        ${CHECKLIST.map(item => `
                          <label class="syllabus-check ${checks[item.id] ? 'checked' : ''}">
                            <input type="checkbox" data-chapter="${escapeHtml(key)}" data-step="${item.id}" ${checks[item.id] ? 'checked' : ''}>
                            <span class="syllabus-check-copy"><b>${item.label}</b><small>${item.detail}</small></span>
                          </label>
                        `).join('')}
                      </div>
                    </details>`;
                }).join('')}
              </div>
            </details>`;
        }).join('')}
      </section>
    `;

    body.querySelectorAll('[data-chapter][data-step]').forEach(input => {
      input.addEventListener('change', () => {
        const key = input.dataset.chapter;
        if (!data.steps[key]) data.steps[key] = {};
        data.steps[key][input.dataset.step] = input.checked;
        if (saveData(data, toast) && typeof rerender === 'function') rerender();
      });
    });
  }

  window.ChronoExamBoard = { render: renderExamBoard, syllabus: SYLLABUS };
})();
