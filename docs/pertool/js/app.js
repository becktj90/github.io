
import { $, load, save, THEME_KEY, SECTION_KEY, GROUP_KEY, TOOL_KEY, updateSavedCount, setFavorites, getFavorites, toggleFavorite, getRecents, pushRecent, getSavedState, setSavedState, renderReport, report } from './utils.js';
import { sections, toolDefs, getSection, getGroup, findToolGroup } from './catalog.js';

let activeTheme = load(THEME_KEY, 'blueprint');
let activeSection = load(SECTION_KEY, sections[0].id);
let activeGroup = load(GROUP_KEY, sections[0].groups[0].id);
let activeTool = load(TOOL_KEY, sections[0].groups[0].tools[0]);

function syncUrl() {
  const params = new URLSearchParams();
  params.set('section', activeSection);
  params.set('group', activeGroup);
  params.set('tool', activeTool);
  history.replaceState(null, '', `${location.pathname}#${params.toString()}`);
}

function loadUrlState() {
  const hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
  const params = new URLSearchParams(hash);
  const tool = params.get('tool');
  if (tool && toolDefs[tool]) {
    const found = findToolGroup(tool);
    activeTool = tool;
    activeSection = params.get('section') || found.section;
    activeGroup = params.get('group') || found.group;
  }
}

function setTheme(theme){
  activeTheme = theme;
  document.body.dataset.theme = theme === 'retro' ? 'retro' : 'blueprint';
  save(THEME_KEY, activeTheme);
  const toggle = $('themeToggle');
  if (toggle) toggle.textContent = activeTheme === 'retro' ? 'Use Modern Theme' : 'Use Retro Accent Theme';
}

function toolMatchesSearch(tool, searchTerm) {
  const haystack = [tool.title, tool.badge, tool.what, tool.why, ...(tool.tags || [])].join(' ').toLowerCase();
  return haystack.includes(searchTerm);
}

function renderFavorites() {
  const favorites = getFavorites();
  const recent = getRecents().filter(id => toolDefs[id]);
  $('favoritesList').innerHTML = favorites.length
    ? favorites.map(id => `<button class="mini-tool-btn ${id===activeTool?'active':''}" data-tool="${id}">${toolDefs[id].title}</button>`).join('')
    : '<div class="empty-state">No pinned tools yet. Use ☆ in a tool row to pin one here.</div>';
  $('recentList').innerHTML = recent.length
    ? recent.map(id => `<button class="mini-tool-btn ${id===activeTool?'active':''}" data-tool="${id}">${toolDefs[id].title}</button>`).join('')
    : '<div class="empty-state">Your recently opened tools will appear here.</div>';
  document.querySelectorAll('#favoritesList [data-tool], #recentList [data-tool]').forEach(btn => btn.onclick = () => setTool(btn.dataset.tool));
}

function renderNav(){
  $('sectionNav').innerHTML = sections.map(sec => `<button class="section-btn ${sec.id===activeSection?'active':''}" data-section="${sec.id}">${sec.title}<small>${sec.groups.reduce((sum,group)=>sum+group.tools.length,0)} tools</small></button>`).join('');
  const sec = getSection(activeSection);
  const group = getGroup(sec, activeGroup);
  $('groupNav').innerHTML = sec.groups.map(gr => `<button class="section-btn ${gr.id===activeGroup?'active':''}" data-group="${gr.id}">${gr.title}<small>${gr.tools.length} tools</small></button>`).join('');
  const searchTerm = $('toolSearch')?.value.trim().toLowerCase() || '';
  let tools = searchTerm
    ? sec.groups.flatMap(g => g.tools).filter((id, index, arr) => arr.indexOf(id) === index).filter(id => toolMatchesSearch(toolDefs[id], searchTerm))
    : group.tools;

  if (!tools.length) {
    $('toolNav').innerHTML = '<div class="empty-state">No matching glossary entries in this section.</div>';
  } else {
    const favorites = new Set(getFavorites());
    $('toolNav').innerHTML = tools.map(id => `
      <div class="tool-row ${id===activeTool?'active':''}">
        <button class="tool-btn ${id===activeTool?'active':''}" data-tool="${id}">
          ${toolDefs[id].title}
          <small>${toolDefs[id].badge}</small>
        </button>
        <button class="fav-btn ${favorites.has(id)?'active':''}" data-favorite="${id}" aria-label="Pin ${toolDefs[id].title}">${favorites.has(id)?'★':'☆'}</button>
      </div>`).join('');
  }

  $('toolCount').textContent = Object.keys(toolDefs).length;
  $('sectionTitle').textContent = sec.title;
  $('sectionSubtitle').textContent = sec.subtitle;
  $('toolFamilyTag').textContent = sec.title;

  document.querySelectorAll('[data-section]').forEach(btn => btn.onclick = () => setSection(btn.dataset.section));
  document.querySelectorAll('[data-group]').forEach(btn => btn.onclick = () => setGroup(btn.dataset.group));
  document.querySelectorAll('[data-tool]').forEach(btn => btn.onclick = () => setTool(btn.dataset.tool));
  document.querySelectorAll('[data-favorite]').forEach(btn => btn.onclick = () => {
    toggleFavorite(btn.dataset.favorite);
    renderNav();
    renderFavorites();
  });
}

