import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'opamp-gain',
  section:'electronics', title:"Op-Amp Gain Helper", badge:"Inverting / non-inverting", what:"Calculates closed-loop gain and output estimate for inverting or non-inverting op-amp stages.", why:"It helps with quick signal-conditioning decisions before deeper simulation.", how:"The gain equations use the standard resistor ratios for the chosen topology, then multiply by the input signal.", render, tags:["opamp", "gain", "amplifier"], schema
};

export const render = renderOpamp;
export { renderOpamp };
