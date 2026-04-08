import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from './utils.js';
function parseList(str){ return str.split(/[ ,]+/).map(Number).filter(v=>Number.isFinite(v)&&v>0); }

export function renderResistorColor(){
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

export function renderSmdCode(){
  mountTwoCol(`
    <div class="input-grid">
      <div class="field-span-2"><label>SMD code</label><input id="smdCode" value="472"></div>
    </div>
    <div class="actions"><button id="smdRun" class="primary-btn">Decode</button></div>
    <div class="note">Supports common numeric 3-digit and 4-digit styles and R-decimal forms such as 4R7.</div>
  `, `<div id="smdResult" class="result-box">Enter an SMD code and run the decoder.</div>`);
  $('smdRun').onclick = () => {
    const code = $('smdCode').value.trim().toUpperCase(); let ohms = NaN; let reason='';
    if (/^\d{3}$/.test(code)) { ohms = Number(code.slice(0,2)) * Math.pow(10, Number(code[2])); reason = '3-digit numeric code'; }
    else if (/^\d{4}$/.test(code)) { ohms = Number(code.slice(0,3)) * Math.pow(10, Number(code[3])); reason = '4-digit numeric code'; }
    else if (/^\d*R\d+$/.test(code)) { ohms = Number(code.replace('R','.')); reason = 'R used as decimal point'; }
    $('smdResult').textContent = Number.isFinite(ohms) ? `Decoded value: ${describeOhms(ohms)}\nReasoning: ${reason}` : 'Unsupported code format for this quick decoder.';
    report('SMD Resistor Code', Number.isFinite(ohms) ? describeOhms(ohms) : 'Unsupported code');
  };
}

export function renderSeriesParallel(){
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

export function renderVoltageDivider(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>Vin (V)</label><input id="vdVin" type="number" value="12"></div>
      <div><label>R1 (Ω)</label><input id="vdR1" type="number" value="10000"></div>
      <div><label>R2 (Ω)</label><input id="vdR2" type="number" value="4700"></div>
    </div>
    <div class="actions"><button id="vdivRun" class="primary-btn">Calculate</button></div>
  `, `<div id="vdivResult" class="result-box">Run the tool to compute divider output and resistor dissipation.</div>`);
  $('vdivRun').onclick = () => {
    const vin=+$('vdVin').value||0, r1=+$('vdR1').value||1, r2=+$('vdR2').value||1; const i = vin/(r1+r2); const vout = vin*r2/(r1+r2);
    $('vdivResult').textContent = `Vout: ${fmt(vout,3)} V\nDivider current: ${fmt(i*1000,3)} mA\nR1 power: ${fmt(i*i*r1*1000,3)} mW\nR2 power: ${fmt(i*i*r2*1000,3)} mW`;
    report('Voltage Divider', `${fmt(vout,3)} V out at ${fmt(i*1000,3)} mA`);
  };
}

export function renderRcFilter(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Type</label><select id="rcType"><option>Low-pass</option><option>High-pass</option></select></div>
      <div><label>Cutoff frequency (Hz)</label><input id="rcFc" type="number" value="1000"></div>
      <div><label>Known resistor (Ω)</label><input id="rcR" type="number" value="10000"></div>
      <div><label>Known capacitor (F)</label><input id="rcC" type="number" value="0.0000000159"></div>
    </div>
    <div class="actions"><button id="rcSolveC" class="primary-btn">Solve for C</button><button id="rcSolveR" class="secondary-btn">Solve for R</button></div>
  `, `<div id="rcResult" class="result-box">Pick which component to solve for.</div>`);
  $('rcSolveC').onclick = () => { const fc=+$('rcFc').value||1, r=+$('rcR').value||1; const c = 1/(2*Math.PI*r*fc); $('rcResult').textContent = `${$('rcType').value} filter\nRequired C: ${describeCap(c)}\nEquation: C = 1 / (2πRf_c)`; report('RC Filter Designer', `Solved C = ${describeCap(c)}`); };
  $('rcSolveR').onclick = () => { const fc=+$('rcFc').value||1, c=+$('rcC').value||1e-9; const r = 1/(2*Math.PI*c*fc); $('rcResult').textContent = `${$('rcType').value} filter\nRequired R: ${describeOhms(r)}\nEquation: R = 1 / (2πCf_c)`; report('RC Filter Designer', `Solved R = ${describeOhms(r)}`); };
}

export function renderLedResistor(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Supply voltage (V)</label><input id="ledVs" type="number" value="12"></div>
      <div><label>LED forward voltage (V)</label><input id="ledVf" type="number" value="2.1"></div>
      <div><label>LED count in series</label><input id="ledN" type="number" value="3"></div>
      <div><label>Target current (mA)</label><input id="ledI" type="number" value="20"></div>
    </div>
    <div class="actions"><button id="ledRun" class="primary-btn">Size Resistor</button></div>
  `, `<div id="ledResult" class="result-box">Run the tool to size the current-limiting resistor.</div>`);
  $('ledRun').onclick = () => {
    const vs=+$('ledVs').value||0, vf=+$('ledVf').value||0, n=Math.max(1, +$('ledN').value||1), i=(+$('ledI').value||0)/1000; const drop = vs-vf*n;
    if (drop <= 0 || i<=0) { $('ledResult').textContent = 'Supply voltage must exceed total LED forward voltage, and current must be positive.'; return; }
    const r = drop/i; const p = i*i*r; $('ledResult').textContent = `Required resistor: ${describeOhms(r)}\nResistor power: ${fmt(p*1000,1)} mW\nRecommended minimum wattage: ${p>0.25?'1 W':p>0.125?'1/2 W':'1/4 W'}\n\nReasoning\n- Available resistor voltage = ${fmt(drop,2)} V`;
    report('LED Series Resistor', `${describeOhms(r)}, ${fmt(p*1000,1)} mW`);
  };
}

export function render555(){
  mountTwoCol(`
    <div class="input-grid cols-3">
      <div><label>RA (Ω)</label><input id="t555Ra" type="number" value="1000"></div>
      <div><label>RB (Ω)</label><input id="t555Rb" type="number" value="6800"></div>
      <div><label>C (F)</label><input id="t555C" type="number" value="0.000001"></div>
    </div>
    <div class="actions"><button id="t555Run" class="primary-btn">Calculate</button></div>
  `, `<div id="t555Result" class="result-box">Run the tool to calculate 555 astable timing.</div>`);
  $('t555Run').onclick = () => {
    const ra=+$('t555Ra').value||1, rb=+$('t555Rb').value||1, c=+$('t555C').value||1e-9; const th=0.693*(ra+rb)*c, tl=0.693*rb*c, f=1/(th+tl), duty = 100*th/(th+tl);
    $('t555Result').textContent = `High time: ${fmt(th*1000,3)} ms\nLow time: ${fmt(tl*1000,3)} ms\nFrequency: ${fmt(f,2)} Hz\nDuty cycle: ${fmt(duty,2)}%`;
    report('555 Astable Timer', `${fmt(f,2)} Hz, ${fmt(duty,1)}% duty`);
  };
}

export function renderOpamp(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="oaMode"><option value="noninv">Non-inverting</option><option value="inv">Inverting</option></select></div>
      <div><label>Input voltage (V)</label><input id="oaVin" type="number" value="0.25"></div>
      <div><label>Rin / Rg (Ω)</label><input id="oaRin" type="number" value="10000"></div>
      <div><label>Rf (Ω)</label><input id="oaRf" type="number" value="47000"></div>
    </div>
    <div class="actions"><button id="oaRun" class="primary-btn">Calculate</button></div>
  `, `<div id="oaResult" class="result-box">Run the tool to compute gain and estimated output.</div>`);
  $('oaRun').onclick = () => {
    const mode=$('oaMode').value, vin=+$('oaVin').value||0, rin=+$('oaRin').value||1, rf=+$('oaRf').value||1;
    const gain = mode==='noninv' ? 1 + rf/rin : -rf/rin; const out = vin*gain;
    $('oaResult').textContent = `Closed-loop gain: ${fmt(gain,3)} V/V\nEstimated output: ${fmt(out,3)} V\nMode: ${mode==='noninv'?'Non-inverting':'Inverting'}\n\nReasoning\n- ${mode==='noninv' ? 'Gain = 1 + Rf/Rg' : 'Gain = -Rf/Rin'}`;
    report('Op-Amp Gain Helper', `Gain ${fmt(gain,2)}, Vout ${fmt(out,3)} V`);
  };
}

