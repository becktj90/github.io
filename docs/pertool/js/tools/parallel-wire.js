import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'parallel-wire',
  section:'code', title:"Parallel Conductors Helper", badge:"Ampacity", what:"Estimates conductor count per phase when one conductor is not enough ampacity.", why:"Large feeders often need parallel sets, and this tool gives a quick sanity check.", how:"The required ampacity is divided by the per-conductor ampacity and rounded up to the next whole conductor count.", render, tags:["parallel conductors", "ampacity"], schema
};

export const render = renderParallelWire;
export { renderParallelWire };
