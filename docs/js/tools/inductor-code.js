import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'inductor-code',
  section:'electronics', title:"Inductor Code Decoder", badge:"Decoder", what:"Decodes common inductor body codes into inductance values.", why:"It helps turn terse inductor markings into real values without lookup tables.", how:"The code uses a significant-figure plus multiplier pattern similar to many passive components.", render, tags:["inductor", "decoder"], schema
};

export const render = renderIndCode;
export { renderIndCode };
