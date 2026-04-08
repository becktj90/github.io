import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from './utils.js';
export function renderPowerTriangle(){
  mountTwoCol(`
    <div class="input-grid">
      <div><label>Real power kW</label><input id="ptKW" type="number" value="45"></div>
      <div><label>Power factor</label><input id="ptPF" type="number" step="0.01" value="0.86"></div>
    </div>
    <div class="actions"><button id="ptRun" class="primary-btn">Generate Triangle</button></div>
  `, `<div id="ptResult" class="result-box">Run the tool to compute kVA, kVAR, and draw the triangle.</div><div class="chart-wrap"><svg id="ptSvg" viewBox="0 0 420 280"></svg></div>`);
  $('ptRun').onclick = () => {
    const kw = +$('ptKW').value||0, pf = Math.max(0.01, Math.min(1, +$('ptPF').value || 1));
    const kva = kw/pf;
    const kvar = Math.sqrt(Math.max(kva*kva - kw*kw, 0));
    const angle = Math.acos(pf) * 180 / Math.PI;
    $('ptResult').textContent = `kVA: ${fmt(kva,2)}\nkVAR: ${fmt(kvar,2)}\nPhase angle: ${fmt(angle,2)}°\n\nReasoning\n- kVA = kW / PF\n- kVAR = √(kVA² − kW²)`;
    const max = Math.max(kva, kw, kvar, 1), sx = 250/max, sy = 190/max; const base = kw*sx, vert = kvar*sy;
    $('ptSvg').innerHTML = `
      <line x1="50" y1="230" x2="370" y2="230" stroke="rgba(255,255,255,.2)"/>
      <line x1="50" y1="40" x2="50" y2="230" stroke="rgba(255,255,255,.2)"/>
      <polyline points="50,230 ${50+base},230 ${50+base},${230-vert} 50,230" fill="rgba(103,214,255,.12)" stroke="rgba(103,214,255,.8)" stroke-width="3"/>
      <text x="${55+base/2}" y="248" fill="currentColor">P = ${fmt(kw,1)} kW</text>
      <text x="${58+base}" y="${225-vert/2}" fill="currentColor">Q = ${fmt(kvar,1)} kVAR</text>
      <text x="${55+base/2}" y="${210-vert/2}" fill="currentColor">S = ${fmt(kva,1)} kVA</text>
      <text x="82" y="210" fill="currentColor">θ = ${fmt(angle,1)}°</text>`;
    report('Power Triangle', `${fmt(kw,1)} kW, ${fmt(kva,1)} kVA, ${fmt(kvar,1)} kVAR`);
  };
}

export function renderPhasorPlotter(){
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

export function renderHarmonicSpectrum(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Fundamental %</label><input id="h1" type="number" value="100"></div>
      <div><label>3rd %</label><input id="h3" type="number" value="18"></div>
      <div><label>5th %</label><input id="h5" type="number" value="26"></div>
      <div><label>7th %</label><input id="h7" type="number" value="14"></div>
      <div><label>9th %</label><input id="h9" type="number" value="8"></div>
      <div><label>11th %</label><input id="h11" type="number" value="5"></div>
      <div><label>13th %</label><input id="h13" type="number" value="3"></div>
    </div>
    <div class="actions"><button id="hRun" class="primary-btn">Plot Spectrum</button></div>
  `, `<div id="hResult" class="result-box">Run the tool to compute THD and generate the spectrum.</div><div class="chart-wrap"><svg id="hSvg" viewBox="0 0 520 250"></svg></div>`);
  $('hRun').onclick = () => {
    const data = [1,3,5,7,9,11,13].map(n => [n, +$(`h${n}`).value || 0]);
    const thd = Math.sqrt(data.slice(1).reduce((s,[,v])=>s+v*v,0));
    $('hResult').textContent = `THD: ${fmt(thd,2)}%\nDominant harmonic: ${data.slice(1).sort((a,b)=>b[1]-a[1])[0][0]}th\n\nReasoning\n- THD is the RMS sum of harmonic percentages relative to the fundamental\n- The spectrum is a quick fingerprint of nonlinear loading`;
    const max = Math.max(...data.map(([,v])=>v), 100); const svg=$('hSvg');
    svg.innerHTML = data.map(([n,v],i)=>{
      const x = 40 + i*65, h = 170*(v/max), y = 210-h;
      return `<rect x="${x}" y="${y}" width="36" height="${h}" rx="7" fill="rgba(${n===1?'103,214,255':'255,211,110'},${n===1?'.7':'.72'})"/><text x="${x+7}" y="228" fill="currentColor">${n}</text><text x="${x+2}" y="${Math.max(y-8,18)}" fill="currentColor" font-size="12">${fmt(v,0)}%</text>`;
    }).join('') + `<line x1="24" y1="210" x2="500" y2="210" stroke="rgba(255,255,255,.16)"/><text x="24" y="18" fill="currentColor">THD ${fmt(thd,2)}%</text>`;
    report('Harmonic Spectrum', `THD ${fmt(thd,2)}%, dominant ${data.slice(1).sort((a,b)=>b[1]-a[1])[0][0]}th`);
  };
}
