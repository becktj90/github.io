import { $, CMIL, RESISTOR_DIGIT, MULTIPLIER, TOL, mountTwoCol, addSaveLoadBar, fmt, nearestConductor, nearestBreaker, egcForBreaker, nearestTransformer, describeOhms, describeCap, describeKw, describeKwh, report } from '../utils.js';

function renderTransformerTradeoff(){
  $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">Coming soon: Transformer sizing tradeoff analysis.</div><div class="output-card">This tool will compare efficiency, cost, and loading across different transformer kVA ratings.</div></div>`;
  report('Transformer Tradeoff', 'Placeholder - tool in development');
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'transformer-tradeoff',
  section:'optimization', title:"Transformer Tradeoff", badge:"Sizing guide", what:"Evaluates transformer sizing options, showing the tradeoff between cost, efficiency, and loading margin.", why:"Oversizing adds cost but improves efficiency and spare capacity; undersizing risks overheating and poor efficiency.", how:"Calculates loading percentage, efficiency loss, and lifecycle cost for each standard transformer kVA option.", render, tags:["transformer", "tradeoff", "loading"], schema
};

export const render = renderTransformerTradeoff;
export { renderTransformerTradeoff };
