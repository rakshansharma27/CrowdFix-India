/* CrowdFix civic reporting demo. No API key is shipped to the browser. */
const STORAGE_KEY = 'crowdfix-demo-v2';
const DEHRADUN = [30.3256, 78.0437];
const CATEGORY_META = {
  'ROAD SAFETY': { icon: '⚠', cls: 'road' },
  'CLEANLINESS': { icon: '✳', cls: 'clean' },
  'PUBLIC LIGHTING': { icon: '☼', cls: 'light' },
  'WATER & SEWAGE': { icon: '≈', cls: 'water' },
  'TRAFFIC & TRANSIT': { icon: '↗', cls: 'traffic' },
  'OTHER': { icon: '•', cls: 'traffic' }
};
const ACCOUNTS = {
  'resident-rakshan': { id: 'resident-rakshan', name: 'Riya Demo', email: 'resident@example.test', role: 'resident', area: 'Rajpur Road, Dehradun', initials: 'RD' },
  'resident-arav': { id: 'resident-arav', name: 'Aman Demo', email: 'officer@example.test', role: 'officer', area: 'Nagar Nigam Dehradun', initials: 'AD' },
  'officer-snehal': { id: 'officer-snehal', name: 'Aman Demo', email: 'officer@example.test', role: 'officer', area: 'Nagar Nigam Dehradun', initials: 'AD' }
};
const PROMPTS = [
  { label: '🇮🇳 हिन्दी · घंटाघर / गड्ढा', text: 'घंटाघर राजपुर रोड के पास बहुत बड़ा और खतरनाक गड्ढा है, तुरंत ठीक करवाएं।' },
  { label: '🇮🇳 हिन्दी · पल्टन बाज़ार / कचरा', text: 'पल्टन बाज़ार के बाहर कचरे का ढेर लगा है और भयंकर बदबू आ रही है।' },
  { label: '🇮🇳 हिन्दी · पानी की पाइपलाइन', text: 'बल्लूपुर चौक के पास पानी की मुख्य पाइपलाइन फट गई है और सड़क पर पानी भर रहा है।' },
  { label: '🌐 English · Pothole / Rajpur Rd', text: 'There is a dangerous pothole near Clock Tower junction on Rajpur Road. Two bikes almost skidded this morning.' },
  { label: '🇮🇳 Hinglish · Pothole / Rajpur Rd', text: 'Rajpur Road Clock Tower ke paas bohot bada gaddha hai, do bikes abhi slip ho gayi dangerous pothole hai.' },
  { label: '🌐 English · Bins / Paltan Bazaar', text: 'The garbage dump outside Paltan Bazaar commercial market has been overflowing for two days with severe foul smell.' },
  { label: '🇮🇳 Hinglish · Kachra / Paltan Bazaar', text: 'Paltan Bazaar commercial market ke bahar kachra bohot zyada faila hua hai aur badboo aa rahi hai.' },
  { label: '🌐 English · Water / Ballupur', text: 'A water supply pipeline has burst and is flooding the road near Ballupur Chowk. Clean water is being wasted.' },
  { label: '🌐 English · Streetlight / Ballupur', text: 'Streetlight has been flickering and completely off on Ballupur Chowk, making the road pitch dark and unsafe.' }
];

const hoursAgo = (n) => new Date(Date.now() - n * 3600000).toISOString();
const seedState = () => ({
  version: 1,
  user: null,
  issues: [
    { id: 'issue-1', title: 'Large pothole near Clock Tower junction', category: 'ROAD SAFETY', landmark: 'Clock Tower · Rajpur Road', place: 'Rajpur Road, Dehradun', coords: [30.3256, 78.0437], voiceCount: 12, mergedCount: 3, status: 'open', priority: 'High', officer: 'Aman Demo', note: '', verification: 'verified', createdAt: hoursAgo(2.2), slaStart: hoursAgo(2.2), resolvedAt: null, resolutionTime: '', testimonies: [
      { name: 'Aman Demo', quote: 'A dangerous pothole is forming near Clock Tower. Two bikes almost skidded this morning.', language: 'English', time: hoursAgo(2.1), confidence: 98 },
      { name: 'Siddharth Rawat', quote: 'घंटाघर के पास राजपुर रोड पर बड़ा गड्ढा है। रात में दिखता नहीं है।', language: 'Hindi', time: hoursAgo(1.6), confidence: 97 },
      { name: 'Kavita Uniyal', quote: 'Clock Tower se Rajpur Road turn par wahi gaddha hai, please repair it soon.', language: 'Hinglish', time: hoursAgo(.7), confidence: 96 }
    ] },
    { id: 'issue-2', title: 'Overflowing bins outside Paltan Bazaar', category: 'CLEANLINESS', landmark: 'Paltan Bazaar', place: 'Paltan Bazaar, Dehradun', coords: [30.3218, 78.0402], voiceCount: 7, mergedCount: 2, status: 'in_progress', priority: 'Medium', officer: 'Aman Demo', note: 'Nagar Nigam Dehradun compactor vehicle UK-07 dispatched.', verification: 'verified', createdAt: hoursAgo(5.8), slaStart: hoursAgo(5.8), resolvedAt: null, resolutionTime: '', testimonies: [
      { name: 'Vikram Negi', quote: 'The garbage dump outside Paltan Bazaar has been overflowing for two days with a severe foul smell.', language: 'English', time: hoursAgo(4.5), confidence: 98 },
      { name: 'Deepa Joshi', quote: 'Paltan Bazaar ke bahar kachra bohot zyada faila hua hai aur badboo aa rahi hai.', language: 'Hinglish', time: hoursAgo(3.9), confidence: 95 }
    ] },
    { id: 'issue-3', title: 'Streetlight not working on Ballupur Chowk road', category: 'PUBLIC LIGHTING', landmark: 'Ballupur Chowk', place: 'Ballupur Chowk, Dehradun', coords: [30.3350, 78.0125], voiceCount: 4, mergedCount: 1, status: 'open', priority: 'Medium', officer: 'Unassigned', note: '', verification: 'needs_verification', createdAt: hoursAgo(1.8), slaStart: hoursAgo(1.8), resolvedAt: null, resolutionTime: '', testimonies: [
      { name: 'Meera Pant', quote: 'The streetlight at Ballupur Chowk is completely off and the road feels unsafe after dark.', language: 'English', time: hoursAgo(1.6), confidence: 96 }
    ] },
    { id: 'issue-4', title: 'Fallen tree branch cleared from road', category: 'ROAD SAFETY', landmark: 'Saharanpur Road', place: 'Saharanpur Road, Dehradun', coords: [30.3284, 78.0304], voiceCount: 1, mergedCount: 1, status: 'resolved', priority: 'Medium', officer: 'Aman Demo', note: 'Branch removed by Nagar Nigam Rapid Action Team. Road is clear and safe for traffic.', verification: 'verified', createdAt: hoursAgo(41), slaStart: hoursAgo(41), resolvedAt: hoursAgo(27), resolutionTime: '14 hours', testimonies: [
      { name: 'Rohit Bisht', quote: 'A fallen tree branch is blocking part of Saharanpur Road near the crossing.', language: 'English', time: hoursAgo(40), confidence: 96 }
    ] }
  ]
});

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.version === 1 && Array.isArray(parsed.issues)) return parsed;
  } catch (_) { /* Start with clean demo data if storage is unavailable. */ }
  return seedState();
}
let appState = loadState();
let currentIssueId = null;
let pendingAction = null;
let activeSpeech = null;
let isAudioRecording = false;
let audioContext = null;
let audioStream = null;
let audioProcessor = null;
let audioSource = null;
let audioMute = null;
let audioSamples = [];
let recordingTimeout = null;
let gnaniApiReady = false;
let isTranscribing = false;
let simulationToken = 0;
let mapInstance = null;
let mapMarkers = [];
let heatLayer = null;
let heatEnabled = false;
let markersVisible = true;

