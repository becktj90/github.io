import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from './utils.js';
export function renderBranchCircuit(){
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

export function renderTransformerPackage(){
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

export function renderVoltageDrop(){
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

export function renderParallelWire(){
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
