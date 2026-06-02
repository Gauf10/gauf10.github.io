// Living Art Frame — app.js — 2026-06-01 17:41 Buenos Aires
// v5: clean rewrite. utils first, no hoisting issues, defensive API calls.

// ── UTILS ─────────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function wait(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }
function dkey(d) { return d.getFullYear()+'/'+d.getMonth()+'/'+d.getDate(); }
function esc(s)  { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function cap(s)  { return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }

// ── CONFIG + LOCALSTORAGE ──────────────────────────────────────────────────────
var LS  = 'laf2_cfg';
var LSF = 'laf2_fav';

function loadCFG() {
  var s = {};
  try { s = JSON.parse(localStorage.getItem(LS)||'{}'); } catch(e){}
  var d = CONFIG_DEFAULTS;
  return {
    city:             s.city             || d.city,
    latitude:         s.latitude         != null ? s.latitude   : d.latitude,
    longitude:        s.longitude        != null ? s.longitude  : d.longitude,
    artworkInterval:  s.artworkInterval  || d.artworkInterval,
    weatherRefresh:   s.weatherRefresh   || d.weatherRefresh,
    calendarMode:     s.calendarMode     || d.calendarMode,
    publicCalendarURL:s.publicCalendarURL|| d.publicCalendarURL,
    googleClientId:   s.googleClientId   || d.googleClientId,
    calendarRefresh:  s.calendarRefresh  || d.calendarRefresh,
    mediaEnabled:     s.mediaEnabled     != null ? !!s.mediaEnabled  : d.mediaEnabled,
    spotifyEnabled:   s.spotifyEnabled   != null ? !!s.spotifyEnabled : d.spotifyEnabled,
    spotifyClientId:  s.spotifyClientId  || d.spotifyClientId,
    artCategories:    Object.assign({}, d.artCategories, s.artCategories||{})
  };
}
function saveCFG(c) { localStorage.setItem(LS, JSON.stringify(c)); }
function loadFAV()  { try { return JSON.parse(localStorage.getItem(LSF)||'[]'); } catch(e){ return []; } }
function saveFAV(f) { localStorage.setItem(LSF, JSON.stringify(f)); }

var C = loadCFG();

// ── LOCALE ─────────────────────────────────────────────────────────────────────
var LOC = (navigator.languages && navigator.languages[0]) || navigator.language || 'es-AR';

// ── WMO WEATHER MAP (localised) ────────────────────────────────────────────────
var WMAP = {
  es:{0:'Cielo despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Cubierto',
      45:'Neblina',48:'Neblina',51:'Llovizna ligera',53:'Llovizna',55:'Llovizna intensa',
      61:'Lluvia ligera',63:'Lluvia',65:'Lluvia intensa',71:'Nieve ligera',73:'Nieve',
      75:'Nieve intensa',80:'Chaparrones',81:'Chaparrones',82:'Chaparrones fuertes',
      95:'Tormenta',96:'Tormenta',99:'Tormenta'},
  pt:{0:'Céu limpo',1:'Principalmente limpo',2:'Parcialmente nublado',3:'Nublado',
      45:'Nevoeiro',48:'Nevoeiro',51:'Garoa leve',53:'Garoa',55:'Garoa forte',
      61:'Chuva leve',63:'Chuva',65:'Chuva forte',71:'Neve leve',73:'Neve',
      75:'Neve forte',80:'Pancadas',81:'Pancadas',82:'Pancadas fortes',
      95:'Tempestade',96:'Tempestade',99:'Tempestade'},
  fr:{0:'Ciel dégagé',1:'Principalement dégagé',2:'Partiellement nuageux',3:'Couvert',
      45:'Brouillard',51:'Bruine légère',53:'Bruine',55:'Bruine forte',
      61:'Pluie légère',63:'Pluie',65:'Pluie forte',71:'Neige légère',73:'Neige',
      75:'Neige forte',80:'Averses',81:'Averses',82:'Fortes averses',
      95:'Orage',96:'Orage',99:'Orage'},
  de:{0:'Klarer Himmel',1:'Überwiegend klar',2:'Teils bewölkt',3:'Bewölkt',
      45:'Neblig',51:'Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',
      61:'Leichter Regen',63:'Regen',65:'Starker Regen',71:'Leichter Schnee',73:'Schnee',
      80:'Schauer',81:'Schauer',82:'Starke Schauer',95:'Gewitter',96:'Gewitter'},
  en:{0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',
      45:'Foggy',48:'Foggy',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',
      61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',
      75:'Heavy Snow',80:'Showers',81:'Showers',82:'Heavy Showers',
      95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'}
};

function wmo(code) {
  var lang = LOC.split('-')[0].toLowerCase();
  var m = WMAP[lang] || WMAP.en;
  return m[code] || WMAP.en[code] || '';
}

// ── CLOCK ──────────────────────────────────────────────────────────────────────
var elTime = $('clock-time');
var elDate = $('clock-date');

function tickClock() {
  var n  = new Date();
  var hh = String(n.getHours()).padStart(2,'0');
  var mm = String(n.getMinutes()).padStart(2,'0');
  elTime.textContent = hh + ':' + mm;

  var wd = cap(n.toLocaleDateString(LOC, {weekday:'long'}));
  var dt = cap(n.toLocaleDateString(LOC, {month:'long', day:'numeric'}));
  elDate.innerHTML = wd + '<span class="sep"> · </span>' + dt;
}
setInterval(tickClock, 1000);
tickClock();

// ── WEATHER ────────────────────────────────────────────────────────────────────
var elTemp = $('w-temp');
var elDesc = $('w-desc');
var elCity = $('w-city');
var wxTimer = null;

function startWeather() {
  clearInterval(wxTimer);
  fetchWeather();
  wxTimer = setInterval(fetchWeather, C.weatherRefresh);
}

function fetchWeather() {
  var url = 'https://api.open-meteo.com/v1/forecast'
          + '?latitude='  + C.latitude
          + '&longitude=' + C.longitude
          + '&current_weather=true';
  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(d){
      var cw = d.current_weather;
      elTemp.textContent = Math.round(cw.temperature) + '\u00b0C';
      elDesc.textContent = wmo(cw.weathercode);
      elCity.textContent = C.city;
    })
    .catch(function(e){ console.warn('[wx]', e.message); });
}

// ── ARTWORK ────────────────────────────────────────────────────────────────────
// Uses AIC search API (GET with proper encoded params)
// Falls back to Met Museum open API if AIC fails.

var elBg     = $('bg');
var elCaption= $('caption');
var elCapTit = $('cap-title');
var elCapArt = $('cap-artist');
var elFav    = $('btn-fav');

var artQueue   = [];
var artHistory = [];
var histIdx    = -1;
var curArt     = null;
var inTrans    = false;
var artTimer   = null;

// AIC: use simple GET, encode query properly
function fetchAIC() {
  // Random offset across ~60k public domain works
  var from = Math.floor(Math.random() * 3000);
  var url  = 'https://api.artic.edu/api/v1/artworks/search'
           + '?query[term][is_public_domain]=true'
           + '&fields=id,title,artist_display,image_id'
           + '&limit=20&from=' + from;
  return fetch(url, {headers:{'AIC-User-Agent':'LivingArtFrame/1.0'}})
    .then(function(r){
      if(!r.ok) throw new Error('AIC '+r.status);
      return r.json();
    })
    .then(function(d){
      return (d.data||[]).filter(function(a){ return !!a.image_id; })
        .map(function(a){
          return {
            src:    'https://www.artic.edu/iiif/2/'+a.image_id+'/full/843,/0/default.jpg',
            title:  a.title || 'Untitled',
            artist: (a.artist_display||'').split('\n')[0] || '',
            id:     'aic_'+a.id
          };
        });
    });
}

// Met Museum: open access, CORS-friendly
function fetchMet() {
  // Departments with rich public-domain content
  var depts = [11,13,14,15,21,6];
  var dept  = depts[Math.floor(Math.random()*depts.length)];
  var url   = 'https://collectionapi.metmuseum.org/public/collection/v1/search'
            + '?departmentId='+dept+'&hasImages=true&isPublicDomain=true&q=art';
  return fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d.objectIDs||!d.objectIDs.length) throw new Error('Met empty');
      // Pick 6 random IDs from first 1000
      var pool = d.objectIDs.slice(0, 1000);
      var ids  = [];
      for(var i=0;i<6;i++) ids.push(pool[Math.floor(Math.random()*pool.length)]);
      return Promise.allSettled(ids.map(function(id){
        return fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+id)
          .then(function(r){ return r.json(); });
      }));
    })
    .then(function(results){
      var out = [];
      results.forEach(function(r){
        if(r.status==='fulfilled'){
          var o = r.value;
          if(o && o.primaryImage && o.isPublicDomain){
            out.push({
              src:    o.primaryImage,
              title:  o.title||'Untitled',
              artist: o.artistDisplayName||'',
              id:     'met_'+o.objectID
            });
          }
        }
      });
      return out;
    });
}

