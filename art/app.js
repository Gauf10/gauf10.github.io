// ============================================================
// LIVING ART FRAME — app.js
// Vanilla JS. No frameworks. Designed for low-RAM tablets.
// ============================================================

'use strict';

// ── DOM REFERENCES ────────────────────────────────────────────
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

// ── OPEN-METEO WMO CODE MAP ───────────────────────────────────
// Maps WMO weather interpretation codes to readable descriptions.
const WMO = {
  0:'Clear Sky', 1:'Mainly Clear', 2:'Partly Cloudy', 3:'Overcast',
  45:'Foggy', 48:'Foggy', 51:'Light Drizzle', 53:'Drizzle',
  55:'Heavy Drizzle', 61:'Light Rain', 63:'Rain', 65:'Heavy Rain',
  71:'Light Snow', 73:'Snow', 75:'Heavy Snow', 77:'Snow Grains',
  80:'Showers', 81:'Showers', 82:'Heavy Showers',
  85:'Snow Showers', 86:'Heavy Snow Showers',
  95:'Thunderstorm', 96:'Thunderstorm', 99:'Thunderstorm'
};

// ── STATE ─────────────────────────────────────────────────────
let nextImageEl   = null; // preloaded <img> element
let artworkQueue  = [];
let calendarTimer = null;
let googleToken   = null; // for private calendar OAuth

// ============================================================
// CLOCK
// ============================================================

function updateClock() {
  const now = new Date();

  // Time HH:MM
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  $clockTime.textContent = `${h}:${m}`;

  // Weekday + Date
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const day    = days[now.getDay()];
  const date   = `${months[now.getMonth()]} ${now.getDate()}`;

  $clockDate.innerHTML = `<span class="clock-weekday">${day}</span>${date}`;
}

// Start clock; tick every second
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// WEATHER — Open-Meteo (no API key required)
// Docs: https://open-meteo.com/en/docs
// ============================================================

async function fetchWeather() {
  const { latitude, longitude, city } = CONFIG;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    const cw   = data.current_weather;

    $weatherTemp.textContent = `${Math.round(cw.temperature)}°C`;
    $weatherDesc.textContent = WMO[cw.weathercode] || 'Clear';
    $weatherCity.textContent = city;
  } catch (e) {
    console.warn('[Weather] fetch failed:', e);
  }
}

fetchWeather();
setInterval(fetchWeather, CONFIG.weatherRefresh);

// ============================================================
// ARTWORK — Art Institute of Chicago API
// Docs: https://api.artic.edu/docs/
// Only fetches works that have public-domain images.
// ============================================================

const AIC_BASE   = 'https://api.artic.edu/api/v1';
const AIC_FIELDS = 'id,title,artist_display,image_id,thumbnail';

/**
 * Fetch a page of random public-domain artworks.
 * Returns an array of objects: { title, artist, imageId }
 */
async function fetchArtworkPage() {
  // Random page between 1-200 keeps variety high.
  const page  = Math.floor(Math.random() * 200) + 1;
  const url   = `${AIC_BASE}/artworks?page=${page}&limit=20&fields=${AIC_FIELDS}&query[term][is_public_domain]=true`;

  const res   = await fetch(url);
  const data  = await res.json();
  const valid = (data.data || []).filter(a => a.image_id);

  return valid.map(a => ({
    title:   a.title || 'Untitled',
    artist:  a.artist_display ? a.artist_display.split('\n')[0] : 'Unknown Artist',
    imageId: a.image_id,
  }));
}

/**
 * Build the full image URL from an image_id.
 * AIC IIIF endpoint: https://www.artic.edu/iiif/2/{image_id}/full/1686,/0/default.jpg
 * 1686px wide covers tablet + desktop at full quality.
 */
function artworkUrl(imageId) {
  return `https://www.artic.edu/iiif/2/${imageId}/full/1686,/0/default.jpg`;
}