export function renderCapCode(){
  mountTwoCol(`
    <div class="input-grid"><div class="field-span-2"><label>3-digit capacitor code</label><input id="capCode" value="104"></div></div>
    <div class="actions"><button id="capRun" class="primary-btn">Decode</button></div>
  `, `<div id="capResult" class="result-box">Enter a 3-digit code like 104 or 472.</div>`);
  $('capRun').onclick = () => {
    const code = $('capCode').value.trim();
    if (!/^\d{3}$/.test(code)) { $('capResult').textContent = 'Use a 3-digit numeric code.'; return; }
    const pf = Number(code.slice(0,2)) * Math.pow(10, Number(code[2]));
    $('capResult').textContent = `Capacitance: ${pf} pF\n= ${fmt(pf/1000,3)} nF\n= ${fmt(pf/1e6,3)} µF\n\nReasoning\n- Significant digits: ${code.slice(0,2)}\n- Multiplier: 10^${code[2]} pF`;
    report('Capacitor Code Decoder', `${pf} pF (${fmt(pf/1000,3)} nF)`);
  };
}

export function renderIndCode(){
  mountTwoCol(`
    <div class="input-grid"><div class="field-span-2"><label>3-digit inductor code</label><input id="indCode" value="101"></div></div>
    <div class="actions"><button id="indRun" class="primary-btn">Decode</button></div>
  `, `<div id="indResult" class="result-box">Enter a 3-digit code like 101 or 221.</div>`);
  $('indRun').onclick = () => {
    const code = $('indCode').value.trim();
    if (!/^\d{3}$/.test(code)) { $('indResult').textContent = 'Use a 3-digit numeric code.'; return; }
    const uh = Number(code.slice(0,2)) * Math.pow(10, Number(code[2]));
    $('indResult').textContent = `Inductance: ${uh} µH\n= ${fmt(uh/1000,3)} mH\n\nReasoning\n- Significant digits: ${code.slice(0,2)}\n- Multiplier: 10^${code[2]} µH`;
    report('Inductor Code Decoder', `${uh} µH`);
  };
}

