import { tool as branch_circuit_tool } from '../tools/branch-circuit.js';
import { tool as parallel_wire_tool } from '../tools/parallel-wire.js';
import { tool as transformer_package_tool } from '../tools/transformer-package.js';
import { tool as voltage_drop_tool } from '../tools/voltage-drop.js';

export const codeToolDefs = {
  'branch-circuit': branch_circuit_tool,
  'parallel-wire': parallel_wire_tool,
  'transformer-package': transformer_package_tool,
  'voltage-drop': voltage_drop_tool,
};
