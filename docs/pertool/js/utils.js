
export const THEME_KEY = 'engineer-reference-theme';
export const SECTION_KEY = 'ee-pro-section';
export const GROUP_KEY = 'ee-pro-group';
export const TOOL_KEY = 'ee-pro-tool';
export const SAVE_KEY = 'engineer-reference-saved-tools';
export const FAVORITES_KEY = 'engineer-reference-favorites';
export const RECENTS_KEY = 'engineer-reference-recents';

export const STANDARD_BREAKERS = [15,20,25,30,35,40,45,50,60,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,800,1000,1200,1600,2000];
export const STANDARD_TRANSFORMERS = [3,5,7.5,10,15,25,30,37.5,45,50,75,100,112.5,150,167,225,300,500,750,1000,1500,2000,2500];
export const COPPER_75 = [
  ['14 AWG',20],['12 AWG',25],['10 AWG',35],['8 AWG',50],['6 AWG',65],['4 AWG',85],['3 AWG',100],['2 AWG',115],['1 AWG',130],['1/0 AWG',150],['2/0 AWG',175],['3/0 AWG',200],['4/0 AWG',230],['250 kcmil',255],['300 kcmil',285],['350 kcmil',310],['400 kcmil',335],['500 kcmil',380],['600 kcmil',420],['700 kcmil',460],['750 kcmil',475],['800 kcmil',490],['1000 kcmil',545]
];
export const EGC_TABLE = [
  [15,'14 AWG'],[20,'12 AWG'],[60,'10 AWG'],[100,'8 AWG'],[200,'6 AWG'],[300,'4 AWG'],[400,'3 AWG'],[500,'2 AWG'],[600,'1 AWG'],[800,'1/0 AWG'],[1000,'2/0 AWG'],[1200,'3/0 AWG'],[1600,'4/0 AWG'],[2000,'250 kcmil']
];
export const CMIL = {
  '14 AWG': 4110, '12 AWG': 6530, '10 AWG': 10380, '8 AWG': 16510, '6 AWG': 26240, '4 AWG': 41740,
  '3 AWG': 52620, '2 AWG': 66360, '1 AWG': 83690, '1/0 AWG': 105600, '2/0 AWG': 133100, '3/0 AWG': 167800,
  '4/0 AWG': 211600, '250 kcmil': 250000, '300 kcmil': 300000, '350 kcmil': 350000, '400 kcmil': 400000,
  '500 kcmil': 500000, '600 kcmil': 600000, '700 kcmil': 700000, '750 kcmil': 750000, '800 kcmil': 800000,
  '1000 kcmil': 1000000
};
export const RESISTOR_DIGIT = { black:0,brown:1,red:2,orange:3,yellow:4,green:5,blue:6,violet:7,gray:8,white:9 };
export const MULTIPLIER = { black:1,brown:10,red:100,orange:1e3,yellow:1e4,green:1e5,blue:1e6,violet:1e7,gold:0.1,silver:0.01 };
export const TOL = { brown:'±1%', red:'±2%', green:'±0.5%', blue:'±0.25%', violet:'±0.1%', gray:'±0.05%', gold:'±5%', silver:'±10%' };

export const reportState = [];

export function $(id){ return document.getElementById(id); }
export function load(key, fallback){ return localStorage.getItem(key) || fallback; }
export function save(key, val){ localStorage.setItem(key, val); }
export function getSavedState(){ try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; } }
export function setSavedState(obj){ localStorage.setItem(SAVE_KEY, JSON.stringify(obj)); updateSavedCount(); }
export function saveToolState(toolId, state){ const all = getSavedState(); all[toolId] = { ...state, savedAt: new Date().toISOString() }; setSavedState(all); }
export function loadToolState(toolId){ return getSavedState()[toolId] || null; }
export function clearToolState(toolId){ const all = getSavedState(); delete all[toolId]; setSavedState(all); }
export function getFavorites(){ try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; } }
export function setFavorites(list){ localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(list)])); }
export function toggleFavorite(toolId){
  const favorites = new Set(getFavorites());
  if (favorites.has(toolId)) favorites.delete(toolId); else favorites.add(toolId);
  setFavorites([...favorites]);
  return favorites.has(toolId);
}
export function getRecents(){ try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; } }
export function pushRecent(toolId){
  const next = [toolId, ...getRecents().filter(id => id !== toolId)].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}
