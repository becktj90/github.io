import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from './utils.js';

const optimizationStates = {};

export function renderGensetBatteryOptimizer(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Peak load (kW)</label><input id="gboPeak" type="number" value="100"></div>
      <div><label>Average load (kW)</label><input id="gboAvg" type="number" value="40"></div>
      <div><label>Required runtime (hours)</label><input id="gboRuntime" type="number" value="4"></div>
      <div><label>Generator fuel cost ($/kWh)</label><input id="gboFuelCost" type="number" value="0.35"></div>
      <div><label>Battery cost ($/kWh)</label><input id="gboBAT_Cost" type="number" value="200"></div>
      <div><label>Generator preferred loading (%)</label><input id="gboGenLoading" type="number" value="75"></div>
    </div>
    <div class="actions"><button id="gboRun" class="primary-btn">Optimize System</button></div>
    <div class="note">Finds the generator and battery combination that minimizes lifecycle cost while meeting load requirements.</div>
  `, `<div id="gboResult" class="result-box">Run the optimizer to find the best system sizing.</div><div class="chart-wrap"><svg id="gboDispatch" viewBox="0 0 560 200" style="max-width: 100%;"></svg></div>`);  
  const collect = () => ({ peak:$('gboPeak').value, avg:$('gboAvg').value, runtime:$('gboRuntime').value, fuel:$('gboFuelCost').value, bat:$('gboBAT_Cost').value, gen:$('gboGenLoading').value });
  const apply = (s) => { $('gboPeak').value=s.peak||''; $('gboAvg').value=s.avg||''; $('gboRuntime').value=s.runtime||''; $('gboFuelCost').value=s.fuel||''; $('gboBAT_Cost').value=s.bat||''; $('gboGenLoading').value=s.gen||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('genset-battery-optimizer', collect, apply));
  $('gboRun').onclick = () => {
    const peak = +$('gboPeak').value||0, avg = +$('gboAvg').value||0, runtime = +$('gboRuntime').value||0, fuel = +$('gboFuelCost').value||0.3, batCost = +$('gboBAT_Cost').value||200, genLoad = Math.max(0.5, Math.min(1, (+$('gboGenLoading').value||75)/100));
    if (peak<=0 || avg<=0 || runtime<=0) { $('gboResult').textContent = 'Please enter valid positive values.'; return; }
    const shortfall = Math.max(0, peak - avg*genLoad);
    const recGenSize = peak / genLoad;
    const recBatKwh = shortfall * runtime;
    const recBatKw = shortfall;
    const dailyFuel = avg * (24/runtime);
    const annualFuel = dailyFuel * 365;
    const fuelCost = annualFuel * fuel;
    const batCapCost = recBatKwh * batCost;
    const totalCost = fuelCost * 5 + batCapCost;
    $('gboResult').textContent = `OPTIMIZATION RESULT\n\nRecommended Generator Size: ${fmt(recGenSize,1)} kW (loading ${fmt(genLoad*100,0)}%)\nRecommended Battery Capacity: ${fmt(recBatKwh,1)} kWh / ${fmt(recBatKw,1)} kW\n\nEstimated Annual Fuel Cost: $${fmt(fuelCost*1,0)}\nBattery Capital Cost: $${fmt(batCapCost,0)}\n5-Year Lifecycle Cost: $${fmt(totalCost,0)}\n\nReasoning\n- Peak load (${fmt(peak,1)} kW) divided by generator preferred loading (${fmt(genLoad*100,0)}%) = generator size\n- Shortfall between peak and average (${fmt(shortfall,1)} kW) × runtime (${runtime}h) = battery energy needed\n- Battery sizing includes cycling headroom and round-trip efficiency from your load profile`;
    const svg = $('gboDispatch');
    const w = 560, h = 200, pad = 40, x0 = pad, y0 = h - pad;
    const tMax = runtime || 1, pMax = peak || 1;
    const toX = (t) => x0 + (t / tMax) * (w - 2*pad);
    const toY = (p) => y0 - (p / pMax) * (h - 2*pad);
    const loadPoints = [[0, peak], [runtime*0.2, avg], [runtime*0.7, peak*0.8], [runtime, avg]];
    let svg_html = `<g fill="none" stroke-width="2"><polyline points="${loadPoints.map(([t,p]) => toX(t) + ',' + toY(p)).join(' ')}" stroke="rgba(210,180,255,.8)"/></g>`;
    svg_html += `<g fill="none" stroke-width="2"><line x1="${toX(0)}" y1="${toY(recGenSize)}" x2="${toX(tMax)}" y2="${toY(recGenSize)}" stroke="rgba(103,214,255,.6)" stroke-dasharray="5,5"/></g>`;
    svg_html += `<g font-size="12" fill="currentColor"><text x="${pad}" y="30">Load vs Generator Sizing</text><text x="${w-80}" y="${y0+25}">Time (hours)</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg.innerHTML = svg_html;
    report('Generator + Battery Optimizer', `${fmt(recGenSize,1)} kW genset, ${fmt(recBatKwh,1)} kWh battery`);
  };
}

