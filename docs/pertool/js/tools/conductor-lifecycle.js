import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderConductorLifecycle(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Current (A)</label><input id="clCurrent" type="number" value="200"></div>
      <div><label>Distance (feet)</label><input id="clDist" type="number" value="500"></div>
      <div><label>Energy cost ($/kWh)</label><input id="clEnergyCost" type="number" value="0.12"></div>
      <div><label>Annual operating hours</label><input id="clAnnualHours" type="number" value="8760"></div>
      <div><label>Analysis period (years)</label><input id="clYears" type="number" value="20"></div>
      <div><label>Material</label><select id="clMaterial"><option value="copper" selected>Copper</option><option value="aluminum">Aluminum</option></select></div>
    </div>
    <div class="actions"><button id="clRun" class="primary-btn">Analyze Lifecycle Cost</button></div>
    <div class="note">Compares conductor sizes, balancing initial cost against energy loss cost over the analysis period.</div>
  `, `<div id="clResult" class="result-box">Run the analysis to find the optimal conductor size.</div><div class="chart-wrap"><svg id="clCostChart" viewBox="0 0 560 200" style="max-width: 100%;"></svg></div>`);
  const collect = () => ({ i:$('clCurrent').value, d:$('clDist').value, e:$('clEnergyCost').value, h:$('clAnnualHours').value, y:$('clYears').value, m:$('clMaterial').value });
  const apply = (s) => { $('clCurrent').value=s.i||''; $('clDist').value=s.d||''; $('clEnergyCost').value=s.e||''; $('clAnnualHours').value=s.h||''; $('clYears').value=s.y||''; $('clMaterial').value=s.m||'copper'; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('conductor-lifecycle', collect, apply));
  $('clRun').onclick = () => {
    const I = +$('clCurrent').value||0, dist = +$('clDist').value||0, eCost = +$('clEnergyCost').value||0.12, annHrs = +$('clAnnualHours').value||8760, years = +$('clYears').value||20, mat = $('clMaterial').value;
    if (I<=0 || dist<=0) { $('clResult').textContent = 'Please enter valid values.'; return; }
    const sizes = [4, 2, 1, '1/0', '2/0', '3/0', '4/0'];
    const resis = mat==='copper' ? [0.00624,0.00974,0.01232,0.01560,0.01968,0.02480,0.03133] : [0.01030,0.01602,0.02020,0.02560,0.03224,0.04047,0.05129];
    const costs = mat==='copper' ? [45,60,85,110,135,175,215] : [30,40,55,75,90,115,145];
    let bestIdx = 0, bestTotal = Infinity;
    const results = [];
    for (let i=0; i<sizes.length; i++){
      const R = resis[i] * 2 * dist / 1000;
      const losses = I*I*R;
      const lossEnergy = losses * annHrs / 1000;
      const lossCost = lossEnergy * eCost * years;
      const matCost = costs[i] * dist * 1.5;
      const total = matCost + lossCost;
      results.push({size: sizes[i], loss: losses, lossCost, matCost, total});
      if (total < bestTotal) { bestTotal = total; bestIdx = i; }
    }
    const best = results[bestIdx];
    $('clResult').textContent = `LIFECYCLE COST ANALYSIS (${years}-year period)\n\nOPTIMAL CONDUCTOR: ${best.size} AWG\n\nInitial Material Cost: $${fmt(best.matCost,0)}\nLifetime Loss Cost: $${fmt(best.lossCost,0)}\nTotal Lifecycle Cost: $${fmt(best.total,0)}\n\nPower Loss: ${fmt(best.loss,2)} W\nAnnual Loss Energy: ${fmt(best.loss*annHrs/1000,0)} kWh\n\nAnalysis\n- I² R losses scale with size; larger conductors reduce losses\n- ${best.matCost < results[bestIdx-1]?.matCost ? 'Lower cost now, but high loss cost later' : 'Slightly higher upfront cost is recovered in energy savings'}\n- Analysis assumes continuous ${I}A loading, ${annHrs} hours/year`;
    const svg = $('clCostChart');
    const w = 560, h = 200, pad = 45, x0 = pad, y0 = h - pad;
    const maxCost = Math.max(...results.map(r => r.total)) * 1.1;
    const toX = (i) => x0 + (i / (results.length-1)) * (w - 2*pad);
    const toY = (c) => y0 - (c / maxCost) * (h - 2*pad);
    let svg_html = `<g fill="none" stroke-width="2.5" stroke="rgba(255,211,110,.7)"><polyline points="${results.map((r,i) => toX(i)+','+toY(r.total)).join(' ')}"/></g>`;
    for (let i=0; i<results.length; i++){
      svg_html += `<circle cx="${toX(i)}" cy="${toY(results[i].total)}" r="5" fill="${i===bestIdx?'#7ef1c3':'rgba(103,214,255,.4)'}"/>`;
    }
    svg_html += `<g font-size="12" fill="currentColor"><text x="${pad}" y="25">Lifecycle Cost by Conductor Size</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg_html += `<g fill="currentColor" font-size="11" text-anchor="middle"><text x="${pad*0.5}" y="${y0+5}">$</text><text x="${w-15}" y="${y0+20}">AWG</text></g>`;
    svg.innerHTML = svg_html;
    report('Conductor Lifecycle', `Optimal: ${best.size} AWG, total cost $${fmt(best.total,0)}`);
  };
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'conductor-lifecycle',
  section:'optimization', title:"Conductor Lifecycle Tradeoff", badge:"Capex vs loss", what:"Compares conductor sizes by capex and lifetime energy-loss cost.", why:"A larger conductor often costs more up front but less over the life of the system.", how:"The tool estimates conductor resistance, annual energy loss, lifetime loss cost at current energy prices, and recommends the economically optimal conductor size.", render, tags:["conductor", "losses", "lifecycle"], schema
};

export const render = renderConductorLifecycle;
export { renderConductorLifecycle };
