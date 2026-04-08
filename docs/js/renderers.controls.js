import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from './utils.js';

const ladderState = { coil:false, timerAcc:0, timerDone:false, count:0, lastCountIn:false, lastStart:false, bits:{ start:false, stop:false, ol:false, auto:false, demand:false, reset:false } };

export function renderFlexLogic(){
  mountTwoCol(`
    <div class="subcard">
      <div class="flex-row" id="flexInputs"></div>
      <div class="actions"><button id="flexEval" class="primary-btn">Evaluate Logic</button></div>
      <div class="note">Output logic used here: RUN = MODE_AUTO · DEMAND · START_OK · ESTOP_OK · OL_OK</div>
    </div>
  `, `<div id="flexResult" class="result-box">Toggle inputs and evaluate the permissive chain.</div>`);
  const keys = [
    ['modeAuto','Mode Auto'],['demand','Auto Demand'],['startOk','Start Permissive'],['estopOk','E-Stop Healthy'],['olOk','Overload Healthy']
  ];
  $('flexInputs').innerHTML = keys.map(([k,label],i)=>`<button class="toggle-chip ${i!==1?'active':''}" data-bit="${k}" data-state="${i!==1?'1':'0'}">${label}: ${i!==1?'ON':'OFF'}</button>`).join('');
  document.querySelectorAll('[data-bit]').forEach(btn => btn.onclick = () => {
    const on = btn.dataset.state !== '1'; btn.dataset.state = on ? '1' : '0'; btn.classList.toggle('active', on); btn.textContent = `${btn.textContent.split(':')[0]}: ${on?'ON':'OFF'}`;
  });
  $('flexEval').onclick = () => {
    const vals = Object.fromEntries([...document.querySelectorAll('[data-bit]')].map(btn => [btn.dataset.bit, btn.dataset.state==='1']));
    const run = vals.modeAuto && vals.demand && vals.startOk && vals.estopOk && vals.olOk;
    $('flexResult').textContent = `Output RUN: ${run?'ENERGIZED':'DE-ENERGIZED'}\nBoolean expression: RUN = A·D·S·E·O\n\nExplanation\n- Auto mode is ${vals.modeAuto?'true':'false'}\n- Demand is ${vals.demand?'true':'false'}\n- Start permissive is ${vals.startOk?'true':'false'}\n- E-stop healthy is ${vals.estopOk?'true':'false'}\n- Overload healthy is ${vals.olOk?'true':'false'}\n\nPlain English\nThe output only energizes when every permissive in the chain is healthy at the same time.`;
    report('Flex Logic Simulator', `RUN ${run?'energized':'de-energized'}`);
  };
}

function ladderCell(type, label, active=false){ return `<div class="rung-cell ${active?'active':''}">${type}<br><strong>${label}</strong></div>`; }

function computeLadder(bits){
  const stopClosed = !bits.stop;
  const olClosed = !bits.ol;
  const motorRung = stopClosed && olClosed && (bits.start || ladderState.coil);
  ladderState.coil = motorRung;
  const timerRung = bits.auto && bits.demand;
  if (timerRung) ladderState.timerAcc += 1; else { ladderState.timerAcc = 0; ladderState.timerDone = false; }
  ladderState.timerDone = ladderState.timerAcc >= 5;
  if (bits.start && !ladderState.lastCountIn) ladderState.count += 1;
  if (bits.reset) ladderState.count = 0;
  ladderState.lastCountIn = bits.start;
  ladderState.lastStart = bits.start;
  return { stopClosed, olClosed, motorRung, timerRung, timerDone: ladderState.timerDone, count: ladderState.count };
}

function ladderExplanation(state){
  return `Motor rung: the motor coil ${state.motorRung?'is':'is not'} energized because STOP is ${state.stopClosed?'healthy/closed':'pressed/open'}, overload is ${state.olClosed?'healthy/closed':'tripped/open'}, and the seal-in path ${state.motorRung?'has':'does not have'} continuity.\n\nTimer rung: AUTO and DEMAND are ${state.timerRung?'both true':'not both true'}, so the TON accumulator is ${ladderState.timerAcc} scan(s) and the done bit is ${state.timerDone?'true':'false'}.\n\nCounter rung: the counter has recorded ${state.count} start pulse(s).`;
}

export function renderLadderSim(){
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
