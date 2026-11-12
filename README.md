# CWA landing (React + Vite)
1. Replace the placeholder files in `public/assets/` (about, achievements, graduation, teaching-photos, video) with your own, keeping the same file names. The video must be `video/lesson-preview.mp4`.
2. Paste `apps-script/Code.gs` into Apps Script, set `SPREADSHEET_ID`, deploy as Web app (Execute as Me, Anyone) and copy the `/exec` URL.
3. `cp .env.example .env` → set `VITE_META_PIXEL_ID` and `VITE_BOOKING_API`.
4. `npm i && npm run dev` / `npm run build` (deploy `dist/`).
Pixel events: PageView on load, Lead on a confirmed successful submit (value 500 EGP).
