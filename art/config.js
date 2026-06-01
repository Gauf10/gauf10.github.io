// ============================================================
// LIVING ART FRAME — config.js
// These are FACTORY DEFAULTS only.
// At runtime, app.js merges these with values from localStorage.
// Users can override everything via the settings menu.
// ============================================================

const CONFIG_DEFAULTS = {

  // -- LOCATION --
  city:      "Buenos Aires",
  latitude:  -34.6037,
  longitude: -58.3816,

  // -- ARTWORK --
  artworkInterval: 2 * 60 * 1000,   // 2 minutes

  // -- WEATHER --
  weatherRefresh: 30 * 60 * 1000,  // 30 minutes

  // -- CALENDAR --
  // "none" | "public" | "private"
  calendarMode:      "none",
  publicCalendarURL: "",
  googleClientId:    "",
  calendarRefresh:   15 * 60 * 1000,

  // -- MEDIA --
  mediaEnabled:      true,   // tries mediaSession first, then Spotify
  spotifyEnabled:    false,
  spotifyClientId:   "",
  spotifyRedirectUri: window.location.origin + window.location.pathname,

  // -- ARTWORK CATEGORIES (for next update filter) --
  artCategories: {
    paintings:    true,
    photography:  true,
    sculpture:    true,
    prints:       true,
    contemporary: true,
  },
};
