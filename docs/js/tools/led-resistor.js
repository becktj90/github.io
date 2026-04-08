import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'led-resistor',
  section:'electronics', title:"LED Series Resistor", badge:"Current limiter", what:"Sizes a current-limiting resistor for one or more LEDs.", why:"It prevents overdriving LEDs and gives a more realistic current estimate for strings.", how:"The resistor is (Vsupply \u2212 total LED forward voltage) / I. Power is I\u00b2R, with a recommended preferred-value rounding.", render, tags:["led", "resistor", "current"], schema
};

export const render = renderLedResistor;
export { renderLedResistor };
