import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderSmdCode(){
  mountTwoCol(`
    <div class="input-grid">
      <div class="field-span-2"><label>SMD code</label><input id="smdCode" value="472"></div>
    </div>
    <div class="actions"><button id="smdRun" class="primary-btn">Decode</button></div>
    <div class="note">Supports common numeric 3-digit and 4-digit styles and R-decimal forms such as 4R7.</div>
  `, `<div id="smdResult" class="result-box">Enter an SMD code and run the decoder.</div>`);
  $('smdRun').onclick = () => {
    const code = $('smdCode').value.trim().toUpperCase(); let ohms = NaN; let reason='';
    if (/^\d{3}$/.test(code)) { ohms = Number(code.slice(0,2)) * Math.pow(10, Number(code[2])); reason = '3-digit numeric code'; }
    else if (/^\d{4}$/.test(code)) { ohms = Number(code.slice(0,3)) * Math.pow(10, Number(code[3])); reason = '4-digit numeric code'; }
    else if (/^\d*R\d+$/.test(code)) { ohms = Number(code.replace('R','.')); reason = 'R used as decimal point'; }
    $('smdResult').textContent = Number.isFinite(ohms) ? `Decoded value: ${describeOhms(ohms)}\nReasoning: ${reason}` : 'Unsupported code format for this quick decoder.';
    report('SMD Resistor Code', Number.isFinite(ohms) ? describeOhms(ohms) : 'Unsupported code');
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'smd-code',
  section:'electronics', title:"SMD Resistor Code", badge:"Decoder", what:"Decodes common 3-digit and 4-digit SMD resistor markings.", why:"SMD markings are easy to misread, so a direct decoder saves time and wrong-part errors.", how:"For standard numeric codes, the last digit is treated as the power-of-ten multiplier. Codes with R are treated as decimal resistances.", render, tags:["smd", "resistor", "decoder"], schema
};

export const render = renderSmdCode;
export { renderSmdCode };
