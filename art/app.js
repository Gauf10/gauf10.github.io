// ============================================================
// LIVING ART FRAME — app.js
// v4 — 2026-06-01 17:41 (Buenos Aires)
// ============================================================
'use strict';

// ── UTILS ─────────────────────────────────────────────────────
function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function dateKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// ── BA TIMESTAMP for console ──────────────────────────────────
function ts() {
  return new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false });
}

// ── STORAGE ───────────────────────────────────────────────────
var LS_KEY  = 'laf_config';
var LS_FAVS = 'laf_favs';

function loadConfig() {
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) {}
  return Object.assign({}, CONFIG_DEFAULTS, saved, {
    artCategories: Object.assign({}, CONFIG_DEFAULTS.artCategories, saved.artCategories || {})
  });
}
function saveConfig(c) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }
function loadFavs()    { try { return JSON.parse(localStorage.getItem(LS_FAVS) || '[]'); } catch(e) { return []; } }
function saveFavs(f)   { localStorage.setItem(LS_FAVS, JSON.stringify(f)); }

var CFG = loadConfig();

// ── DOM ───────────────────────────────────────────────────────
var $bg          = document.getElementById('artwork-bg');
var $artInfo     = document.getElementById('artwork-info');
var $artTitle    = document.getElementById('artwork-title');
var $artArtist   = document.getElementById('artwork-artist');
var $clockTime   = document.getElementById('clock-time');
var $clockDate   = document.getElementById('clock-date');
var $weatherTemp = document.getElementById('weather-temp');
var $weatherDesc = document.getElementById('weather-desc');
var $weatherCity = document.getElementById('weather-city');
var $calCol      = document.getElementById('calendar-col');
var $mediaCol    = document.getElementById('media-col');
var $mediaTrack  = document.getElementById('media-track');
var $mediaArtist = document.getElementById('media-artist');
var $btnFav      = document.getElementById('btn-fav');
var $btnSettings = document.getElementById('btn-settings');
var $backdrop    = document.getElementById('settings-backdrop');
var $panel       = document.getElementById('settings-panel');
var $btnClose    = document.getElementById('btn-close-settings');
var $btnSave     = document.getElementById('btn-save-settings');
var $btnReset    = document.getElementById('btn-reset-settings');
var $zonePrev    = document.getElementById('zone-prev');
var $zoneNext    = document.getElementById('zone-next');

// ── LOCALE — system language ──────────────────────────────────
var LOCALE = (navigator.languages && navigator.languages[0]) || navigator.language || 'es-AR';
console.log('[LAF ' + ts() + '] locale=' + LOCALE);

// ── WMO CODES ─────────────────────────────────────────────────
var WMO = {
  en: {
    0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
    45:'Foggy',48:'Foggy',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',
    61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',
    75:'Heavy Snow',77:'Snow Grains',80:'Showers',81:'Showers',82:'Heavy Showers',
    95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'
  },
  es: {
    0:'Cielo despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Cubierto',
    45:'Neblina',48:'Neblina',51:'Llovizna ligera',53:'Llovizna',55:'Llovizna intensa',
    61:'Lluvia ligera',63:'Lluvia',65:'Lluvia intensa',71:'Nieve ligera',73:'Nieve',
    75:'Nieve intensa',77:'Granizo',80:'Chaparrones',81:'Chaparrones',82:'Chaparrones fuertes',
    95:'Tormenta',96:'Tormenta',99:'Tormenta'
  },
  pt: {
    0:'Céu limpo',1:'Principalmente limpo',2:'Parcialmente nublado',3:'Nublado',
    45:'Nevoeiro',48:'Nevoeiro',51:'Garoa leve',53:'Garoa',55:'Garoa forte',
    61:'Chuva leve',63:'Chuva',65:'Chuva forte',71:'Neve leve',73:'Neve',
    75:'Neve forte',77:'Granizo',80:'Pancadas',81:'Pancadas',82:'Pancadas fortes',
    95:'Tempestade',96:'Tempestade',99:'Tempestade'
  },
  fr: {
    0:'Ciel dégagé',1:'Principalement dégagé',2:'Partiellement nuageux',3:'Couvert',
    45:'Brouillard',48:'Brouillard',51:'Bruine légère',53:'Bruine',55:'Bruine forte',
    61:'Pluie légère',63:'Pluie',65:'Pluie forte',71:'Neige légère',73:'Neige',
    75:'Neige forte',77:'Grésil',80:'Averses',81:'Averses',82:'Fortes averses',
    95:'Orage',96:'Orage',99:'Orage'
  },
  de: {
    0:'Klarer Himmel',1:'Überwiegend klar',2:'Teils bewölkt',3:'Bewölkt',
    45:'Neblig',48:'Neblig',51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',
    61:'Leichter Regen',63:'Regen',65:'Starker Regen',71:'Leichter Schnee',73:'Schnee',
    75:'Starker Schnee',80:'Schauer',81:'Schauer',82:'Starke Schauer',
    95:'Gewitter',96:'Gewitter',99:'Gewitter'
  }
};

