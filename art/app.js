// ============================================================
// LIVING ART FRAME — app.js
// Vanilla JS. localStorage-persisted settings. No frameworks.
// ============================================================

'use strict';

// ── STORAGE KEY ───────────────────────────────────────────────
const LS_KEY = 'laf_config';
const LS_FAVS = 'laf_favs';

// ── MERGE CONFIG: defaults ← localStorage overrides ──────────
function loadConfig() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (_) {}
  // Deep merge for nested objects (artCategories)
  return {
    ...CONFIG_DEFAULTS,
    ...saved,
    artCategories: { ...CONFIG_DEFAULTS.artCategories, ...(saved.artCategories || {}) },
  };
}

function saveConfig(cfg) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

// Active config (mutable at runtime)
let CFG = loadConfig();

// ── FAVOURITES ────────────────────────────────────────────────
function loadFavs() {
  try { return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); } catch (_) { return []; }
}
function saveFavs(favs) { localStorage.setItem(LS_FAVS, JSON.stringify(favs)); }

// ── DOM ───────────────────────────────────────────────────────
const $bg          = document.getElementById('artwork-bg');
const $artInfo     = document.getElementById('artwork-info');
const $artTitle    = document.getElementById('artwork-title');
const $artArtist   = document.getElementById('artwork-artist');
const $clockTime   = document.getElementById('clock-time');
const $clockDate   = document.getElementById('clock-date');
const $weatherTemp = document.getElementById('weather-temp');
const $weatherDesc = document.getElementById('weather-desc');
const $weatherCity = document.getElementById('weather-city');
const $calCol      = document.getElementById('calendar-col');
const $mediaCol    = document.getElementById('media-col');
const $mediaTrack  = document.getElementById('media-track');
const $mediaArtist = document.getElementById('media-artist');
const $btnFav      = document.getElementById('btn-fav');
const $btnSettings = document.getElementById('btn-settings');
const $backdrop    = document.getElementById('settings-backdrop');
const $panel       = document.getElementById('settings-panel');
const $btnClose    = document.getElementById('btn-close-settings');
const $btnSave     = document.getElementById('btn-save-settings');
const $btnReset    = document.getElementById('btn-reset-settings');
const $zonePrev    = document.getElementById('zone-prev');
const $zoneNext    = document.getElementById('zone-next');

// ── LOCALE ───────────────────────────────────────────────────
// Use browser locale for date and weather text
const LOCALE = navigator.language || 'en';

// ============================================================
// WMO WEATHER CODES — localised via Intl where possible,
// fallback English map otherwise.
// ============================================================
const WMO_EN = {
  0:'Clear Sky', 1:'Mainly Clear', 2:'Partly Cloudy', 3:'Overcast',
  45:'Foggy', 48:'Foggy', 51:'Light Drizzle', 53:'Drizzle',
  55:'Heavy Drizzle', 61:'Light Rain', 63:'Rain', 65:'Heavy Rain',
  71:'Light Snow', 73:'Snow', 75:'Heavy Snow', 77:'Snow Grains',
  80:'Showers', 81:'Showers', 82:'Heavy Showers',
  85:'Snow Showers', 86:'Heavy Snow Showers',
  95:'Thunderstorm', 96:'Thunderstorm', 99:'Thunderstorm'
};

