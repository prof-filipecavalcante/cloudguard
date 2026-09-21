import { challenges, checkAnswer, difficultyLabels } from './data/challenges.js';
import { authenticate, resumeSession, signIn, signOut } from './services/auth.js';
import { loadStudentProgress, saveAttempts, saveStudentProgress } from './services/storage.js';
import { formatTime, remainingMs } from './services/timer.js';

const state = { student: null, completed: [], attempts: {}, deadline: 0, activeChallengeId: null, filter: 'all', search: '' };
const $ = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];

function updateStudentIdentity() {
  const name = state.student.name;
  $('#student-name').textContent = name;
  $('#student-registration').textContent = state.student.registration;
  $('#student-avatar').textContent = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
}
function updateTimer() {
  if (!state.student) return;
  const left = remainingMs(state.deadline);
  $('#timer-display').textContent = formatTime(left);
  $('#timer-display').classList.toggle('timer-expired', left === 0);
  if (left === 0) all('.submit-button').forEach(button => { button.disabled = true; });
}
function updateAttempts() {
  const used = state.activeChallengeId ? Number(state.attempts[state.activeChallengeId] || 0) : 0;
  const left = Math.max(0, 3 - used);
  const label = `${left} tentativa${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}`;
  $('#attempts-indicator').textContent = '3 tentativas por desafio';
  $('#modal-attempts').textContent = label;
}
function renderStats() {
  const completed = challenges.filter(challenge => state.completed.includes(challenge.id));
  const percentage = Math.round(completed.length / challenges.length * 100);
  $('#progress-percent').textContent = `${percentage}%`;
  $('#progress-bar').style.width = `${percentage}%`;
  $('#mission-count').textContent = `${completed.length} / ${challenges.length} concluídos`;
  $('#flags-count').textContent = completed.length;
  $('#xp-count').textContent = completed.reduce((total, challenge) => total + challenge.xp, 0);
  $('#challenge-total').textContent = challenges.length - completed.length;
  ['all', 'easy', 'medium', 'hard'].forEach(level => { $(`#${level}-count`).textContent = level === 'all' ? challenges.length : challenges.filter(challenge => challenge.difficulty === level).length; });
}
function renderChallenges() {
  const search = state.search.toLowerCase();
  const filtered = challenges.filter(challenge => (state.filter === 'all' || challenge.difficulty === state.filter) && `${challenge.title} ${challenge.topic}`.toLowerCase().includes(search));
  $('#challenge-list').innerHTML = filtered.length ? filtered.map(challenge => {
    const completed = state.completed.includes(challenge.id);
    return `<article class="challenge-row ${completed ? 'completed' : ''}"><span class="challenge-id">${String(challenge.id).padStart(2, '0')}</span><div><div class="challenge-title">${challenge.title}</div><div class="challenge-topic">${challenge.topic}</div></div><span class="difficulty-badge badge-${challenge.difficulty}">${difficultyLabels[challenge.difficulty]}</span><span class="challenge-xp">+${challenge.xp} XP</span><button class="open-challenge" data-id="${challenge.id}">${completed ? '✓ Concluído' : 'Abrir desafio'}</button></article>`;
  }).join('') : '<div class="empty-state">Nenhum desafio encontrado.</div>';
  all('.open-challenge').forEach(button => button.addEventListener('click', () => openChallenge(Number(button.dataset.id))));
}
function showView(view) {
  all('.view').forEach(item => item.classList.toggle('active-view', item.id === `${view}-view`));
  all('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  $('#current-breadcrumb').textContent = view === 'dashboard' ? 'VISÃO GERAL' : 'DESAFIOS';
  if (view === 'challenges') renderChallenges();
}
function openChallenge(id) {
  const challenge = challenges.find(item => item.id === id);
  if (!challenge) return;
  $('#modal-difficulty').textContent = difficultyLabels[challenge.difficulty];
  $('#modal-difficulty').className = `difficulty-badge badge-${challenge.difficulty}`;
  $('#modal-category').textContent = challenge.topic.toUpperCase();
  $('#modal-xp').textContent = `+${challenge.xp} XP`;
  $('#modal-title').textContent = challenge.title;
  $('#modal-description').textContent = challenge.description;
  $('#modal-hint').hidden = !challenge.hint;
  $('#modal-hint p').textContent = challenge.hint;
  $('#flag-form').dataset.challengeId = id;
  state.activeChallengeId = id;
  $('#flag-input').value = '';
  $('#feedback').textContent = '';
  $('#feedback').className = 'feedback';
  updateAttempts();
  const attemptsExhausted = Number(state.attempts[id] || 0) >= 3;
  $('#submit-button').disabled = attemptsExhausted || remainingMs(state.deadline) === 0;
  if (attemptsExhausted) { $('#feedback').textContent = 'Este desafio atingiu o limite de 3 tentativas para esta matrícula.'; $('#feedback').className = 'feedback error'; }
  $('#challenge-modal').hidden = false;
  setTimeout(() => $('#flag-input').focus(), 0);
}
function closeChallenge() { $('#challenge-modal').hidden = true; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
function showCaptureCelebration(xp) { const celebration = $('#capture-celebration'); $('#celebration-xp').textContent = `+${xp} XP`; celebration.classList.remove('active'); celebration.setAttribute('aria-hidden', 'false'); void celebration.offsetWidth; celebration.classList.add('active'); setTimeout(() => { celebration.classList.remove('active'); celebration.setAttribute('aria-hidden', 'true'); }, 1800); }
function enterLab(student) {
  state.student = student;
  Object.assign(state, loadStudentProgress(student.registration));
  updateStudentIdentity(); updateAttempts(); updateTimer(); renderStats(); renderChallenges();
  signIn(student); document.body.classList.add('authenticated'); $('#login-screen').classList.add('hidden');
}
function leaveLab() { state.student = null; signOut(); document.body.classList.remove('authenticated'); $('#login-screen').classList.remove('hidden'); $('#registration-input').value = ''; }

$('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  const student = authenticate($('#registration-input').value);
  $('#login-feedback').textContent = student ? '' : 'Matrícula não encontrada na lista desta turma.';
  $('#login-feedback').className = student ? 'feedback' : 'feedback error';
  if (student) enterLab(student);
});
$('#logout-button').addEventListener('click', leaveLab);
$('#start-learning').addEventListener('click', () => showView('challenges'));
all('[data-view="challenges"]').forEach(button => button.addEventListener('click', () => showView('challenges')));
all('.level-card, .filter-link').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.difficulty; showView('challenges'); all('.segment').forEach(segment => segment.classList.toggle('active', segment.dataset.filter === state.filter)); }));
all('.segment').forEach(button => button.addEventListener('click', () => { state.filter = button.dataset.filter; all('.segment').forEach(segment => segment.classList.toggle('active', segment === button)); renderChallenges(); }));
$('#challenge-search').addEventListener('input', event => { state.search = event.target.value.slice(0, 80); renderChallenges(); });
$('#modal-close').addEventListener('click', closeChallenge);
$('#challenge-modal').addEventListener('click', event => { if (event.target.id === 'challenge-modal') closeChallenge(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeChallenge(); });
$('#flag-form').addEventListener('submit', event => {
  event.preventDefault();
  const challengeId = Number(event.currentTarget.dataset.challengeId);
  const challenge = challenges.find(item => item.id === challengeId);
  if (!state.student || !challenge || Number(state.attempts[challengeId] || 0) >= 3 || remainingMs(state.deadline) === 0) return;
  const answer = $('#flag-input').value.trim().toLowerCase().replace(/^flag\{/, '').replace(/\}$/, '');
  state.attempts[challengeId] = Number(state.attempts[challengeId] || 0) + 1; saveAttempts(state.student.registration, state.attempts); updateAttempts();
  if (checkAnswer(challenge, answer)) {
    if (!state.completed.includes(challenge.id)) { state.completed.push(challenge.id); saveStudentProgress(state.student.registration, state.completed); renderStats(); renderChallenges(); }
    $('#feedback').textContent = `✓ Flag correta. +${challenge.xp} XP adicionados à sua missão. ${challenge.explanation}`; $('#feedback').className = 'feedback success'; $('#challenge-modal').classList.remove('challenge-success'); void $('#challenge-modal').offsetWidth; $('#challenge-modal').classList.add('challenge-success'); const completedRow = document.querySelector(`.open-challenge[data-id="${challenge.id}"]`)?.closest('.challenge-row'); completedRow?.classList.add('challenge-completed-pop'); showCaptureCelebration(challenge.xp); showToast('Desafio concluído.');
  } else { $('#feedback').textContent = state.attempts[challengeId] >= 3 ? '✕ Limite de 3 tentativas atingido neste desafio.' : '✕ Flag incorreta. Tente novamente.'; $('#feedback').className = 'feedback error'; }
  $('#submit-button').disabled = state.attempts[challengeId] >= 3;
});

setInterval(updateTimer, 1000);
const session = resumeSession();
if (session) enterLab(session);
else { document.body.classList.remove('authenticated'); renderChallenges(); }