function imgLoad(src) {
  return new Promise(function(resolve, reject){
    var i = new Image();
    i.onload  = function(){ resolve(src); };
    i.onerror = function(){ reject(); };
    i.src = src;
  });
}

function refill() {
  return fetchAIC()
    .then(function(items){
      if(items.length){ artQueue = artQueue.concat(items); return; }
      throw new Error('AIC empty');
    })
    .catch(function(){
      return fetchMet().then(function(items){
        artQueue = artQueue.concat(items);
      });
    })
    .catch(function(e){ console.warn('[art] refill fail', e); });
}

function getNext() {
  var doGet = artQueue.length < 3
    ? refill().then(tryShift)
    : Promise.resolve(tryShift());
  return doGet;
}

function tryShift() {
  if(!artQueue.length) return Promise.resolve(null);
  var a = artQueue.shift();
  return imgLoad(a.src)
    .then(function(){ return a; })
    .catch(function(){
      // Skip this one and try next
      if(artQueue.length) return tryShift();
      return null;
    });
}

function showArt(a, info) {
  if(!a||inTrans) return Promise.resolve();
  if(info===undefined) info=true;
  inTrans = true;
  curArt  = a;
  updateFav();

  elBg.style.opacity = '0';
  return wait(1600)
    .then(function(){
      elBg.style.backgroundImage = 'url("'+a.src+'")';
      elBg.style.opacity = '1';
      if(info){
        elCapTit.textContent = a.title;
        elCapArt.textContent = a.artist;
        elCaption.classList.add('show');
        setTimeout(function(){ elCaption.classList.remove('show'); }, 5000);
      }
      inTrans = false;
    });
}