// Translations for common locales
const WMO_I18N = {
  es: {
    0:'Cielo despejado', 1:'Mayormente despejado', 2:'Parcialmente nublado', 3:'Cubierto',
    45:'Neblina', 48:'Neblina', 51:'Llovizna ligera', 53:'Llovizna', 55:'Llovizna intensa',
    61:'Lluvia ligera', 63:'Lluvia', 65:'Lluvia intensa',
    71:'Nieve ligera', 73:'Nieve', 75:'Nieve intensa', 77:'Granizo',
    80:'Chaparrones', 81:'Chaparrones', 82:'Chaparrones fuertes',
    85:'Nevada', 86:'Nevada intensa', 95:'Tormenta', 96:'Tormenta', 99:'Tormenta'
  },
  pt: {
    0:'Céu limpo', 1:'Principalmente limpo', 2:'Parcialmente nublado', 3:'Nublado',
    45:'Nevoeiro', 48:'Nevoeiro', 51:'Garoa leve', 53:'Garoa', 55:'Garoa forte',
    61:'Chuva leve', 63:'Chuva', 65:'Chuva forte',
    71:'Neve leve', 73:'Neve', 75:'Neve forte', 77:'Granizo',
    80:'Pancadas', 81:'Pancadas', 82:'Pancadas fortes',
    85:'Nevada', 86:'Nevada forte', 95:'Tempestade', 96:'Tempestade', 99:'Tempestade'
  },
  fr: {
    0:'Ciel dégagé', 1:'Principalement dégagé', 2:'Partiellement nuageux', 3:'Couvert',
    45:'Brouillard', 48:'Brouillard', 51:'Bruine légère', 53:'Bruine', 55:'Bruine forte',
    61:'Pluie légère', 63:'Pluie', 65:'Pluie forte',
    71:'Neige légère', 73:'Neige', 75:'Neige forte', 77:'Grésil',
    80:'Averses', 81:'Averses', 82:'Fortes averses',
    85:'Chutes de neige', 86:'Chutes de neige fortes', 95:'Orage', 96:'Orage', 99:'Orage'
  },
};

function wmoText(code) {
  const lang = LOCALE.split('-')[0].toLowerCase();
  const map  = WMO_I18N[lang] || WMO_EN;
  return map[code] || WMO_EN[code] || '';
}

// ============================================================
// CLOCK — localized
// ============================================================

function updateClock() {
  const now = new Date();
  const h   = String(now.getHours()).padStart(2, '0');
  const m   = String(now.getMinutes()).padStart(2, '0');
  $clockTime.textContent = `${h}:${m}`;

  // Localized weekday + date (e.g. "Jueves · 1 de junio")
  const weekday = now.toLocaleDateString(LOCALE, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(LOCALE, { month: 'long', day: 'numeric' });
  // Capitalize first letter
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  $clockDate.innerHTML = `<span>${cap(weekday)}</span><span class="clock-sep"> · </span>${cap(dateStr)}`;
}

setInterval(updateClock, 1000);
updateClock();

// ============================================================
// WEATHER — Open-Meteo, no key, localized description
// ============================================================

let weatherTimer = null;

async function fetchWeather() {
  const { latitude, longitude, city } = CFG;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    const cw   = data.current_weather;
    $weatherTemp.textContent = `${Math.round(cw.temperature)}°C`;
    $weatherDesc.textContent = wmoText(cw.weathercode);
    $weatherCity.textContent = city;
  } catch (e) {
    console.warn('[Weather]', e);
  }
}

function startWeather() {
  clearInterval(weatherTimer);
  fetchWeather();
  weatherTimer = setInterval(fetchWeather, CFG.weatherRefresh);
}

startWeather();

// ============================================================
// ARTWORK — Art Institute of Chicago API
// ============================================================

const AIC_BASE   = 'https://api.artic.edu/api/v1';
const AIC_FIELDS = 'id,title,artist_display,image_id,department_title,medium_display';

// Category → AIC department search terms
const CAT_MAP = {
  paintings:    ['Painting', 'European Painting', 'American Art'],
  photography:  ['Photography and Media'],
  sculpture:    ['Sculpture and Decorative Arts', 'African Art and Indian Art'],
  prints:       ['Prints and Drawings'],
  contemporary: ['Modern and Contemporary Art'],
};

function buildAICQuery() {
  const cats  = CFG.artCategories;
  const terms = [];
  for (const [key, active] of Object.entries(cats)) {
    if (active && CAT_MAP[key]) terms.push(...CAT_MAP[key]);
  }
  return terms;
}

// ── STATE ─────────────────────────────────────────────────────
let artworkQueue    = [];
let currentArtwork  = null;
let artworkTimer    = null;
let isTransitioning = false;

function artworkUrl(imageId) {
  return `https://www.artic.edu/iiif/2/${imageId}/full/1686,/0/default.jpg`;
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img    = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}