function wmoText(code) {
  var lang = LOCALE.split('-')[0].toLowerCase();
  var map  = WMO[lang] || WMO.en;
  return map[code] || WMO.en[code] || '';
}

// ============================================================
// CLOCK — system locale
// ============================================================
function updateClock() {
  var now = new Date();
  $clockTime.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  var weekday = cap(now.toLocaleDateString(LOCALE, { weekday: 'long' }));
  var dateStr = cap(now.toLocaleDateString(LOCALE, { month: 'long', day: 'numeric' }));
  $clockDate.innerHTML = weekday + '<span class="clock-sep"> &middot; </span>' + dateStr;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// WEATHER — Open-Meteo, no key needed
// ============================================================
var weatherTimer = null;

function startWeather() {
  clearInterval(weatherTimer);
  doWeather();
  weatherTimer = setInterval(doWeather, CFG.weatherRefresh);
}

async function doWeather() {
  try {
    var url  = 'https://api.open-meteo.com/v1/forecast?latitude=' + CFG.latitude + '&longitude=' + CFG.longitude + '&current_weather=true';
    var res  = await fetch(url);
    var data = await res.json();
    var cw   = data.current_weather;
    $weatherTemp.textContent = Math.round(cw.temperature) + '\u00b0C';
    $weatherDesc.textContent = wmoText(cw.weathercode);
    $weatherCity.textContent = CFG.city;
    console.log('[LAF ' + ts() + '] weather ok: ' + cw.temperature + '° code=' + cw.weathercode);
  } catch(e) {
    console.warn('[LAF ' + ts() + '] weather fail:', e.message);
  }
}

// ============================================================
// ARTWORK — Art Institute of Chicago
// Pools multiple random pages; falls back to Met Museum API
// ============================================================
var AIC_BASE   = 'https://api.artic.edu/api/v1';
var MET_BASE   = 'https://collectionapi.metmuseum.org/public/collection/v1';

var artQueue    = [];
var curArtwork  = null;
var artTimer    = null;
var isTrans     = false;
var artHistory  = [];
var histIdx     = -1;

// AIC image
function aicImg(imageId) {
  return 'https://www.artic.edu/iiif/2/' + imageId + '/full/1686,/0/default.jpg';
}

function loadImg(src) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.onload  = function() { resolve(src); };
    img.onerror = function() { reject(new Error('img load failed: ' + src)); };
    img.src = src;
  });
}

// ── AIC fetch — simple endpoint, no bracket params ───────────
async function fetchAIC() {
  var page = Math.floor(Math.random() * 300) + 1;
  // Use search endpoint with proper JSON body via POST to avoid bracket encoding issues
  var url = AIC_BASE + '/artworks/search';
  var res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'AIC-User-Agent': 'LivingArtFrame/1.0' },
    body: JSON.stringify({
      query:  { term: { is_public_domain: true } },
      fields: ['id','title','artist_display','image_id'],
      limit:  20,
      from:   page * 20
    })
  });
  if (!res.ok) throw new Error('AIC HTTP ' + res.status);
  var data = await res.json();
  return (data.data || []).filter(function(a) { return !!a.image_id; }).map(function(a) {
    return { id: a.id, title: a.title || 'Untitled', artist: (a.artist_display || '').split('\n')[0] || 'Unknown', imageId: a.image_id, src: aicImg(a.image_id) };
  });
}

// ── Met Museum fallback ───────────────────────────────────────
// Search by department IDs that have paintings/photos/prints
var MET_DEPTS = [11, 13, 14, 15, 21]; // European, Modern, Drawings, Photographs, Islamic

