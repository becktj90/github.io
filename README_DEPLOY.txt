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

What’s in this version:
- Electrical Code: Branch Circuit Sizer, Transformer Package, Voltage Drop, Parallel Wire Gauge
- Power & 3-Phase: Power Triangle visualizer, 3-Phase Phasor Plotter, Harmonic Spectrum Viewer
- Electronics: Resistor Color Code, SMD Resistor Code, Series / Parallel Resistor Network, Voltage Divider, RC Filter Designer, LED Series Resistor, 555 Astable Timer, Op-Amp Gain Helper, Capacitor Code Decoder, Inductor Code Decoder, PCB Trace Width / Current, ADC / DAC Helper, Logic Gate Explorer
- Controls & PLC: Flex Logic Simulator, Ladder Logic Simulator with seal-in motor rung, timer, counter, and rung explanation