function goNext() {
  if(histIdx < artHistory.length-1){
    histIdx++;
    return showArt(artHistory[histIdx]);
  }
  return getNext().then(function(a){
    if(!a) return;
    artHistory.push(a);
    histIdx = artHistory.length-1;
    if(artHistory.length>40){ artHistory=artHistory.slice(-40); histIdx=artHistory.length-1; }
    return showArt(a);
  });
}

function goPrev() {
  if(histIdx<=0) return;
  histIdx--;
  showArt(artHistory[histIdx]);
}

function startArt() {
  clearInterval(artTimer);
  goNext();
  artTimer = setInterval(goNext, C.artworkInterval);
}

// Nav zones
$('zone-prev').addEventListener('click', function(){ goPrev(); });
$('zone-next').addEventListener('click', function(){ goNext(); });

// Swipe
var _tx = 0;
document.addEventListener('touchstart', function(e){ _tx = e.touches[0].clientX; },{passive:true});
document.addEventListener('touchend',   function(e){
  var dx = e.changedTouches[0].clientX - _tx;
  if(Math.abs(dx)>55){ dx<0 ? goNext() : goPrev(); }
},{passive:true});

// ── FAVOURITES ────────────────────────────────────────────────────────────────
function updateFav() {
  if(!curArt) return;
  var favs = loadFAV();
  var on   = favs.some(function(f){ return f.id===curArt.id; });
  elFav.classList.toggle('faved', on);
}
elFav.addEventListener('click', function(){
  if(!curArt) return;
  var favs = loadFAV();
  var idx  = favs.findIndex(function(f){ return f.id===curArt.id; });
  if(idx===-1) favs.push({id:curArt.id, title:curArt.title, artist:curArt.artist});
  else favs.splice(idx,1);
  saveFAV(favs);
  updateFav();
});