async function fetchArtworkPage() {
  const page  = Math.floor(Math.random() * 200) + 1;
  // Build department filter if categories are configured
  const depts = buildAICQuery();
  let url;
  if (depts.length > 0) {
    const should = depts.map(d => ({ match_phrase: { department_title: d } }));
    const query  = encodeURIComponent(JSON.stringify({
      bool: { must: [{ term: { is_public_domain: true } }], should, minimum_should_match: 1 }
    }));
    url = `${AIC_BASE}/artworks/search?page=${page}&limit=20&fields=${AIC_FIELDS}&query=${query}`;
  } else {
    url = `${AIC_BASE}/artworks?page=${page}&limit=20&fields=${AIC_FIELDS}&query[term][is_public_domain]=true`;
  }

  const res  = await fetch(url);
  const data = await res.json();
  return (data.data || [])
    .filter(a => a.image_id)
    .map(a => ({
      title:    a.title || 'Untitled',
      artist:   a.artist_display ? a.artist_display.split('\n')[0] : 'Unknown Artist',
      imageId:  a.image_id,
      id:       a.id,
    }));
}

async function getNextArtwork() {
  if (artworkQueue.length < 3) {
    try {
      const fresh = await fetchArtworkPage();
      artworkQueue = artworkQueue.concat(fresh);
    } catch (e) {
      console.warn('[Artwork] refill failed', e);
    }
  }
  while (artworkQueue.length > 0) {
    const candidate = artworkQueue.shift();
    const src       = artworkUrl(candidate.imageId);
    try {
      await preloadImage(src);
      return { ...candidate, src };
    } catch (_) { /* skip invalid */ }
  }
  return null;
}

// History for prev/next navigation
let artHistory = [];  // array of artwork objects
let historyIdx = -1;  // current position

/**
 * Transition to artwork with smooth crossfade.
 * @param {object} artwork
 * @param {boolean} showInfo — show title overlay
 */
async function showArtwork(artwork, showInfo = true) {
  if (!artwork || isTransitioning) return;
  isTransitioning = true;

  currentArtwork = artwork;
  updateFavButton();

  // Fade out
  $bg.style.opacity = '0';
  await delay(1800);

  $bg.style.backgroundImage = `url('${artwork.src}')`;
  $bg.style.opacity         = '1';

  if (showInfo) {
    $artTitle.textContent  = artwork.title;
    $artArtist.textContent = artwork.artist;
    $artInfo.classList.add('visible');
    setTimeout(() => $artInfo.classList.remove('visible'), 5000);
  }

  isTransitioning = false;
}

/** Navigate forward (new artwork or next in history) */
async function goNext() {
  // If we're not at the end of history, move forward
  if (historyIdx < artHistory.length - 1) {
    historyIdx++;
    await showArtwork(artHistory[historyIdx]);
    return;
  }
  // Fetch new artwork
  const next = await getNextArtwork();
  if (next) {
    artHistory.push(next);
    historyIdx = artHistory.length - 1;
    // Trim history to last 30 to avoid memory bloat
    if (artHistory.length > 30) {
      artHistory = artHistory.slice(-30);
      historyIdx = artHistory.length - 1;
    }
    await showArtwork(next);
  }
}

/** Navigate backward in history */
async function goPrev() {
  if (historyIdx <= 0) return; // nothing before
  historyIdx--;
  await showArtwork(artHistory[historyIdx]);
}

async function startArtworkCycle() {
  await goNext(); // first artwork
  artworkTimer = setInterval(goNext, CFG.artworkInterval);
}

function restartArtworkCycle() {
  clearInterval(artworkTimer);
  artworkTimer = setInterval(goNext, CFG.artworkInterval);
}

startArtworkCycle();

// ── PREV / NEXT ZONES ─────────────────────────────────────────
$zonePrev.addEventListener('click', () => goPrev());
$zoneNext.addEventListener('click', () => goNext());

// ── SWIPE SUPPORT (touch) ─────────────────────────────────────
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 60) dx < 0 ? goNext() : goPrev();
}, { passive: true });

// ============================================================
// FAVOURITES
// ============================================================

function updateFavButton() {
  if (!currentArtwork) return;
  const favs = loadFavs();
  const is   = favs.some(f => f.id === currentArtwork.id);
  $btnFav.classList.toggle('faved', is);
  $btnFav.setAttribute('aria-label', is ? 'Remove favourite' : 'Favourite this artwork');
}

$btnFav.addEventListener('click', () => {
  if (!currentArtwork) return;
  let favs = loadFavs();
  const idx = favs.findIndex(f => f.id === currentArtwork.id);
  if (idx === -1) {
    favs.push({ id: currentArtwork.id, title: currentArtwork.title, artist: currentArtwork.artist, imageId: currentArtwork.imageId });
  } else {
    favs.splice(idx, 1);
  }
  saveFavs(favs);
  updateFavButton();
});

