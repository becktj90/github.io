import { tool as conductor_lifecycle_tool } from '../tools/conductor-lifecycle.js';
import { tool as genset_battery_optimizer_tool } from '../tools/genset-battery-optimizer.js';
import { tool as load_scheduler_tool } from '../tools/load-scheduler.js';
import { tool as peak_shaving_optimizer_tool } from '../tools/peak-shaving-optimizer.js';
import { tool as scenario_manager_tool } from '../tools/scenario-manager.js';
import { tool as transformer_tradeoff_tool } from '../tools/transformer-tradeoff.js';

export const optimizationToolDefs = {
  'conductor-lifecycle': conductor_lifecycle_tool,
  'genset-battery-optimizer': genset_battery_optimizer_tool,
  'load-scheduler': load_scheduler_tool,
  'peak-shaving-optimizer': peak_shaving_optimizer_tool,
  'scenario-manager': scenario_manager_tool,
  'transformer-tradeoff': transformer_tradeoff_tool,
};