function persistState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }
  catch (_) { showToast('This browser could not save the demo changes.', 'warning'); }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function normalizeText(text) { return String(text || '').toLowerCase().normalize('NFC').replace(/[.,!?;:()[\]{}"'`]/g, ' ').replace(/\s+/g, ' ').trim(); }
function detectLanguage(text) {
  const value = String(text || '');
  if (/[\u0900-\u097F]/.test(value)) return 'Hindi';
  if (/\b(gaddha|khaddha|kachra|badboo|paani|andhera|batti|bohot|hai|ke paas|mein|nahi)\b/i.test(value)) return 'Hinglish';
  return 'English';
}

class CivicEvidenceParser {
  static categories = [
    ['ROAD SAFETY', ['pothole', 'path hole', 'gaddha', 'gaddhe', 'khaddha', 'crater', 'asphalt', 'गड्ढा', 'गड्ढे', 'सड़क']],
    ['CLEANLINESS', ['garbage', 'waste', 'trash', 'dump', 'kachra', 'kuda', 'badboo', 'कचरा', 'कूड़ा', 'बदबू', 'सफाई']],
    ['PUBLIC LIGHTING', ['streetlight', 'street light', 'lamp', 'dark', 'flicker', 'andhera', 'batti', 'अंधेरा', 'बिजली', 'बत्ती']],
    ['WATER & SEWAGE', ['water', 'pipe', 'burst', 'flooding', 'paani', 'nali', 'पानी', 'नाली', 'सीवेज']],
    ['TRAFFIC & TRANSIT', ['traffic', 'signal', 'jam', 'jaam', 'bheed', 'जाम', 'ट्रैफिक']]
  ];
  static landmarks = [
    { name: 'Clock Tower · Rajpur Road', aliases: ['clock tower', 'ghanta ghar', 'ghantaghar', 'घंटाघर', 'rajpur road', 'rajpur', 'राजपुर रोड', 'राजपुर'] },
    { name: 'Ballupur Chowk', aliases: ['ballupur chowk', 'ballupur', 'बल्लूपुर चौक', 'बल्लूपुर'] },
    { name: 'Paltan Bazaar', aliases: ['paltan bazaar', 'paltan bazar', 'paltan', 'पल्टन बाजार', 'पल्टन बाज़ार'] },
    { name: 'Saharanpur Road', aliases: ['saharanpur road', 'saharanpur', 'सहारनपुर रोड'] },
    { name: 'Prem Nagar', aliases: ['prem nagar', 'प्रेम नगर'] },
    { name: 'ISBT Dehradun', aliases: ['isbt', 'dehradun bus stand'] }
  ];
  static parse(text) {
    const source = String(text || '').trim();
    const normalized = normalizeText(source);
    const match = this.categories.find(([, words]) => words.some((word) => normalized.includes(normalizeText(word))));
    const landmark = this.landmarks.find((entry) => entry.aliases.some((alias) => normalized.includes(normalizeText(alias))));
    const highWords = ['crash', 'accident', 'danger', 'dangerous', 'khatarnak', 'phat gaya', 'unsafe', 'immediately', 'खतरनाक', 'तुरंत', 'बहुत बड़ा'];
    const lowWords = ['minor', 'slow', 'thoda', 'chhota', 'छोटा'];
    const severity = highWords.some((word) => normalized.includes(normalizeText(word))) ? 'High' : lowWords.some((word) => normalized.includes(normalizeText(word))) ? 'Low' : 'Medium';
    const repeated = /(.)\1{5,}/u.test(source.replace(/\s/g, ''));
    const tooShort = source.replace(/\s/g, '').length < 8;
    const spamRisk = (repeated || tooShort) ? 0.94 : 0.01;
    return { category: match?.[0] || 'OTHER', landmark: landmark?.name || 'Not identified', severity, spamRisk, isSpam: spamRisk >= 0.5, language: detectLanguage(source), text: source };
  }
  static findClusterMatch(evidence, issues) {
    if (!evidence || evidence.isSpam || evidence.category === 'OTHER') return null;
    const active = issues.filter((issue) => issue.status !== 'resolved' && issue.category === evidence.category);
    if (!active.length) return null;
    const input = normalizeText(`${evidence.landmark || ''} ${evidence.text || ''}`);
    const aliasesFor = (issue) => {
      const landmark = normalizeText(issue.landmark || issue.place || '');
      if (landmark.includes('clock tower') || landmark.includes('rajpur')) return ['clock tower', 'ghanta ghar', 'ghantaghar', 'घंटाघर', 'rajpur', 'राजपुर'];
      if (landmark.includes('paltan')) return ['paltan bazaar', 'paltan bazar', 'paltan', 'पल्टन'];
      if (landmark.includes('ballupur')) return ['ballupur', 'बल्लूपुर'];
      return [landmark].filter(Boolean);
    };
    return active.find((issue) => aliasesFor(issue).some((alias) => input.includes(alias))) || null;
  }
}
window.CivicEvidenceParser = CivicEvidenceParser;

function activeIssues() { return appState.issues.filter((issue) => issue.status !== 'resolved'); }
function resolvedIssues() { return appState.issues.filter((issue) => issue.status === 'resolved'); }
function allVoiceCount() { return appState.issues.reduce((sum, issue) => sum + Number(issue.voiceCount || 0), 0); }
function pressureScore(count) { return Math.min(100, Math.round((Number(count || 0) / 20) * 100)); }
function resolutionEstimate(count) { return Math.max(.5, 10 - Number(count || 0) * .75); }
function timeAgo(isoString) {
  const delta = Math.max(0, Date.now() - new Date(isoString).getTime());
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}
function formatEstimate(count) {
  const hours = resolutionEstimate(count);
  return hours < 1 ? `${Math.round(hours * 60)} min` : `~${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}
function priorityRank(priority) { return priority === 'High' ? 0 : priority === 'Medium' ? 1 : 2; }
function categoryIcon(category) {
  const meta = CATEGORY_META[category] || CATEGORY_META.OTHER;
  return `<span class="issue-icon ${meta.cls}">${meta.icon}</span>`;
}
function setSpeechmaticsHudState(status, latency = null, confidence = null, language = null, interim = null) {
  const labels = { idle: 'Demo fallback', streaming: 'Streaming demo', finalized: 'Demo finalized', listening: 'Recording', transcribing: 'Sending to Gnani', gnani_ready: 'Gnani Prisma v3.0', gnani_finalized: 'Gnani Prisma v3.0', error: 'Fallback ready' };
  const statusText = labels[status] || status;
  const statusEl = document.getElementById('hudStatus');
  if (statusEl) statusEl.innerHTML = `${escapeHTML(statusText)} <i class="pulse-dot"></i>`;
  const reportStatus = document.getElementById('reportHudStatus');
  if (reportStatus) reportStatus.textContent = statusText;
  const languageEl = document.getElementById('hudLanguage');
  if (languageEl) languageEl.textContent = language || 'Auto detect';
  const latencyEl = document.getElementById('hudLatency');
  if (latencyEl) latencyEl.textContent = latency == null ? '—' : `${latency} ms`;
  const confidenceEl = document.getElementById('hudConfidence');
  if (confidenceEl) confidenceEl.textContent = confidence == null ? '—' : `${confidence}%`;
  const interimEl = document.getElementById('hudInterimText');
  if (interimEl && interim != null) interimEl.textContent = interim || 'Listening for a civic issue…';
}

function renderAll() {
  renderOverviewPriorityQueue();
  renderLiveReportsFeed();
  renderClustersGrid();
  renderResolvedList();
  updateStats();
  updateIdentityUI();
  updateDynamicHeader();
  renderMapMarkers();
}
function updateStats() {
  const total = allVoiceCount();
  const activeCount = activeIssues().length;
  const resolvedCount = resolvedIssues().length;
  const rate = appState.issues.length ? Math.round((resolvedCount / appState.issues.length) * 100) : 0;
  setText('statTotalReports', total);
  setText('heroReportCount', total);
  setText('statActiveClusters', activeCount);
  setText('statResolvedRate', rate);
  setText('sidebarReportCount', total);
  setText('sidebarClusterCount', activeCount);
  setText('sidebarResolvedCount', resolvedCount);
  setText('clusterSummaryCount', activeCount);
  setText('clusterSummaryVoices', activeIssues().reduce((sum, issue) => sum + Number(issue.voiceCount || 0), 0));
  setText('resolvedTotal', resolvedCount);
}
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = String(value); }

function renderOverviewPriorityQueue() {
  const container = document.getElementById('priorityQueue');
  if (!container) return;
  const list = activeIssues().slice().sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.voiceCount - a.voiceCount).slice(0, 4);
  container.innerHTML = list.length ? list.map((issue) => `<div class="priority-item" data-issue-id="${escapeHTML(issue.id)}" tabindex="0" role="button" aria-label="View ${escapeHTML(issue.title)}">${categoryIcon(issue.category)}<div class="priority-main"><strong>${escapeHTML(issue.title)}</strong><small>${escapeHTML(issue.place)} · <span class="status-dot ${issue.status === 'in_progress' ? 'status-blue' : 'status-amber'}"></span>${issue.status === 'in_progress' ? ' In progress' : ' Open'}</small></div><div class="priority-side"><strong>${issue.voiceCount} voices</strong><small>${escapeHTML(issue.priority)} priority</small><div class="mini-pressure"><i style="width:${pressureScore(issue.voiceCount)}%"></i></div></div></div>`).join('') : emptyState('No active issues', 'New community reports will show here.', '✓');
}
function renderLiveReportsFeed() {
  const container = document.getElementById('liveReportsFeed');
  if (!container) return;
  const search = normalizeText(document.getElementById('feedSearchInput')?.value || '');
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const statusFilter = document.getElementById('feedTagFilter')?.value || 'all';
  const rows = appState.issues.flatMap((issue) => (issue.testimonies || []).map((entry, index) => ({ issue, entry, index })))
    .filter(({ issue, entry }) => (category === 'all' || issue.category === category) && (statusFilter === 'all' || issue.status === statusFilter) && (!search || normalizeText(`${issue.title} ${issue.place} ${entry.quote} ${entry.name}`).includes(search)))
    .sort((a, b) => new Date(b.entry.time) - new Date(a.entry.time));
  container.innerHTML = rows.length ? rows.map(({ issue, entry, index }) => `<article class="feed-report-item" data-issue-id="${escapeHTML(issue.id)}" tabindex="0" role="button"><span>${categoryIcon(issue.category)}</span><div class="feed-report-content"><h3 class="feed-report-title">${escapeHTML(issue.title)}</h3><p class="feed-report-quote">“${escapeHTML(entry.quote)}”</p><div class="feed-report-meta"><span>${escapeHTML(entry.name)}</span><span>·</span><span>${timeAgo(entry.time)}</span><span class="report-tag">${escapeHTML(issue.category)}</span><span class="status-tag ${escapeHTML(issue.status)}">${issue.status === 'in_progress' ? 'IN PROGRESS' : issue.status.toUpperCase()}</span></div></div><div class="feed-confidence">${escapeHTML(entry.language || 'English')} · ${escapeHTML(entry.confidence || 96)}%</div></article>`).join('') : emptyState('No matching reports', 'Try another search or clear one of the filters.', '⌕');
}
function renderClustersGrid() {
  const container = document.getElementById('clustersGrid');
  if (!container) return;
  const list = activeIssues().slice().sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || b.voiceCount - a.voiceCount);
  container.innerHTML = list.length ? list.map((issue) => `<article class="cluster-card" data-issue-id="${escapeHTML(issue.id)}" tabindex="0" role="button"><div class="cluster-card-top">${categoryIcon(issue.category)}<div class="cluster-badges"><span class="priority-badge ${issue.priority.toLowerCase()}">${escapeHTML(issue.priority.toUpperCase())} PRIORITY</span><span class="status-tag ${escapeHTML(issue.status)}">${issue.status === 'in_progress' ? 'IN PROGRESS' : 'OPEN'}</span></div></div><h3>${escapeHTML(issue.title)}</h3><div class="cluster-place">⌖ ${escapeHTML(issue.place)}</div><div class="cluster-stats"><span><strong>${issue.voiceCount}</strong> voices</span><span>•</span><span>${issue.mergedCount} merged reports</span><span>•</span><span>${escapeHTML(issue.officer || 'Unassigned')}</span></div><div class="cluster-card-bottom"><div class="pressure-wrap"><div class="pressure-top"><span>Community pressure</span><b>${pressureScore(issue.voiceCount)}%</b></div><div class="pressure-bar"><i style="width:${pressureScore(issue.voiceCount)}%"></i></div></div><div class="estimate-label">EST. RESOLUTION<strong>${formatEstimate(issue.voiceCount)}</strong></div></div>${issue.verification === 'needs_verification' ? '<div class="verification-alert">ⓘ Single report · Community verification needed before escalation.</div>' : ''}</article>`).join('') : emptyState('No active clusters', 'New issues will appear here after a report is submitted.', '◎');
}
function renderResolvedList() {
  const container = document.getElementById('resolvedList');
  if (!container) return;
  const list = resolvedIssues().slice().sort((a, b) => new Date(b.resolvedAt || 0) - new Date(a.resolvedAt || 0));
  container.innerHTML = list.length ? list.map((issue) => `<article class="resolved-card" data-issue-id="${escapeHTML(issue.id)}" tabindex="0" role="button"><span class="resolved-check">✓</span><div><h3>${escapeHTML(issue.title)}</h3><p>${escapeHTML(issue.category)} · ${escapeHTML(issue.place)} · ${issue.voiceCount} community ${issue.voiceCount === 1 ? 'voice' : 'voices'}</p><div class="resolved-note">“${escapeHTML(issue.note || 'Work completed and verified by the Nagar Nigam field team.')}”</div></div><div class="resolved-side"><span>✓ RESOLVED</span><small>${escapeHTML(issue.resolutionTime || 'Completed')} · ${timeAgo(issue.resolvedAt || issue.createdAt)}</small></div></article>`).join('') : emptyState('Nothing resolved yet', 'Completed civic work will be saved here.', '✓');
}
function emptyState(title, description, icon) { return `<div class="empty-state"><span>${icon}</span><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p></div>`; }

function updateDynamicHeader() {
  const now = new Date();
  const dateText = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(now).toUpperCase();
  setText('topbarDate', dateText);
  const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(now));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = appState.user?.name?.split(' ')[0];
  setText('topbarGreeting', name ? `${greeting}, ${name} ✦` : `${greeting}, neighbour ✦`);
}
function updateIdentityUI() {
  const user = appState.user;
  const isGuest = !user;
  const name = user?.name || 'Demo Guest';
  const initials = user?.initials || 'DG';
  setText('sidebarUserName', name);
  setText('sidebarUserRole', isGuest ? 'Read only' : user.role === 'officer' ? 'Public Service Officer' : 'Resident · Dehradun');
  setText('sidebarAvatar', initials);
  setText('topbarAvatar', initials);
  setText('topbarSignInBtn', isGuest ? 'Sign in' : '');
  const signIn = document.getElementById('topbarSignInBtn');
  if (signIn) signIn.style.display = isGuest ? 'inline-block' : 'none';
  setText('modalAvatarLarge', initials);
  setText('modalUserName', name);
  setText('modalUserEmail', user?.email || 'Read-only preview');
  setText('modalRoleBadge', isGuest ? 'Demo guest' : user.role === 'officer' ? 'Public Service Officer' : 'Resident');
  setText('sidebarRoleTitle', user?.role === 'officer' ? 'Officer Mode' : 'Resident Mode');
  setText('sidebarRoleDesc', user?.role === 'officer' ? 'Triage and resolve civic reports.' : 'File a report and add your voice.');
  document.querySelectorAll('.account-row').forEach((el) => el.classList.toggle('selected', el.dataset.accountId === user?.id || (user?.role === 'officer' && el.dataset.accountId === 'resident-arav')));
}
function switchView(viewName) {
  document.querySelectorAll('.page-view').forEach((el) => el.classList.toggle('active', el.dataset.page === viewName));
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === viewName));
  closeSidebar();
  if (viewName === 'overview') setTimeout(() => mapInstance?.invalidateSize(), 100);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const first = el.querySelector('button:not([disabled]), input:not([disabled]), textarea:not([disabled])');
  setTimeout(() => first?.focus(), 60);
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-backdrop.open')) document.body.style.overflow = '';
  if (id === 'reportModal') stopRecording(false);
}
function closeAllModals() { document.querySelectorAll('.modal-backdrop.open').forEach((el) => closeModal(el.id)); }
function openAuthModal(action = null) { pendingAction = action; openModal('authModal'); }
function finishAuth(accountId) {
  appState.user = accountId ? { ...ACCOUNTS[accountId] } : null;
  persistState(); renderAll(); closeModal('authModal'); closeModal('profileModal');
  showToast(appState.user ? `Signed in as ${appState.user.name}.` : 'Continuing in read-only demo mode.', 'success');
  const action = pendingAction; pendingAction = null;
  if (action === 'report' && appState.user?.role === 'resident') setTimeout(openReportModal, 180);
}
function openProfileModal() { updateIdentityUI(); openModal('profileModal'); }
function requireResident(action = null) {
  if (!appState.user) { openAuthModal(action); return false; }
  if (appState.user.role !== 'resident') { showToast('Switch to the resident demo profile to add a report or voice.'); openProfileModal(); return false; }
  return true;
}
function requireOfficer() {
  if (appState.user?.role === 'officer') return true;
  showToast('Switch to the Public Service Officer profile to update issue status.');
  openProfileModal(); return false;
}
function resetReportForm() {
  simulationToken++;
  stopRecording(false);
  const textarea = document.getElementById('reportText');
  if (textarea) textarea.value = '';
  setText('transcriptState', 'Ready when you are');
  setSpeechmaticsHudState(gnaniApiReady ? 'gnani_ready' : 'idle', null, null, 'Auto detect', 'Hindi · Hinglish · English and more');
  updateParserLivePreview('');
  setRecordingUI(false);
}
function openReportModal() {
  if (!requireResident('report')) return;
  resetReportForm(); renderPromptChips(); openModal('reportModal');
}
function renderPromptChips() {
  const container = document.getElementById('promptGrid');
  if (!container) return;
  container.innerHTML = '';
  PROMPTS.forEach((prompt) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'demo-chip'; button.textContent = prompt.label;
    button.addEventListener('click', () => startSpeechmaticsSimulation(prompt.text));
    container.appendChild(button);
  });
}
function setRecordingUI(isRecording) {
  const button = document.getElementById('recordButton');
  const stop = document.getElementById('stopRecordingBtn');
  const bars = document.getElementById('soundWaveBars');
  if (button) button.classList.toggle('recording', isRecording);
  if (stop) stop.disabled = !isRecording;
  if (bars) bars.classList.toggle('active', isRecording);
  setText('recordButtonIcon', isRecording ? '◼' : '🎙');
  setText('recordTitle', isRecording ? 'Recording…' : 'Tap to record');
  setText('recordHint', isRecording ? 'Recording locally. Tap Finish to send this clip to Gnani.' : 'Record up to 25 seconds; Gnani Prisma v3.0 will transcribe it.');
}
function updateParserLivePreview(text) {
  const parsed = CivicEvidenceParser.parse(text);
  const category = document.getElementById('previewCategory');
  if (category) category.textContent = text.trim() ? parsed.category : 'Awaiting text';
  setText('previewLandmark', text.trim() ? parsed.landmark : '—');
  setText('previewSeverity', text.trim() ? parsed.severity : '—');
  setText('previewSpam', text.trim() ? (parsed.isSpam ? 'Review' : 'Low') : '—');
  const match = CivicEvidenceParser.findClusterMatch(parsed, appState.issues);
  setText('previewClusteringReason', !text.trim() ? 'Add a description to check for a related issue.' : parsed.isSpam ? 'This text needs more detail before it can be submitted.' : match ? `Will merge into “${match.title}” · category + landmark match` : parsed.category === 'OTHER' ? 'No civic category detected yet. Add a few more details.' : 'Will create a new civic issue cluster.');
  const submit = document.getElementById('submitReport');
  if (submit) submit.disabled = !text.trim() || parsed.isSpam || Boolean(activeSpeech) || isTranscribing;
  return parsed;
}
async function startSpeechmaticsSimulation(text) {
  if (!text || isTranscribing) return;
  if (!document.getElementById('reportModal')?.classList.contains('open')) {
    if (!requireResident('report')) return;
    resetReportForm(); renderPromptChips(); openModal('reportModal');
  }
  if (activeSpeech) stopRecording(false);
  simulationToken++;
  const token = simulationToken;
  const textarea = document.getElementById('reportText');
  if (textarea) textarea.value = '';
  updateParserLivePreview('');
  const words = String(text).split(/\s+/);
  let output = '';
  activeSpeech = { type: 'local-demo' };
  setText('transcriptState', 'Streaming sample prompt…');
  setRecordingUI(true);
  setText('recordTitle', 'Streaming sample prompt');
  setText('recordHint', 'Local simulation only; no audio is sent to Gnani.');
  setSpeechmaticsHudState('streaming', 180, 72, detectLanguage(text), 'Starting local demo transcription…');
  for (let i = 0; i < words.length; i++) {
    if (token !== simulationToken) return;
    output += (i ? ' ' : '') + words[i];
    if (textarea) textarea.value = output;
    const confidence = Math.min(99, 78 + Math.round((i / Math.max(1, words.length - 1)) * 20));
    setSpeechmaticsHudState('streaming', 165 + (i * 17 % 31), confidence, detectLanguage(output), output);
    updateParserLivePreview(output);
    await new Promise((resolve) => setTimeout(resolve, 54));
  }
  if (token !== simulationToken) return;
  activeSpeech = null;
  setRecordingUI(false);
  setText('transcriptState', 'Sample transcript ready');
  setSpeechmaticsHudState('finalized', 172, 98, detectLanguage(output), output);
  updateParserLivePreview(output);
}
async function startNativeSpeechRecognition() {
  if (isTranscribing) { showToast('Wait for the current Gnani request to finish.'); return; }
  if (isAudioRecording) { stopRecording(true); return; }
  if (!gnaniApiReady) {
    showToast('The secure Gnani connection is not available. You can still type or choose a demo prompt.', 'warning');
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast('Microphone recording needs a supported browser on HTTPS. Type a report or use a demo prompt.', 'warning');
    return;
  }
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass({ sampleRate: 16000 });
    if (audioContext.state === 'suspended') await audioContext.resume();
    audioSource = audioContext.createMediaStreamSource(audioStream);
    audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    audioMute = audioContext.createGain(); audioMute.gain.value = 0;
    audioSamples = [];
    audioProcessor.onaudioprocess = (event) => audioSamples.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    audioSource.connect(audioProcessor); audioProcessor.connect(audioMute); audioMute.connect(audioContext.destination);
    isAudioRecording = true; activeSpeech = { type: 'gnani-audio' };
    const textarea = document.getElementById('reportText'); if (textarea) textarea.value = '';
    updateParserLivePreview('');
    setRecordingUI(true); setText('transcriptState', 'Recording locally; audio sends when you tap Finish');
    setSpeechmaticsHudState('listening', null, null, 'Prisma v3.0 · automatic language detection', 'Listening for Hindi, Hinglish, or English…');
    recordingTimeout = setTimeout(() => { showToast('25-second limit reached; sending the recording to Gnani.'); stopRecording(true); }, 25000);
  } catch (error) {
    cleanupAudioCapture();
    setRecordingUI(false); setSpeechmaticsHudState(gnaniApiReady ? 'gnani_ready' : 'error');
    setText('transcriptState', 'Recording was not started');
    showToast(error?.name === 'NotAllowedError' ? 'Microphone permission was denied. You can still type or use a prompt.' : 'Could not start microphone recording. Try again or use a prompt.', 'warning');
  }
}
function cleanupAudioCapture() {
  clearTimeout(recordingTimeout); recordingTimeout = null;
  if (audioProcessor) { audioProcessor.onaudioprocess = null; try { audioProcessor.disconnect(); } catch (_) {} }
  if (audioSource) { try { audioSource.disconnect(); } catch (_) {} }
  if (audioMute) { try { audioMute.disconnect(); } catch (_) {} }
  audioStream?.getTracks().forEach((track) => track.stop());
  const closingContext = audioContext;
  audioProcessor = null; audioSource = null; audioMute = null; audioStream = null; audioContext = null;
  if (closingContext && closingContext.state !== 'closed') closingContext.close().catch(() => {});
}
function encodeWav(samples, inputRate) {
  const outputRate = 16000;
  const step = inputRate / outputRate;
  const outputLength = Math.floor(samples.length / step);
  const pcm = new Int16Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * step);
    const end = Math.min(samples.length, Math.floor((i + 1) * step));
    let total = 0;
    for (let j = start; j < Math.max(start + 1, end); j++) total += samples[Math.min(j, samples.length - 1)];
    const sample = Math.max(-1, Math.min(1, total / Math.max(1, end - start)));
    pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  writeText(0, 'RIFF'); view.setUint32(4, 36 + pcm.length * 2, true); writeText(8, 'WAVE'); writeText(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, outputRate, true); view.setUint32(28, outputRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeText(36, 'data'); view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return new Blob([buffer], { type: 'audio/wav' });
}
function stopRecording(sendAudio = true) {
  simulationToken++;
  if (isAudioRecording) {
    isAudioRecording = false;
    const rate = audioContext?.sampleRate || 16000;
    const samples = audioSamples; audioSamples = [];
    cleanupAudioCapture(); activeSpeech = null; setRecordingUI(false);
    if (sendAudio && samples.length) {
      const flattened = new Float32Array(samples.reduce((sum, chunk) => sum + chunk.length, 0));
      let offset = 0; samples.forEach((chunk) => { flattened.set(chunk, offset); offset += chunk.length; });
      const wav = encodeWav(flattened, rate);
      setText('transcriptState', 'Sending audio to Gnani Prisma v3.0…');
      setSpeechmaticsHudState('transcribing', null, null, 'Prisma v3.0 · automatic language detection', 'Securely transcribing your recording…');
      transcribeWithGnani(wav);
    } else {
      setText('transcriptState', 'Recording discarded');
      setSpeechmaticsHudState(gnaniApiReady ? 'gnani_ready' : 'idle');
    }
    return;
  }
  if (activeSpeech?.stop) { try { activeSpeech.stop(); } catch (_) {} }
  activeSpeech = null; setRecordingUI(false);
  const text = document.getElementById('reportText')?.value || '';
  updateParserLivePreview(text);
  if (text.trim()) setText('transcriptState', 'Transcript ready to review');
}
async function transcribeWithGnani(audioBlob) {
  isTranscribing = true;
  const submit = document.getElementById('submitReport'); if (submit) submit.disabled = true;
  try {
    const form = new FormData();
    form.append('audio_file', audioBlob, 'crowdfix-report.wav');
    const response = await fetch('/api/transcribe', { method: 'POST', body: form, cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.message || `Gnani request failed (${response.status}).`);
    const transcript = String(result.transcript || '').trim();
    const textarea = document.getElementById('reportText');
    if (textarea) textarea.value = transcript;
    const language = result.detectedLanguage || 'Auto detected';
    const latency = Number.isFinite(Number(result.latencyMs)) ? Math.round(Number(result.latencyMs)) : null;
    setSpeechmaticsHudState('gnani_finalized', latency, null, language, transcript || 'No speech was detected in this clip.');
    setText('transcriptState', transcript ? `Transcribed by ${result.model || 'Gnani Prisma v3.0'}${result.requestId ? ` · ${result.requestId}` : ''}` : 'No speech detected — try again or type your report');
    if (transcript) showToast('Transcript returned by Gnani Prisma v3.0.', 'success');
    isTranscribing = false; updateParserLivePreview(transcript);
  } catch (error) {
    isTranscribing = false;
    setSpeechmaticsHudState('error', null, null, 'Prisma v3.0');
    setText('transcriptState', 'Gnani transcription failed — type or try again');
    showToast(error?.message || 'Gnani transcription failed. Check the connection and try again.', 'warning');
    updateParserLivePreview(document.getElementById('reportText')?.value || '');
  }
}
async function checkGnaniStatus() {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    const data = await response.json();
    gnaniApiReady = response.ok && data.configured === true;
    if (gnaniApiReady) {
      setSpeechmaticsHudState('gnani_ready', null, null, 'Indic auto-detect', 'Gnani Prisma v3.0 ready for a real audio clip.');
      setText('telemetryNote', 'Prisma v3.0 is configured server-side; audio is sent only when recording is finished.');
      setText('reportHudStatus', 'Gnani Prisma v3.0 ready');
    } else {
      setSpeechmaticsHudState('idle', null, null, 'Auto detect', 'Use a local prompt demo or type a report.');
      setText('telemetryNote', 'Gnani API secret is not configured; local sample prompts and text entry remain available.');
    }
  } catch (_) {
    gnaniApiReady = false;
    setSpeechmaticsHudState('error', null, null, 'Auto detect', 'Secure Gnani endpoint unavailable.');
    setText('telemetryNote', 'Secure transcription endpoint unavailable.');
  }
}
function locationForLandmark(landmark) {
  const normalized = normalizeText(landmark);
  if (normalized.includes('paltan')) return { place: 'Paltan Bazaar, Dehradun', coords: [30.3218, 78.0402] };
  if (normalized.includes('ballupur')) return { place: 'Ballupur Chowk, Dehradun', coords: [30.3350, 78.0125] };
  if (normalized.includes('saharanpur')) return { place: 'Saharanpur Road, Dehradun', coords: [30.3284, 78.0304] };
  if (normalized.includes('prem')) return { place: 'Prem Nagar, Dehradun', coords: [30.354, 77.999] };
  if (normalized.includes('isbt')) return { place: 'ISBT Dehradun', coords: [30.286, 78.011] };
  if (normalized.includes('not identified')) return { place: 'Dehradun, Uttarakhand', coords: [30.327, 78.035] };
  return { place: 'Rajpur Road, Dehradun', coords: [30.3256, 78.0437] };
}
function makeIssueTitle(evidence) {
  const issueWord = {
    'ROAD SAFETY': 'Road hazard reported', 'CLEANLINESS': 'Waste collection issue reported', 'PUBLIC LIGHTING': 'Streetlight issue reported',
    'WATER & SEWAGE': 'Water or drainage issue reported', 'TRAFFIC & TRANSIT': 'Traffic issue reported', OTHER: 'Civic issue reported'
  }[evidence.category];
  const place = evidence.landmark !== 'Not identified' ? ` near ${evidence.landmark}` : '';
  return `${issueWord}${place}`;
}
function handleReportSubmission() {
  if (!requireResident('report')) return;
  const textarea = document.getElementById('reportText');
  const text = textarea?.value.trim() || '';
  const evidence = CivicEvidenceParser.parse(text);
  if (text.length < 8 || evidence.isSpam) { showToast('Please add a little more detail so this report can be checked.', 'warning'); return; }
  const now = new Date().toISOString();
  const match = CivicEvidenceParser.findClusterMatch(evidence, appState.issues);
  const author = appState.user?.name || 'Demo Resident';
  const testimony = { name: author, quote: text, language: evidence.language, time: now, confidence: 98 };
  if (match) {
    match.voiceCount += 1; match.mergedCount += 1; match.testimonies.push(testimony);
    if (match.verification === 'needs_verification' && match.voiceCount >= 3) match.verification = 'community_verified';
    showToast(`Your voice was added to “${match.title}”.`, 'success');
  } else {
    const location = locationForLandmark(evidence.landmark);
    const id = `issue-${Date.now()}`;
    appState.issues.unshift({ id, title: makeIssueTitle(evidence), category: evidence.category, landmark: evidence.landmark, place: location.place, coords: location.coords, voiceCount: 1, mergedCount: 1, status: 'open', priority: evidence.severity, officer: 'Unassigned', note: '', verification: 'needs_verification', createdAt: now, slaStart: now, resolvedAt: null, resolutionTime: '', testimonies: [testimony] });
    showToast('Your report is on the map. Neighbours can add their voice.', 'success');
  }
  persistState(); renderAll(); closeModal('reportModal'); switchView('overview');
  if (!match) setTimeout(() => openIssueDetail(appState.issues[0]?.id), 180);
}

function renderDetail(issue) {
  const root = document.getElementById('detailContent');
  if (!root || !issue) return;
  const verification = issue.verification === 'needs_verification';
  const pressure = pressureScore(issue.voiceCount);
  const sla = issue.priority === 'High' && issue.status !== 'resolved' ? getSlaLabel(issue) : null;
  const isResident = appState.user?.role === 'resident';
  const isOfficer = appState.user?.role === 'officer';
  const activeStatus = issue.status === 'in_progress' ? 'In Progress' : issue.status === 'resolved' ? 'Resolved' : 'Open';
  const testimonies = (issue.testimonies || []).map((voice) => `<div class="voice-item"><span class="voice-avatar">${escapeHTML((voice.name || 'D').split(' ').map((part) => part[0]).join('').slice(0, 2))}</span><div class="voice-copy"><div class="voice-copy-top"><strong>${escapeHTML(voice.name)}</strong><small>${timeAgo(voice.time)} · ${escapeHTML(voice.language || 'English')} · ${escapeHTML(voice.confidence || 96)}%</small></div><p>“${escapeHTML(voice.quote)}”</p></div></div>`).join('');
  root.innerHTML = `<div class="detail-head">${categoryIcon(issue.category)}<div class="detail-head-copy"><div class="detail-badges"><span class="report-tag" id="detailCategory">${escapeHTML(issue.category)}</span><span class="priority-badge ${issue.priority.toLowerCase()}" id="detailPriority">${escapeHTML(issue.priority)} priority</span><span class="status-tag ${escapeHTML(issue.status)}" id="detailStatus">${escapeHTML(activeStatus)}</span></div><h2 id="detailTitle">${escapeHTML(issue.title)}</h2><div class="detail-place" id="detailPlace">⌖ ${escapeHTML(issue.place)} · ${issue.mergedCount} merged reports</div></div></div>
    ${verification ? `<div class="verification-alert detail-verification" id="detailVerificationAlert"><span>ⓘ</span><span><strong id="detailVerificationTitle">Report may need verification</strong><br><span id="detailVerificationDesc">This cluster has limited community confirmation. Urgent escalation requires officer confirmation or 3+ resident voices.</span></span></div>` : ''}
    <div class="explainable-cluster-box"><h4>◎ Explainable clustering engine</h4><p id="detailClusteringStatement">Reports are connected when they describe the same type of issue near the same Dehradun landmark. The exact GPS location is not shown.</p><div class="criteria-row" id="detailMatchingCriteria"><span class="criteria-pill">Category ✓</span><span class="criteria-pill">Landmark ✓</span><span class="criteria-pill">Neighbourhood ✓</span><span class="criteria-pill">Intent ✓</span></div></div>
    <div class="detail-metrics" id="detailP2Stats"><div class="detail-metric"><small>COMMUNITY PRESSURE</small><strong>${pressure}% · ${issue.voiceCount} voices</strong><div class="pressure-bar"><i style="width:${pressure}%"></i></div></div><div class="detail-metric"><small>RESOLUTION ESTIMATE</small><strong>${formatEstimate(issue.voiceCount)}</strong><small>Based on ${issue.voiceCount} community voices</small></div><div class="detail-metric"><small>${sla ? 'HIGH PRIORITY SLA' : 'ASSIGNED TEAM'}</small><strong class="${sla?.breached ? 'sla-breach' : 'sla-good'}">${escapeHTML(sla?.label || issue.officer || 'Unassigned')}</strong></div></div>
    <div class="voices-heading"><h3>Community evidence</h3><span id="detailVoiceCount">${issue.voiceCount} voices · ${issue.testimonies?.length || 0} testimonies</span></div><div class="voice-list" id="detailMergedReportsList">${testimonies || '<div class="empty-state">No testimony details yet.</div>'}</div>
    <div class="detail-actions"><button class="button button-outline" id="addMyVoiceBtn" data-detail-action="voice">＋ ${isResident ? 'Add my voice' : 'Sign in to add your voice'}</button><button class="button button-outline" id="shareEvidenceBtn" data-detail-action="share">↗ Share</button><button class="button button-outline" id="whatsappShareBtn" data-detail-action="whatsapp">◉ WhatsApp</button><button class="button button-outline" id="exportEvidenceBtn" data-detail-action="export">⇩ Export evidence</button></div>
    ${isOfficer && issue.status !== 'resolved' ? `<div class="officer-panel" id="officerControlPanel"><h3>Municipal officer controls</h3><div class="officer-controls"><select id="officerStatusSelect" aria-label="Issue status"><option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option><option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option><option value="resolved">Resolved</option></select><input id="officerNoteInput" type="text" value="${escapeHTML(issue.note || '')}" placeholder="Official update for residents…" aria-label="Official resolution note"><button class="button button-primary" id="officerUpdateBtn" data-detail-action="officer-update">Save update</button></div></div>` : isOfficer ? `<div class="officer-panel" id="officerControlPanel"><h3>Issue resolved</h3><p class="feed-report-quote">${escapeHTML(issue.note || 'The issue was marked resolved.')}</p></div>` : ''}`;
}
function openIssueDetail(issueId) {
  const issue = appState.issues.find((entry) => entry.id === issueId);
  if (!issue) return;
  currentIssueId = issueId; renderDetail(issue); openModal('issueDetailModal');
}
function getSlaLabel(issue) {
  const deadline = new Date(issue.slaStart || issue.createdAt).getTime() + 24 * 3600000;
  const remain = deadline - Date.now();
  if (remain <= 0) return { label: 'BREACHED', breached: true };
  const hours = Math.floor(remain / 3600000); const minutes = Math.floor((remain % 3600000) / 60000);
  return { label: `${hours}h ${String(minutes).padStart(2, '0')}m left`, breached: false };
}
function startSlaCountdown() {
  setInterval(() => {
    if (currentIssueId && document.getElementById('issueDetailModal')?.classList.contains('open')) {
      const issue = appState.issues.find((entry) => entry.id === currentIssueId);
      if (issue) renderDetail(issue);
    }
  }, 60000);
}
function addMyVoiceToCurrentIssue() {
  const issue = appState.issues.find((entry) => entry.id === currentIssueId);
  if (!issue) return;
  if (!requireResident()) return;
  const alreadyAdded = (issue.testimonies || []).some((entry) => entry.name === appState.user.name && entry.isCorroboration);
  if (alreadyAdded) { showToast('Your voice is already included in this issue.'); return; }
  issue.voiceCount += 1; issue.mergedCount += 1;
  issue.testimonies.push({ name: appState.user.name, quote: 'I have also seen this issue in the neighbourhood.', language: 'English', time: new Date().toISOString(), confidence: 100, isCorroboration: true });
  if (issue.verification === 'needs_verification' && issue.voiceCount >= 3) issue.verification = 'community_verified';
  persistState(); renderAll(); renderDetail(issue); showToast('Your voice was added. Thank you for confirming this issue.', 'success');
}
function handleOfficerStatusUpdate() {
  if (!requireOfficer()) return;
  const issue = appState.issues.find((entry) => entry.id === currentIssueId);
  if (!issue) return;
  const status = document.getElementById('officerStatusSelect')?.value || issue.status;
  const note = document.getElementById('officerNoteInput')?.value.trim() || '';
  const oldStatus = issue.status;
  issue.status = status; issue.note = note || issue.note;
  if (status === 'resolved') {
    issue.resolvedAt = new Date().toISOString();
    const elapsed = Math.max(1, Math.round((Date.now() - new Date(issue.createdAt).getTime()) / 3600000));
    issue.resolutionTime = `${elapsed} ${elapsed === 1 ? 'hour' : 'hours'}`;
    if (!issue.note) issue.note = 'Work completed and verified by the Nagar Nigam field team.';
  }
  persistState(); renderAll(); renderDetail(issue);
  showToast(status === 'resolved' ? 'Issue marked resolved and moved to the archive.' : oldStatus !== status ? 'Civic status update saved.' : 'Officer note saved.', 'success');
  if (status === 'resolved') setTimeout(() => closeModal('issueDetailModal'), 650);
}
function issueShareText(issue) { return `${issue.title} — ${issue.place}. ${issue.voiceCount} community voices. Status: ${issue.status.replace('_', ' ')}. Reported through CrowdFix.`; }
async function shareIssue(issue) {
  const text = issueShareText(issue);
  try {
    if (navigator.share) await navigator.share({ title: issue.title, text });
    else if (navigator.clipboard) { await navigator.clipboard.writeText(text); showToast('Issue summary copied to clipboard.', 'success'); }
    else showToast(text);
  } catch (err) { if (err?.name !== 'AbortError') showToast('Could not share this issue right now.', 'warning'); }
}
function exportEvidence(issue) {
  showToast('Opening print view — choose “Save as PDF” to export evidence.', 'success');
  setTimeout(() => window.print(), 250);
}
function shareWhatsApp(issue) {
  const url = `https://wa.me/?text=${encodeURIComponent(issueShareText(issue))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function initLeafletMap() {
  const container = document.getElementById('osmMap');
  if (!container) return;
  if (!window.L) {
    container.innerHTML = '<div class="empty-state"><span>⌖</span><strong>Map preview unavailable</strong><p>Issue cards remain available above.</p></div>';
    return;
  }
  if (mapInstance) { setTimeout(() => mapInstance.invalidateSize(), 60); return; }
  mapInstance = L.map('osmMap', { zoomControl: false, scrollWheelZoom: false, attributionControl: true }).setView(DEHRADUN, 14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(mapInstance);
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  renderMapMarkers();
}
function renderMapMarkers() {
  if (!mapInstance) return;
  mapMarkers.forEach((marker) => mapInstance.removeLayer(marker)); mapMarkers = [];
  if (heatLayer) { mapInstance.removeLayer(heatLayer); heatLayer = null; }
  const issues = activeIssues();
  if (heatEnabled && window.L?.heatLayer) {
    heatLayer = L.heatLayer(issues.map((issue) => [...issue.coords, Math.max(.25, issue.voiceCount / 20)]), { radius: 31, blur: 22, maxZoom: 16, gradient: { .25: '#5898da', .55: '#edbc55', .82: '#ec7139', 1: '#c63332' } }).addTo(mapInstance);
  }
  if (markersVisible) {
    issues.forEach((issue) => {
      const color = issue.priority === 'High' ? '#e6642d' : issue.status === 'in_progress' ? '#4c68c4' : '#7e66b2';
      const marker = L.circleMarker(issue.coords, { radius: Math.min(10, 6 + issue.voiceCount / 5), color: '#fff', weight: 2, fillColor: color, fillOpacity: .95 });
      marker.bindPopup(`<strong>${escapeHTML(issue.title)}</strong><span>${escapeHTML(issue.place)} · ${issue.voiceCount} voices</span><br><button type="button" data-map-issue="${escapeHTML(issue.id)}">View issue →</button>`);
      marker.addTo(mapInstance); marker.on('click', () => { setTimeout(() => { const btn = document.querySelector('[data-map-issue]'); if (btn) btn.onclick = () => openIssueDetail(issue.id); }, 40); });
      mapMarkers.push(marker);
    });
  }
}
function toggleHeatmapLayer() {
  heatEnabled = !heatEnabled;
  document.getElementById('toggleHeatmapBtn')?.classList.toggle('active', heatEnabled);
  renderMapMarkers();
  showToast(heatEnabled ? 'Community pressure heatmap enabled.' : 'Heatmap hidden.');
}
function reverseGeocodeNominatim(_lat, _lon) { return Promise.resolve('Approximate Dehradun neighbourhood'); }

function showToast(message, tone = '') {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const toast = document.createElement('div'); toast.className = `toast ${tone}`; toast.textContent = message; region.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}
function closeSidebar() { document.getElementById('sidebar')?.classList.remove('mobile-open'); document.getElementById('sidebarOverlay')?.classList.remove('open'); }
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeAllModals(); closeSidebar(); return; }
    if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey && !/input|textarea|select/i.test(event.target.tagName)) openReportModal();
  });
}
function setupEventListeners() {
  document.querySelectorAll('[data-goto]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.goto)));
  ['heroReportBtn', 'feedReportBtn'].forEach((id) => document.getElementById(id)?.addEventListener('click', openReportModal));
  document.getElementById('quickVoiceDemoBtn')?.addEventListener('click', () => { if (requireResident('report')) { resetReportForm(); renderPromptChips(); openModal('reportModal'); setTimeout(() => startSpeechmaticsSimulation(PROMPTS[3].text), 180); } });
  document.getElementById('submitReport')?.addEventListener('click', handleReportSubmission);
  document.getElementById('recordButton')?.addEventListener('click', startNativeSpeechRecognition);
  document.getElementById('stopRecordingBtn')?.addEventListener('click', stopRecording);
  document.getElementById('reportText')?.addEventListener('input', (event) => { updateParserLivePreview(event.target.value); if (event.target.value.trim()) setText('transcriptState', 'Review your report before submitting'); });
  document.getElementById('feedSearchInput')?.addEventListener('input', renderLiveReportsFeed);
  document.getElementById('categoryFilter')?.addEventListener('change', renderLiveReportsFeed);
  document.getElementById('feedTagFilter')?.addEventListener('change', renderLiveReportsFeed);
  document.getElementById('sidebarNav')?.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target.classList.contains('nav-item')) event.target.click(); });
  document.getElementById('profileTrigger')?.addEventListener('click', openProfileModal);
  document.getElementById('topbarAvatar')?.addEventListener('click', openProfileModal);
  document.getElementById('topbarSignInBtn')?.addEventListener('click', () => openAuthModal());
  document.getElementById('btnDemoLoginResident')?.addEventListener('click', () => finishAuth('resident-rakshan'));
  document.getElementById('btnDemoLoginOfficer')?.addEventListener('click', () => finishAuth('resident-arav'));
  document.getElementById('continueAsGuestBtn')?.addEventListener('click', () => finishAuth(null));
  document.getElementById('realAccountsGrid')?.addEventListener('click', (event) => { const button = event.target.closest('[data-account-id]'); if (button) finishAuth(button.dataset.accountId); });
  document.getElementById('btnSwitchResident')?.addEventListener('click', () => finishAuth('resident-rakshan'));
  document.getElementById('btnSwitchOfficer')?.addEventListener('click', () => finishAuth('resident-arav'));
  document.getElementById('btnSignOut')?.addEventListener('click', () => finishAuth(null));
  document.getElementById('btnResetDemoData')?.addEventListener('click', () => { const user = appState.user; appState = seedState(); appState.user = user; persistState(); renderAll(); closeModal('profileModal'); showToast('Demo data reset to the Dehradun seed examples.', 'success'); });
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.close)));
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(backdrop.id); }));
  document.getElementById('sidebarNav')?.addEventListener('click', (event) => { const item = event.target.closest('.nav-item'); if (item) switchView(item.dataset.view); });
  document.getElementById('hamburgerBtn')?.addEventListener('click', () => { document.getElementById('sidebar')?.classList.add('mobile-open'); document.getElementById('sidebarOverlay')?.classList.add('open'); });
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);
  document.getElementById('pushNotificationBtn')?.addEventListener('click', () => showToast('You are up to date. New neighbourhood updates will appear here.'));
  document.getElementById('helpButton')?.addEventListener('click', () => showToast('Tip: press R to report. Add your voice to confirm an issue you have seen.'));
  document.getElementById('overviewRefreshBtn')?.addEventListener('click', () => { renderAll(); showToast('City pulse refreshed.'); });
  document.getElementById('recenterMapBtn')?.addEventListener('click', () => mapInstance?.setView(DEHRADUN, 14));
  document.getElementById('toggleHeatmapBtn')?.addEventListener('click', toggleHeatmapLayer);
  document.getElementById('toggleMarkersBtn')?.addEventListener('click', (event) => { markersVisible = !markersVisible; event.currentTarget.classList.toggle('active', markersVisible); renderMapMarkers(); });
  document.addEventListener('click', (event) => {
    const issueCard = event.target.closest('[data-issue-id]');
    if (issueCard && !event.target.closest('[data-detail-action]')) { openIssueDetail(issueCard.dataset.issueId); return; }
    const action = event.target.closest('[data-detail-action]')?.dataset.detailAction;
    if (action) {
      const issue = appState.issues.find((entry) => entry.id === currentIssueId);
      if (action === 'voice') addMyVoiceToCurrentIssue();
      if (action === 'share' && issue) shareIssue(issue);
      if (action === 'whatsapp' && issue) shareWhatsApp(issue);
      if (action === 'export' && issue) exportEvidence(issue);
      if (action === 'officer-update') handleOfficerStatusUpdate();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-issue-id]')) { event.preventDefault(); openIssueDetail(event.target.dataset.issueId); }
  });
  setupKeyboardShortcuts();
}
function initLeafletAfterLoad() { initLeafletMap(); setTimeout(() => mapInstance?.invalidateSize(), 250); }

