import { tool as adc_dac_tool } from '../tools/adc-dac.js';
import { tool as capacitor_code_tool } from '../tools/capacitor-code.js';
import { tool as inductor_code_tool } from '../tools/inductor-code.js';
import { tool as led_resistor_tool } from '../tools/led-resistor.js';
import { tool as opamp_gain_tool } from '../tools/opamp-gain.js';
import { tool as pcb_trace_tool } from '../tools/pcb-trace.js';
import { tool as rc_filter_tool } from '../tools/rc-filter.js';
import { tool as resistor_color_tool } from '../tools/resistor-color.js';
import { tool as series_parallel_tool } from '../tools/series-parallel.js';
import { tool as smd_code_tool } from '../tools/smd-code.js';
import { tool as timer_555_tool } from '../tools/timer-555.js';
import { tool as voltage_divider_tool } from '../tools/voltage-divider.js';

export const electronicsToolDefs = {
  'adc-dac': adc_dac_tool,
  'capacitor-code': capacitor_code_tool,
  'inductor-code': inductor_code_tool,
  'led-resistor': led_resistor_tool,
  'opamp-gain': opamp_gain_tool,
  'pcb-trace': pcb_trace_tool,
  'rc-filter': rc_filter_tool,
  'resistor-color': resistor_color_tool,
  'series-parallel': series_parallel_tool,
  'smd-code': smd_code_tool,
  'timer-555': timer_555_tool,
  'voltage-divider': voltage_divider_tool,
};