// ============================================================
// CALENDAR
// ============================================================

const PROXY_URL = 'https://corsproxy.io/?';
let calTimer = null;

function parseICal(text) {
  const events = [];
  const lines  = text.replace(/\r\n /g, '').replace(/\r\n/g, '\n').split('\n');
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT')           { cur = {}; }
    else if (line === 'END:VEVENT' && cur) { if (cur.start && cur.title) events.push(cur); cur = null; }
    else if (cur) {
      if (line.startsWith('SUMMARY:'))  cur.title = line.slice(8).trim();
      if (line.match(/^DTSTART/))       cur.start = parseICalDate(line);
    }
  }
  return events;
}

function parseICalDate(line) {
  const val = line.split(':').slice(1).join(':').trim();
  if (val.length === 8) {
    return new Date(`${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}T00:00:00`);
  }
  return new Date(`${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}T${val.slice(9,11)}:${val.slice(11,13)}:00Z`);
}

async function fetchPublicCalendar() {
  if (!CFG.publicCalendarURL) return;
  try {
    const res = await fetch(PROXY_URL + encodeURIComponent(CFG.publicCalendarURL));
    renderCalendarEvents(parseICal(await res.text()));
  } catch (e) { console.warn('[Calendar]', e); hideCalendar(); }
}

function initGoogleOAuth() {
  if (typeof google === 'undefined' || !CFG.googleClientId) return;
  const tc = google.accounts.oauth2.initTokenClient({
    client_id: CFG.googleClientId,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    callback: r => { if (r.access_token) { googleToken = r.access_token; fetchPrivateCalendar(); } },
  });
  tc.requestAccessToken({ prompt: '' });
}

