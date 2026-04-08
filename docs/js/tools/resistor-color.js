import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderResistorColor(){
  const colors = Object.keys(RESISTOR_DIGIT);
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Band 1</label><select id="rB1">${colors.map(c=>`<option ${c==='yellow'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Band 2</label><select id="rB2">${colors.map(c=>`<option ${c==='violet'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Multiplier</label><select id="rB3">${Object.keys(MULTIPLIER).map(c=>`<option ${c==='red'?'selected':''}>${c}</option>`).join('')}</select></div>
      <div><label>Tolerance</label><select id="rB4">${Object.keys(TOL).map(c=>`<option ${c==='gold'?'selected':''}>${c}</option>`).join('')}</select></div>
    </div>
    <div class="actions"><button id="rRun" class="primary-btn">Decode</button></div>
  `, `<div id="rResult" class="result-box">Run the tool to decode the resistor bands.</div>`);
  $('rRun').onclick = () => {
    const value = (RESISTOR_DIGIT[$('rB1').value]*10 + RESISTOR_DIGIT[$('rB2').value]) * MULTIPLIER[$('rB3').value];
    const tol = TOL[$('rB4').value] || 'n/a';
    $('rResult').textContent = `Nominal value: ${describeOhms(value)}\nTolerance: ${tol}\n\nReasoning\n- Digits: ${RESISTOR_DIGIT[$('rB1').value]} and ${RESISTOR_DIGIT[$('rB2').value]}\n- Multiplier: ×${MULTIPLIER[$('rB3').value]}`;
    report('Resistor Color Code', `${describeOhms(value)} ${tol}`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'resistor-color',
  section:'electronics', title:"Resistor Color Code", badge:"Decoder", what:"Converts 4-band resistor colors into resistance and tolerance.", why:"It is a fast identity check when bench parts are loose or labels are gone.", how:"The first two bands form the significant digits, the third band is the multiplier, and the fourth band sets tolerance.", render, tags:["resistor", "decoder", "bench"], schema
};

export const render = renderResistorColor;
export { renderResistorColor };
