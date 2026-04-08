
export function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function requireNumber(label, value, { min = -Infinity, max = Infinity, nonzero = false } = {}) {
  const num = toNumber(value);
  if (num === null) return { ok: false, error: `${label} must be a valid number.` };
  if (nonzero && num === 0) return { ok: false, error: `${label} must be non-zero.` };
  if (num < min) return { ok: false, error: `${label} must be at least ${min}.` };
  if (num > max) return { ok: false, error: `${label} must be at most ${max}.` };
  return { ok: true, value: num };
}

export function validateFields(schema, values) {
  const parsed = {};
  for (const [key, rules] of Object.entries(schema)) {
    const result = requireNumber(rules.label || key, values[key], rules);
    if (!result.ok) return result;
    parsed[key] = result.value;
  }
  return { ok: true, values: parsed };
}
