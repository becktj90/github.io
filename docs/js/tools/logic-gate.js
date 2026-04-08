import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderLogicGate(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'logic-gate',
  section:'controls', title:"Logic Gate Playground", badge:"Truth tables", what:"Evaluates basic logic gate combinations from two Boolean inputs.", why:"A quick truth-table sandbox helps with controls troubleshooting and logic validation.", how:"The tool computes AND, OR, XOR, NAND, and NOR directly from A and B.", render, tags:["logic", "boolean", "truth table"], schema
};

export const render = renderLogicGate;
export { renderLogicGate };
