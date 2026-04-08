import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderBranchCircuit(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Continuous load (A)</label><input id="bcCont" type="number" value="48"></div>
      <div><label>Noncontinuous load (A)</label><input id="bcNon" type="number" value="12"></div>
      <div><label>Spare margin (%)</label><input id="bcMargin" type="number" value="10"></div>
      <div><label>Voltage (V)</label><input id="bcVolt" type="number" value="480"></div>
    </div>
    <div class="actions"><button id="bcRun" class="primary-btn">Size Branch Circuit</button></div>
    <div class="note">Planning-level NEC-style helper. Verify the adopted code edition, conductor insulation, temperature correction, conductor count adjustment, and motor-specific exceptions before issuing for construction.</div>
  `, `
    <div id="bcResult" class="result-box">Run the tool to build a practical branch-circuit package.</div>
  `);
  const collect = () => ({ cont: $('bcCont').value, non: $('bcNon').value, margin: $('bcMargin').value, volt: $('bcVolt').value });
  const apply = (s) => { $('bcCont').value=s.cont||''; $('bcNon').value=s.non||''; $('bcMargin').value=s.margin||''; $('bcVolt').value=s.volt||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('branch-circuit', collect, apply));
  $('bcRun').onclick = () => {
    const cont = +$('bcCont').value || 0, non = +$('bcNon').value || 0, margin = (+$('bcMargin').value || 0)/100;
    const design = (cont*1.25 + non)*(1+margin);
    const [cond, condAmp] = nearestConductor(design);
    const breaker = nearestBreaker(design);
    const egc = egcForBreaker(breaker);
    $('bcResult').textContent = `Design current: ${fmt(design,1)} A\nSuggested copper conductor: ${cond} (${condAmp} A @ 75°C)\nSuggested standard breaker: ${breaker} A\nEquipment grounding conductor: ${egc}\n\nReasoning\n- Continuous load at 125%: ${fmt(cont*1.25,1)} A\n- Noncontinuous load: ${fmt(non,1)} A\n- Spare margin: ${fmt(margin*100,0)}%\n- Voltage reference: ${fmt(+$('bcVolt').value || 0,0)} V`;
    report('Branch Circuit Sizer', `${fmt(design,1)} A design, ${cond}, ${breaker} A breaker`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'branch-circuit',
  section:'code', title:"Branch Circuit Sizer", badge:"NEC-style package", what:"Packages continuous and noncontinuous load into a practical branch-circuit design result with conductor, breaker, and EGC suggestions.", why:"This mirrors the way people actually size circuits in the field: not just amps, but the whole package.", how:"Continuous load is counted at 125%, noncontinuous load is added directly, an optional spare margin is applied, then the next suitable copper conductor, breaker, and EGC are selected.", render, tags:["nec", "breaker", "conductor"], schema
};

export const render = renderBranchCircuit;
export { renderBranchCircuit };
