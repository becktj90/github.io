

function renderProjectManager(){
  const saved = getSavedState();
  mountTwoCol(`
    <div class="actions"><button id="pmRefresh" class="primary-btn">Refresh Saved States</button><button id="pmClearAll" class="secondary-btn">Clear All Saved States</button></div>
    <div class="note">Use Export Workspace in the top bar to download a JSON snapshot of saved tool inputs.</div>
  `, `<div id="pmResult" class="result-box">Saved tools: ${Object.keys(saved).length}</div><div class="chart-wrap"><div id="pmList"></div></div>`);

  function refresh(){
    const all = getSavedState();
    $('pmResult').textContent = `Saved tools: ${Object.keys(all).length}`;
    $('pmList').innerHTML = Object.keys(all).length
      ? `<table class="tableish"><thead><tr><th>Tool</th><th>Saved</th><th>Action</th></tr></thead><tbody>${Object.entries(all).map(([k,v])=>`<tr><td>${escapeHtml(toolDefs[k]?.title || k)}</td><td>${new Date(v.savedAt).toLocaleString()}</td><td><button class="secondary-btn" data-clear-tool="${k}">Clear</button></td></tr>`).join('')}</tbody></table>`
      : emptyState('No saved states yet. Save inputs from any tool to manage them here.');
    document.querySelectorAll('[data-clear-tool]').forEach(btn => btn.onclick = () => {
      clearToolState(btn.dataset.clearTool);
      refresh();
      report('Project Manager', `Cleared saved state for ${toolDefs[btn.dataset.clearTool]?.title || btn.dataset.clearTool}`);
    });
  }

  $('pmRefresh').onclick = refresh;
  $('pmClearAll').onclick = () => {
    localStorage.removeItem(SAVE_KEY);
    refresh();
    updateSavedCount();
    report('Project Manager', 'All saved states cleared');
  };
  refresh();
}

const schema = {
  version: 1,
  fields: []
};

export const tool = {
  id: 'project-manager',
  section:'reference', title:"Project Workspace", badge:"Saved notes", what:"Keeps project notes, saved calculations, and quick references in one place.", why:"Engineering work gets fragmented quickly, so one lightweight workspace can reduce context switching.", how:"This local-first workspace stores notes and saved calculations in browser storage for quick recall.", render, tags:["notes", "saved", "workspace"], schema
};

export const render = renderProjectManager;
export { renderProjectManager };