async function fetchMet() {
  var dept = MET_DEPTS[Math.floor(Math.random() * MET_DEPTS.length)];
  var searchUrl = MET_BASE + '/search?departmentId=' + dept + '&hasImages=true&isPublicDomain=true&q=painting';
  var res  = await fetch(searchUrl);
  var data = await res.json();
  if (!data.objectIDs || !data.objectIDs.length) throw new Error('Met: no results');
  // Grab 5 random IDs from result
  var ids = [];
  for (var i = 0; i < 8; i++) {
    ids.push(data.objectIDs[Math.floor(Math.random() * Math.min(data.objectIDs.length, 500))]);
  }
  // Fetch objects in parallel
  var objects = await Promise.allSettled(ids.map(function(id) {
    return fetch(MET_BASE + '/objects/' + id).then(function(r) { return r.json(); });
  }));
  var results = [];
  objects.forEach(function(r) {
    if (r.status === 'fulfilled') {
      var o = r.value;
      if (o && o.primaryImageSmall && o.isPublicDomain) {
        results.push({
          id:     'met_' + o.objectID,
          title:  o.title || 'Untitled',
          artist: o.artistDisplayName || 'Unknown Artist',
          src:    o.primaryImage || o.primaryImageSmall
        });
      }
    }
  });
  return results;
}

// ── Queue refill — tries AIC first, Met as fallback ──────────
async function refillQueue() {
  try {
    var items = await fetchAIC();
    if (items.length > 0) {
      artQueue = artQueue.concat(items);
      console.log('[LAF ' + ts() + '] AIC refill: +' + items.length + ' items, queue=' + artQueue.length);
      return;
    }
  } catch(e) {
    console.warn('[LAF ' + ts() + '] AIC fail (' + e.message + '), trying Met...');
  }
  try {
    var metItems = await fetchMet();
    artQueue = artQueue.concat(metItems);
    console.log('[LAF ' + ts() + '] Met refill: +' + metItems.length + ' items');
  } catch(e2) {
    console.warn('[LAF ' + ts() + '] Met fail:', e2.message);
  }
}

async function getNext() {
  if (artQueue.length < 3) await refillQueue();
  while (artQueue.length > 0) {
    var candidate = artQueue.shift();
    try {
      await loadImg(candidate.src);
      console.log('[LAF ' + ts() + '] loaded: ' + candidate.title);
      return candidate;
    } catch(e) {
      console.warn('[LAF ' + ts() + '] skip (img fail): ' + candidate.src);
    }
  }
  return null;
}

// ── Transition ────────────────────────────────────────────────
async function showArtwork(artwork, showInfo) {
  if (!artwork || isTrans) return;
  if (showInfo === undefined) showInfo = true;
  isTrans    = true;
  curArtwork = artwork;
  updateFavBtn();

  $bg.style.opacity = '0';
  await delay(1800);
  $bg.style.backgroundImage = 'url("' + artwork.src + '")';
  $bg.classList.remove('loading');
  $bg.style.opacity = '1';

  if (showInfo) {
    $artTitle.textContent  = artwork.title;
    $artArtist.textContent = artwork.artist;
    $artInfo.classList.add('visible');
    setTimeout(function() { $artInfo.classList.remove('visible'); }, 5000);
  }
  isTrans = false;
}

async function goNext() {
  if (histIdx < artHistory.length - 1) {
    histIdx++;
    await showArtwork(artHistory[histIdx]);
    return;
  }
  var next = await getNext();
  if (next) {
    artHistory.push(next);
    histIdx = artHistory.length - 1;
    if (artHistory.length > 30) { artHistory = artHistory.slice(-30); histIdx = artHistory.length - 1; }
    await showArtwork(next);
  }
}

async function goPrev() {
  if (histIdx <= 0) return;
  histIdx--;
  await showArtwork(artHistory[histIdx]);
}

async function startArtworkCycle() {
  console.log('[LAF ' + ts() + '] starting artwork cycle, interval=' + CFG.artworkInterval + 'ms');
  await goNext();
  artTimer = setInterval(goNext, CFG.artworkInterval);
}

function restartArtworkCycle() {
  clearInterval(artTimer);
  artTimer = setInterval(goNext, CFG.artworkInterval);
}

// ── Nav zones ─────────────────────────────────────────────────
$zonePrev.addEventListener('click', function() { goPrev(); });
$zoneNext.addEventListener('click', function() { goNext(); });

var _touchX = 0;
document.addEventListener('touchstart', function(e) { _touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend',   function(e) {
  var dx = e.changedTouches[0].clientX - _touchX;
  if (Math.abs(dx) > 60) { dx < 0 ? goNext() : goPrev(); }
}, { passive: true });

