const THEME_KEY = 'engineer-reference-theme';
const SECTION_KEY = 'ee-pro-section';
const TOOL_KEY = 'ee-pro-tool';
const SAVE_KEY = 'engineer-reference-saved-tools';

const STANDARD_BREAKERS = [15,20,25,30,35,40,45,50,60,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,800,1000,1200,1600,2000];
const STANDARD_TRANSFORMERS = [3,5,7.5,10,15,25,30,37.5,45,50,75,100,112.5,150,167,225,300,500,750,1000,1500,2000,2500];
const COPPER_75 = [
  ['14 AWG',20],['12 AWG',25],['10 AWG',35],['8 AWG',50],['6 AWG',65],['4 AWG',85],['3 AWG',100],['2 AWG',115],['1 AWG',130],['1/0 AWG',150],['2/0 AWG',175],['3/0 AWG',200],['4/0 AWG',230],['250 kcmil',255],['300 kcmil',285],['350 kcmil',310],['400 kcmil',335],['500 kcmil',380],['600 kcmil',420],['700 kcmil',460],['750 kcmil',475],['800 kcmil',490],['1000 kcmil',545]
];
const EGC_TABLE = [
  [15,'14 AWG'],[20,'12 AWG'],[60,'10 AWG'],[100,'8 AWG'],[200,'6 AWG'],[300,'4 AWG'],[400,'3 AWG'],[500,'2 AWG'],[600,'1 AWG'],[800,'1/0 AWG'],[1000,'2/0 AWG'],[1200,'3/0 AWG'],[1600,'4/0 AWG'],[2000,'250 kcmil']
];
const CMIL = {
  '14 AWG': 4110, '12 AWG': 6530, '10 AWG': 10380, '8 AWG': 16510, '6 AWG': 26240, '4 AWG': 41740,
  '3 AWG': 52620, '2 AWG': 66360, '1 AWG': 83690, '1/0 AWG': 105600, '2/0 AWG': 133100, '3/0 AWG': 167800,
  '4/0 AWG': 211600, '250 kcmil': 250000, '300 kcmil': 300000, '350 kcmil': 350000, '400 kcmil': 400000,
  '500 kcmil': 500000, '600 kcmil': 600000, '700 kcmil': 700000, '750 kcmil': 750000, '800 kcmil': 800000,
  '1000 kcmil': 1000000
};
const RESISTOR_DIGIT = { black:0,brown:1,red:2,orange:3,yellow:4,green:5,blue:6,violet:7,gray:8,white:9 };
const MULTIPLIER = { black:1,brown:10,red:100,orange:1e3,yellow:1e4,green:1e5,blue:1e6,violet:1e7,gold:0.1,silver:0.01 };
const TOL = { brown:'±1%', red:'±2%', green:'±0.5%', blue:'±0.25%', violet:'±0.1%', gray:'±0.05%', gold:'±5%', silver:'±10%' };

const sections = [
  { id:'code', title:'Electrical Code', subtitle:'NEC-compliant sizing and field-ready circuit packages.', groups:[
      { id:'sizing', title:'Circuit & Transformer Sizing', tools:['branch-circuit','transformer-package','parallel-wire'] },
      { id:'path', title:'Path & Voltage Drop', tools:['voltage-drop'] }
    ]
  },
  { id:'power', title:'Power Systems', subtitle:'System conversions, phasors, and waveform analysis.', groups:[
      { id:'conversion', title:'Power & Phasors', tools:['power-triangle','phasor-plotter','harmonic-spectrum'] }
    ]
  },
  { id:'electronics', title:'Electronics', subtitle:'Component decoding, circuit helpers, and board-level design tools.', groups:[
      { id:'decoders', title:'Component Decoders', tools:['resistor-color','smd-code','capacitor-code','inductor-code'] },
      { id:'circuits', title:'Circuit & Signal Helpers', tools:['series-parallel','voltage-divider','rc-filter','led-resistor','timer-555','opamp-gain','adc-dac','pcb-trace'] }
    ]
  },
  { id:'controls', title:'Controls & PLC', subtitle:'Logic simulation, seal-in circuits, timers, counters, and troubleshooting views.', groups:[
      { id:'simulation', title:'Simulation Workbench', tools:['flex-logic','ladder-sim'] }
    ]
  },
  { id:'reference', title:'Reference', subtitle:'Saved work and practical engineering notes.', groups:[
      { id:'saved', title:'Saved Work', tools:['project-manager'] }
    ]
  },
  { id:'optimization', title:'Optimization', subtitle:'System sizing, demand optimization, and lifecycle cost analysis.', groups:[
      { id:'sizing', title:'Energy System Sizing', tools:['genset-battery-optimizer','transformer-tradeoff'] },
      { id:'dispatch', title:'Demand & Dispatch', tools:['peak-shaving-optimizer','load-scheduler'] },
      { id:'lifecycle', title:'Lifecycle Cost', tools:['conductor-lifecycle'] },
      { id:'scenarios', title:'Saved Scenarios', tools:['scenario-manager'] }
    ]
  }
];

const toolDefs = {
  'branch-circuit': { section:'code', title:'Branch Circuit Sizer', badge:'NEC-style package', what:'Packages continuous and noncontinuous load into a practical branch-circuit design result with conductor, breaker, and EGC suggestions.', why:'This mirrors the way people actually size circuits in the field: not just amps, but the whole package.', how:'Continuous load is counted at 125%, noncontinuous load is added directly, an optional spare margin is applied, then the next suitable copper conductor, breaker, and EGC are selected.', render: renderBranchCircuit },
  'transformer-package': { section:'code', title:'Transformer Package', badge:'Primary + secondary', what:'Builds a transformer sizing package from load data and shows primary and secondary currents with standard kVA selection.', why:'This turns load information into a practical transformer package rather than an isolated kVA number.', how:'The tool computes apparent power from volts and amps, selects the next standard transformer, then calculates primary and secondary current for the chosen phase and voltages.', render: renderTransformerPackage },
  'voltage-drop': { section:'code', title:'Voltage Drop + Chart', badge:'Visual', what:'Calculates feeder voltage drop and generates a simple visual bar showing source, drop, and delivered voltage.', why:'A quick visual makes it obvious whether the run is comfortably acceptable or getting marginal.', how:'The tool uses standard single-phase or three-phase copper voltage-drop equations and plots the result as proportional bars.', render: renderVoltageDrop },
  'power-triangle': { section:'power', title:'Power Triangle', badge:'SVG plot', what:'Turns kW and power factor into kVA, kVAR, and a power triangle graphic.', why:'It makes real, reactive, and apparent power intuitive for troubleshooting and design.', how:'The tool computes apparent power from kW and PF, then derives reactive power with the Pythagorean relationship and draws the triangle.', render: renderPowerTriangle },
  'phasor-plotter': { section:'power', title:'3-Phase Phasor Plotter', badge:'SVG plot', what:'Draws balanced three-phase voltage phasors with user-set magnitude and phase sequence.', why:'A fast phasor picture helps people understand rotation, phase displacement, and where measurements should land.', how:'Each phase is placed 120 electrical degrees apart from the reference and rendered as a vector from the center point.', render: renderPhasorPlotter },
  'harmonic-spectrum': { section:'power', title:'Harmonic Spectrum Viewer', badge:'THD', what:'Plots harmonic magnitudes and calculates THD from user-entered harmonic percentages.', why:'Nonlinear loads are easier to reason through when the distortion is visible instead of buried in a list.', how:'The spectrum is rendered as bars for the fundamental and selected harmonics. THD is calculated from the RMS sum of harmonic percentages relative to the fundamental.', render: renderHarmonicSpectrum },
  'resistor-color': { section:'electronics', title:'Resistor Color Code', badge:'Decoder', what:'Converts 4-band resistor colors into resistance and tolerance.', why:'It is a fast identity check when bench parts are loose or labels are gone.', how:'The first two bands form the significant digits, the third band is the multiplier, and the fourth band sets tolerance.', render: renderResistorColor },
  'smd-code': { section:'electronics', title:'SMD Resistor Code', badge:'Decoder', what:'Decodes common 3-digit and 4-digit SMD resistor markings.', why:'SMD markings are easy to misread, so a direct decoder saves time and wrong-part errors.', how:'For standard numeric codes, the last digit is treated as the power-of-ten multiplier. Codes with R are treated as decimal resistances.', render: renderSmdCode },
  'series-parallel': { section:'electronics', title:'Series / Parallel Resistors', badge:'Network', what:'Calculates equivalent resistance for lists of resistor values in series or parallel.', why:'This is one of the fastest ways to rough in substitutions or prototype around missing parts.', how:'Series values sum directly. Parallel values use the reciprocal-sum relationship.', render: renderSeriesParallel },
  'voltage-divider': { section:'electronics', title:'Voltage Divider', badge:'Bench basic', what:'Calculates divider output, branch current, and resistor power dissipation.', why:'It is one of the most common small-signal design blocks and a constant bench calculation.', how:'The output is Vin × R2 / (R1 + R2). Current is Vin / (R1 + R2), then resistor dissipation is I²R.', render: renderVoltageDivider },
  'rc-filter': { section:'electronics', title:'RC Filter Designer', badge:'Low-pass / high-pass', what:'Designs a first-order RC filter from target cutoff and either R or C.', why:'It provides a quick path from bandwidth intent to actual component values.', how:'The cutoff relationship f_c = 1 / (2πRC) is rearranged to solve for the unknown component.', render: renderRcFilter },
  'led-resistor': { section:'electronics', title:'LED Series Resistor', badge:'Current limiter', what:'Sizes a current-limiting resistor for one or more LEDs.', why:'It prevents overdriving LEDs and gives a more realistic current estimate for strings.', how:'The resistor is (Vsupply − total LED forward voltage) / I. Power is I²R, with a recommended preferred-value rounding.', render: renderLedResistor },
  'timer-555': { section:'electronics', title:'555 Astable Timer', badge:'Timing', what:'Calculates frequency and duty cycle for a standard astable 555 network.', why:'This makes quick oscillator and blink-rate setup much faster.', how:'The tool uses the classic 555 astable equations based on RA, RB, and C.', render: render555 },
  'opamp-gain': { section:'electronics', title:'Op-Amp Gain Helper', badge:'Inverting / non-inverting', what:'Calculates closed-loop gain and output estimate for inverting or non-inverting op-amp stages.', why:'It helps with quick signal-conditioning decisions before deeper simulation.', how:'The gain equations use the standard resistor ratios for the chosen topology, then multiply by the input signal to estimate output.', render: renderOpamp },
  'capacitor-code': { section:'electronics', title:'Capacitor Code Decoder', badge:'Decoder', what:'Decodes 3-digit capacitor markings into capacitance and estimates common unit conversions.', why:'Small capacitors are often marked compactly, so decoding needs to be immediate.', how:'The first two digits are the significant figures and the third digit is the multiplier in pF.', render: renderCapCode },
  'inductor-code': { section:'electronics', title:'Inductor Code Decoder', badge:'Decoder', what:'Decodes common 2-digit + multiplier inductor markings into inductance.', why:'It speeds up bench work when magnetics markings are cryptic or abbreviated.', how:'The first two digits are significant figures and the third is the base-10 multiplier in µH-like code style.', render: renderIndCode },
  'pcb-trace': { section:'electronics', title:'PCB Trace Width / Current', badge:'Board-level', what:'Estimates PCB trace current from width and copper weight, or the required width for a target current and temperature rise.', why:'This is a high-value practical layout check for power distribution on boards.', how:'It uses a simplified IPC-2221-style relationship for external traces as an estimate, not a compliance-grade replacement for detailed layout analysis.', render: renderPcbTrace },
  'adc-dac': { section:'electronics', title:'ADC / DAC Helper', badge:'Sample / scale', what:'Converts between digital codes and analog voltages for ADC/DAC ranges, showing full-scale and step resolution.', why:'This is useful when interfacing sensors and actuators to microcontrollers or data-acquisition hardware.', how:'It scales the chosen reference voltage and resolution to compute analog value from code or code from analog voltage, with step size and full-scale range.', render: renderAdcDac },
  'logic-gates': { section:'electronics', title:'Logic Gate Explorer', badge:'Boolean', what:'Shows basic combinational logic gates and a truth table for quick gate-level reasoning.', why:'It helps when designing small logic blocks or debugging gate conditions before moving into HDL or ladder logic.', how:'The tool evaluates standard gates for inputs A and B, then highlights the resulting outputs in a compact truth table.', render: renderLogicGate },
  'parallel-wire': { section:'code', title:'Parallel Wire Gauge', badge:'Equivalent area', what:'Calculates equivalent circular-mil area for parallel conductors and suggests a nearest standard single conductor.', why:'Parallel runs are much easier to compare when converted back to an equivalent conductor size.', how:'The individual conductor circular-mil area is multiplied by the number of parallels, then compared against standard conductor areas.', render: renderParallelWire },
  'flex-logic': { section:'controls', title:'Flex Logic Simulator', badge:'Function-block style', what:'Builds a practical permissive chain from live input bits and shows the resulting output and Boolean expression.', why:'This makes control logic easier to reason about without needing a full PLC project.', how:'The output is evaluated from a permissive chain with mode, e-stop, overload, start, and auto demand conditions. The explanation updates in plain English.', render: renderFlexLogic },
  'ladder-sim': { section:'controls', title:'Ladder Logic Simulator', badge:'Canvas + timer/counter', what:'Provides an editable ladder training bench with contacts, TON timing, a CTU-style counter, rung power highlighting, and plain-English rung explanations.', why:'It gives you something closer to actual controls troubleshooting than static truth tables.', how:'Each scan evaluates rung continuity, updates a seal-in motor coil, advances a TON timer when its rung is true, increments a counter on rising edges, then redraws the ladder and state table.', render: renderLadderSim },
  'project-manager': { section:'reference', title:'Project Manager', badge:'Local save', what:'Lets you inspect, reload, and clear locally saved tool states.', why:'Iteration matters. Saved inputs make the site feel like a real workstation rather than a disposable calculator page.', how:'Each tool can store its current inputs under its own key in localStorage. This page shows what is available and lets you export or clear it.', render: renderProjectManager },
  'genset-battery-optimizer': { section:'optimization', title:'Generator + Battery Optimizer', badge:'System design', what:'Recommends optimal generator and battery sizes based on load profile, operating strategy, and cost targets.', why:'Right-sizing a hybrid power system minimizes capital cost and fuel usage while meeting reliability needs.', how:'The tool evaluates load requirements, calculates dispatch strategy, estimates runtime behavior, and compares total lifecycle cost for different sizing options.', render: renderGensetBatteryOptimizer },
  'peak-shaving-optimizer': { section:'optimization', title:'Peak Shaving Optimizer', badge:'Demand reduction', what:'Shows how much a battery can reduce peak demand and estimated savings from lower demand charges.', why:'Peak shaving reduces expensive demand charges and equipment stress without oversizing the power supply.', how:'Simulates battery charging during low-demand windows and discharge during peaks, calculating cost impact of the reduced demand level.', render: renderPeakShavingOptimizer },
  'conductor-lifecycle': { section:'optimization', title:'Conductor Lifecycle Cost', badge:'Economics', what:'Compares conductor sizes by total ownership cost, balancing copper cost against ongoing power loss cost.', why:'Larger conductors cost more upfront but save money in reduced losses over decades of operation.', how:'Calculates I²R losses, projects lifetime loss cost at current energy prices, and recommends the economically optimal conductor size.', render: renderConductorLifecycle },
  'transformer-tradeoff': { section:'optimization', title:'Transformer Tradeoff', badge:'Sizing guide', what:'Evaluates transformer sizing options, showing the tradeoff between cost, efficiency, and loading margin.', why:'Oversizing adds cost but improves efficiency and spare capacity; undersizing risks overheating and poor efficiency.', how:'Calculates loading percentage, efficiency loss, and lifecycle cost for each standard transformer kVA option.', render: renderTransformerTradeoff },
  'load-scheduler': { section:'optimization', title:'Load Scheduler', badge:'Coming soon', what:'Optimizes when flexible loads can run to minimize demand and energy costs.', why:'Shifting load to off-peak hours can significantly reduce operating costs.', how:'Evaluates flexible load windows against energy price signals and constraint limits.', render: renderLoadScheduler },
  'scenario-manager': { section:'optimization', title:'Scenario Manager', badge:'Compare & export', what:'Save, compare, and export optimization scenarios for reporting and decision-making.', why:'Engineering decisions often require comparing multiple scenarios side-by-side.', how:'Lets you save results from any optimization tool, tag them with notes, and generate comparison reports.', render: renderScenarioManager }
};