window.detectLanguage = detectLanguage;
window.startSpeechmaticsSimulation = startSpeechmaticsSimulation;
window.startNativeSpeechRecognition = startNativeSpeechRecognition;
window.updateParserLivePreview = updateParserLivePreview;
window.handleReportSubmission = handleReportSubmission;
window.addMyVoiceToCurrentIssue = addMyVoiceToCurrentIssue;
window.handleOfficerStatusUpdate = handleOfficerStatusUpdate;
window.initLeafletMap = initLeafletMap;
window.renderMapMarkers = renderMapMarkers;
window.toggleHeatmapLayer = toggleHeatmapLayer;
window.reverseGeocodeNominatim = reverseGeocodeNominatim;
window.setSpeechmaticsHudState = setSpeechmaticsHudState;
window.openAuthModal = openAuthModal;
window.closeAuthModal = () => closeModal('authModal');
window.openProfileModal = openProfileModal;
window.switchView = switchView;
window.renderOverviewPriorityQueue = renderOverviewPriorityQueue;
window.renderLiveReportsFeed = renderLiveReportsFeed;
window.renderClustersGrid = renderClustersGrid;
window.pressureScore = pressureScore;
window.resolutionEstimate = resolutionEstimate;
window.startSlaCountdown = startSlaCountdown;
window.updateDynamicHeader = updateDynamicHeader;
window.setupKeyboardShortcuts = setupKeyboardShortcuts;
window.timeAgo = timeAgo;
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
  if (window.L) initLeafletAfterLoad();
  setupEventListeners(); renderPromptChips(); renderAll(); startSlaCountdown();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  checkGnaniStatus();
});
