import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderTransformerPackage(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Phase</label><select id="xfPhase"><option value="3">3-phase</option><option value="1">1-phase</option></select></div>
      <div><label>Load voltage (V)</label><input id="xfLoadV" type="number" value="208"></div>
      <div><label>Load current (A)</label><input id="xfLoadI" type="number" value="180"></div>
      <div><label>Power factor</label><input id="xfPf" type="number" step="0.01" value="0.92"></div>
      <div><label>Primary voltage (V)</label><input id="xfPriV" type="number" value="480"></div>
      <div><label>Secondary voltage (V)</label><input id="xfSecV" type="number" value="208"></div>
    </div>
    <div class="actions"><button id="xfRun" class="primary-btn">Build Package</button></div>
    <div class="note">This is intentionally fast and practical. Confirm overcurrent rules, inrush allowances, and conductor termination limits before treating it as final design.</div>
  `, `<div id="xfResult" class="result-box">Run the tool to estimate transformer size and both-side currents.</div>`);
  const collect = () => ({ phase:$('xfPhase').value, lv:$('xfLoadV').value, li:$('xfLoadI').value, pf:$('xfPf').value, pri:$('xfPriV').value, sec:$('xfSecV').value });
  const apply = (s) => { $('xfPhase').value=s.phase||'3'; $('xfLoadV').value=s.lv||''; $('xfLoadI').value=s.li||''; $('xfPf').value=s.pf||''; $('xfPriV').value=s.pri||''; $('xfSecV').value=s.sec||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('transformer-package', collect, apply));
  $('xfRun').onclick = () => {
    const phase = +$('xfPhase').value, lv = +$('xfLoadV').value||0, li=+$('xfLoadI').value||0, pf=Math.max(0.1, Math.min(1, +$('xfPf').value || 1));
    const pri = +$('xfPriV').value||0, sec = +$('xfSecV').value||0;
    const kva = phase===3 ? Math.sqrt(3)*lv*li/1000 : lv*li/1000;
    const kw = kva*pf;
    const std = nearestTransformer(kva);
    const priI = phase===3 ? std*1000/(Math.sqrt(3)*pri) : std*1000/pri;
    const secI = phase===3 ? std*1000/(Math.sqrt(3)*sec) : std*1000/sec;
    const priB = nearestBreaker(priI*1.25), secB = nearestBreaker(secI*1.25);
    $('xfResult').textContent = `Estimated load: ${fmt(kva,2)} kVA (${fmt(kw,2)} kW at PF ${fmt(pf,2)})\nSuggested standard transformer: ${fmt(std,1)} kVA\nPrimary current at ${fmt(pri,0)} V: ${fmt(priI,1)} A\nSecondary current at ${fmt(sec,0)} V: ${fmt(secI,1)} A\nSuggested primary breaker: ${priB} A\nSuggested secondary breaker: ${secB} A\n\nReasoning\n- Apparent power was computed from volts and amps\n- Standard size rounded up to the next common transformer rating\n- Primary and secondary currents are based on the selected standard size`;
    report('Transformer Package', `${fmt(std,1)} kVA, ${fmt(priI,1)} A primary, ${fmt(secI,1)} A secondary`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'transformer-package',
  section:'code', title:"Transformer Package", badge:"Primary + secondary", what:"Builds a transformer sizing package from load data and shows primary and secondary currents with standard kVA selection.", why:"This turns load information into a practical transformer package rather than an isolated kVA number.", how:"The tool computes apparent power from volts and amps, selects the next standard transformer, then calculates primary and secondary current for the chosen phase and voltages.", render, tags:["transformer", "kva", "primary", "secondary"], schema
};

export const render = renderTransformerPackage;
export { renderTransformerPackage };
