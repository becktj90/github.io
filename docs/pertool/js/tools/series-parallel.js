import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderSeriesParallel(){
  mountTwoCol(`
    <div class="input-grid">
      <div class="field-span-2"><label>Resistor values (ohms, comma or space separated)</label><input id="spList" value="100, 220, 470"></div>
      <div><label>Topology</label><select id="spMode"><option value="series">Series</option><option value="parallel">Parallel</option></select></div>
    </div>
    <div class="actions"><button id="spRun" class="primary-btn">Calculate</button></div>
  `, `<div id="spResult" class="result-box">Enter values to calculate equivalent resistance.</div>`);
  $('spRun').onclick = () => {
    const vals = parseList($('spList').value); const mode = $('spMode').value;
    const eq = mode==='series' ? vals.reduce((a,b)=>a+b,0) : 1/vals.reduce((a,b)=>a+1/b,0);
    $('spResult').textContent = `Equivalent resistance: ${describeOhms(eq)}\nCount: ${vals.length} resistor(s)\nMode: ${mode}`;
    report('Series / Parallel Resistors', `${describeOhms(eq)} equivalent in ${mode}`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'series-parallel',
  section:'electronics', title:"Series / Parallel Resistors", badge:"Network", what:"Calculates equivalent resistance for lists of resistor values in series or parallel.", why:"This is one of the fastest ways to rough in substitutions or prototype around missing parts.", how:"Series values sum directly. Parallel values use the reciprocal-sum relationship.", render, tags:["resistance", "series", "parallel"], schema
};

export const render = renderSeriesParallel;
export { renderSeriesParallel };