/**
 * Preload an image in the background.
 * Returns a Promise that resolves with the Image element.
 */
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img  = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src    = src;
  });
}

/**
 * Pick the next artwork from the queue, refilling if needed.
 * Automatically skips images that fail to load (404 etc).
 */
async function getNextArtwork() {
  // Refill queue when running low
  if (artworkQueue.length < 3) {
    try {
      const fresh = await fetchArtworkPage();
      artworkQueue = artworkQueue.concat(fresh);
    } catch (e) {
      console.warn('[Artwork] queue refill failed:', e);
    }
  }

  // Try artworks in queue until one loads successfully
  while (artworkQueue.length > 0) {
    const candidate = artworkQueue.shift();
    const src       = artworkUrl(candidate.imageId);

    try {
      await preloadImage(src);
      return { ...candidate, src };
    } catch (_) {
      // Image invalid — skip silently and try next
    }
  }

  return null; // Fallback: nothing loaded
}

/**
 * Transition to a new artwork with a smooth crossfade.
 */
async function showArtwork(artwork) {
  if (!artwork) return;

  // Fade out current
  $bg.style.opacity = '0';

  await delay(1800); // match CSS transition

  // Set new background
  $bg.style.backgroundImage = `url('${artwork.src}')`;
  $bg.style.opacity         = '1';

  // Show title overlay for 5 seconds then fade out
  $artTitle.textContent  = artwork.title;
  $artArtist.textContent = artwork.artist;
  $artInfo.classList.add('visible');

  setTimeout(() => {
    $artInfo.classList.remove('visible');
  }, 5000);
}

/**
 * Main artwork rotation loop.
 */
async function startArtworkCycle() {
  // Show first artwork immediately
  const first = await getNextArtwork();
  if (first) await showArtwork(first);

  // Preload next while displaying current
  async function cycle() {
    const next = await getNextArtwork();
    if (next) await showArtwork(next);
  }

  setInterval(cycle, CONFIG.artworkInterval);
}

startArtworkCycle();

// ============================================================
// CALENDAR — Public iCal mode
// Parses iCal format (RFC 5545) from a public Google Calendar URL.
// ============================================================

/**
 * Parse iCal text into event objects.
 * Returns array of { title, start }
 */
function parseICal(text) {
  const events = [];
  const lines  = text.replace(/\r\n /g, '').replace(/\r\n/g, '\n').split('\n');
  let current  = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT' && current) {
      if (current.start && current.title) events.push(current);
      current = null;
    } else if (current) {
      if (line.startsWith('SUMMARY:'))   current.title = line.slice(8).trim();
      if (line.startsWith('DTSTART'))    current.start = parseICalDate(line);
      if (line.startsWith('DTSTART;'))   current.start = parseICalDate(line);
    }
  }

  return events;
}