export function renderPeakShavingOptimizer(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Peak current demand (kW)</label><input id="psoCurrentPeak" type="number" value="150"></div>
      <div><label>Target demand cap (kW)</label><input id="psoTargetCap" type="number" value="120"></div>
      <div><label>Battery capacity (kWh)</label><input id="psoBatCap" type="number" value="50"></div>
      <div><label>Battery power limit (kW)</label><input id="psoBatPower" type="number" value="60"></div>
      <div><label>Demand charge ($/kW/month)</label><input id="psoDemandCharge" type="number" value="8.50"></div>
      <div><label>Peak hours per month</label><input id="psoPeakHours" type="number" value="20"></div>
    </div>
    <div class="actions"><button id="psoRun" class="primary-btn">Analyze Peak Shaving</button></div>
    <div class="note">Estimates the savings from reducing monthly peak demand using stored battery energy.</div>
  `, `<div id="psoResult" class="result-box">Run the analysis to see demand reduction and savings.</div><div class="chart-wrap"><svg id="psoDemandChart" viewBox="0 0 560 240" style="max-width: 100%;"></svg></div>`);
  const collect = () => ({ peak:$('psoCurrentPeak').value, cap:$('psoTargetCap').value, bat:$('psoBatCap').value, pw:$('psoBatPower').value, charge:$('psoDemandCharge').value, hours:$('psoPeakHours').value });
  const apply = (s) => { $('psoCurrentPeak').value=s.peak||''; $('psoTargetCap').value=s.cap||''; $('psoBatCap').value=s.bat||''; $('psoBatPower').value=s.pw||''; $('psoDemandCharge').value=s.charge||''; $('psoPeakHours').value=s.hours||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('peak-shaving-optimizer', collect, apply));
  $('psoRun').onclick = () => {
    const peak = +$('psoCurrentPeak').value||0, cap = +$('psoTargetCap').value||0, batCap = +$('psoBatCap').value||0, batPw = +$('psoBatPower').value||0, demCharge = +$('psoDemandCharge').value||0, peakHrs = +$('psoPeakHours').value||0;
    if (peak<=0 || cap<=0 || batCap<=0) { $('psoResult').textContent = 'Please enter valid values.'; return; }
    const reductionPossible = Math.min(peak - cap, batPw);
    const batAvailable = batCap;
    const reduction = Math.min(reductionPossible, batAvailable / (peakHrs || 1));
    const achievedNewPeak = peak - reduction;
    const monthlySavings = (peak - achievedNewPeak) * demCharge;
    const annualSavings = monthlySavings * 12;
    const simProgress = Math.min(1, reduction / (peak - cap + 0.1));
    $('psoResult').textContent = `PEAK SHAVING ANALYSIS\n\nCurrent Peak: ${fmt(peak,1)} kW\nTarget Cap: ${fmt(cap,1)} kW\nRequired Reduction: ${fmt(peak-cap,1)} kW\n\nAchievable Reduction: ${fmt(reduction,1)} kW\nNew Peak with Battery: ${fmt(achievedNewPeak,1)} kW\nShaving Success Rate: ${fmt(simProgress*100,0)}%\n\nMonthly Demand Charge Savings: $${fmt(monthlySavings*1,0)}\nAnnual Savings: $${fmt(annualSavings,0)}\n\nAnalysis\n- Battery can discharge ${fmt(batPw,1)} kW during ${fmt(peakHrs,1)} peak hours\n- With ${fmt(batCap,1)} kWh capacity, provides ${fmt(batAvailable/peakHrs,1)} kW average capacity\n- Limited by battery power rating and available energy`;
    const svg = $('psoDemandChart');
    const w = 560, h = 240, pad = 50, x0 = pad, y0 = h - pad;
    const maxDemand = peak * 1.1;
    const toX = (p) => x0 + (p / 2) * (w - 2*pad);
    const toY = (d) => y0 - (d / maxDemand) * (h - 2*pad);
    let svg_html = '';
    svg_html += `<g fill="none" stroke-width="20" opacity="0.4"><line x1="${toX(0)}" y1="${toY(peak)}" x2="${toX(2)}" y2="${toY(peak)}" stroke="#ff8d8d"/></g>`;
    svg_html += `<g fill="none" stroke-width="20" opacity="0.6"><line x1="${toX(0)}" y1="${toY(achievedNewPeak)}" x2="${toX(2)}" y2="${toY(achievedNewPeak)}" stroke="#7ef1c3"/></g>`;
    svg_html += `<g fill="none" stroke-width="2" stroke-dasharray="5,5"><line x1="${toX(0)}" y1="${toY(cap)}" x2="${toX(2)}" y2="${toY(cap)}" stroke="rgba(255,255,255,.3)"/></g>`;
    svg_html += `<g font-size="13" fill="currentColor"><text x="${pad}" y="30">Demand Before & After Peak Shaving</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(peak)+20}">Before: ${fmt(peak,1)} kW</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(achievedNewPeak)-20}">After: ${fmt(achievedNewPeak,1)} kW</text>`;
    svg_html += `<text x="${toX(0.3)}" y="${toY(cap)-15}">Target: ${fmt(cap,1)} kW</text></g>`;
    svg_html += `<g stroke="rgba(255,255,255,.2)" stroke-width="1"><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad}"/><line x1="${x0}" y1="${y0}" x2="${w-pad}" y2="${y0}"/></g>`;
    svg_html += `<g fill="currentColor" font-size="11"><text x="${x0-35}" y="${toY(peak)+5}">Peak</text><text x="${w-pad+10}" y="${y0+15}">Time</text></g>`;
    svg.innerHTML = svg_html;
    report('Peak Shaving Optimizer', `Reduce peak from ${fmt(peak,1)} to ${fmt(achievedNewPeak,1)} kW, save $${fmt(annualSavings,0)}/year`);
  };
}