export function updateSavedCount(){ const el = $('savedCount'); if (el) el.textContent = Object.keys(getSavedState()).length; }
export function fmt(n,d=2){ return Number.isFinite(n) ? Number(n).toFixed(d).replace(/\.0+$|(?<=\..*[1-9])0+$/,'') : '-'; }
export function nearestBreaker(a){ return STANDARD_BREAKERS.find(v => v >= a) || STANDARD_BREAKERS.at(-1); }
export function nearestTransformer(kva){ return STANDARD_TRANSFORMERS.find(v => v >= kva) || STANDARD_TRANSFORMERS.at(-1); }
export function nearestConductor(a){ return COPPER_75.find(([,amps]) => amps >= a) || COPPER_75.at(-1); }
export function egcForBreaker(b){ return EGC_TABLE.find(([max]) => b <= max)?.[1] || EGC_TABLE.at(-1)[1]; }
export function describeOhms(ohms){ if (!Number.isFinite(ohms)) return '-'; const a=Math.abs(ohms); if (a>=1e6) return `${fmt(ohms/1e6,3)} MΩ`; if (a>=1e3) return `${fmt(ohms/1e3,3)} kΩ`; return `${fmt(ohms,3)} Ω`; }
export function describeCap(f){ if (!Number.isFinite(f)) return '-'; const a=Math.abs(f); if (a>=1e-3) return `${fmt(f*1e3,3)} mF`; if (a>=1e-6) return `${fmt(f*1e6,3)} µF`; if (a>=1e-9) return `${fmt(f*1e9,3)} nF`; return `${fmt(f*1e12,3)} pF`; }
export function describeKw(kw){ return `${fmt(kw,1)} kW`; }
export function describeKwh(kwh){ return `${fmt(kwh,1)} kWh`; }
export function report(name, summary){ reportState.unshift({name, summary, ts:new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}); reportState.splice(10); renderReport(); }
export function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
export function renderReport(){ const list = $('reportList'); if (!list) return; list.innerHTML = reportState.length ? reportState.map(item => `<div class="report-item"><strong>${escapeHtml(item.name)}</strong><div>${escapeHtml(item.summary)}</div><div class="muted">${item.ts}</div></div>`).join('') : '<div class="report-item">Run a tool to populate the session ledger.</div>'; }

export function mountTwoCol(inputHtml, outputHtml){ $('toolMount').innerHTML = `<div class="tool-grid"><div class="input-card">${inputHtml}</div><div class="output-card">${outputHtml}</div></div>`; }
export function addSaveLoadBar(toolId, collect, apply){
  const wrap = document.createElement('div');
  wrap.className = 'actions';
  wrap.innerHTML = `<button class="secondary-btn" type="button">Save Inputs</button><button class="secondary-btn" type="button">Load Saved</button><button class="secondary-btn" type="button">Clear Saved</button>`;
  const [saveBtn, loadBtn, clearBtn] = wrap.querySelectorAll('button');
  saveBtn.onclick = () => { saveToolState(toolId, collect()); report(toolId, 'Inputs saved locally'); };
  loadBtn.onclick = () => { const state = loadToolState(toolId); if (state) apply(state); report(toolId, state ? 'Loaded saved inputs' : 'No saved inputs found'); };
  clearBtn.onclick = () => { clearToolState(toolId); report(toolId, 'Saved inputs cleared'); };
  return wrap;
}
