
import { escapeHtml } from './utils.js';

export function resultCard(title, body) {
  return `<div class="result-box"><strong>${escapeHtml(title)}</strong><div>${body}</div></div>`;
}

export function keyValueTable(rows) {
  return `<table class="tableish"><tbody>${rows.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${v}</td></tr>`).join('')}</tbody></table>`;
}

export function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}