let activeTheme = load(THEME_KEY, 'blueprint');
let activeSection = load(SECTION_KEY, sections[0].id);
let activeGroup = load('ee-pro-group', sections[0].groups[0].id);
let activeTool = load(TOOL_KEY, sections[0].groups[0].tools[0]);
const reportState = [];
const ladderState = { coil:false, timerAcc:0, timerDone:false, count:0, lastCountIn:false, lastStart:false, bits:{ start:false, stop:false, ol:false, auto:false, demand:false, reset:false } };
const optimizationStates = {};

function $(id){ return document.getElementById(id); }
function load(key, fallback){ return localStorage.getItem(key) || fallback; }
function save(key, val){ localStorage.setItem(key, val); }
function getSavedState(){ try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; } }
function setSavedState(obj){ localStorage.setItem(SAVE_KEY, JSON.stringify(obj)); updateSavedCount(); }
function saveToolState(toolId, state){ const all = getSavedState(); all[toolId] = { ...state, savedAt: new Date().toISOString() }; setSavedState(all); }
function loadToolState(toolId){ return getSavedState()[toolId] || null; }
function clearToolState(toolId){ const all = getSavedState(); delete all[toolId]; setSavedState(all); }
function updateSavedCount(){ $('savedCount').textContent = Object.keys(getSavedState()).length; }
function fmt(n,d=2){ return Number.isFinite(n) ? Number(n).toFixed(d).replace(/\.0+$|(?<=\..*[1-9])0+$/,'') : '-'; }
function nearestBreaker(a){ return STANDARD_BREAKERS.find(v => v >= a) || STANDARD_BREAKERS.at(-1); }
function nearestTransformer(kva){ return STANDARD_TRANSFORMERS.find(v => v >= kva) || STANDARD_TRANSFORMERS.at(-1); }
function nearestConductor(a){ return COPPER_75.find(([,amps]) => amps >= a) || COPPER_75.at(-1); }
function egcForBreaker(b){ return EGC_TABLE.find(([max]) => b <= max)?.[1] || EGC_TABLE.at(-1)[1]; }
function describeOhms(ohms){ if (!Number.isFinite(ohms)) return '-'; const a=Math.abs(ohms); if (a>=1e6) return `${fmt(ohms/1e6,3)} MΩ`; if (a>=1e3) return `${fmt(ohms/1e3,3)} kΩ`; return `${fmt(ohms,3)} Ω`; }
function describeCap(f){ if (!Number.isFinite(f)) return '-'; const a=Math.abs(f); if (a>=1e-3) return `${fmt(f*1e3,3)} mF`; if (a>=1e-6) return `${fmt(f*1e6,3)} µF`; if (a>=1e-9) return `${fmt(f*1e9,3)} nF`; return `${fmt(f*1e12,3)} pF`; }
function describeKw(kw){ return `${fmt(kw,1)} kW`; }
function describeKwh(kwh){ return `${fmt(kwh,1)} kWh`; }
function getSection(id){ return sections.find(s=>s.id===id) || sections[0]; }
function getGroup(section, id){ return section.groups.find(g=>g.id===id) || section.groups[0]; }
function findToolGroup(toolId){ for (const section of sections){ for (const group of section.groups){ if (group.tools.includes(toolId)) return { section: section.id, group: group.id }; }} return { section: sections[0].id, group: sections[0].groups[0].id }; }
function report(name, summary){ reportState.unshift({name, summary, ts:new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}); reportState.splice(10); renderReport(); }
function renderReport(){ $('reportList').innerHTML = reportState.length ? reportState.map(item => `<div class="report-item"><strong>${escapeHtml(item.name)}</strong><div>${escapeHtml(item.summary)}</div><div class="muted">${item.ts}</div></div>`).join('') : '<div class="report-item">Run a tool to populate the session ledger.</div>'; }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function setTheme(theme){ activeTheme = theme; document.body.dataset.theme = theme === 'retro' ? 'retro' : 'blueprint'; save(THEME_KEY, activeTheme); }
function setSection(id){ const sec = getSection(id); activeSection = sec.id; activeGroup = getGroup(sec, activeGroup).id; const group = getGroup(sec, activeGroup); if (!group.tools.includes(activeTool)) activeTool = group.tools[0]; save(SECTION_KEY, activeSection); save('ee-pro-group', activeGroup); save(TOOL_KEY, activeTool); renderAll(); }
function setGroup(id){ const sec = getSection(activeSection); const group = getGroup(sec, id); activeGroup = group.id; if (!group.tools.includes(activeTool)) activeTool = group.tools[0]; save('ee-pro-group', activeGroup); save(TOOL_KEY, activeTool); renderAll(); }
function setTool(id){ if (!toolDefs[id]) return; const found = findToolGroup(id); activeTool = id; activeSection = found.section; activeGroup = found.group; save(SECTION_KEY, activeSection); save('ee-pro-group', activeGroup); save(TOOL_KEY, activeTool); renderAll(); }

function renderNav(){
  $('sectionNav').innerHTML = sections.map(sec => `<button class="section-btn ${sec.id===activeSection?'active':''}" data-section="${sec.id}">${sec.title}<small>${sec.groups.reduce((sum,group)=>sum+group.tools.length,0)} tools</small></button>`).join('');
  const sec = getSection(activeSection);
  const group = getGroup(sec, activeGroup);
  $('groupNav').innerHTML = sec.groups.map(gr => `<button class="section-btn ${gr.id===activeGroup?'active':''}" data-group="${gr.id}">${gr.title}<small>${gr.tools.length} tools</small></button>`).join('');
  const searchTerm = $('toolSearch')?.value.trim().toLowerCase() || '';
  let tools = group.tools;
  if (searchTerm) {
    tools = sec.groups.flatMap(g => g.tools).filter(id => {
      const tool = toolDefs[id];
      return tool.title.toLowerCase().includes(searchTerm) || tool.what.toLowerCase().includes(searchTerm) || tool.badge.toLowerCase().includes(searchTerm);
    });
  }
  $('toolNav').innerHTML = tools.map(id => `<button class="tool-btn ${id===activeTool?'active':''}" data-tool="${id}">${toolDefs[id].title}<small>${toolDefs[id].badge}</small></button>`).join('');
  $('toolCount').textContent = Object.keys(toolDefs).length;
  $('sectionTitle').textContent = sec.title;
  $('sectionSubtitle').textContent = sec.subtitle;
  $('toolFamilyTag').textContent = sec.title;
  document.querySelectorAll('[data-section]').forEach(btn => btn.onclick = () => setSection(btn.dataset.section));
  document.querySelectorAll('[data-group]').forEach(btn => btn.onclick = () => setGroup(btn.dataset.group));
  document.querySelectorAll('[data-tool]').forEach(btn => btn.onclick = () => setTool(btn.dataset.tool));
}