// ============================================================
// FAVOURITES
// ============================================================
function updateFavBtn() {
  if (!curArtwork) return;
  var favs = loadFavs();
  var is   = favs.some(function(f) { return f.id === curArtwork.id; });
  $btnFav.classList.toggle('faved', is);
}
$btnFav.addEventListener('click', function() {
  if (!curArtwork) return;
  var favs = loadFavs();
  var idx  = favs.findIndex(function(f) { return f.id === curArtwork.id; });
  if (idx === -1) favs.push({ id: curArtwork.id, title: curArtwork.title, artist: curArtwork.artist });
  else favs.splice(idx, 1);
  saveFavs(favs);
  updateFavBtn();
});

// ============================================================
// CALENDAR
// ============================================================
var PROXY  = 'https://corsproxy.io/?';
var calTmr = null;
var gToken = null;

function parseICal(text) {
  var events = [], cur = null;
  var lines = text.replace(/\r\n /g,'').replace(/\r\n/g,'\n').split('\n');
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];
    if (ln === 'BEGIN:VEVENT')           { cur = {}; }
    else if (ln === 'END:VEVENT' && cur) { if (cur.start && cur.title) events.push(cur); cur = null; }
    else if (cur) {
      if (ln.indexOf('SUMMARY:') === 0) cur.title = ln.slice(8).trim();
      if (/^DTSTART/.test(ln))          cur.start = parseICalDate(ln);
    }
  }
  return events;
}
function parseICalDate(line) {
  var val = line.split(':').slice(1).join(':').trim();
  if (val.length === 8) return new Date(val.slice(0,4)+'-'+val.slice(4,6)+'-'+val.slice(6,8)+'T00:00:00');
  return new Date(val.slice(0,4)+'-'+val.slice(4,6)+'-'+val.slice(6,8)+'T'+val.slice(9,11)+':'+val.slice(11,13)+':00Z');
}
function dayLabel(date) {
  var t = new Date(), tm = new Date(t); tm.setDate(tm.getDate()+1);
  if (dateKey(date) === dateKey(t))  return cap(new Intl.RelativeTimeFormat(LOCALE,{numeric:'auto'}).format(0,'day'));
  if (dateKey(date) === dateKey(tm)) return cap(new Intl.RelativeTimeFormat(LOCALE,{numeric:'auto'}).format(1,'day'));
  return cap(date.toLocaleDateString(LOCALE,{weekday:'long'}));
}
function evHtml(e) {
  var h = String(e.start.getHours()).padStart(2,'0'), m = String(e.start.getMinutes()).padStart(2,'0');
  return '<div class="cal-event"><span class="cal-time">'+h+':'+m+'</span><span class="cal-title">'+escHtml(e.title)+'</span></div>';
}
function renderCal(events) {
  var now = new Date(), t = dateKey(now), tm = new Date(now); tm.setDate(tm.getDate()+1);
  var tod = events.filter(function(e){ return e.start && dateKey(e.start)===t && e.start>=now; });
  var tmr = events.filter(function(e){ return e.start && dateKey(e.start)===dateKey(tm); });
  if (!tod.length && !tmr.length) { hideCal(); return; }
  var html = '';
  if (tod.length) html += '<div class="cal-day-label">'+dayLabel(now)+'</div>' + tod.map(evHtml).join('');
  if (tmr.length) html += '<div class="cal-day-label">'+dayLabel(tm)+'</div>'  + tmr.map(evHtml).join('');
  $calCol.innerHTML = html;
  $calCol.classList.add('visible');
}
function hideCal() { $calCol.classList.remove('visible'); $calCol.innerHTML = ''; }

async function fetchPubCal() {
  if (!CFG.publicCalendarURL) return;
  try {
    var res = await fetch(PROXY + encodeURIComponent(CFG.publicCalendarURL));
    renderCal(parseICal(await res.text()));
  } catch(e) { console.warn('[LAF] cal fail', e); hideCal(); }
}

