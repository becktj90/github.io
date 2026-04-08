import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderCapCode(){
  mountTwoCol(`
    <div class="input-grid"><div class="field-span-2"><label>3-digit capacitor code</label><input id="capCode" value="104"></div></div>
    <div class="actions"><button id="capRun" class="primary-btn">Decode</button></div>
  `, `<div id="capResult" class="result-box">Enter a 3-digit code like 104 or 472.</div>`);
  $('capRun').onclick = () => {
    const code = $('capCode').value.trim();
    if (!/^\d{3}$/.test(code)) { $('capResult').textContent = 'Use a 3-digit numeric code.'; return; }
    const pf = Number(code.slice(0,2)) * Math.pow(10, Number(code[2]));
    $('capResult').textContent = `Capacitance: ${pf} pF\n= ${fmt(pf/1000,3)} nF\n= ${fmt(pf/1e6,3)} µF\n\nReasoning\n- Significant digits: ${code.slice(0,2)}\n- Multiplier: 10^${code[2]} pF`;
    report('Capacitor Code Decoder', `${pf} pF (${fmt(pf/1000,3)} nF)`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'capacitor-code',
  section:'electronics', title:"Capacitor Code Decoder", badge:"Decoder", what:"Decodes common 3-digit capacitor markings into capacitance.", why:"Capacitor body markings are compact and often cryptic, so a decoder speeds up part identification.", how:"The first two digits are significant figures and the third is the multiplier in pF.", render, tags:["capacitor", "decoder"], schema
};

export const render = renderCapCode;
export { renderCapCode };
