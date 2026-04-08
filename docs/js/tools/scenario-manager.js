import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderScenarioManager(){
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

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'scenario-manager',
  section:'optimization', title:"Scenario Manager", badge:"Compare & export", what:"Save, compare, and export optimization scenarios for reporting and decision-making.", why:"Engineering decisions often require comparing multiple scenarios side-by-side.", how:"Lets you save results from any optimization tool, tag them with notes, and generate comparison reports.", render, tags:["scenario", "compare", "export"], schema
};

export const render = renderScenarioManager;
export { renderScenarioManager };
