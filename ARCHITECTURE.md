# Engineer Reference Lab Architecture

This repo has been split for long-term growth:

- `js/catalog.sections.js` defines section/group navigation.
- `js/tool-defs/*.js` stores per-category tool metadata.
- `js/tools/*.js` provides one file per tool entry point.
- `js/renderers.*.js` contains category-level rendering logic.
- `js/ui.js` contains shared UI helpers.
- `js/validation.js` contains schema-style numeric validation helpers.
- `js/tool-schemas.js` is the start of a formal per-tool schema layer.

Recommended next step:
- move each renderer implementation from `renderers.*.js` into the matching `js/tools/*.js` file when you want full one-tool-per-file isolation.
