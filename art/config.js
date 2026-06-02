// Living Art Frame — config.js — 2026-06-01 17:41 Buenos Aires
// Factory defaults. User overrides are stored in localStorage.

var CONFIG_DEFAULTS = {
  city:             'Buenos Aires',
  latitude:         -34.6037,
  longitude:        -58.3816,
  artworkInterval:  2 * 60 * 1000,   // 2 min
  weatherRefresh:   30 * 60 * 1000,  // 30 min
  calendarMode:     'none',
  publicCalendarURL:'',
  googleClientId:   '',
  calendarRefresh:  15 * 60 * 1000,
  mediaEnabled:     true,
  spotifyEnabled:   false,
  spotifyClientId:  '',
  artCategories: {
    paintings: true, photography: true, sculpture: true,
    prints: true, contemporary: true
  }
};
