# MetaRipper

A lightweight, static web app for tracking competitor creative pulled from the Meta Ad Library. The page ships with the Real Money Gaming (RMG) categories and publishers from the provided targeting doc (Online Casino, Online Sportsbook, Sweepstakes/Social Casino, DFS) and supports adding or removing publishers on the fly.

## Usage

### Setup
- Copy `config.example.js` to `config.js` (git-ignored) and paste your Meta Graph API access token into `graphApiAccessToken`.
- Alternatively, paste your token directly into the "Graph API access token" box in the UI; it is stored only in this tab's session storage.
- Paste the raw token value only—do not prefix it with `Bearer`, surrounding quotes, or whitespace. Tokens that look like `code 190` errors often come from formatting issues or missing Ads Library/`ads_read` permissions.

### Fetch creatives
1. Open `index.html` in your browser (no build step required). Any token in `config.js` will be picked up automatically.
2. In the combined "Ad Library creatives" panel, narrow the view with industry, category, tag, or search filters—these filters also scope the ad fetch target.
3. Pick a publisher from the dropdown **or click a publisher name in the grid** to fetch creatives with your token. Requests use `ad_active_status=ALL` and `ad_type=ALL` and show any Graph API errors inline (unknown `code 1` responses usually mean the token is expired or lacks Ads Library permissions; `code 190` usually means the token format is wrong or the token is invalid).

### Manage publishers
1. Use the "Add a publisher" form to insert new entries (optionally adding one or more comma-separated tags).
2. Remove publishers with the ✕ button or restore the default list with "Reset to defaults".

Publisher data is stored in localStorage so your edits persist between visits. Graph API tokens are never committed to the repo.
