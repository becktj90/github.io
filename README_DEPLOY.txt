EE TOOLBOX PRO - DEPLOY INSTRUCTIONS

Files:
- index.html
- style.css
- app.js

Quick local test:
1. Put all 3 files in the same folder.
2. Open index.html directly, or run:
   python3 -m http.server 8000
3. Visit http://localhost:8000

Vercel:
1. Create a new repo and add the 3 files to the repo root.
2. Import the repo into Vercel.
3. Framework preset: Other / no framework.
4. Build command: leave blank.
5. Output directory: leave blank.
6. Deploy.

Netlify:
1. Put the 3 files in a folder.
2. Drag that folder into Netlify Drop, or connect the repo.
3. No build settings required.

GitHub Pages:
1. Put the 3 files in the repo root.
2. In repo Settings -> Pages, deploy from the main branch root.
3. Save and wait for Pages to publish.

Notes:
- This is a fully static site.
- Saved tool inputs use browser localStorage.
- Export State downloads a JSON snapshot of the saved local data.
- NEC-related outputs are planning-level helpers and still require final verification.