function initCalendar() {
  clearInterval(calTmr);
  if (CFG.calendarMode === 'public' && CFG.publicCalendarURL) {
    fetchPubCal();
    calTmr = setInterval(fetchPubCal, CFG.calendarRefresh);
  } else if (CFG.calendarMode === 'private' && CFG.googleClientId) {
    if (window._loadGIS) window._loadGIS();
    typeof google !== 'undefined' ? initGOAuth() : window.addEventListener('load', initGOAuth);
  } else {
    hideCal();
  }
}
function initGOAuth() {
  if (typeof google === 'undefined' || !CFG.googleClientId) return;
  google.accounts.oauth2.initTokenClient({
    client_id: CFG.googleClientId,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    callback: function(r) { if (r.access_token) { gToken = r.access_token; fetchPrivCal(); } }
  }).requestAccessToken({ prompt: '' });
}
async function fetchPrivCal() {
  if (!gToken) return;
  var now = new Date(), end = new Date(now); end.setDate(end.getDate()+2);
  try {
    var res  = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin='+now.toISOString()+'&timeMax='+end.toISOString()+'&maxResults=20&singleEvents=true&orderBy=startTime',{headers:{Authorization:'Bearer '+gToken}});
    var data = await res.json();
    renderCal((data.items||[]).map(function(e){ return {title:e.summary||'Event',start:new Date(e.start.dateTime||e.start.date)}; }));
  } catch(e) { hideCal(); }
}

// ============================================================
// MEDIA — mediaSession → Spotify
// ============================================================
var spToken  = null;
var mediaTmr = null;

function pollMedia() {
  if (!CFG.mediaEnabled) { $mediaCol.classList.remove('visible'); return; }
  try {
    var ms    = navigator.mediaSession;
    var meta  = ms ? ms.metadata : null;
    var state = ms ? ms.playbackState : 'none';
    if (meta && meta.title && state !== 'paused' && state !== 'none') {
      $mediaTrack.textContent  = meta.title;
      $mediaArtist.textContent = meta.artist || '';
      $mediaCol.classList.add('visible');
      return;
    }
  } catch(e) {}
  if (CFG.spotifyEnabled && spToken) fetchSpotify();
  else $mediaCol.classList.remove('visible');
}
async function fetchSpotify() {
  try {
    var res = await fetch('https://api.spotify.com/v1/me/player/currently-playing',{headers:{Authorization:'Bearer '+spToken}});
    if (res.status === 204) { $mediaCol.classList.remove('visible'); return; }
    var d = await res.json();
    if (d && d.is_playing && d.item) {
      $mediaTrack.textContent  = d.item.name;
      $mediaArtist.textContent = d.item.artists.map(function(a){return a.name;}).join(', ');
      $mediaCol.classList.add('visible');
    } else { $mediaCol.classList.remove('visible'); }
  } catch(e) { $mediaCol.classList.remove('visible'); }
}

function genVer() {
  var a = new Uint8Array(64); crypto.getRandomValues(a);
  return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function genChal(v) {
  var d = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
  return btoa(String.fromCharCode.apply(null,new Uint8Array(d))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

async function initSpotify() {
  if (!CFG.spotifyEnabled || !CFG.spotifyClientId) return;
  var params = new URLSearchParams(window.location.search);
  var code   = params.get('code');
  if (code && sessionStorage.getItem('sp_ver')) {
    try {
      var res  = await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:code,redirect_uri:CFG.spotifyRedirectUri,client_id:CFG.spotifyClientId,code_verifier:sessionStorage.getItem('sp_ver')})});
      var data = await res.json();
      if (data.access_token) { spToken = data.access_token; sessionStorage.setItem('sp_tok',spToken); }
    } catch(e) {}
    window.history.replaceState({},document.title,window.location.pathname);
    return;
  }
  var stored = sessionStorage.getItem('sp_tok');
  if (stored) { spToken = stored; return; }
  if (!CFG.spotifyClientId || !CFG.spotifyRedirectUri) return;
  var ver = genVer(), chal = await genChal(ver);
  sessionStorage.setItem('sp_ver', ver);
  window.location.href = 'https://accounts.spotify.com/authorize?'+new URLSearchParams({response_type:'code',client_id:CFG.spotifyClientId,scope:'user-read-currently-playing user-read-playback-state',redirect_uri:CFG.spotifyRedirectUri,code_challenge_method:'S256',code_challenge:chal});
}

function startMedia() {
  clearInterval(mediaTmr);
  if (!CFG.mediaEnabled) { $mediaCol.classList.remove('visible'); return; }
  var boot = function() { pollMedia(); mediaTmr = setInterval(pollMedia, 10000); };
  if (CFG.spotifyEnabled && CFG.spotifyClientId) {
    initSpotify().then(boot).catch(boot);
  } else { boot(); }
}

// ============================================================
// SETTINGS PANEL
// ============================================================
function openSettings()  { populateForm(); $panel.classList.add('open'); $backdrop.classList.add('open'); }
function closeSettings() { $panel.classList.remove('open'); $backdrop.classList.remove('open'); }

$btnSettings.addEventListener('click', openSettings);
$btnClose.addEventListener('click', closeSettings);
$backdrop.addEventListener('click', closeSettings);

