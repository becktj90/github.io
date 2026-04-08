import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'rc-filter',
  section:'electronics', title:"RC Filter Designer", badge:"Low-pass / high-pass", what:"Designs a first-order RC filter from target cutoff and either R or C.", why:"It provides a quick path from bandwidth intent to actual component values.", how:"The cutoff relationship f_c = 1 / (2\u03c0RC) is rearranged to solve for the unknown component.", render, tags:["filter", "rc", "cutoff"], schema
};

export const render = renderRcFilter;
export { renderRcFilter };
