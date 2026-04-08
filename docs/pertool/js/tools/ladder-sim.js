import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderLadderSim(){
  mountTwoCol(`
    <div class="ladder-toolbar">
      <button class="toggle-chip" data-lbit="start">START</button>
      <button class="toggle-chip" data-lbit="stop">STOP</button>
      <button class="toggle-chip" data-lbit="ol">OL TRIP</button>
      <button class="toggle-chip" data-lbit="auto">AUTO</button>
      <button class="toggle-chip" data-lbit="demand">DEMAND</button>
      <button class="toggle-chip" data-lbit="reset">RESET COUNT</button>
    </div>
    <div class="actions"><button id="ladderScan" class="primary-btn">Run One Scan</button><button id="ladderReset" class="secondary-btn">Reset Simulator</button></div>
    <div class="note">This version includes a seal-in motor rung, a 5-scan TON alarm rung, and a CTU-style start counter.</div>
  `, `<div class="subcard"><div id="ladderCanvas"></div></div><div class="kpi-row"><div class="kpi"><div class="label">Motor coil</div><div id="kpiMotor" class="value">OFF</div></div><div class="kpi"><div class="label">Timer done</div><div id="kpiTon" class="value">0</div></div><div class="kpi"><div class="label">Start count</div><div id="kpiCount" class="value">0</div></div></div><div id="ladderExplain" class="result-box" style="margin-top:12px;">Run one or more scans.</div>`);
  document.querySelectorAll('[data-lbit]').forEach(btn => btn.onclick = () => {
    const key = btn.dataset.lbit; ladderState.bits[key] = !ladderState.bits[key]; btn.classList.toggle('active', ladderState.bits[key]);
  });
  function redraw(){ const st = computeLadder(ladderState.bits); $('ladderCanvas').innerHTML = renderLadderCanvas(st); $('kpiMotor').textContent = st.motorRung ? 'ON' : 'OFF'; $('kpiTon').textContent = st.timerDone ? '1' : `${ladderState.timerAcc}/5`; $('kpiCount').textContent = st.count; $('ladderExplain').textContent = ladderExplanation(st); report('Ladder Logic Simulator', `Motor ${st.motorRung?'ON':'OFF'}, TON ${st.timerDone?'done':'timing'}, count ${st.count}`); ladderState.bits.reset = false; document.querySelector('[data-lbit="reset"]').classList.remove('active'); }
  $('ladderScan').onclick = redraw;
  $('ladderReset').onclick = () => { ladderState.coil=false; ladderState.timerAcc=0; ladderState.timerDone=false; ladderState.count=0; ladderState.lastCountIn=false; ladderState.lastStart=false; ladderState.bits={ start:false, stop:false, ol:false, auto:false, demand:false, reset:false }; document.querySelectorAll('[data-lbit]').forEach(btn => btn.classList.remove('active')); $('ladderCanvas').innerHTML=''; $('kpiMotor').textContent='OFF'; $('kpiTon').textContent='0'; $('kpiCount').textContent='0'; $('ladderExplain').textContent='Simulator reset.'; report('Ladder Logic Simulator', 'Simulator reset'); };
  $('ladderCanvas').innerHTML = renderLadderCanvas({ stopClosed:true, olClosed:true, motorRung:false, timerRung:false, timerDone:false, count:0 });
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'ladder-sim',
  section:'controls', title:"Ladder Logic Mini-Sim", badge:"Seal-in + TON + CTU", what:"Simulates a simple start/stop seal-in circuit with overload contact, timer, and counter.", why:"Even a lightweight simulation makes state behavior much easier to reason through.", how:"The seal-in branch is evaluated each scan, a timer accumulates while the coil is true, and a rising edge increments the counter.", render, tags:["ladder", "ton", "ctu"], schema
};

export const render = renderLadderSim;
export { renderLadderSim };
