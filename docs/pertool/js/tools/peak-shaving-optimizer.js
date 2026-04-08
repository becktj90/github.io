import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderPeakShavingOptimizer(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'peak-shaving-optimizer',
  section:'optimization', title:"Peak Shaving Optimizer", badge:"Demand charges", what:"Calculates battery discharge needs to shave peak demand and reduce utility demand charges.", why:"Demand charges can dominate bills, so even modest shaving can have outsized value.", how:"The tool estimates shaved kW, discharge duration, required battery energy, and approximate annual savings from the chosen utility demand rate.", render, tags:["demand", "peak", "battery"], schema
};

export const render = renderPeakShavingOptimizer;
export { renderPeakShavingOptimizer };
