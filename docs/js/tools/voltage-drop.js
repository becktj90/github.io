import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'voltage-drop',
  section:'code', title:"Voltage Drop + Chart", badge:"Visual", what:"Calculates feeder voltage drop and generates a simple visual bar showing source, drop, and delivered voltage.", why:"A quick visual makes it obvious whether the run is comfortably acceptable or getting marginal.", how:"The tool uses standard single-phase or three-phase copper voltage-drop equations and plots the result as proportional bars.", render, tags:["voltage drop", "feeder", "awg"], schema
};

export const render = renderVoltageDrop;
export { renderVoltageDrop };
