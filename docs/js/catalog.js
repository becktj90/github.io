import { sections, getSection, getGroup, findToolGroup } from './catalog.sections.js';
import { codeToolDefs } from './tool-defs/code.js';
import { powerToolDefs } from './tool-defs/power.js';
import { electronicsToolDefs } from './tool-defs/electronics.js';
import { controlsToolDefs } from './tool-defs/controls.js';
import { referenceToolDefs } from './tool-defs/reference.js';
import { optimizationToolDefs } from './tool-defs/optimization.js';

export { sections, getSection, getGroup, findToolGroup };

export const toolDefs = {
  ...codeToolDefs,
  ...powerToolDefs,
  ...electronicsToolDefs,
  ...controlsToolDefs,
  ...referenceToolDefs,
  ...optimizationToolDefs
};
