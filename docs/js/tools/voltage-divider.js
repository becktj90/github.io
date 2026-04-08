import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'voltage-divider',
  section:'electronics', title:"Voltage Divider", badge:"Bench basic", what:"Calculates divider output, branch current, and resistor power dissipation.", why:"It is one of the most common small-signal design blocks and a constant bench calculation.", how:"The output is Vin \u00d7 R2 / (R1 + R2). Current is Vin / (R1 + R2), then resistor dissipation is I\u00b2R.", render, tags:["divider", "voltage", "resistor"], schema
};

export const render = renderVoltageDivider;
export { renderVoltageDivider };
