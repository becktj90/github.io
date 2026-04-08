import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderPhasorPlotter(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Phase-to-phase voltage</label><input id="phV" type="number" value="480"></div>
      <div><label>Sequence</label><select id="phSeq"><option value="abc">ABC</option><option value="acb">ACB</option></select></div>
      <div><label>Reference angle A (deg)</label><input id="phAng" type="number" value="0"></div>
    </div>
    <div class="actions"><button id="phRun" class="primary-btn">Draw Phasors</button></div>
  `, `<div id="phResult" class="result-box">Run the tool to draw balanced three-phase phasors.</div><div class="chart-wrap"><svg id="phSvg" viewBox="0 0 420 320"></svg></div>`);
  $('phRun').onclick = () => {
    const v = +$('phV').value||0, seq=$('phSeq').value, a0=(+$('phAng').value||0)*Math.PI/180;
    const order = seq==='abc' ? [0,-120,120] : [0,120,-120];
    const names = ['A','B','C']; const colors = ['rgba(103,214,255,.9)','rgba(94,241,195,.9)','rgba(255,211,110,.9)'];
    const cx=210, cy=160, r=110; let ph=[];
    for(let i=0;i<3;i++){ const ang=a0+order[i]*Math.PI/180; ph.push({x:cx+r*Math.cos(ang), y:cy-r*Math.sin(ang), ang:order[i]}); }
    $('phSvg').innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.12)"/>
      <line x1="${cx-r-10}" y1="${cy}" x2="${cx+r+10}" y2="${cy}" stroke="rgba(255,255,255,.12)"/>
      <line x1="${cx}" y1="${cy-r-10}" x2="${cx}" y2="${cy+r+10}" stroke="rgba(255,255,255,.12)"/>
      ${ph.map((p,i)=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${colors[i]}" stroke-width="4"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="${colors[i]}"/><text x="${p.x+8}" y="${p.y-8}" fill="currentColor">${names[i]}</text>`).join('')}`;
    $('phResult').textContent = `Balanced phasors drawn for ${fmt(v,0)} V ${seq.toUpperCase()} sequence\nPhase A angle: ${fmt((+$('phAng').value||0),1)}°\nPhase spacing: 120° electrical\n\nReasoning\n- Balanced systems place each phase vector 120° apart\n- Sequence changes the rotation direction of B and C`;
    report('3-Phase Phasor Plotter', `${fmt(v,0)} V, ${seq.toUpperCase()} sequence`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'phasor-plotter',
  section:'power', title:"3-Phase Phasor Plotter", badge:"SVG plot", what:"Draws balanced three-phase voltage phasors with user-set magnitude and phase sequence.", why:"A fast phasor picture helps people understand rotation, phase displacement, and where measurements should land.", how:"Each phase is placed 120 electrical degrees apart from the reference and rendered as a vector from the center point.", render, tags:["phasor", "three phase", "rotation"], schema
};

export const render = renderPhasorPlotter;
export { renderPhasorPlotter };
