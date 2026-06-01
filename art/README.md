# Living Art Frame

A museum-quality digital art display for tablets and desktops.  
Rotates artworks from the Art Institute of Chicago with an elegant clock, weather, and optional calendar.

## Configuration

Open `config.js` and edit:

| Key | Description |
|-----|-------------|
| `city` | Your city name (display only) |
| `latitude` / `longitude` | For accurate weather |
| `artworkInterval` | How often artwork changes (ms) |
| `weatherRefresh` | How often weather updates (ms) |
| `calendarMode` | `"none"` / `"public"` / `"private"` |
| `publicCalendarURL` | iCal URL from Google Calendar settings |
| `googleClientId` | For private calendar OAuth |
| `mediaEnabled` | `true` to show now-playing |
| `spotifyEnabled` | `true` to enable Spotify |

---

## Calendar Setup

### Public mode
1. Open Google Calendar → your calendar's **Settings**
2. Scroll to **Integrate calendar** → copy **Secret address in iCal format**
3. Paste into `config.js` → `publicCalendarURL`
4. Set `calendarMode: "public"`

### Private mode (Google OAuth)
1. Go to [Google Cloud Console](https://console.developers.google.com)
2. Create a project → Enable **Google Calendar API**
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add your domain to **Authorized JavaScript origins**
5. Copy the Client ID into `config.js` → `googleClientId`
6. Set `calendarMode: "private"`

> **Note:** When no calendar events exist, the left column disappears completely and the artwork fills the full screen.

---

## Android Tablet Setup

For a permanent display:

1. Open Chrome on the tablet
2. Navigate to your URL
3. Tap **⋮ Menu → Add to Home Screen**
4. Open the app from the home screen (full-screen kiosk mode)
5. In Android Settings → **Display → Screen timeout** → set to **Never** or maximum
6. Optional: enable **Developer Options → Stay awake** (keeps screen on while charging)

---

## Notes

- No API keys required for artwork or weather
- Artwork rotates every 30 minutes (configurable)
- Weather updates every 15 minutes (configurable)
- Works in both landscape and portrait orientation
- Always dark/museum mode — no light theme