function renderAll(){
  renderNav();
  const tool = toolDefs[activeTool];
  $('toolTitle').textContent = tool.title;
  $('toolBadge').textContent = tool.badge;
  $('toolWhat').textContent = tool.what;
  $('toolWhy').textContent = tool.why;
  $('toolHow').textContent = tool.how;
  tool.render();
  renderReport();
  updateSavedCount();
}

function mountTwoCol(inputHtml, outputHtml){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">${inputHtml}</div><div class="output-card">${outputHtml}</div></div>`;
}
function addSaveLoadBar(toolId, collect, apply){
  const wrap = document.createElement('div');
  wrap.className = 'actions';
  wrap.innerHTML = `<button class="secondary-btn" type="button">Save Inputs</button><button class="secondary-btn" type="button">Load Saved</button><button class="secondary-btn" type="button">Clear Saved</button>`;
  const [saveBtn, loadBtn, clearBtn] = wrap.querySelectorAll('button');
  saveBtn.onclick = () => { saveToolState(toolId, collect()); report(toolDefs[toolId].title, 'Inputs saved locally'); };
  loadBtn.onclick = () => { const state = loadToolState(toolId); if (state) apply(state); report(toolDefs[toolId].title, state ? 'Loaded saved inputs' : 'No saved inputs found'); };
  clearBtn.onclick = () => { clearToolState(toolId); report(toolDefs[toolId].title, 'Saved inputs cleared'); };
  return wrap;
}

function renderBranchCircuit(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Continuous load (A)</label><input id="bcCont" type="number" value="48"></div>
      <div><label>Noncontinuous load (A)</label><input id="bcNon" type="number" value="12"></div>
      <div><label>Spare margin (%)</label><input id="bcMargin" type="number" value="10"></div>
      <div><label>Voltage (V)</label><input id="bcVolt" type="number" value="480"></div>
    </div>
    <div class="actions"><button id="bcRun" class="primary-btn">Size Branch Circuit</button></div>
    <div class="note">Planning-level NEC-style helper. Verify the adopted code edition, conductor insulation, temperature correction, conductor count adjustment, and motor-specific exceptions before issuing for construction.</div>
  `, `
    <div id="bcResult" class="result-box">Run the tool to build a practical branch-circuit package.</div>
  `);
  const collect = () => ({ cont: $('bcCont').value, non: $('bcNon').value, margin: $('bcMargin').value, volt: $('bcVolt').value });
  const apply = (s) => { $('bcCont').value=s.cont||''; $('bcNon').value=s.non||''; $('bcMargin').value=s.margin||''; $('bcVolt').value=s.volt||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('branch-circuit', collect, apply));
  $('bcRun').onclick = () => {
    const cont = +$('bcCont').value || 0, non = +$('bcNon').value || 0, margin = (+$('bcMargin').value || 0)/100;
    const design = (cont*1.25 + non)*(1+margin);
    const [cond, condAmp] = nearestConductor(design);
    const breaker = nearestBreaker(design);
    const egc = egcForBreaker(breaker);
    $('bcResult').textContent = `Design current: ${fmt(design,1)} A\nSuggested copper conductor: ${cond} (${condAmp} A @ 75°C)\nSuggested standard breaker: ${breaker} A\nEquipment grounding conductor: ${egc}\n\nReasoning\n- Continuous load at 125%: ${fmt(cont*1.25,1)} A\n- Noncontinuous load: ${fmt(non,1)} A\n- Spare margin: ${fmt(margin*100,0)}%\n- Voltage reference: ${fmt(+$('bcVolt').value || 0,0)} V`;
    report('Branch Circuit Sizer', `${fmt(design,1)} A design, ${cond}, ${breaker} A breaker`);
  };
}

function renderTransformerPackage(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Phase</label><select id="xfPhase"><option value="3">3-phase</option><option value="1">1-phase</option></select></div>
      <div><label>Load voltage (V)</label><input id="xfLoadV" type="number" value="208"></div>
      <div><label>Load current (A)</label><input id="xfLoadI" type="number" value="180"></div>
      <div><label>Power factor</label><input id="xfPf" type="number" step="0.01" value="0.92"></div>
      <div><label>Primary voltage (V)</label><input id="xfPriV" type="number" value="480"></div>
      <div><label>Secondary voltage (V)</label><input id="xfSecV" type="number" value="208"></div>
    </div>
    <div class="actions"><button id="xfRun" class="primary-btn">Build Package</button></div>
    <div class="note">This is intentionally fast and practical. Confirm overcurrent rules, inrush allowances, and conductor termination limits before treating it as final design.</div>
  `, `<div id="xfResult" class="result-box">Run the tool to estimate transformer size and both-side currents.</div>`);
  const collect = () => ({ phase:$('xfPhase').value, lv:$('xfLoadV').value, li:$('xfLoadI').value, pf:$('xfPf').value, pri:$('xfPriV').value, sec:$('xfSecV').value });
  const apply = (s) => { $('xfPhase').value=s.phase||'3'; $('xfLoadV').value=s.lv||''; $('xfLoadI').value=s.li||''; $('xfPf').value=s.pf||''; $('xfPriV').value=s.pri||''; $('xfSecV').value=s.sec||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('transformer-package', collect, apply));
  $('xfRun').onclick = () => {
    const phase = +$('xfPhase').value, lv = +$('xfLoadV').value||0, li=+$('xfLoadI').value||0, pf=Math.max(0.1, Math.min(1, +$('xfPf').value || 1));
    const pri = +$('xfPriV').value||0, sec = +$('xfSecV').value||0;
    const kva = phase===3 ? Math.sqrt(3)*lv*li/1000 : lv*li/1000;
    const kw = kva*pf;
    const std = nearestTransformer(kva);
    const priI = phase===3 ? std*1000/(Math.sqrt(3)*pri) : std*1000/pri;
    const secI = phase===3 ? std*1000/(Math.sqrt(3)*sec) : std*1000/sec;
    const priB = nearestBreaker(priI*1.25), secB = nearestBreaker(secI*1.25);
    $('xfResult').textContent = `Estimated load: ${fmt(kva,2)} kVA (${fmt(kw,2)} kW at PF ${fmt(pf,2)})\nSuggested standard transformer: ${fmt(std,1)} kVA\nPrimary current at ${fmt(pri,0)} V: ${fmt(priI,1)} A\nSecondary current at ${fmt(sec,0)} V: ${fmt(secI,1)} A\nSuggested primary breaker: ${priB} A\nSuggested secondary breaker: ${secB} A\n\nReasoning\n- Apparent power was computed from volts and amps\n- Standard size rounded up to the next common transformer rating\n- Primary and secondary currents are based on the selected standard size`;
    report('Transformer Package', `${fmt(std,1)} kVA, ${fmt(priI,1)} A primary, ${fmt(secI,1)} A secondary`);
  };
}

function renderVoltageDrop(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Phase</label><select id="vdPhase"><option value="1">Single-phase</option><option value="3" selected>Three-phase</option></select></div>
      <div><label>Current (A)</label><input id="vdI" type="number" value="120"></div>
      <div><label>System voltage (V)</label><input id="vdV" type="number" value="480"></div>
      <div><label>One-way length (ft)</label><input id="vdL" type="number" value="250"></div>
      <div><label>Conductor size</label><select id="vdWire">${Object.keys(CMIL).map(k=>`<option ${k==='3/0 AWG'?'selected':''}>${k}</option>`).join('')}</select></div>
      <div><label>Material constant K</label><select id="vdK"><option value="12.9">Copper</option><option value="21.2">Aluminum</option></select></div>
    </div>
    <div class="actions"><button id="vdRun" class="primary-btn">Calculate Voltage Drop</button></div>
  `, `<div id="vdResult" class="result-box">Run the tool to calculate drop and generate the bar chart.</div><div class="chart-wrap"><svg id="vdChart" viewBox="0 0 560 150"></svg></div>`);
  const collect = () => ({ phase:$('vdPhase').value, i:$('vdI').value, v:$('vdV').value, l:$('vdL').value, wire:$('vdWire').value, k:$('vdK').value });
  const apply = (s) => { $('vdPhase').value=s.phase||'3'; $('vdI').value=s.i||''; $('vdV').value=s.v||''; $('vdL').value=s.l||''; $('vdWire').value=s.wire||'3/0 AWG'; $('vdK').value=s.k||'12.9'; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('voltage-drop', collect, apply));
  $('vdRun').onclick = () => {
    const phase = +$('vdPhase').value, i=+$('vdI').value||0, v=+$('vdV').value||0, l=+$('vdL').value||0, k=+$('vdK').value||12.9, cma=CMIL[$('vdWire').value] || 1;
    const factor = phase===3 ? Math.sqrt(3) : 2;
    const drop = factor*k*i*l/cma;
    const pct = v ? 100*drop/v : 0;
    const delivered = v - drop;
    $('vdResult').textContent = `Voltage drop: ${fmt(drop,2)} V\nPercent drop: ${fmt(pct,2)}%\nDelivered voltage: ${fmt(delivered,2)} V\n\nReasoning\n- Equation factor: ${phase===3?'√3 for 3-phase':'2 for single-phase'}\n- K constant: ${fmt(k,1)}\n- Circular-mil area: ${cma.toLocaleString()} cmil`;
    const svg = $('vdChart');
    const w=560, x=30, max=v || 1, sourceW = 480*(v/max), dropW = 480*(Math.max(drop,0)/max), delW = 480*(Math.max(delivered,0)/max);
    svg.innerHTML = `
      <rect x="${x}" y="25" width="480" height="28" rx="10" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.1)"/>
      <rect x="${x}" y="25" width="${Math.max(sourceW,1)}" height="28" rx="10" fill="rgba(103,214,255,.55)"/>
      <rect x="${x}" y="74" width="480" height="28" rx="10" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.1)"/>
      <rect x="${x}" y="74" width="${Math.max(delW,1)}" height="28" rx="10" fill="rgba(94,241,195,.55)"/>
      <rect x="${x + Math.max(delW,0)}" y="74" width="${Math.max(dropW,1)}" height="28" rx="10" fill="rgba(255,211,110,.75)"/>
      <text x="${x}" y="20" fill="currentColor" font-size="13">Source voltage: ${fmt(v,1)} V</text>
      <text x="${x}" y="69" fill="currentColor" font-size="13">Delivered voltage: ${fmt(delivered,1)} V</text>
      <text x="${x+6}" y="44" fill="#08111a" font-size="12">Source</text>
      <text x="${x+6}" y="93" fill="#08111a" font-size="12">Load</text>
      <text x="${x + Math.max(delW + 8, 140)}" y="93" fill="currentColor" font-size="12">Drop ${fmt(drop,2)} V</text>`;
    report('Voltage Drop', `${fmt(drop,2)} V (${fmt(pct,2)}%), delivered ${fmt(delivered,1)} V`);
  };
}

function renderPowerTriangle(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Real power kW</label><input id="ptKW" type="number" value="45"></div>
      <div><label>Power factor</label><input id="ptPF" type="number" step="0.01" value="0.86"></div>
    </div>
    <div class="actions"><button id="ptRun" class="primary-btn">Generate Triangle</button></div>
  `, `<div id="ptResult" class="result-box">Run the tool to compute kVA, kVAR, and draw the triangle.</div><div class="chart-wrap"><svg id="ptSvg" viewBox="0 0 420 280"></svg></div>`);
  $('ptRun').onclick = () => {
    const kw = +$('ptKW').value||0, pf = Math.max(0.01, Math.min(1, +$('ptPF').value || 1));
    const kva = kw/pf;
    const kvar = Math.sqrt(Math.max(kva*kva - kw*kw, 0));
    const angle = Math.acos(pf) * 180 / Math.PI;
    $('ptResult').textContent = `kVA: ${fmt(kva,2)}\nkVAR: ${fmt(kvar,2)}\nPhase angle: ${fmt(angle,2)}°\n\nReasoning\n- kVA = kW / PF\n- kVAR = √(kVA² − kW²)`;
    const max = Math.max(kva, kw, kvar, 1), sx = 250/max, sy = 190/max; const base = kw*sx, vert = kvar*sy;
    $('ptSvg').innerHTML = `
      <line x1="50" y1="230" x2="370" y2="230" stroke="rgba(255,255,255,.2)"/>
      <line x1="50" y1="40" x2="50" y2="230" stroke="rgba(255,255,255,.2)"/>
      <polyline points="50,230 ${50+base},230 ${50+base},${230-vert} 50,230" fill="rgba(103,214,255,.12)" stroke="rgba(103,214,255,.8)" stroke-width="3"/>
      <text x="${55+base/2}" y="248" fill="currentColor">P = ${fmt(kw,1)} kW</text>
      <text x="${58+base}" y="${225-vert/2}" fill="currentColor">Q = ${fmt(kvar,1)} kVAR</text>
      <text x="${55+base/2}" y="${210-vert/2}" fill="currentColor">S = ${fmt(kva,1)} kVA</text>
      <text x="82" y="210" fill="currentColor">θ = ${fmt(angle,1)}°</text>`;
    report('Power Triangle', `${fmt(kw,1)} kW, ${fmt(kva,1)} kVA, ${fmt(kvar,1)} kVAR`);
  };
}