// ── CALENDAR ──────────────────────────────────────────────────────────────────
var elCal  = $('cal');
var calTmr = null;
var gTok   = null;

function parseICal(txt) {
  var evs=[], cur=null;
  var lines = txt.replace(/\r\n /g,'').replace(/\r\n/g,'\n').split('\n');
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    if(l==='BEGIN:VEVENT')         { cur={}; }
    else if(l==='END:VEVENT'&&cur) { if(cur.start&&cur.title) evs.push(cur); cur=null; }
    else if(cur){
      if(l.indexOf('SUMMARY:')===0) cur.title=l.slice(8).trim();
      if(/^DTSTART/.test(l))        cur.start=parseIDate(l);
    }
  }
  return evs;
}
function parseIDate(line){
  var v=line.split(':').slice(1).join(':').trim();
  if(v.length===8) return new Date(v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8)+'T00:00:00');
  return new Date(v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8)+'T'+v.slice(9,11)+':'+v.slice(11,13)+':00Z');
}
function dayLbl(d){
  var t=new Date(), tm=new Date(t); tm.setDate(tm.getDate()+1);
  var rtf = new Intl.RelativeTimeFormat(LOC,{numeric:'auto'});
  if(dkey(d)===dkey(t))  return cap(rtf.format(0,'day'));
  if(dkey(d)===dkey(tm)) return cap(rtf.format(1,'day'));
  return cap(d.toLocaleDateString(LOC,{weekday:'long'}));
}
function renderCal(evs){
  var now=new Date(), ts=dkey(now), tm=new Date(now); tm.setDate(tm.getDate()+1);
  var tod=evs.filter(function(e){ return e.start&&dkey(e.start)===ts&&e.start>=now; });
  var tmr=evs.filter(function(e){ return e.start&&dkey(e.start)===dkey(tm); });
  if(!tod.length&&!tmr.length){ hideCal(); return; }
  var h='';
  if(tod.length){
    h+='<div class="cal-group"><div class="cal-day">'+dayLbl(now)+'</div>';
    tod.forEach(function(e){ h+=evRow(e); }); h+='</div>';
  }
  if(tmr.length){
    h+='<div class="cal-group"><div class="cal-day">'+dayLbl(tm)+'</div>';
    tmr.forEach(function(e){ h+=evRow(e); }); h+='</div>';
  }
  elCal.innerHTML=h; elCal.classList.add('show');
}
function evRow(e){
  var hh=String(e.start.getHours()).padStart(2,'0'), mm=String(e.start.getMinutes()).padStart(2,'0');
  return '<div class="cal-ev"><span class="cal-t">'+hh+':'+mm+'</span><span class="cal-n">'+esc(e.title)+'</span></div>';
}
function hideCal(){ elCal.classList.remove('show'); elCal.innerHTML=''; }

function startCalendar(){
  clearInterval(calTmr);
  if(C.calendarMode==='public'&&C.publicCalendarURL){
    fetchPubCal();
    calTmr=setInterval(fetchPubCal, C.calendarRefresh);
  } else if(C.calendarMode==='private'&&C.googleClientId){
    loadGIS();
  } else { hideCal(); }
}
function fetchPubCal(){
  fetch('https://corsproxy.io/?'+encodeURIComponent(C.publicCalendarURL))
    .then(function(r){ return r.text(); })
    .then(function(t){ renderCal(parseICal(t)); })
    .catch(function(){ hideCal(); });
}
function loadGIS(){
  var s=document.createElement('script');
  s.src='https://accounts.google.com/gsi/client'; s.async=true;
  s.onload=function(){
    google.accounts.oauth2.initTokenClient({
      client_id:C.googleClientId,
      scope:'https://www.googleapis.com/auth/calendar.readonly',
      callback:function(r){ if(r.access_token){ gTok=r.access_token; fetchPrivCal(); } }
    }).requestAccessToken({prompt:''});
  };
  document.head.appendChild(s);
}
function fetchPrivCal(){
  if(!gTok) return;
  var n=new Date(), e=new Date(n); e.setDate(e.getDate()+2);
  fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin='+n.toISOString()+'&timeMax='+e.toISOString()+'&maxResults=20&singleEvents=true&orderBy=startTime',{headers:{Authorization:'Bearer '+gTok}})
    .then(function(r){ return r.json(); })
    .then(function(d){ renderCal((d.items||[]).map(function(ev){ return {title:ev.summary||'Event',start:new Date(ev.start.dateTime||ev.start.date)}; })); })
    .catch(function(){ hideCal(); });
}

