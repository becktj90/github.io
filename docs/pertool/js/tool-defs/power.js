import { tool as harmonic_spectrum_tool } from '../tools/harmonic-spectrum.js';
import { tool as phasor_plotter_tool } from '../tools/phasor-plotter.js';
import { tool as power_triangle_tool } from '../tools/power-triangle.js';

export const powerToolDefs = {
  'harmonic-spectrum': harmonic_spectrum_tool,
  'phasor-plotter': phasor_plotter_tool,
  'power-triangle': power_triangle_tool,
};
