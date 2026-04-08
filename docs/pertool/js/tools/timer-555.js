import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function render555(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>RA (Ω)</label><input id="t555Ra" type="number" value="1000"></div>
      <div><label>RB (Ω)</label><input id="t555Rb" type="number" value="6800"></div>
      <div><label>C (F)</label><input id="t555C" type="number" value="0.000001"></div>
    </div>
    <div class="actions"><button id="t555Run" class="primary-btn">Calculate</button></div>
  `, `<div id="t555Result" class="result-box">Run the tool to calculate 555 astable timing.</div>`);
  $('t555Run').onclick = () => {
    const ra=+$('t555Ra').value||1, rb=+$('t555Rb').value||1, c=+$('t555C').value||1e-9; const th=0.693*(ra+rb)*c, tl=0.693*rb*c, f=1/(th+tl), duty = 100*th/(th+tl);
    $('t555Result').textContent = `High time: ${fmt(th*1000,3)} ms\nLow time: ${fmt(tl*1000,3)} ms\nFrequency: ${fmt(f,2)} Hz\nDuty cycle: ${fmt(duty,2)}%`;
    report('555 Astable Timer', `${fmt(f,2)} Hz, ${fmt(duty,1)}% duty`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'timer-555',
  section:'electronics', title:"555 Astable Timer", badge:"Timing", what:"Calculates frequency and duty cycle for a standard astable 555 network.", why:"This makes quick oscillator and blink-rate setup much faster.", how:"The tool uses the classic 555 astable equations based on RA, RB, and C.", render, tags:["555", "timer", "frequency"], schema
};

export const render = render555;
export { render555 };
