import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderGensetBatteryOptimizer(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'genset-battery-optimizer',
  section:'optimization', title:"Generator + Battery Optimizer", badge:"Hybrid sizing", what:"Finds a practical battery size, charge power, and generator operating window for a hybrid power system.", why:"Battery and generator systems are almost always a tradeoff between runtime, fuel, lifecycle, and capex.", how:"The tool evaluates candidate battery capacities and generator loading scenarios, then reports the lowest-cost feasible solution.", render, tags:["battery", "generator", "optimizer"], schema
};

export const render = renderGensetBatteryOptimizer;
export { renderGensetBatteryOptimizer };