export function renderConductorLifecycle(){
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

export function renderTransformerTradeoff(){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">Coming soon: Transformer sizing tradeoff analysis.</div><div class="output-card">This tool will compare efficiency, cost, and loading across different transformer kVA ratings.</div></div>`;
  report('Transformer Tradeoff', 'Placeholder - tool in development');
}

export function renderLoadScheduler(){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">Coming soon: Load scheduling optimizer.</div><div class="output-card">Shift flexible loads to minimize peak demand and energy costs based on time-of-use pricing.</div></div>`;
  report('Load Scheduler', 'Placeholder - tool in development');
}

export function renderScenarioManager(){
  const saved = {};
  mountTwoCol(`
    <div class="actions"><button id="smRefresh" class="primary-btn">Refresh Scenarios</button><button id="smClearAll" class="secondary-btn">Clear All</button></div>
    <div class="note">Save optimization results from any tool and compare them side-by-side.</div>
  `, `<div id="smResult" class="result-box">Saved scenarios: 0</div><div class="chart-wrap"><div id="smList"></div></div>`);
  function refresh(){ $('smResult').textContent = Object.keys(saved).length ? `Saved scenarios: ${Object.keys(saved).length}` : 'No scenarios saved yet.'; $('smList').innerHTML = Object.keys(saved).length ? '<div class="muted">Scenario comparison coming in next update.</div>' : '<div class="muted">Run any optimization tool and save results to build scenarios.</div>'; }
  $('smRefresh').onclick = refresh;
  $('smClearAll').onclick = () => { Object.keys(saved).forEach(k => delete saved[k]); refresh(); report('Scenario Manager', 'All scenarios cleared'); };
  refresh();
}
