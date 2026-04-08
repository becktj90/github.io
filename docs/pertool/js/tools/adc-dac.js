import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderAdcDac(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="adcMode"><option value="code-to-voltage">Code → Voltage</option><option value="voltage-to-code">Voltage → Code</option></select></div>
      <div><label>Resolution (bits)</label><input id="adcBits" type="number" value="12"></div>
      <div><label>Reference voltage (V)</label><input id="adcVref" type="number" value="3.3"></div>
      <div><label>Code or voltage</label><input id="adcValue" type="number" value="2048"></div>
    </div>
    <div class="actions"><button id="adcRun" class="primary-btn">Convert</button></div>
    <div class="note">Converts between ADC/DAC codes and analog voltages using straight binary scaling and full-scale range.</div>
  `, `<div id="adcResult" class="result-box">Run the tool to compute step size, full-scale range, and conversion results.</div>`);
  const collect = () => ({ mode:$('adcMode').value, bits:$('adcBits').value, vref:$('adcVref').value, value:$('adcValue').value });
  const apply = (s) => { $('adcMode').value=s.mode||'code-to-voltage'; $('adcBits').value=s.bits||12; $('adcVref').value=s.vref||3.3; $('adcValue').value=s.value||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('adc-dac', collect, apply));
  $('adcRun').onclick = () => {
    const mode = $('adcMode').value, bits = Math.max(1, Math.min(24, +$('adcBits').value||12));
    const vref = Math.max(0.001, +$('adcVref').value||1);
    const raw = +$('adcValue').value;
    const maxCode = Math.pow(2, bits) - 1;
    const step = vref / maxCode;
    if (mode === 'code-to-voltage') {
      const code = Math.min(maxCode, Math.max(0, Math.round(raw)));
      const voltage = code * step;
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted voltage: ${fmt(voltage,4)} V\n\nReasoning\n- Voltage = code × step\-size\n- Full-scale is ${fmt(vref,4)} V at code ${maxCode}`;
      report('ADC / DAC Helper', `Code ${code} → ${fmt(voltage,4)} V`);
    } else {
      const voltage = Math.min(vref, Math.max(0, raw));
      const code = Math.round(voltage / step);
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted code: ${code}\n\nReasoning\n- Code = voltage / step\-size\n- Input voltage limited to 0–${fmt(vref,4)} V`;
      report('ADC / DAC Helper', `${fmt(voltage,4)} V → code ${code}`);
    }
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'adc-dac',
  section:'electronics', title:"ADC / DAC Resolution Helper", badge:"Quantization", what:"Converts bit depth and reference voltage into LSB size and code relationships.", why:"This clarifies what a given converter resolution really means in voltage terms.", how:"The tool computes the code count, then divides reference voltage by counts to determine the LSB.", render, tags:["adc", "dac", "resolution"], schema
};

export const render = renderAdcDac;
export { renderAdcDac };