function parseICalDate(line) {
  // Handles: DTSTART:20240101T090000Z  or  DTSTART;VALUE=DATE:20240101
  const val = line.split(':').slice(1).join(':').trim();
  if (val.length === 8) {
    // All-day: YYYYMMDD
    const y = val.slice(0,4), mo = val.slice(4,6), d = val.slice(6,8);
    return new Date(`${y}-${mo}-${d}T00:00:00`);
  }
  // DateTime: YYYYMMDDTHHMMSSZ
  const y  = val.slice(0,4), mo = val.slice(4,6), d = val.slice(6,8);
  const h  = val.slice(9,11), mi = val.slice(11,13);
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:00Z`);
}

/**
 * Fetch and render a public Google Calendar via iCal.
 * Passes through a CORS proxy since Google doesn't support direct fetch.
 *
 * CORS proxy: corsproxy.io (free, no key required).
 * If you self-host, replace PROXY_URL.
 */
const PROXY_URL = 'https://corsproxy.io/?';

async function fetchPublicCalendar() {
  if (!CONFIG.publicCalendarURL) return;

  try {
    const url = PROXY_URL + encodeURIComponent(CONFIG.publicCalendarURL);
    const res = await fetch(url);
    const txt = await res.text();
    renderCalendarEvents(parseICal(txt));
  } catch (e) {
    console.warn('[Calendar] public fetch failed:', e);
    hideCalendar();
  }
}

// ============================================================
// CALENDAR — Private Google Calendar via OAuth
// Uses Google Identity Services (GIS) + Calendar REST API.
// Docs: https://developers.google.com/calendar/api/guides/overview
// Setup: enable Calendar API in Google Cloud Console,
//        create OAuth 2.0 client ID (Web Application),
//        add your domain to Authorized JS Origins.
// ============================================================

function initGoogleOAuth() {
  if (typeof google === 'undefined' || !CONFIG.googleClientId) {
    console.warn('[Calendar] Google Identity Services not loaded.');
    return;
  }

  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.googleClientId,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    callback: (response) => {
      if (response.access_token) {
        googleToken = response.access_token;
        fetchPrivateCalendar();
        setInterval(fetchPrivateCalendar, CONFIG.calendarRefresh);
      }
    },
  });

  // Silently request token (no popup) if user previously consented.
  tokenClient.requestAccessToken({ prompt: '' });
}

async function fetchPrivateCalendar() {
  if (!googleToken) return;

  const now     = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 2);

  const params = new URLSearchParams({
    timeMin:    now.toISOString(),
    timeMax:    tomorrow.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy:    'startTime',
  });

  try {
    const res  = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${googleToken}` } }
    );
    const data = await res.json();
    const events = (data.items || []).map(e => ({
      title: e.summary || 'Event',
      start: new Date(e.start.dateTime || e.start.date),
    }));
    renderCalendarEvents(events);
  } catch (e) {
    console.warn('[Calendar] private fetch failed:', e);
    hideCalendar();
  }
}

// ============================================================
// CALENDAR — Render
// ============================================================

/**
 * Render events to the calendar column.
 * Groups events into "Today" and "Tomorrow".
 * If no events exist → hides the column completely.
 */
function renderCalendarEvents(events) {
  const now       = new Date();
  const todayStr  = dateKey(now);
  const tmrw      = new Date(now);
  tmrw.setDate(tmrw.getDate() + 1);
  const tmrwStr   = dateKey(tmrw);

  const todays    = events.filter(e => e.start && dateKey(e.start) === todayStr && e.start >= now);
  const tomorrows = events.filter(e => e.start && dateKey(e.start) === tmrwStr);

  if (todays.length === 0 && tomorrows.length === 0) {
    hideCalendar();
    return;
  }

  let html = '';

  if (todays.length) {
    html += `<div class="cal-day-label">Today</div>`;
    html += todays.map(e => eventHtml(e)).join('');
  }

  if (tomorrows.length) {
    html += `<div class="cal-day-label">Tomorrow</div>`;
    html += tomorrows.map(e => eventHtml(e)).join('');
  }

  $calCol.innerHTML = html;
  $calCol.classList.add('visible');
}

function eventHtml(e) {
  const h = String(e.start.getHours()).padStart(2, '0');
  const m = String(e.start.getMinutes()).padStart(2, '0');
  return `<div class="cal-event">
    <span class="cal-time">${h}:${m}</span>
    <span class="cal-title">${escapeHtml(e.title)}</span>
  </div>`;
}

