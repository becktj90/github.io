import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'power-triangle',
  section:'power', title:"Power Triangle", badge:"SVG plot", what:"Turns kW and power factor into kVA, kVAR, and a power triangle graphic.", why:"It makes real, reactive, and apparent power intuitive for troubleshooting and design.", how:"The tool computes apparent power from kW and PF, then derives reactive power with the Pythagorean relationship and draws the triangle.", render, tags:["kw", "kva", "kvar", "pf"], schema
};

export const render = renderPowerTriangle;
export { renderPowerTriangle };
