# Living Art Frame

A museum-quality digital art display for tablets and desktops.  
Rotates artworks from the Art Institute of Chicago with an elegant clock, weather, and optional calendar.

---

## Files

```
index.html   — HTML shell
styles.css   — All styles
app.js       — Application logic
config.js    — Your configuration (edit this)
```

---

## Step-by-Step: Upload to GitHub & Deploy

### 1. Create a GitHub repository

1. Go to [github.com](https://github.com) → **New repository**
2. Name it something like `living-art-frame`
3. Set it to **Public**
4. Do **not** add a README (you have one already)
5. Click **Create repository**

---

### 2. Upload the files

#### Option A — GitHub web UI (easiest, no Git required)

1. Open your new repository on GitHub
2. Click **Add file → Upload files**
3. Drag and drop all 4 files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
4. Click **Commit changes**

#### Option B — Git command line

```bash
git clone https://github.com/YOUR_USERNAME/living-art-frame.git
cd living-art-frame
# copy your 4 files here
git add .
git commit -m "Initial deploy"
git push
```

---

### 3. Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)`
4. Click **Save**

GitHub will give you a URL like:  
`https://YOUR_USERNAME.github.io/living-art-frame/`

---

### 4. Host at your own domain (gaufgang.com/art)

Since you want to serve from `https://gaufgang.com/art`, you have two options:

#### Option A — Host files directly on your web server

Upload the 4 files to your server's `/art/` directory via FTP/SFTP:

```
public_html/
  art/
    index.html
    styles.css
    app.js
    config.js
```

That's it. Visit `https://gaufgang.com/art/` — done.

#### Option B — Use GitHub Pages + redirect/proxy

If you prefer GitHub Pages as the host, add a redirect in your web server config:

**Apache** (`.htaccess` at domain root):
```apache
RedirectMatch 301 ^/art/?$ https://YOUR_USERNAME.github.io/living-art-frame/
```

**Nginx**:
```nginx
location /art {
  return 301 https://YOUR_USERNAME.github.io/living-art-frame/;
}
```

---

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
