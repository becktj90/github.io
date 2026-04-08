import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'pcb-trace',
  section:'electronics', title:"PCB Trace Width Helper", badge:"DC current", what:"Estimates PCB trace width for a given current rise target using simple external-layer assumptions.", why:"It provides a quick planning estimate during board layout and concept work.", how:"The tool uses a simplified IPC-style current density relationship to estimate required trace width.", render, tags:["pcb", "trace", "current"], schema
};

export const render = renderPcbTrace;
export { renderPcbTrace };
