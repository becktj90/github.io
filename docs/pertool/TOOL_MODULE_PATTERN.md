# Tool Module Pattern

Each tool is now self-contained in a single file under `js/tools/`.

Every tool module owns:
- render implementation
- catalog metadata used by the app
- a placeholder schema block for future validation expansion

Current exported shape:

```js
export const tool = {
  id,
  section,
  title,
  badge,
  what,
  why,
  how,
  tags,
  schema,
  render
};
```

Compatibility:
- `js/tool-defs/*.js` now aggregate `tool` objects directly.
- `js/catalog.js` still merges those maps into `toolDefs`.
- `js/app.js` still calls `tool.render()` with no UI behavior changes.

Recommended next step:
- populate `schema.fields`
- extract pure compute helpers from render handlers for unit testing
- add automated smoke tests for all tool modules
