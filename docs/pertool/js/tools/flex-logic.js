import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderFlexLogic(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'flex-logic',
  section:'controls', title:"Flexible Logic Builder", badge:"Combinational logic", what:"Lets you build and evaluate nested Boolean expressions from practical signal names.", why:"This is a fast way to rough in interlocks and permissives before PLC coding.", how:"The tool substitutes entered signal states into the expression and evaluates the resulting Boolean logic.", render, tags:["plc", "interlock", "boolean"], schema
};

export const render = renderFlexLogic;
export { renderFlexLogic };