function renderPhasorPlotter(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Phase-to-phase voltage</label><input id="phV" type="number" value="480"></div>
      <div><label>Sequence</label><select id="phSeq"><option value="abc">ABC</option><option value="acb">ACB</option></select></div>
      <div><label>Reference angle A (deg)</label><input id="phAng" type="number" value="0"></div>
    </div>
    <div class="actions"><button id="phRun" class="primary-btn">Draw Phasors</button></div>
  `, `<div id="phResult" class="result-box">Run the tool to draw balanced three-phase phasors.</div><div class="chart-wrap"><svg id="phSvg" viewBox="0 0 420 320"></svg></div>`);
  $('phRun').onclick = () => {
    const v = +$('phV').value||0, seq=$('phSeq').value, a0=(+$('phAng').value||0)*Math.PI/180;
    const order = seq==='abc' ? [0,-120,120] : [0,120,-120];
    const names = ['A','B','C']; const colors = ['rgba(103,214,255,.9)','rgba(94,241,195,.9)','rgba(255,211,110,.9)'];
    const cx=210, cy=160, r=110; let ph=[];
    for(let i=0;i<3;i++){ const ang=a0+order[i]*Math.PI/180; ph.push({x:cx+r*Math.cos(ang), y:cy-r*Math.sin(ang), ang:order[i]}); }
    $('phSvg').innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.12)"/>
      <line x1="${cx-r-10}" y1="${cy}" x2="${cx+r+10}" y2="${cy}" stroke="rgba(255,255,255,.12)"/>
      <line x1="${cx}" y1="${cy-r-10}" x2="${cx}" y2="${cy+r+10}" stroke="rgba(255,255,255,.12)"/>
      ${ph.map((p,i)=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${colors[i]}" stroke-width="4"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="${colors[i]}"/><text x="${p.x+8}" y="${p.y-8}" fill="currentColor">${names[i]}</text>`).join('')}`;
    $('phResult').textContent = `Balanced phasors drawn for ${fmt(v,0)} V ${seq.toUpperCase()} sequence\nPhase A angle: ${fmt((+$('phAng').value||0),1)}°\nPhase spacing: 120° electrical\n\nReasoning\n- Balanced systems place each phase vector 120° apart\n- Sequence changes the rotation direction of B and C`;
    report('3-Phase Phasor Plotter', `${fmt(v,0)} V, ${seq.toUpperCase()} sequence`);
  };
}

function renderHarmonicSpectrum(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Fundamental %</label><input id="h1" type="number" value="100"></div>
      <div><label>3rd %</label><input id="h3" type="number" value="18"></div>
      <div><label>5th %</label><input id="h5" type="number" value="26"></div>
      <div><label>7th %</label><input id="h7" type="number" value="14"></div>
      <div><label>9th %</label><input id="h9" type="number" value="8"></div>
      <div><label>11th %</label><input id="h11" type="number" value="5"></div>
      <div><label>13th %</label><input id="h13" type="number" value="3"></div>
    </div>
    <div class="actions"><button id="hRun" class="primary-btn">Plot Spectrum</button></div>
  `, `<div id="hResult" class="result-box">Run the tool to compute THD and generate the spectrum.</div><div class="chart-wrap"><svg id="hSvg" viewBox="0 0 520 250"></svg></div>`);
  $('hRun').onclick = () => {
    const data = [1,3,5,7,9,11,13].map(n => [n, +$(`h${n}`).value || 0]);
    const thd = Math.sqrt(data.slice(1).reduce((s,[,v])=>s+v*v,0));
    $('hResult').textContent = `THD: ${fmt(thd,2)}%\nDominant harmonic: ${data.slice(1).sort((a,b)=>b[1]-a[1])[0][0]}th\n\nReasoning\n- THD is the RMS sum of harmonic percentages relative to the fundamental\n- The spectrum is a quick fingerprint of nonlinear loading`;
    const max = Math.max(...data.map(([,v])=>v), 100); const svg=$('hSvg');
    svg.innerHTML = data.map(([n,v],i)=>{
      const x = 40 + i*65, h = 170*(v/max), y = 210-h;
      return `<rect x="${x}" y="${y}" width="36" height="${h}" rx="7" fill="rgba(${n===1?'103,214,255':'255,211,110'},${n===1?'.7':'.72'})"/><text x="${x+7}" y="228" fill="currentColor">${n}</text><text x="${x+2}" y="${Math.max(y-8,18)}" fill="currentColor" font-size="12">${fmt(v,0)}%</text>`;
    }).join('') + `<line x1="24" y1="210" x2="500" y2="210" stroke="rgba(255,255,255,.16)"/><text x="24" y="18" fill="currentColor">THD ${fmt(thd,2)}%</text>`;
    report('Harmonic Spectrum', `THD ${fmt(thd,2)}%, dominant ${data.slice(1).sort((a,b)=>b[1]-a[1])[0][0]}th`);
  };
}

