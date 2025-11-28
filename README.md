# MetaRipper

A lightweight, static web app for tracking competitor creative pulled from the Meta Ad Library. The page ships with the Real Money Gaming (RMG) categories and publishers from the provided targeting doc (Online Casino, Online Sportsbook, Sweepstakes/Social Casino, DFS) and supports adding or removing publishers on the fly.

## Usage

1. Copy `config.example.js` to `config.js` (git-ignored) and paste your Meta Graph API access token into `graphApiAccessToken`.
2. Open `index.html` in your browser (no build step required). The token will auto-load from `config.js` or you can paste it into the "Graph API access token" box (saved only in this tab's session storage).
3. In the "Ad Library creatives" panel, filter by industry, category, tag, or search to focus the grid and the ad query target.
4. Click any publisher name in the grid (or pick one from the dropdown) to fetch creatives from the Meta Ad Library with your token. The request uses `ad_active_status=ALL` and `ad_type=ALL` to avoid overly restrictive filters and will surface any Graph API error messages inline.
5. Use the "Add a publisher" form to insert new entries (optionally adding one or more comma-separated tags).
6. Remove publishers with the ✕ button or restore the default list with "Reset to defaults".

All publisher data is stored in localStorage so your edits persist between visits. Graph API tokens are never committed to the repo and, when entered in the UI, are scoped to the current browser tab.