// ── MEDIA ──────────────────────────────────────────────────────────────────────
var elMedia = $('media');
var elMTrk  = $('media-track');
var elMArt  = $('media-artist');
var medTmr  = null;
var spTok   = null;

function startMedia(){
  clearInterval(medTmr);
  if(!C.mediaEnabled){ elMedia.classList.remove('show'); return; }
  if(C.spotifyEnabled&&C.spotifyClientId){
    initSpotify().then(pollMedia).catch(pollMedia);
  } else { pollMedia(); }
  medTmr = setInterval(pollMedia, 10000);
}

function pollMedia(){
  if(!C.mediaEnabled){ elMedia.classList.remove('show'); return; }
  try{
    var ms    = navigator.mediaSession;
    var meta  = ms ? ms.metadata : null;
    var state = ms ? ms.playbackState : 'none';
    if(meta&&meta.title&&state!=='paused'&&state!=='none'){
      elMTrk.textContent = meta.title;
      elMArt.textContent = meta.artist||'';
      elMedia.classList.add('show');
      return;
    }
  }catch(e){}
  if(C.spotifyEnabled&&spTok){ fetchSpotify(); }
  else { elMedia.classList.remove('show'); }
}

function fetchSpotify(){
  fetch('https://api.spotify.com/v1/me/player/currently-playing',{headers:{Authorization:'Bearer '+spTok}})
    .then(function(r){ if(r.status===204) throw new Error('empty'); return r.json(); })
    .then(function(d){
      if(d&&d.is_playing&&d.item){
        elMTrk.textContent=d.item.name;
        elMArt.textContent=d.item.artists.map(function(a){return a.name;}).join(', ');
        elMedia.classList.add('show');
      } else { elMedia.classList.remove('show'); }
    })
    .catch(function(){ elMedia.classList.remove('show'); });
}

function gv(){ var a=new Uint8Array(64); crypto.getRandomValues(a); return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function gc(v){ return crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)).then(function(d){ return btoa(String.fromCharCode.apply(null,new Uint8Array(d))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }); }

function initSpotify(){
  if(!C.spotifyEnabled||!C.spotifyClientId) return Promise.resolve();
  var p=new URLSearchParams(window.location.search), code=p.get('code');
  var redir=window.location.origin+window.location.pathname;
  if(code&&sessionStorage.getItem('sp_v')){
    return fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:code,redirect_uri:redir,client_id:C.spotifyClientId,code_verifier:sessionStorage.getItem('sp_v')})})
      .then(function(r){ return r.json(); })
      .then(function(d){ if(d.access_token){ spTok=d.access_token; sessionStorage.setItem('sp_t',spTok); } window.history.replaceState({},'',window.location.pathname); })
      .catch(function(){});
  }
  var t=sessionStorage.getItem('sp_t');
  if(t){ spTok=t; return Promise.resolve(); }
  var v=gv();
  return gc(v).then(function(ch){
    sessionStorage.setItem('sp_v',v);
    window.location.href='https://accounts.spotify.com/authorize?'+new URLSearchParams({response_type:'code',client_id:C.spotifyClientId,scope:'user-read-currently-playing user-read-playback-state',redirect_uri:redir,code_challenge_method:'S256',code_challenge:ch});
  });
}