function hideCalendar() {
  $calCol.classList.remove('visible');
  $calCol.innerHTML = '';
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ============================================================
// CALENDAR — Init based on mode
// ============================================================

function initCalendar() {
  if (CONFIG.calendarMode === 'public' && CONFIG.publicCalendarURL) {
    fetchPublicCalendar();
    setInterval(fetchPublicCalendar, CONFIG.calendarRefresh);

  } else if (CONFIG.calendarMode === 'private') {
    // GIS script loaded async in index.html; wait for it.
    if (typeof google !== 'undefined') {
      initGoogleOAuth();
    } else {
      window.addEventListener('load', initGoogleOAuth);
    }

  } else {
    // calendarMode === 'none' or not configured — hide calendar
    hideCalendar();
  }
}

initCalendar();

// ============================================================
// MEDIA — Now Playing
// Supports: Browser Media Session API + Spotify Web API
// ============================================================

/**
 * Browser Media Session API:
 * Works natively with YouTube, Spotify Web Player, etc.
 * when the browser tab has media focus.
 * No credentials required.
 */
function pollMediaSession() {
  if (!CONFIG.mediaEnabled) return;

  if ('mediaSession' in navigator) {
    const meta = navigator.mediaSession.metadata;

    if (meta && meta.title) {
      $mediaTrack.textContent  = meta.title;
      $mediaArtist.textContent = meta.artist || '';
      $mediaCol.classList.add('visible');
    } else {
      trySpotify();
    }
  } else {
    trySpotify();
  }
}

// ============================================================
// MEDIA — Spotify Web API
// Docs: https://developer.spotify.com/documentation/web-api
// Requires: spotifyClientId in config.js and user auth flow.
// Uses Authorization Code Flow with PKCE for browser-based apps.
// ============================================================

let spotifyToken = null;

async function spotifyAuth() {
  if (!CONFIG.spotifyEnabled || !CONFIG.spotifyClientId) return;

  // Check URL for auth callback code
  const params = new URLSearchParams(window.location.search);
  const code   = params.get('code');

  if (code) {
    await exchangeSpotifyCode(code);
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  // Check stored token
  const stored = sessionStorage.getItem('spotify_token');
  if (stored) {
    spotifyToken = stored;
    return;
  }

  // Redirect to Spotify auth
  const codeVerifier  = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem('spotify_verifier', codeVerifier);

  const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type:         'code',
    client_id:             CONFIG.spotifyClientId,
    scope:                 'user-read-currently-playing user-read-playback-state',
    redirect_uri:          CONFIG.spotifyRedirectUri,
    code_challenge_method: 'S256',
    code_challenge:        codeChallenge,
  });

  window.location.href = authUrl;
}

async function exchangeSpotifyCode(code) {
  const verifier = sessionStorage.getItem('spotify_verifier');

  const res  = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  CONFIG.spotifyRedirectUri,
      client_id:     CONFIG.spotifyClientId,
      code_verifier: verifier,
    }),
  });

  const data = await res.json();
  if (data.access_token) {
    spotifyToken = data.access_token;
    sessionStorage.setItem('spotify_token', spotifyToken);
  }
}

async function trySpotify() {
  if (!spotifyToken) {
    $mediaCol.classList.remove('visible');
    return;
  }

  try {
    const res  = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${spotifyToken}` }
    });

    if (res.status === 204) {
      $mediaCol.classList.remove('visible');
      return;
    }

    const data = await res.json();

    if (data && data.is_playing && data.item) {
      $mediaTrack.textContent  = data.item.name;
      $mediaArtist.textContent = data.item.artists.map(a => a.name).join(', ');
      $mediaCol.classList.add('visible');
    } else {
      $mediaCol.classList.remove('visible');
    }
  } catch (e) {
    $mediaCol.classList.remove('visible');
  }
}

// PKCE helpers for Spotify OAuth
function generateCodeVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

async function generateCodeChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

// Start media polling if enabled
if (CONFIG.mediaEnabled) {
  spotifyAuth().then(() => {
    pollMediaSession();
    setInterval(pollMediaSession, 10000);
  });
}

// ============================================================
// UTILS
// ============================================================

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Prevent screen sleep on Android (where supported) ────────
// The Wake Lock API keeps the screen on during display mode.
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch (e) {
      // Not fatal — screen may sleep
    }
  }
}

requestWakeLock();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});
