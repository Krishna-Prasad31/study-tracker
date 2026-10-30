# Studyspace — Study Tracker (corrected)

A local-first React + Vite study tracker. This version fixes the JSX syntax error in the Study Sessions history section and several state/search/date handling issues.

## Requirements
- Node.js 18 or newer
- npm

## Run on macOS
1. Extract `study-tracker-corrected.zip`.
2. Open the `study-tracker` folder in VS Code.
3. Open Terminal in that folder and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL Vite prints (usually `http://localhost:5173`).

## Included features
- Add, edit and delete subjects.
- Add, edit and delete chapters within subjects.
- Chapter status, priority, notes and target date.
- Subject and overall progress dashboard.
- Separate subject and chapter search fields.
- Study timer with pause/resume and session history.
- Daily study goal.
- Light/dark theme.
- JSON backup export.

## Data storage
This version stores data in browser local storage on this device and browser. It does not use MongoDB or a backend. Use **Settings → Export your data** to download a backup. Clearing browser data can erase the saved tracker data.

## Production build
```bash
npm run build
npm run preview
```
