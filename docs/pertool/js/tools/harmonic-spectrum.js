import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderHarmonicSpectrum(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'harmonic-spectrum',
  section:'power', title:"Harmonic Spectrum Viewer", badge:"THD", what:"Plots harmonic magnitudes and calculates THD from user-entered harmonic percentages.", why:"Nonlinear loads are easier to reason through when the distortion is visible instead of buried in a list.", how:"The spectrum is rendered as bars for the fundamental and selected harmonics. THD is calculated from the RMS sum of harmonic percentages relative to the fundamental.", render, tags:["harmonics", "thd", "waveform"], schema
};

export const render = renderHarmonicSpectrum;
export { renderHarmonicSpectrum };