export function renderPcbTrace(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="pcbMode"><option value="ampacity">Current from width</option><option value="width">Width from current</option></select></div>
      <div><label>Trace width (mil)</label><input id="pcbW" type="number" value="50"></div>
      <div><label>Copper weight (oz)</label><select id="pcbOz"><option>1</option><option>2</option></select></div>
      <div><label>Allowed temp rise (°C)</label><input id="pcbDT" type="number" value="10"></div>
      <div><label>Target current (A)</label><input id="pcbI" type="number" value="3"></div>
    </div>
    <div class="actions"><button id="pcbRun" class="primary-btn">Estimate</button></div>
    <div class="note">Simplified external-trace estimate only. Use detailed standards and thermal judgment for production design.</div>
  `, `<div id="pcbResult" class="result-box">Run the tool to estimate current or required width.</div>`);
  $('pcbRun').onclick = () => {
    const mode=$('pcbMode').value, w=+$('pcbW').value||1, oz=+$('pcbOz').value||1, dt=+$('pcbDT').value||10, i=+$('pcbI').value||1;
    const thicknessMil = oz===2 ? 2.8 : 1.4; const area = w*thicknessMil; const k=0.048;
    const currentFromWidth = k * Math.pow(dt, 0.44) * Math.pow(area, 0.725);
    const reqArea = Math.pow(i/(k*Math.pow(dt,0.44)), 1/0.725); const reqWidth = reqArea/thicknessMil;
    $('pcbResult').textContent = mode==='ampacity'
      ? `Estimated current: ${fmt(currentFromWidth,2)} A\nWidth: ${fmt(w,1)} mil\nCopper weight: ${oz} oz\nTemp rise basis: ${fmt(dt,1)} °C`
      : `Required width: ${fmt(reqWidth,1)} mil\nTarget current: ${fmt(i,2)} A\nCopper weight: ${oz} oz\nTemp rise basis: ${fmt(dt,1)} °C`;
    report('PCB Trace Width / Current', mode==='ampacity' ? `${fmt(currentFromWidth,2)} A estimate` : `${fmt(reqWidth,1)} mil required`);
  };
}

export function renderAdcDac(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Mode</label><select id="adcMode"><option value="code-to-voltage">Code → Voltage</option><option value="voltage-to-code">Voltage → Code</option></select></div>
      <div><label>Resolution (bits)</label><input id="adcBits" type="number" value="12"></div>
      <div><label>Reference voltage (V)</label><input id="adcVref" type="number" value="3.3"></div>
      <div><label>Code or voltage</label><input id="adcValue" type="number" value="2048"></div>
    </div>
    <div class="actions"><button id="adcRun" class="primary-btn">Convert</button></div>
    <div class="note">Converts between ADC/DAC codes and analog voltages using straight binary scaling and full-scale range.</div>
  `, `<div id="adcResult" class="result-box">Run the tool to compute step size, full-scale range, and conversion results.</div>`);
  const collect = () => ({ mode:$('adcMode').value, bits:$('adcBits').value, vref:$('adcVref').value, value:$('adcValue').value });
  const apply = (s) => { $('adcMode').value=s.mode||'code-to-voltage'; $('adcBits').value=s.bits||12; $('adcVref').value=s.vref||3.3; $('adcValue').value=s.value||''; };
  document.querySelector('.input-card').appendChild(addSaveLoadBar('adc-dac', collect, apply));
  $('adcRun').onclick = () => {
    const mode = $('adcMode').value, bits = Math.max(1, Math.min(24, +$('adcBits').value||12));
    const vref = Math.max(0.001, +$('adcVref').value||1);
    const raw = +$('adcValue').value;
    const maxCode = Math.pow(2, bits) - 1;
    const step = vref / maxCode;
    if (mode === 'code-to-voltage') {
      const code = Math.min(maxCode, Math.max(0, Math.round(raw)));
      const voltage = code * step;
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted voltage: ${fmt(voltage,4)} V\n\nReasoning\n- Voltage = code × step\-size\n- Full-scale is ${fmt(vref,4)} V at code ${maxCode}`;
      report('ADC / DAC Helper', `Code ${code} → ${fmt(voltage,4)} V`);
    } else {
      const voltage = Math.min(vref, Math.max(0, raw));
      const code = Math.round(voltage / step);
      $('adcResult').textContent = `Resolution: ${bits} bits\nFull-scale code: ${maxCode}\nStep size: ${fmt(step*1000,3)} mV\nConverted code: ${code}\n\nReasoning\n- Code = voltage / step\-size\n- Input voltage limited to 0–${fmt(vref,4)} V`;
      report('ADC / DAC Helper', `${fmt(voltage,4)} V → code ${code}`);
    }
  };
}

export function renderLogicGate(){
  mountTwoCol(`
    <div class="input-grid cols-4">
      <div><label>Input A</label><select id="lgA"><option value="0">0</option><option value="1" selected>1</option></select></div>
      <div><label>Input B</label><select id="lgB"><option value="0">0</option><option value="1" selected>1</option></select></div>
    </div>
    <div class="actions"><button id="lgRun" class="primary-btn">Evaluate Gates</button></div>
    <div class="note">Shows the outputs for basic gates and highlights the selected input combination in the truth table.</div>
  `, `<div id="lgResult" class="result-box">Run the gate explorer to view outputs for A and B.</div><div class="chart-wrap"><div id="lgTable"></div></div>`);
  document.querySelector('.input-card').appendChild(addSaveLoadBar('logic-gates', () => ({ a:$('lgA').value, b:$('lgB').value }), s => { $('lgA').value=s.a||'1'; $('lgB').value=s.b||'1'; }));
  $('lgRun').onclick = () => {
    const a = +$('lgA').value, b = +$('lgB').value;
    const table = [[0,0],[0,1],[1,0],[1,1]].map(([x,y]) => ({ x, y, and: x&&y, or: x||y, nand: !(x&&y), nor: !(x||y), xor: Boolean(x^y), xnor: !(x^y) }));
    const activeRow = table.find(r=>r.x===a&&r.y===b);
    $('lgResult').textContent = `Selected inputs: A=${a}, B=${b}\nAND=${activeRow.and?1:0}  OR=${activeRow.or?1:0}  XOR=${activeRow.xor?1:0}\nNAND=${activeRow.nand?1:0}  NOR=${activeRow.nor?1:0}  XNOR=${activeRow.xnor?1:0}`;
    $('lgTable').innerHTML = `<table class="tableish"><thead><tr><th>A</th><th>B</th><th>AND</th><th>OR</th><th>NAND</th><th>NOR</th><th>XOR</th><th>XNOR</th></tr></thead><tbody>${table.map(row => `<tr style="background:${row.x===a&&row.y===b?'rgba(103,214,255,.12)':''}"><td>${row.x}</td><td>${row.y}</td><td>${row.and?1:0}</td><td>${row.or?1:0}</td><td>${row.nand?1:0}</td><td>${row.nor?1:0}</td><td>${row.xor?1:0}</td><td>${row.xnor?1:0}</td></tr>`).join('')}</tbody></table>`;
    report('Logic Gate Explorer', `A=${a}, B=${b}, OR=${activeRow.or?1:0}, XOR=${activeRow.xor?1:0}`);
  };
}