function renderResistorColor(){
  const colors = Object.keys(RESISTOR_DIGIT);
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Band 1</label><select id="rB1">${colors.map(c=>`<option ${c==='yellow'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Band 2</label><select id="rB2">${colors.map(c=>`<option ${c==='violet'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Multiplier</label><select id="rB3">${Object.keys(MULTIPLIER).map(c=>`<option ${c==='red'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Tolerance</label><select id="rB4">${Object.keys(TOL).map(c=>`<option ${c==='gold'?'selected':''}>${c}</option>`).join('')}</select></div>
    </div>
    <div class="actions"><button id="rRun" class="primary-btn">Decode</button></div>
  `, `<div id="rResult" class="result-box">Run the tool to decode the resistor bands.</div>`);
  $('rRun').onclick = () => {
    const value = (RESISTOR_DIGIT[$('rB1').value]*10 + RESISTOR_DIGIT[$('rB2').value]) * MULTIPLIER[$('rB3').value];
    const tol = TOL[$('rB4').value] || 'n/a';
    $('rResult').textContent = `Nominal value: ${describeOhms(value)}\nTolerance: ${tol}\n\nReasoning\n- Digits: ${RESISTOR_DIGIT[$('rB1').value]} and ${RESISTOR_DIGIT[$('rB2').value]}\n- Multiplier: ×${MULTIPLIER[$('rB3').value]}`;
    report('Resistor Color Code', `${describeOhms(value)} ${tol}`);
  };
}

function renderSmdCode(){
  mountTwoCol(`
    <div class="input-grid">
      <div class="field-span-2"><label>SMD code</label><input id="smdCode" value="472"></div>
    </div>
    <div class="actions"><button id="smdRun" class="primary-btn">Decode</button></div>
    <div class="note">Supports common numeric 3-digit and 4-digit styles and R-decimal forms such as 4R7.</div>
  `, `<div id="smdResult" class="result-box">Enter an SMD code and run the decoder.</div>`);
  $('smdRun').onclick = () => {
    const code = $('smdCode').value.trim().toUpperCase(); let ohms = NaN; let reason='';
    if (/^\d{3}$/.test(code)) { ohms = Number(code.slice(0,2)) * Math.pow(10, Number(code[2])); reason = '3-digit numeric code'; }
    else if (/^\d{4}$/.test(code)) { ohms = Number(code.slice(0,3)) * Math.pow(10, Number(code[3])); reason = '4-digit numeric code'; }
    else if (/^\d*R\d+$/.test(code)) { ohms = Number(code.replace('R','.')); reason = 'R used as decimal point'; }
    $('smdResult').textContent = Number.isFinite(ohms) ? `Decoded value: ${describeOhms(ohms)}\nReasoning: ${reason}` : 'Unsupported code format for this quick decoder.';
    report('SMD Resistor Code', Number.isFinite(ohms) ? describeOhms(ohms) : 'Unsupported code');
  };
}

function parseList(str){ return str.split(/[ ,]+/).map(Number).filter(v=>Number.isFinite(v)&&v>0); }
function renderSeriesParallel(){
  mountTwoCol(`
    <div class="input-grid">
      <div class="field-span-2"><label>Resistor values (ohms, comma or space separated)</label><input id="spList" value="100, 220, 470"></div>
      <div><label>Topology</label><select id="spMode"><option value="series">Series</option><option value="parallel">Parallel</option></select></div>
    </div>
    <div class="actions"><button id="spRun" class="primary-btn">Calculate</button></div>
  `, `<div id="spResult" class="result-box">Enter values to calculate equivalent resistance.</div>`);
  $('spRun').onclick = () => {
    const vals = parseList($('spList').value); const mode = $('spMode').value;
    const eq = mode==='series' ? vals.reduce((a,b)=>a+b,0) : 1/vals.reduce((a,b)=>a+1/b,0);
    $('spResult').textContent = `Equivalent resistance: ${describeOhms(eq)}\nCount: ${vals.length} resistor(s)\nMode: ${mode}`;
    report('Series / Parallel Resistors', `${describeOhms(eq)} equivalent in ${mode}`);
  };
}

function renderVoltageDivider(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Vin (V)</label><input id="vdVin" type="number" value="12"></div>
      <div><label>R1 (Ω)</label><input id="vdR1" type="number" value="10000"></div>
      <div><label>R2 (Ω)</label><input id="vdR2" type="number" value="4700"></div>
    </div>
    <div class="actions"><button id="vdivRun" class="primary-btn">Calculate</button></div>
  `, `<div id="vdivResult" class="result-box">Run the tool to compute divider output and resistor dissipation.</div>`);
  $('vdivRun').onclick = () => {
    const vin=+$('vdVin').value||0, r1=+$('vdR1').value||1, r2=+$('vdR2').value||1; const i = vin/(r1+r2); const vout = vin*r2/(r1+r2);
    $('vdivResult').textContent = `Vout: ${fmt(vout,3)} V\nDivider current: ${fmt(i*1000,3)} mA\nR1 power: ${fmt(i*i*r1*1000,3)} mW\nR2 power: ${fmt(i*i*r2*1000,3)} mW`;
    report('Voltage Divider', `${fmt(vout,3)} V out at ${fmt(i*1000,3)} mA`);
  };
}

function renderRcFilter(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Type</label><select id="rcType"><option>Low-pass</option><option>High-pass</option></select></div>
      <div><label>Cutoff frequency (Hz)</label><input id="rcFc" type="number" value="1000"></div>
      <div><label>Known resistor (Ω)</label><input id="rcR" type="number" value="10000"></div>
      <div><label>Known capacitor (F)</label><input id="rcC" type="number" value="0.0000000159"></div>
    </div>
    <div class="actions"><button id="rcSolveC" class="primary-btn">Solve for C</button><button id="rcSolveR" class="secondary-btn">Solve for R</button></div>
  `, `<div id="rcResult" class="result-box">Pick which component to solve for.</div>`);
  $('rcSolveC').onclick = () => { const fc=+$('rcFc').value||1, r=+$('rcR').value||1; const c = 1/(2*Math.PI*r*fc); $('rcResult').textContent = `${$('rcType').value} filter\nRequired C: ${describeCap(c)}\nEquation: C = 1 / (2πRf_c)`; report('RC Filter Designer', `Solved C = ${describeCap(c)}`); };
  $('rcSolveR').onclick = () => { const fc=+$('rcFc').value||1, c=+$('rcC').value||1e-9; const r = 1/(2*Math.PI*c*fc); $('rcResult').textContent = `${$('rcType').value} filter\nRequired R: ${describeOhms(r)}\nEquation: R = 1 / (2πCf_c)`; report('RC Filter Designer', `Solved R = ${describeOhms(r)}`); };
}

function renderLedResistor(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Supply voltage (V)</label><input id="ledVs" type="number" value="12"></div>
      <div><label>LED forward voltage (V)</label><input id="ledVf" type="number" value="2.1"></div>
      <div><label>LED count in series</label><input id="ledN" type="number" value="3"></div>
      <div><label>Target current (mA)</label><input id="ledI" type="number" value="20"></div>
    </div>
    <div class="actions"><button id="ledRun" class="primary-btn">Size Resistor</button></div>
  `, `<div id="ledResult" class="result-box">Run the tool to size the current-limiting resistor.</div>`);
  $('ledRun').onclick = () => {
    const vs=+$('ledVs').value||0, vf=+$('ledVf').value||0, n=Math.max(1, +$('ledN').value||1), i=(+$('ledI').value||0)/1000; const drop = vs-vf*n;
    if (drop <= 0 || i<=0) { $('ledResult').textContent = 'Supply voltage must exceed total LED forward voltage, and current must be positive.'; return; }
    const r = drop/i; const p = i*i*r; $('ledResult').textContent = `Required resistor: ${describeOhms(r)}\nResistor power: ${fmt(p*1000,1)} mW\nRecommended minimum wattage: ${p>0.25?'1 W':p>0.125?'1/2 W':'1/4 W'}\n\nReasoning\n- Available resistor voltage = ${fmt(drop,2)} V`;
    report('LED Series Resistor', `${describeOhms(r)}, ${fmt(p*1000,1)} mW`);
  };
}

function render555(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>RA (Ω)</label><input id="t555Ra" type="number" value="1000"></div>
      <div><label>RB (Ω)</label><input id="t555Rb" type="number" value="6800"></div>
      <div><label>C (F)</label><input id="t555C" type="number" value="0.000001"></div>
    </div>
    <div class="actions"><button id="t555Run" class="primary-btn">Calculate</button></div>
  `, `<div id="t555Result" class="result-box">Run the tool to calculate 555 astable timing.</div>`);
  $('t555Run').onclick = () => {
    const ra=+$('t555Ra').value||1, rb=+$('t555Rb').value||1, c=+$('t555C').value||1e-9; const th=0.693*(ra+rb)*c, tl=0.693*rb*c, f=1/(th+tl), duty = 100*th/(th+tl);
    $('t555Result').textContent = `High time: ${fmt(th*1000,3)} ms\nLow time: ${fmt(tl*1000,3)} ms\nFrequency: ${fmt(f,2)} Hz\nDuty cycle: ${fmt(duty,2)}%`;
    report('555 Astable Timer', `${fmt(f,2)} Hz, ${fmt(duty,1)}% duty`);
  };
}

function renderOpamp(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="oaMode"><option value="noninv">Non-inverting</option><option value="inv">Inverting</option></select></div>
      <div><label>Input voltage (V)</label><input id="oaVin" type="number" value="0.25"></div>
      <div><label>Rin / Rg (Ω)</label><input id="oaRin" type="number" value="10000"></div>
      <div><label>Rf (Ω)</label><input id="oaRf" type="number" value="47000"></div>
    </div>
    <div class="actions"><button id="oaRun" class="primary-btn">Calculate</button></div>
  `, `<div id="oaResult" class="result-box">Run the tool to compute gain and estimated output.</div>`);
  $('oaRun').onclick = () => {
    const mode=$('oaMode').value, vin=+$('oaVin').value||0, rin=+$('oaRin').value||1, rf=+$('oaRf').value||1;
    const gain = mode==='noninv' ? 1 + rf/rin : -rf/rin; const out = vin*gain;
    $('oaResult').textContent = `Closed-loop gain: ${fmt(gain,3)} V/V\nEstimated output: ${fmt(out,3)} V\nMode: ${mode==='noninv'?'Non-inverting':'Inverting'}\n\nReasoning\n- ${mode==='noninv' ? 'Gain = 1 + Rf/Rg' : 'Gain = -Rf/Rin'}`;
    report('Op-Amp Gain Helper', `Gain ${fmt(gain,2)}, Vout ${fmt(out,3)} V`);
  };
}

function renderCapCode(){
  mountTwoCol(`
    <div class="input-grid"><div class="field-span-2"><label>3-digit capacitor code</label><input id="capCode" value="104"></div></div>
    <div class="actions"><button id="capRun" class="primary-btn">Decode</button></div>
  `, `<div id="capResult" class="result-box">Enter a 3-digit code like 104 or 472.</div>`);
  $('capRun').onclick = () => {
    const code = $('capCode').value.trim();
    if (!/^\d{3}$/.test(code)) { $('capResult').textContent = 'Use a 3-digit numeric code.'; return; }
    const pf = Number(code.slice(0,2)) * Math.pow(10, Number(code[2]));
    $('capResult').textContent = `Capacitance: ${pf} pF\n= ${fmt(pf/1000,3)} nF\n= ${fmt(pf/1e6,3)} µF\n\nReasoning\n- Significant digits: ${code.slice(0,2)}\n- Multiplier: 10^${code[2]} pF`;
    report('Capacitor Code Decoder', `${pf} pF (${fmt(pf/1000,3)} nF)`);
  };
}

function renderIndCode(){
  mountTwoCol(`
    <div class="input-grid"><div class="field-span-2"><label>3-digit inductor code</label><input id="indCode" value="101"></div></div>
    <div class="actions"><button id="indRun" class="primary-btn">Decode</button></div>
  `, `<div id="indResult" class="result-box">Enter a 3-digit code like 101 or 221.</div>`);
  $('indRun').onclick = () => {
    const code = $('indCode').value.trim();
    if (!/^\d{3}$/.test(code)) { $('indResult').textContent = 'Use a 3-digit numeric code.'; return; }
    const uh = Number(code.slice(0,2)) * Math.pow(10, Number(code[2]));
    $('indResult').textContent = `Inductance: ${uh} µH\n= ${fmt(uh/1000,3)} mH\n\nReasoning\n- Significant digits: ${code.slice(0,2)}\n- Multiplier: 10^${code[2]} µH`;
    report('Inductor Code Decoder', `${uh} µH`);
  };
}

function renderPcbTrace(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="pcbMode"><option value="ampacity">Current from width</option><option value="width">Width from current</option></select></div>
      <div><label>Trace width (mil)</label><input id="pcbW" type="number" value="50"></div>
      <div><label>Copper weight (oz)</label><select id="pcbOz"><option>1</option><option>2</option></select></div>
      <div><label>Allowed temp rise (°C)</label><input id="pcbDT" type="number" value="10"></div>
      <div><label>Target current (A)</label><input id="pcbI" type="number" value="3"></div>
    </div>
    <div class="actions"><button id="pcbRun" class="primary-btn">Estimate</button></div>
    <div class="note">Simplified external-trace estimate only. Use detailed standards and thermal judgment for production design.</div>
  `, `<div id="pcbResult" class="result-box">Run the tool to estimate current or required width.</div>`);
  $('pcbRun').onclick = () => {
    const mode=$('pcbMode').value, w=+$('pcbW').value||1, oz=+$('pcbOz').value||1, dt=+$('pcbDT').value||10, i=+$('pcbI').value||1;
    const thicknessMil = oz===2 ? 2.8 : 1.4; const area = w*thicknessMil; const k=0.048;
    const currentFromWidth = k * Math.pow(dt, 0.44) * Math.pow(area, 0.725);
    const reqArea = Math.pow(i/(k*Math.pow(dt,0.44)), 1/0.725); const reqWidth = reqArea/thicknessMil;
    $('pcbResult').textContent = mode==='ampacity'
      ? `Estimated current: ${fmt(currentFromWidth,2)} A\nWidth: ${fmt(w,1)} mil\nCopper weight: ${oz} oz\nTemp rise basis: ${fmt(dt,1)} °C`
      : `Required width: ${fmt(reqWidth,1)} mil\nTarget current: ${fmt(i,2)} A\nCopper weight: ${oz} oz\nTemp rise basis: ${fmt(dt,1)} °C`;
    report('PCB Trace Width / Current', mode==='ampacity' ? `${fmt(currentFromWidth,2)} A estimate` : `${fmt(reqWidth,1)} mil required`);
  };
}

function renderAdcDac(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="adcMode"><option value="code-to-voltage">Code → Voltage</option><option value="voltage-to-code">Voltage → Code</option></select></div>
      <div><label>Resolution (bits)</label><input id="adcBits" type="number" value="12"></div>
      <div><label>Reference voltage (V)</label><input id="adcVref" type="number" value="3.3"></div>
      <div><label>Code or voltage</label><input id="adcValue" type="number" value="2048"></div>
    </div>
    <div class="actions"><button id="adcRun" class="primary-btn">Convert</button></div>
    <div class="note">Converts between ADC/DAC codes and analog voltages using straight binary scaling and full-scale range.</div>
  `, `<div id="adcResult" class="result-box">Run the tool to compute step size, full-scale range, and conversion results.</div>`);
  const collect = () => ({ mode:$('adcMode').value, bits:$('adcBits').value, vref:$('adcVref').value, value:$('adcValue').value });
  const apply = (s) => { $('adcMode').value=s.mode||'code-to-voltage'; $('adcBits').value=s.bits||12; $('adcVref').value=s.vref||3.3; $('adcValue').value=s.value||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('adc-dac', collect, apply));
  $('adcRun').onclick = () => {
    const mode = $('adcMode').value, bits = Math.max(1, Math.min(24, +$('adcBits').value||12));
    const vref = Math.max(0.001, +$('adcVref').value||1);
    const raw = +$('adcValue').value;
    const maxCode = Math.pow(2, bits) - 1;
    const step = vref / maxCode;
    if (mode === 'code-to-voltage') {
      const code = Math.min(maxCode, Math.max(0, Math.round(raw)));
      const voltage = code * step;
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted voltage: ${fmt(voltage,4)} V\n\nReasoning\n- Voltage = code × step\-size\n- Full-scale is ${fmt(vref,4)} V at code ${maxCode}`;
      report('ADC / DAC Helper', `Code ${code} → ${fmt(voltage,4)} V`);
    } else {
      const voltage = Math.min(vref, Math.max(0, raw));
      const code = Math.round(voltage / step);
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted code: ${code}\n\nReasoning\n- Code = voltage / step\-size\n- Input voltage limited to 0–${fmt(vref,4)} V`;
      report('ADC / DAC Helper', `${fmt(voltage,4)} V → code ${code}`);
    }
  };
}

function renderLogicGate(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Input A</label><select id="lgA"><option value="0">0</option><option value="1" selected>1</option></select></div>
      <div><label>Input B</label><select id="lgB"><option value="0">0</option><option value="1" selected>1</option></select></div>
    </div>
    <div class="actions"><button id="lgRun" class="primary-btn">Evaluate Gates</button></div>
    <div class="note">Shows the outputs for basic gates and highlights the selected input combination in the truth table.</div>
  `, `<div id="lgResult" class="result-box">Run the gate explorer to view outputs for A and B.</div><div class="chart-wrap"><div id="lgTable"></div></div>`);
  document.querySelector('.input-card').appendChild(addSaveLoadBar('logic-gates', () => ({ a:$('lgA').value, b:$('lgB').value }), s => { $('lgA').value=s.a||'1'; $('lgB').value=s.b||'1'; }));
  $('lgRun').onclick = () => {
    const a = +$('lgA').value, b = +$('lgB').value;
    const table = [[0,0],[0,1],[1,0],[1,1]].map(([x,y]) => ({ x, y, and: x&&y, or: x||y, nand: !(x&&y), nor: !(x||y), xor: Boolean(x^y), xnor: !(x^y) }));
    const activeRow = table.find(r=>r.x===a&&r.y===b);
    $('lgResult').textContent = `Selected inputs: A=${a}, B=${b}\nAND=${activeRow.and?1:0}  OR=${activeRow.or?1:0}  XOR=${activeRow.xor?1:0}\nNAND=${activeRow.nand?1:0}  NOR=${activeRow.nor?1:0}  XNOR=${activeRow.xnor?1:0}`;
    $('lgTable').innerHTML = `<table class="tableish"><thead><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th><th>XNOR</th></tr></thead><tbody>${table.map(row => `<tr style="background:${row.x===a&&row.y===b?'rgba(103,214,255,.12)':''}"><td>${row.x}</td><td>${row.y}</td><td>${row.and?1:0}</td><td>${row.or?1:0}</td><td>${row.nand?1:0}</td><td>${row.nor?1:0}</td><td>${row.xor?1:0}</td><td>${row.xnor?1:0}</td></tr>`).join('')}</tbody></table>`;
    report('Logic Gate Explorer', `A=${a}, B=${b}, OR=${activeRow.or?1:0}, XOR=${activeRow.xor?1:0}`);
  };
}