function renderAll(){
  renderNav();
  renderFavorites();
  const tool = toolDefs[activeTool];
  $('toolTitle').textContent = tool.title;
  $('toolBadge').textContent = tool.badge;
  $('toolWhat').textContent = tool.what;
  $('toolWhy').textContent = tool.why;
  $('toolHow').textContent = tool.how;
  $('toolTags').innerHTML = (tool.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
  $('activeToolId').textContent = activeTool;
  $('favoriteToggle').textContent = getFavorites().includes(activeTool) ? 'Unpin Tool' : 'Pin Tool';
  tool.render();
  renderReport();
  updateSavedCount();
  syncUrl();
}

function setSection(id){
  const sec = getSection(id);
  activeSection = sec.id;
  activeGroup = getGroup(sec, activeGroup).id;
  const group = getGroup(sec, activeGroup);
  if (!group.tools.includes(activeTool)) activeTool = group.tools[0];
  save(SECTION_KEY, activeSection); save(GROUP_KEY, activeGroup); save(TOOL_KEY, activeTool);
  renderAll();
}

function setGroup(id){
  const sec = getSection(activeSection);
  const group = getGroup(sec, id);
  activeGroup = group.id;
  if (!group.tools.includes(activeTool)) activeTool = group.tools[0];
  save(GROUP_KEY, activeGroup); save(TOOL_KEY, activeTool);
  renderAll();
}

function setTool(id){
  if (!toolDefs[id]) return;
  const found = findToolGroup(id);
  activeTool = id; activeSection = found.section; activeGroup = found.group;
  save(SECTION_KEY, activeSection); save(GROUP_KEY, activeGroup); save(TOOL_KEY, activeTool);
  pushRecent(id);
  renderAll();
}

function exportWorkspace(){
  const payload = {
    theme: activeTheme,
    favorites: getFavorites(),
    recents: getRecents(),
    savedTools: getSavedState(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'engineer-reference-workspace.json'; a.click();
  URL.revokeObjectURL(url);
}

function importWorkspace(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.theme) setTheme(data.theme);
      if (Array.isArray(data.favorites)) setFavorites(data.favorites.filter(id => toolDefs[id]));
      if (data.savedTools && typeof data.savedTools === 'object') setSavedState(data.savedTools);
      if (Array.isArray(data.recents)) localStorage.setItem('engineer-reference-recents', JSON.stringify(data.recents.filter(id => toolDefs[id])));
      renderAll();
      report('Workspace', 'Imported workspace snapshot');
    } catch {
      report('Workspace', 'Import failed: invalid JSON file');
      alert('Import failed. Please choose a valid workspace JSON file.');
    }
  };
  reader.readAsText(file);
}

function bindUi(){
  $('toolSearch').oninput = renderNav;
  $('themeToggle').onclick = () => setTheme(activeTheme === 'retro' ? 'blueprint' : 'retro');
  $('exportState').onclick = exportWorkspace;
  $('importState').onclick = () => $('importFile').click();
  $('importFile').onchange = (e) => { const file = e.target.files?.[0]; if (file) importWorkspace(file); e.target.value = ''; };
  $('favoriteToggle').onclick = () => { toggleFavorite(activeTool); renderAll(); };
  $('copyLink').onclick = async () => {
    syncUrl();
    try {
      await navigator.clipboard.writeText(location.href);
      report('Workspace', 'Deep link copied to clipboard');
    } catch {
      report('Workspace', 'Copy failed - use browser share/copy manually');
    }
  };
}

loadUrlState();
setTheme(activeTheme);
bindUi();
pushRecent(activeTool);
renderAll();