// ── SETTINGS PANEL ────────────────────────────────────────────────────────────
var btnCfg  = $('btn-cfg');
var bdrop   = $('cfg-backdrop');
var panel   = $('cfg-panel');
var btnClose= $('btn-cfg-close');
var btnSave = $('btn-save');
var btnReset= $('btn-reset');
var selCal  = $('i-cal-mode');
var cbSp    = $('i-sp-on');

function openCfg(){  fillForm(); panel.classList.add('show'); bdrop.classList.add('show'); }
function closeCfg(){ panel.classList.remove('show'); bdrop.classList.remove('show'); }

btnCfg.addEventListener('click',  openCfg);
btnClose.addEventListener('click', closeCfg);
bdrop.addEventListener('click',   closeCfg);

function fillForm(){
  $('i-city').value = C.city;
  $('i-lat').value  = C.latitude;
  $('i-lon').value  = C.longitude;
  $('i-art').value  = Math.round(C.artworkInterval/60000);
  $('i-wx').value   = Math.round(C.weatherRefresh/60000);
  selCal.value      = C.calendarMode;
  $('i-cal-url').value = C.publicCalendarURL||'';
  $('i-gcid').value    = C.googleClientId||'';
  $('i-media').checked = !!C.mediaEnabled;
  cbSp.checked         = !!C.spotifyEnabled;
  $('i-sp-id').value   = C.spotifyClientId||'';
  $('c-paint').checked  = !!C.artCategories.paintings;
  $('c-photo').checked  = !!C.artCategories.photography;
  $('c-sculpt').checked = !!C.artCategories.sculpture;
  $('c-print').checked  = !!C.artCategories.prints;
  $('c-mod').checked    = !!C.artCategories.contemporary;
  updCalRows(); updSpRow();
}

selCal.addEventListener('change', updCalRows);
function updCalRows(){
  $('r-cal-url').style.display = selCal.value==='public'  ? 'flex':'none';
  $('r-gcid').style.display    = selCal.value==='private' ? 'flex':'none';
}
cbSp.addEventListener('change', updSpRow);
function updSpRow(){
  $('r-sp-id').style.display = cbSp.checked ? 'flex':'none';
}

btnSave.addEventListener('click', function(){
  var am = parseInt($('i-art').value)||2;
  var wm = parseInt($('i-wx').value)||30;
  C = {
    city:             $('i-city').value.trim()||C.city,
    latitude:         parseFloat($('i-lat').value)||C.latitude,
    longitude:        parseFloat($('i-lon').value)||C.longitude,
    artworkInterval:  am*60000,
    weatherRefresh:   wm*60000,
    calendarMode:     selCal.value,
    publicCalendarURL:$('i-cal-url').value.trim(),
    googleClientId:   $('i-gcid').value.trim(),
    calendarRefresh:  C.calendarRefresh,
    mediaEnabled:     $('i-media').checked,
    spotifyEnabled:   cbSp.checked,
    spotifyClientId:  $('i-sp-id').value.trim(),
    artCategories:{
      paintings:    $('c-paint').checked,
      photography:  $('c-photo').checked,
      sculpture:    $('c-sculpt').checked,
      prints:       $('c-print').checked,
      contemporary: $('c-mod').checked
    }
  };
  saveCFG(C);
  closeCfg();
  startWeather();
  startCalendar();
  startMedia();
  // Restart artwork cycle
  clearInterval(artTimer);
  artQueue=[];
  artTimer=setInterval(goNext, C.artworkInterval);
});

btnReset.addEventListener('click', function(){
  if(!confirm('Reset to defaults?')) return;
  localStorage.removeItem(LS);
  C = loadCFG();
  closeCfg();
  startWeather();
  startCalendar();
  startMedia();
  clearInterval(artTimer);
  artQueue=[];
  artTimer=setInterval(goNext, C.artworkInterval);
});

// ── WAKE LOCK ──────────────────────────────────────────────────────────────────
function wakeLock(){
  if('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(function(){});
}
wakeLock();
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState==='visible') wakeLock();
});

// ── BOOT ───────────────────────────────────────────────────────────────────────
startWeather();
startCalendar();
startMedia();
startArt();