function renderParallelWire(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Conductor size</label><select id="pwWire">${Object.keys(CMIL).map(k=>`<option ${k==='3/0 AWG'?'selected':''}>${k}</option>`).join('')}</select></div>
      <div><label>Parallel sets</label><input id="pwN" type="number" value="2"></div>
      <div><label>Use case note</label><input id="pwNote" value="Feeder comparison"></div>
    </div>
    <div class="actions"><button id="pwRun" class="primary-btn">Calculate Equivalent</button></div>
  `, `<div id="pwResult" class="result-box">Run the tool to compare parallel conductors to an equivalent single conductor.</div>`);
  $('pwRun').onclick = () => {
    const size=$('pwWire').value, n=Math.max(1, +$('pwN').value||1), area=(CMIL[size]||0)*n;
    let nearest = Object.entries(CMIL).find(([,v]) => v>=area) || Object.entries(CMIL).at(-1);
    $('pwResult').textContent = `Total circular-mil area: ${area.toLocaleString()} cmil\nNearest standard single conductor: ${nearest[0]} (${nearest[1].toLocaleString()} cmil)\nParallel sets: ${n}\nNote: ${$('pwNote').value}`;
    report('Parallel Wire Gauge', `${n} × ${size} ≈ ${nearest[0]}`);
  };
}

function renderFlexLogic(){
  mountTwoCol(`
    <div class="subcard">
      <div class="flex-row" id="flexInputs"></div>
      <div class="actions"><button id="flexEval" class="primary-btn">Evaluate Logic</button></div>
      <div class="note">Output logic used here: RUN = MODE_AUTO · DEMAND · START_OK · ESTOP_OK · OL_OK</div>
    </div>
  `, `<div id="flexResult" class="result-box">Toggle inputs and evaluate the permissive chain.</div>`);
  const keys = [
    ['modeAuto','Mode Auto'],['demand','Auto Demand'],['startOk','Start Permissive'],['estopOk','E-Stop Healthy'],['olOk','Overload Healthy']
  ];
  $('flexInputs').innerHTML = keys.map(([k,label],i)=>`<button class="toggle-chip ${i!==1?'active':''}" data-bit="${k}" data-state="${i!==1?'1':'0'}">${label}: ${i!==1?'ON':'OFF'}</button>`).join('');
  document.querySelectorAll('[data-bit]').forEach(btn => btn.onclick = () => {
    const on = btn.dataset.state !== '1'; btn.dataset.state = on ? '1' : '0'; btn.classList.toggle('active', on); btn.textContent = `${btn.textContent.split(':')[0]}: ${on?'ON':'OFF'}`;
  });
  $('flexEval').onclick = () => {
    const vals = Object.fromEntries([...document.querySelectorAll('[data-bit]')].map(btn => [btn.dataset.bit, btn.dataset.state==='1']));
    const run = vals.modeAuto && vals.demand && vals.startOk && vals.estopOk && vals.olOk;
    $('flexResult').textContent = `Output RUN: ${run?'ENERGIZED':'DE-ENERGIZED'}\nBoolean expression: RUN = A·D·S·E·O\n\nExplanation\n- Auto mode is ${vals.modeAuto?'true':'false'}\n- Demand is ${vals.demand?'true':'false'}\n- Start permissive is ${vals.startOk?'true':'false'}\n- E-stop healthy is ${vals.estopOk?'true':'false'}\n- Overload healthy is ${vals.olOk?'true':'false'}\n\nPlain English\nThe output only energizes when every permissive in the chain is healthy at the same time.`;
    report('Flex Logic Simulator', `RUN ${run?'energized':'de-energized'}`);
  };
}

function ladderCell(type, label, active=false){ return `<div class="rung-cell ${active?'active':''}">${type}<br><strong>${label}</strong></div>`; }
function computeLadder(bits){
  const stopClosed = !bits.stop;
  const olClosed = !bits.ol;
  const motorRung = stopClosed && olClosed && (bits.start || ladderState.coil);
  ladderState.coil = motorRung;
  const timerRung = bits.auto && bits.demand;
  if (timerRung) ladderState.timerAcc += 1; else { ladderState.timerAcc = 0; ladderState.timerDone = false; }
  ladderState.timerDone = ladderState.timerAcc >= 5;
  if (bits.start && !ladderState.lastCountIn) ladderState.count += 1;
  if (bits.reset) ladderState.count = 0;
  ladderState.lastCountIn = bits.start;
  ladderState.lastStart = bits.start;
  return { stopClosed, olClosed, motorRung, timerRung, timerDone: ladderState.timerDone, count: ladderState.count };
}
function renderLadderCanvas(state){
  const r1 = state.motorRung; const r2 = state.timerRung; const r3 = state.timerDone;
  return `
    <div class="rung-row">
      <div class="rung-label">Rung 1 Motor seal-in</div>
      ${ladderCell('XIO','STOP', state.stopClosed)}
      ${ladderCell('XIO','OL', state.olClosed)}
      ${ladderCell('XIC','START', ladderState.bits.start)}
      ${ladderCell('OR','MTR', ladderState.coil)}
      ${ladderCell('---','', r1)}
      ${ladderCell('---','', r1)}
      ${ladderCell('OTE','MTR', state.motorRung)}
    </div>
    <div class="rung-row">
      <div class="rung-label">Rung 2 Delay alarm</div>
      ${ladderCell('XIC','AUTO', ladderState.bits.auto)}
      ${ladderCell('XIC','DEMAND', ladderState.bits.demand)}
      ${ladderCell('---','', r2)}
      ${ladderCell('---','', r2)}
      ${ladderCell('TON','T1', r2)}
      ${ladderCell('ACC', `${ladderState.timerAcc}/5`, r2)}
      ${ladderCell('DN', `${state.timerDone?'1':'0'}`, state.timerDone)}
      ${ladderCell('OTE','ALM', state.timerDone)}
    </div>
    <div class="rung-row">
      <div class="rung-label">Rung 3 Count starts</div>
      ${ladderCell('ONS','START↑', ladderState.bits.start)}
      ${ladderCell('CTU','C1', ladderState.bits.start)}
      ${ladderCell('ACC', `${state.count}`, state.count>0)}
      ${ladderCell('RES','RESET', ladderState.bits.reset)}
      ${ladderCell('---','', false)}
      ${ladderCell('---','', false)}
      ${ladderCell('---','', false)}
      ${ladderCell('OTE','CNT', false)}
    </div>`;
}
function ladderExplanation(state){
  return `Motor rung: the motor coil ${state.motorRung?'is':'is not'} energized because STOP is ${state.stopClosed?'healthy/closed':'pressed/open'}, overload is ${state.olClosed?'healthy/closed':'tripped/open'}, and the seal-in path ${state.motorRung?'has':'does not have'} continuity.\n\nTimer rung: AUTO and DEMAND are ${state.timerRung?'both true':'not both true'}, so the TON accumulator is ${ladderState.timerAcc} scan(s) and the done bit is ${state.timerDone?'true':'false'}.\n\nCounter rung: the counter has recorded ${state.count} start pulse(s).`;
}
function renderLadderSim(){
  mountTwoCol(`
    <div class="ladder-toolbar">
      <button class="toggle-chip" data-lbit="start">START</button>
      <button class="toggle-chip" data-lbit="stop">STOP</button>
      <button class="toggle-chip" data-lbit="ol">OL TRIP</button>
      <button class="toggle-chip" data-lbit="auto">AUTO</button>
      <button class="toggle-chip" data-lbit="demand">DEMAND</button>
      <button class="toggle-chip" data-lbit="reset">RESET COUNT</button>
    </div>
    <div class="actions"><button id="ladderScan" class="primary-btn">Run One Scan</button><button id="ladderReset" class="secondary-btn">Reset Simulator</button></div>
    <div class="note">This version includes a seal-in motor rung, a 5-scan TON alarm rung, and a CTU-style start counter.</div>
  `, `<div class="subcard"><div id="ladderCanvas"></div></div><div class="kpi-row"><div class="kpi"><div class="label">Motor coil</div><div id="kpiMotor" class="value">OFF</div></div><div class="kpi"><div class="label">Timer done</div><div id="kpiTon" class="value">0</div></div><div class="kpi"><div class="label">Start count</div><div id="kpiCount" class="value">0</div></div></div><div id="ladderExplain" class="result-box" style="margin-top:12px;">Run one or more scans.</div>`);
  document.querySelectorAll('[data-lbit]').forEach(btn => btn.onclick = () => {
    const key = btn.dataset.lbit; ladderState.bits[key] = !ladderState.bits[key]; btn.classList.toggle('active', ladderState.bits[key]);
  });
  function redraw(){ const st = computeLadder(ladderState.bits); $('ladderCanvas').innerHTML = renderLadderCanvas(st); $('kpiMotor').textContent = st.motorRung ? 'ON' : 'OFF'; $('kpiTon').textContent = st.timerDone ? '1' : `${ladderState.timerAcc}/5`; $('kpiCount').textContent = st.count; $('ladderExplain').textContent = ladderExplanation(st); report('Ladder Logic Simulator', `Motor ${st.motorRung?'ON':'OFF'}, TON ${st.timerDone?'done':'timing'}, count ${st.count}`); ladderState.bits.reset = false; document.querySelector('[data-lbit="reset"]').classList.remove('active'); }
  $('ladderScan').onclick = redraw;
  $('ladderReset').onclick = () => { ladderState.coil=false; ladderState.timerAcc=0; ladderState.timerDone=false; ladderState.count=0; ladderState.lastCountIn=false; ladderState.lastStart=false; ladderState.bits={ start:false, stop:false, ol:false, auto:false, demand:false, reset:false }; document.querySelectorAll('[data-lbit]').forEach(btn => btn.classList.remove('active')); $('ladderCanvas').innerHTML=''; $('kpiMotor').textContent='OFF'; $('kpiTon').textContent='0'; $('kpiCount').textContent='0'; $('ladderExplain').textContent='Simulator reset.'; report('Ladder Logic Simulator', 'Simulator reset'); };
  $('ladderCanvas').innerHTML = renderLadderCanvas({ stopClosed:true, olClosed:true, motorRung:false, timerRung:false, timerDone:false, count:0 });
}

function renderProjectManager(){
  const saved = getSavedState();
  mountTwoCol(`
    <div class="actions"><button id="pmRefresh" class="primary-btn">Refresh Saved States</button><button id="pmClearAll" class="secondary-btn">Clear All Saved States</button></div>
    <div class="note">Use Export State in the top bar to download a JSON snapshot of saved tool inputs.</div>
  `, `<div id="pmResult" class="result-box">Saved tools: ${Object.keys(saved).length}</div><div class="chart-wrap"><div id="pmList"></div></div>`);
  function refresh(){ const all = getSavedState(); $('pmResult').textContent = `Saved tools: ${Object.keys(all).length}`; $('pmList').innerHTML = Object.keys(all).length ? `<table class="tableish"><thead><tr><th>Tool</th><th>Saved</th><th>Action</th></tr></thead><tbody>${Object.entries(all).map(([k,v])=>`<tr><td>${escapeHtml(toolDefs[k]?.title || k)}</td><td>${new Date(v.savedAt).toLocaleString()}</td><td><button class="secondary-btn" data-clear-tool="${k}">Clear</button></td></tr>`).join('')}</tbody></table>` : '<div class="muted">No saved states yet.</div>'; document.querySelectorAll('[data-clear-tool]').forEach(btn => btn.onclick = () => { clearToolState(btn.dataset.clearTool); refresh(); report('Project Manager', `Cleared saved state for ${toolDefs[btn.dataset.clearTool]?.title || btn.dataset.clearTool}`); }); }
  $('pmRefresh').onclick = refresh;
  $('pmClearAll').onclick = () => { localStorage.removeItem(SAVE_KEY); refresh(); updateSavedCount(); report('Project Manager', 'All saved states cleared'); };
  refresh();
}

$('themeToggle').onclick = () => { setTheme(activeTheme === 'retro' ? 'blueprint' : 'retro'); };
$('exportState').onclick = () => {
  const payload = { exportedAt: new Date().toISOString(), savedTools: getSavedState(), sessionLedger: reportState };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'engineer-reference-lab-state.json'; a.click(); URL.revokeObjectURL(a.href);
  report('Project Export', 'Downloaded local reference workspace snapshot');
};

function renderGensetBatteryOptimizer(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Peak load (kW)</label><input id="gboPeak" type="number" value="100"></div>
      <div><label>Average load (kW)</label><input id="gboAvg" type="number" value="40"></div>
      <div><label>Required runtime (hours)</label><input id="gboRuntime" type="number" value="4"></div>
      <div><label>Generator fuel cost ($/kWh)</label><input id="gboFuelCost" type="number" value="0.35"></div>
      <div><label>Battery cost ($/kWh)</label><input id="gboBAT_Cost" type="number" value="200"></div>
      <div><label>Generator preferred loading (%)</label><input id="gboGenLoading" type="number" value="75"></div>
    </div>
    <div class="actions"><button id="gboRun" class="primary-btn">Optimize System</button></div>
    <div class="note">Finds the generator and battery combination that minimizes lifecycle cost while meeting load requirements.</div>
  `, `<div id="gboResult" class="result-box">Run the optimizer to find the best system sizing.</div><div class="chart-wrap"><svg id="gboDispatch" viewBox="0 0 560 200" style="max-width: 100%;"></svg></div>`);  
  const collect = () => ({ peak:$('gboPeak').value, avg:$('gboAvg').value, runtime:$('gboRuntime').value, fuel:$('gboFuelCost').value, bat:$('gboBAT_Cost').value, gen:$('gboGenLoading').value });
  const apply = (s) => { $('gboPeak').value=s.peak||''; $('gboAvg').value=s.avg||''; $('gboRuntime').value=s.runtime||''; $('gboFuelCost').value=s.fuel||''; $('gboBAT_Cost').value=s.bat||''; $('gboGenLoading').value=s.gen||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('genset-battery-optimizer', collect, apply));
  $('gboRun').onclick = () => {
    const peak = +$('gboPeak').value||0, avg = +$('gboAvg').value||0, runtime = +$('gboRuntime').value||0, fuel = +$('gboFuelCost').value||0.3, batCost = +$('gboBAT_Cost').value||200, genLoad = Math.max(0.5, Math.min(1, (+$('gboGenLoading').value||75)/100));
    if (peak<=0 || avg<=0 || runtime<=0) { $('gboResult').textContent = 'Please enter valid positive values.'; return; }
    const shortfall = Math.max(0, peak - avg*genLoad);
    const recGenSize = peak / genLoad;
    const recBatKwh = shortfall * runtime;
    const recBatKw = shortfall;
    const dailyFuel = avg * (24/runtime);
    const annualFuel = dailyFuel * 365;
    const fuelCost = annualFuel * fuel;
    const batCapCost = recBatKwh * batCost;
    const totalCost = fuelCost * 5 + batCapCost;
    $('gboResult').textContent = `OPTIMIZATION RESULT\n\nRecommended Generator Size: ${fmt(recGenSize,1)} kW (loading ${fmt(genLoad*100,0)}%)\nRecommended Battery Capacity: ${fmt(recBatKwh,1)} kWh / ${fmt(recBatKw,1)} kW\n\nEstimated Annual Fuel Cost: $${fmt(fuelCost*1,0)}\nBattery Capital Cost: $${fmt(batCapCost,0)}\n5-Year Lifecycle Cost: $${fmt(totalCost,0)}\n\nReasoning\n- Peak load (${fmt(peak,1)} kW) divided by generator preferred loading (${fmt(genLoad*100,0)}%) = generator size\n- Shortfall between peak and average (${fmt(shortfall,1)} kW) × runtime (${runtime}h) = battery energy needed\n- Battery sizing includes cycling headroom and round-trip efficiency from your load profile`;
    const svg = $('gboDispatch');
    const w = 560, h = 200, pad = 40, x0 = pad, y0 = h - pad;
    const tMax = runtime || 1, pMax = peak || 1;
    const toX = (t) => x0 + (t / tMax) * (w - 2*pad);
    const toY = (p) => y0 - (p / pMax) * (h - 2*pad);
    const loadPoints = [[0, peak], [runtime*0.2, avg], [runtime*0.7, peak*0.8], [runtime, avg]];
    let svg_html = `<g fill="none" stroke-width="2"><polyline points="${loadPoints.map(([t,p]) => toX(t) + ',' + toY(p)).join(' ')}" stroke="rgba(210,180,255,.8)"/></g>`;
    svg_html += `<g fill="none" stroke-width="2"><line x1="${toX(0)}" y1="${toY(recGenSize)}" x2="${toX(tMax)}" y2="${toY(recGenSize)}" stroke="rgba(103,214,255,.6)" stroke-dasharray="5,5"/></g>`;
    svg_html += `<g font-size="12" fill="currentColor"><text x="${pad}" y="30">Load vs Generator Sizing</text><text x="${w-80}" y="${y0+25}">Time (hours)</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg.innerHTML = svg_html;
    report('Generator + Battery Optimizer', `${fmt(recGenSize,1)} kW genset, ${fmt(recBatKwh,1)} kWh battery`);
  };
}

function renderPeakShavingOptimizer(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Peak current demand (kW)</label><input id="psoCurrentPeak" type="number" value="150"></div>
      <div><label>Target demand cap (kW)</label><input id="psoTargetCap" type="number" value="120"></div>
      <div><label>Battery capacity (kWh)</label><input id="psoBatCap" type="number" value="50"></div>
      <div><label>Battery power limit (kW)</label><input id="psoBatPower" type="number" value="60"></div>
      <div><label>Demand charge ($/kW/month)</label><input id="psoDemandCharge" type="number" value="8.50"></div>
      <div><label>Peak hours per month</label><input id="psoPeakHours" type="number" value="20"></div>
    </div>
    <div class="actions"><button id="psoRun" class="primary-btn">Analyze Peak Shaving</button></div>
    <div class="note">Estimates the savings from reducing monthly peak demand using stored battery energy.</div>
  `, `<div id="psoResult" class="result-box">Run the analysis to see demand reduction and savings.</div><div class="chart-wrap"><svg id="psoDemandChart" viewBox="0 0 560 240" style="max-width: 100%;"></svg></div>`);
  const collect = () => ({ peak:$('psoCurrentPeak').value, cap:$('psoTargetCap').value, bat:$('psoBatCap').value, pw:$('psoBatPower').value, charge:$('psoDemandCharge').value, hours:$('psoPeakHours').value });
  const apply = (s) => { $('psoCurrentPeak').value=s.peak||''; $('psoTargetCap').value=s.cap||''; $('psoBatCap').value=s.bat||''; $('psoBatPower').value=s.pw||''; $('psoDemandCharge').value=s.charge||''; $('psoPeakHours').value=s.hours||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('peak-shaving-optimizer', collect, apply));
  $('psoRun').onclick = () => {
    const peak = +$('psoCurrentPeak').value||0, cap = +$('psoTargetCap').value||0, batCap = +$('psoBatCap').value||0, batPw = +$('psoBatPower').value||0, demCharge = +$('psoDemandCharge').value||0, peakHrs = +$('psoPeakHours').value||0;
    if (peak<=0 || cap<=0 || batCap<=0) { $('psoResult').textContent = 'Please enter valid values.'; return; }
    const reductionPossible = Math.min(peak - cap, batPw);
    const batAvailable = batCap;
    const reduction = Math.min(reductionPossible, batAvailable / (peakHrs || 1));
    const achievedNewPeak = peak - reduction;
    const monthlySavings = (peak - achievedNewPeak) * demCharge;
    const annualSavings = monthlySavings * 12;
    const simProgress = Math.min(1, reduction / (peak - cap + 0.1));
    $('psoResult').textContent = `PEAK SHAVING ANALYSIS\n\nCurrent Peak: ${fmt(peak,1)} kW\nTarget Cap: ${fmt(cap,1)} kW\nRequired Reduction: ${fmt(peak-cap,1)} kW\n\nAchievable Reduction: ${fmt(reduction,1)} kW\nNew Peak with Battery: ${fmt(achievedNewPeak,1)} kW\nShaving Success Rate: ${fmt(simProgress*100,0)}%\n\nMonthly Demand Charge Savings: $${fmt(monthlySavings*1,0)}\nAnnual Savings: $${fmt(annualSavings,0)}\n\nAnalysis\n- Battery can discharge ${fmt(batPw,1)} kW during ${fmt(peakHrs,1)} peak hours\n- With ${fmt(batCap,1)} kWh capacity, provides ${fmt(batAvailable/peakHrs,1)} kW average capacity\n- Limited by battery power rating and available energy`;
    const svg = $('psoDemandChart');
    const w = 560, h = 240, pad = 50, x0 = pad, y0 = h - pad;
    const maxDemand = peak * 1.1;
    const toX = (p) => x0 + (p / 2) * (w - 2*pad);
    const toY = (d) => y0 - (d / maxDemand) * (h - 2*pad);
    let svg_html = '';
    svg_html += `<g fill="none" stroke-width="20" opacity="0.4"><line x1="${toX(0)}" y1="${toY(peak)}" x2="${toX(2)}" y2="${toY(peak)}" stroke="#ff8d8d"/></g>`;
    svg_html += `<g fill="none" stroke-width="20" opacity="0.6"><line x1="${toX(0)}" y1="${toY(achievedNewPeak)}" x2="${toX(2)}" y2="${toY(achievedNewPeak)}" stroke="#7ef1c3"/></g>`;
    svg_html += `<g fill="none" stroke-width="2" stroke-dasharray="5,5"><line x1="${toX(0)}" y1="${toY(cap)}" x2="${toX(2)}" y2="${toY(cap)}" stroke="rgba(255,255,255,.3)"/></g>`;
    svg_html += `<g font-size="13" fill="currentColor"><text x="${pad}" y="30">Demand Before & After Peak Shaving</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(peak)+20}">Before: ${fmt(peak,1)} kW</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(achievedNewPeak)-20}">After: ${fmt(achievedNewPeak,1)} kW</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(cap)-15}">Target: ${fmt(cap,1)} kW</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg_html += `<g fill="currentColor" font-size="11"><text x="${x0-35}" y="${toY(peak)+5}">Peak</text><text x="${w-pad+10}" y="${y0+15}">Time</text></g>`;
    svg.innerHTML = svg_html;
    report('Peak Shaving Optimizer', `Reduce peak from ${fmt(peak,1)} to ${fmt(achievedNewPeak,1)} kW, save $${fmt(annualSavings,0)}/year`);
  };
}

function renderConductorLifecycle(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Current (A)</label><input id="clCurrent" type="number" value="200"></div>
      <div><label>Distance (feet)</label><input id="clDist" type="number" value="500"></div>
      <div><label>Energy cost ($/kWh)</label><input id="clEnergyCost" type="number" value="0.12"></div>
      <div><label>Annual operating hours</label><input id="clAnnualHours" type="number" value="8760"></div>
      <div><label>Analysis period (years)</label><input id="clYears" type="number" value="20"></div>
      <div><label>Material</label><select id="clMaterial"><option value="copper" selected>Copper</option><option value="aluminum">Aluminum</option></select></div>
    </div>
    <div class="actions"><button id="clRun" class="primary-btn">Analyze Lifecycle Cost</button></div>
    <div class="note">Compares conductor sizes, balancing initial cost against energy loss cost over the analysis period.</div>
  `, `<div id="clResult" class="result-box">Run the analysis to find the optimal conductor size.</div><div class="chart-wrap"><svg id="clCostChart" viewBox="0 0 560 200" style="max-width: 100%;"></svg></div>`);
  const collect = () => ({ i:$('clCurrent').value, d:$('clDist').value, e:$('clEnergyCost').value, h:$('clAnnualHours').value, y:$('clYears').value, m:$('clMaterial').value });
  const apply = (s) => { $('clCurrent').value=s.i||''; $('clDist').value=s.d||''; $('clEnergyCost').value=s.e||''; $('clAnnualHours').value=s.h||''; $('clYears').value=s.y||''; $('clMaterial').value=s.m||'copper'; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('conductor-lifecycle', collect, apply));
  $('clRun').onclick = () => {
    const I = +$('clCurrent').value||0, dist = +$('clDist').value||0, eCost = +$('clEnergyCost').value||0.12, annHrs = +$('clAnnualHours').value||8760, years = +$('clYears').value||20, mat = $('clMaterial').value;
    if (I<=0 || dist<=0) { $('clResult').textContent = 'Please enter valid values.'; return; }
    const sizes = [4, 2, 1, '1/0', '2/0', '3/0', '4/0'];
    const resis = mat==='copper' ? [0.00624,0.00974,0.01232,0.01560,0.01968,0.02480,0.03133] : [0.01030,0.01602,0.02020,0.02560,0.03224,0.04047,0.05129];
    const costs = mat==='copper' ? [45,60,85,110,135,175,215] : [30,40,55,75,90,115,145];
    let bestIdx = 0, bestTotal = Infinity;
    const results = [];
    for (let i=0; i<sizes.length; i++){
      const R = resis[i] * 2 * dist / 1000;
      const losses = I*I*R;
      const lossEnergy = losses * annHrs / 1000;
      const lossCost = lossEnergy * eCost * years;
      const matCost = costs[i] * dist * 1.5;
      const total = matCost + lossCost;
      results.push({size: sizes[i], loss: losses, lossCost, matCost, total});
      if (total < bestTotal) { bestTotal = total; bestIdx = i; }
    }
    const best = results[bestIdx];
    $('clResult').textContent = `LIFECYCLE COST ANALYSIS (${years}-year period)\n\nOPTIMAL CONDUCTOR: ${best.size} AWG\n\nInitial Material Cost: $${fmt(best.matCost,0)}\nLifetime Loss Cost: $${fmt(best.lossCost,0)}\nTotal Lifecycle Cost: $${fmt(best.total,0)}\n\nPower Loss: ${fmt(best.loss,2)} W\nAnnual Loss Energy: ${fmt(best.loss*annHrs/1000,0)} kWh\n\nAnalysis\n- I² R losses scale with size; larger conductors reduce losses\n- ${best.matCost < results[bestIdx-1]?.matCost ? 'Lower cost now, but high loss cost later' : 'Slightly higher upfront cost is recovered in energy savings'}\n- Analysis assumes continuous ${I}A loading, ${annHrs} hours/year`;
    const svg = $('clCostChart');
    const w = 560, h = 200, pad = 45, x0 = pad, y0 = h - pad;
    const maxCost = Math.max(...results.map(r => r.total)) * 1.1;
    const toX = (i) => x0 + (i / (results.length-1)) * (w - 2*pad);
    const toY = (c) => y0 - (c / maxCost) * (h - 2*pad);
    let svg_html = `<g fill="none" stroke-width="2.5" stroke="rgba(255,211,110,.7)"><polyline points="${results.map((r,i) => toX(i)+','+toY(r.total)).join(' ')}"/></g>`;
    for (let i=0; i<results.length; i++){
      svg_html += `<circle cx="${toX(i)}" cy="${toY(results[i].total)}" r="5" fill="${i===bestIdx?'#7ef1c3':'rgba(103,214,255,.4)'}"/>`;
    }
    svg_html += `<g font-size="12" fill="currentColor"><text x="${pad}" y="25">Lifecycle Cost by Conductor Size</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg_html += `<g fill="currentColor" font-size="11" text-anchor="middle"><text x="${pad*0.5}" y="${y0+5}">$</text><text x="${w-15}" y="${y0+20}">AWG</text></g>`;
    svg.innerHTML = svg_html;
    report('Conductor Lifecycle', `Optimal: ${best.size} AWG, total cost $${fmt(best.total,0)}`);
  };
}

function renderTransformerTradeoff(){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">Coming soon: Transformer sizing tradeoff analysis.</div><div class="output-card">This tool will compare efficiency, cost, and loading across different transformer kVA ratings.</div></div>`;
  report('Transformer Tradeoff', 'Placeholder - tool in development');
}

