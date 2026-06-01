// ============================================================
// LIVING ART FRAME — Configuration
// Edit this file to customize your installation.
// ============================================================

const CONFIG = {

  // -- LOCATION (for weather) --
  city: "Buenos Aires",
  latitude: -34.6037,
  longitude: -58.3816,

  // -- ARTWORK --
  // Interval in milliseconds (default: 2 minutes)
  artworkInterval: 2 * 60 * 1000,

  // -- WEATHER --
  // Refresh interval in milliseconds (default: 30 minutes)
  weatherRefresh: 30 * 60 * 1000,

  // -- CALENDAR --
  // "public"  → reads a public iCal/Google Calendar URL (no login required)
  // "private" → uses Google OAuth to read user's own calendar
  // "none"    → disables the calendar module entirely
  calendarMode: "none",

  // Public iCal URL (used when calendarMode === "public")
  // Export from Google Calendar: Calendar Settings → "Secret address in iCal format"
  publicCalendarURL: "",

  // Google OAuth Client ID (used when calendarMode === "private")
  // Create at: https://console.developers.google.com
  googleClientId: "",

  // Calendar refresh interval in milliseconds (default: 15 minutes)
  calendarRefresh: 15 * 60 * 1000,

  // -- MEDIA (optional) --
  // Shows currently playing song above the clock
  mediaEnabled: false,

  // Spotify Web API — requires your own app credentials
  // https://developer.spotify.com/dashboard
  spotifyEnabled: false,
  spotifyClientId: "",
  spotifyRedirectUri: "https://gaufgang.com/art",

};