let googleToken = null;
async function fetchPrivateCalendar() {
  if (!googleToken) return;
  const now  = new Date();
  const end  = new Date(now); end.setDate(end.getDate() + 2);
  const p    = new URLSearchParams({ timeMin: now.toISOString(), timeMax: end.toISOString(), maxResults: 20, singleEvents: true, orderBy: 'startTime' });
  try {
    const res  = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${p}`, { headers: { Authorization: `Bearer ${googleToken}` } });
    const data = await res.json();
    renderCalendarEvents((data.items || []).map(e => ({ title: e.summary || 'Event', start: new Date(e.start.dateTime || e.start.date) })));
  } catch (e) { hideCalendar(); }
}

// Localized day labels
function localDayLabel(date) {
  const today = new Date();
  const tmrw  = new Date(today); tmrw.setDate(tmrw.getDate() + 1);
  if (dateKey(date) === dateKey(today)) {
    return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(0, 'day');
  }
  if (dateKey(date) === dateKey(tmrw)) {
    return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(1, 'day');
  }
  return date.toLocaleDateString(LOCALE, { weekday: 'long' });
}

function renderCalendarEvents(events) {
  const now      = new Date();
  const todayStr = dateKey(now);
  const tmrw     = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
  const tmrwStr  = dateKey(tmrw);

  const todays    = events.filter(e => e.start && dateKey(e.start) === todayStr && e.start >= now);
  const tomorrows = events.filter(e => e.start && dateKey(e.start) === tmrwStr);

  if (!todays.length && !tomorrows.length) { hideCalendar(); return; }

  let html = '';
  if (todays.length) {
    const label = localDayLabel(now);
    html += `<div class="cal-day-label">${label}</div>`;
    html += todays.map(eventHtml).join('');
  }
  if (tomorrows.length) {
    const label = localDayLabel(tmrw);
    html += `<div class="cal-day-label">${label}</div>`;
    html += tomorrows.map(eventHtml).join('');
  }
  $calCol.innerHTML = html;
  $calCol.classList.add('visible');
}

function eventHtml(e) {
  const h = String(e.start.getHours()).padStart(2,'0');
  const m = String(e.start.getMinutes()).padStart(2,'0');
  return `<div class="cal-event"><span class="cal-time">${h}:${m}</span><span class="cal-title">${escapeHtml(e.title)}</span></div>`;
}

function hideCalendar() { $calCol.classList.remove('visible'); $calCol.innerHTML = ''; }

function initCalendar() {
  clearInterval(calTimer);
  if (CFG.calendarMode === 'public' && CFG.publicCalendarURL) {
    fetchPublicCalendar();
    calTimer = setInterval(fetchPublicCalendar, CFG.calendarRefresh);
  } else if (CFG.calendarMode === 'private') {
    if (CFG.googleClientId) window._loadGIS();
    typeof google !== 'undefined' ? initGoogleOAuth() : window.addEventListener('load', initGoogleOAuth);
  } else {
    hideCalendar();
  }
}

initCalendar();

// ============================================================
// MEDIA — mediaSession first, then Spotify fallback
// ============================================================

let spotifyToken = null;
let mediaTimer   = null;

/**
 * 1. Try navigator.mediaSession (works with YouTube, Spotify Web, etc.)
 * 2. If no active session → try Spotify API if enabled
 * 3. If nothing → hide module
 */
function pollMedia() {
  if (!CFG.mediaEnabled) { $mediaCol.classList.remove('visible'); return; }

  const meta = ('mediaSession' in navigator) ? navigator.mediaSession.metadata : null;
  const state = ('mediaSession' in navigator) ? navigator.mediaSession.playbackState : 'none';

  if (meta && meta.title && state !== 'paused') {
    $mediaTrack.textContent  = meta.title;
    $mediaArtist.textContent = meta.artist || '';
    $mediaCol.classList.add('visible');
    return;
  }

  // Fallback: Spotify API
  if (CFG.spotifyEnabled && spotifyToken) {
    fetchSpotifyCurrent();
  } else {
    $mediaCol.classList.remove('visible');
  }
}

async function fetchSpotifyCurrent() {
  try {
    const res  = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });
    if (res.status === 204) { $mediaCol.classList.remove('visible'); return; }
    const data = await res.json();
    if (data && data.is_playing && data.item) {
      $mediaTrack.textContent  = data.item.name;
      $mediaArtist.textContent = data.item.artists.map(a => a.name).join(', ');
      $mediaCol.classList.add('visible');
    } else {
      $mediaCol.classList.remove('visible');
    }
  } catch (_) { $mediaCol.classList.remove('visible'); }
}

// ── Spotify PKCE Auth ─────────────────────────────────────────
function genVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function genChallenge(v) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

async function initSpotify() {
  if (!CFG.spotifyEnabled || !CFG.spotifyClientId) return;
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');
  if (code) {
    const verifier = sessionStorage.getItem('sp_verifier');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: CFG.spotifyRedirectUri, client_id: CFG.spotifyClientId, code_verifier: verifier }),
    });
    const data = await res.json();
    if (data.access_token) { spotifyToken = data.access_token; sessionStorage.setItem('sp_token', spotifyToken); }
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }
  const stored = sessionStorage.getItem('sp_token');
  if (stored) { spotifyToken = stored; return; }
  // Need auth — open flow
  const verifier   = genVerifier();
  const challenge  = await genChallenge(verifier);
  sessionStorage.setItem('sp_verifier', verifier);
  window.location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: CFG.spotifyClientId,
    scope: 'user-read-currently-playing user-read-playback-state',
    redirect_uri: CFG.spotifyRedirectUri,
    code_challenge_method: 'S256', code_challenge: challenge,
  });
}

function startMedia() {
  clearInterval(mediaTimer);
  if (!CFG.mediaEnabled) { $mediaCol.classList.remove('visible'); return; }
  initSpotify().then(() => {
    pollMedia();
    mediaTimer = setInterval(pollMedia, 10000);
  });
}

startMedia();

// ============================================================
// SETTINGS PANEL
// ============================================================

function openSettings() {
  populateSettingsForm();
  $panel.classList.add('open');
  $backdrop.classList.add('open');
}

function closeSettings() {
  $panel.classList.remove('open');
  $backdrop.classList.remove('open');
}

$btnSettings.addEventListener('click', openSettings);
$btnClose.addEventListener('click', closeSettings);
$backdrop.addEventListener('click', closeSettings);

// Populate form from current CFG
function populateSettingsForm() {
  document.getElementById('cfg-city').value            = CFG.city;
  document.getElementById('cfg-lat').value             = CFG.latitude;
  document.getElementById('cfg-lon').value             = CFG.longitude;
  document.getElementById('cfg-art-interval').value    = Math.round(CFG.artworkInterval / 60000);
  document.getElementById('cfg-weather-interval').value= Math.round(CFG.weatherRefresh / 60000);
  document.getElementById('cfg-cal-mode').value        = CFG.calendarMode;
  document.getElementById('cfg-cal-url').value         = CFG.publicCalendarURL;
  document.getElementById('cfg-gcid').value            = CFG.googleClientId;
  document.getElementById('cfg-media-enabled').checked = CFG.mediaEnabled;
  document.getElementById('cfg-spotify-enabled').checked = CFG.spotifyEnabled;
  document.getElementById('cfg-spotify-id').value      = CFG.spotifyClientId;

  // Categories
  document.getElementById('cat-paintings').checked    = !!CFG.artCategories.paintings;
  document.getElementById('cat-photography').checked  = !!CFG.artCategories.photography;
  document.getElementById('cat-sculpture').checked    = !!CFG.artCategories.sculpture;
  document.getElementById('cat-prints').checked       = !!CFG.artCategories.prints;
  document.getElementById('cat-contemporary').checked = !!CFG.artCategories.contemporary;

  updateCalendarRowVisibility();
  updateSpotifyRowVisibility();
}

// Show/hide conditional rows
const $calMode = document.getElementById('cfg-cal-mode');
$calMode.addEventListener('change', updateCalendarRowVisibility);

function updateCalendarRowVisibility() {
  const mode = $calMode.value;
  document.getElementById('row-cal-url').style.display  = mode === 'public'  ? 'flex' : 'none';
  document.getElementById('row-cal-gcid').style.display = mode === 'private' ? 'flex' : 'none';
}

const $spotifyEnabled = document.getElementById('cfg-spotify-enabled');
$spotifyEnabled.addEventListener('change', updateSpotifyRowVisibility);

function updateSpotifyRowVisibility() {
  document.getElementById('row-spotify-id').style.display = $spotifyEnabled.checked ? 'flex' : 'none';
}

// Save
$btnSave.addEventListener('click', () => {
  const artMins     = parseInt(document.getElementById('cfg-art-interval').value) || 2;
  const weatherMins = parseInt(document.getElementById('cfg-weather-interval').value) || 30;

  const newCFG = {
    city:              document.getElementById('cfg-city').value.trim() || CFG.city,
    latitude:          parseFloat(document.getElementById('cfg-lat').value) || CFG.latitude,
    longitude:         parseFloat(document.getElementById('cfg-lon').value) || CFG.longitude,
    artworkInterval:   artMins * 60 * 1000,
    weatherRefresh:    weatherMins * 60 * 1000,
    calendarMode:      document.getElementById('cfg-cal-mode').value,
    publicCalendarURL: document.getElementById('cfg-cal-url').value.trim(),
    googleClientId:    document.getElementById('cfg-gcid').value.trim(),
    calendarRefresh:   CFG.calendarRefresh,
    mediaEnabled:      document.getElementById('cfg-media-enabled').checked,
    spotifyEnabled:    document.getElementById('cfg-spotify-enabled').checked,
    spotifyClientId:   document.getElementById('cfg-spotify-id').value.trim(),
    spotifyRedirectUri: CFG.spotifyRedirectUri,
    artCategories: {
      paintings:    document.getElementById('cat-paintings').checked,
      photography:  document.getElementById('cat-photography').checked,
      sculpture:    document.getElementById('cat-sculpture').checked,
      prints:       document.getElementById('cat-prints').checked,
      contemporary: document.getElementById('cat-contemporary').checked,
    },
  };

  saveConfig(newCFG);
  CFG = newCFG;

  // Apply changes live
  startWeather();
  initCalendar();
  startMedia();
  restartArtworkCycle();
  artworkQueue = []; // flush queue so categories apply on next fetch

  closeSettings();
});

// Reset to factory defaults
$btnReset.addEventListener('click', () => {
  if (!confirm('Reset all settings to defaults?')) return;
  localStorage.removeItem(LS_KEY);
  CFG = loadConfig();
  startWeather();
  initCalendar();
  startMedia();
  restartArtworkCycle();
  artworkQueue = [];
  closeSettings();
});

// ============================================================
// UTILS
// ============================================================

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function dateKey(d) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Wake Lock (keep screen on) ────────────────────────────────
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { await navigator.wakeLock.request('screen'); } catch (_) {}
  }
}
requestWakeLock();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});