function renderLoadScheduler(){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">Coming soon: Load scheduling optimizer.</div><div class="output-card">Shift flexible loads to minimize peak demand and energy costs based on time-of-use pricing.</div></div>`;
  report('Load Scheduler', 'Placeholder - tool in development');
}

function renderScenarioManager(){
  const saved = {};
  mountTwoCol(`
    <div class="actions"><button id="smRefresh" class="primary-btn">Refresh Scenarios</button><button id="smClearAll" class="secondary-btn">Clear All</button></div>
    <div class="note">Save optimization results from any tool and compare them side-by-side.</div>
  `, `<div id="smResult" class="result-box">Saved scenarios: 0</div><div class="chart-wrap"><div id="smList"></div></div>`);
  function refresh(){ $('smResult').textContent = Object.keys(saved).length ? `Saved scenarios: ${Object.keys(saved).length}` : 'No scenarios saved yet.'; $('smList').innerHTML = Object.keys(saved).length ? '<div class="muted">Scenario comparison coming in next update.</div>' : '<div class="muted">Run any optimization tool and save results to build scenarios.</div>'; }
  $('smRefresh').onclick = refresh;
  $('smClearAll').onclick = () => { Object.keys(saved).forEach(k => delete saved[k]); refresh(); report('Scenario Manager', 'All scenarios cleared'); };
  refresh();
}

setTheme(activeTheme);
$('toolSearch').oninput = renderNav;
renderAll();