function populateForm() {
  document.getElementById('cfg-city').value              = CFG.city;
  document.getElementById('cfg-lat').value               = CFG.latitude;
  document.getElementById('cfg-lon').value               = CFG.longitude;
  document.getElementById('cfg-art-interval').value      = Math.round(CFG.artworkInterval/60000);
  document.getElementById('cfg-weather-interval').value  = Math.round(CFG.weatherRefresh/60000);
  document.getElementById('cfg-cal-mode').value          = CFG.calendarMode;
  document.getElementById('cfg-cal-url').value           = CFG.publicCalendarURL || '';
  document.getElementById('cfg-gcid').value              = CFG.googleClientId || '';
  document.getElementById('cfg-media-enabled').checked   = !!CFG.mediaEnabled;
  document.getElementById('cfg-spotify-enabled').checked = !!CFG.spotifyEnabled;
  document.getElementById('cfg-spotify-id').value        = CFG.spotifyClientId || '';
  document.getElementById('cat-paintings').checked       = !!CFG.artCategories.paintings;
  document.getElementById('cat-photography').checked     = !!CFG.artCategories.photography;
  document.getElementById('cat-sculpture').checked       = !!CFG.artCategories.sculpture;
  document.getElementById('cat-prints').checked          = !!CFG.artCategories.prints;
  document.getElementById('cat-contemporary').checked    = !!CFG.artCategories.contemporary;
  showCalRows(); showSpotifyRow();
}

var $calModeEl = document.getElementById('cfg-cal-mode');
$calModeEl.addEventListener('change', showCalRows);
function showCalRows() {
  var m = $calModeEl.value;
  document.getElementById('row-cal-url').style.display  = m==='public'  ? 'flex':'none';
  document.getElementById('row-cal-gcid').style.display = m==='private' ? 'flex':'none';
}
var $spEl = document.getElementById('cfg-spotify-enabled');
$spEl.addEventListener('change', showSpotifyRow);
function showSpotifyRow() {
  document.getElementById('row-spotify-id').style.display = $spEl.checked ? 'flex':'none';
}

$btnSave.addEventListener('click', function() {
  var am = parseInt(document.getElementById('cfg-art-interval').value)     || 2;
  var wm = parseInt(document.getElementById('cfg-weather-interval').value) || 30;
  var nc = {
    city:              document.getElementById('cfg-city').value.trim() || CFG.city,
    latitude:          parseFloat(document.getElementById('cfg-lat').value)  || CFG.latitude,
    longitude:         parseFloat(document.getElementById('cfg-lon').value)  || CFG.longitude,
    artworkInterval:   am * 60000,
    weatherRefresh:    wm * 60000,
    calendarMode:      $calModeEl.value,
    publicCalendarURL: document.getElementById('cfg-cal-url').value.trim(),
    googleClientId:    document.getElementById('cfg-gcid').value.trim(),
    calendarRefresh:   CFG.calendarRefresh || 900000,
    mediaEnabled:      document.getElementById('cfg-media-enabled').checked,
    spotifyEnabled:    document.getElementById('cfg-spotify-enabled').checked,
    spotifyClientId:   document.getElementById('cfg-spotify-id').value.trim(),
    spotifyRedirectUri: CFG.spotifyRedirectUri || (window.location.origin+window.location.pathname),
    artCategories: {
      paintings:    document.getElementById('cat-paintings').checked,
      photography:  document.getElementById('cat-photography').checked,
      sculpture:    document.getElementById('cat-sculpture').checked,
      prints:       document.getElementById('cat-prints').checked,
      contemporary: document.getElementById('cat-contemporary').checked
    }
  };
  saveConfig(nc); CFG = nc;
  startWeather(); initCalendar(); startMedia(); restartArtworkCycle();
  artQueue = []; closeSettings();
});

$btnReset.addEventListener('click', function() {
  if (!confirm('¿Restaurar configuración original?')) return;
  localStorage.removeItem(LS_KEY); CFG = loadConfig();
  startWeather(); initCalendar(); startMedia(); restartArtworkCycle();
  artQueue = []; closeSettings();
});

// ============================================================
// WAKE LOCK
// ============================================================
function wakeLock() {
  if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(function(){});
}
wakeLock();
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') wakeLock();
});

// ============================================================
// BOOT
// ============================================================
console.log('[LAF ' + ts() + '] boot — locale=' + LOCALE + ' city=' + CFG.city);
startWeather();
initCalendar();
startMedia();
startArtworkCycle();
