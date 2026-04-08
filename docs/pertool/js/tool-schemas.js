
export const toolSchemas = {
  'branch-circuit': {
    continuous: { label: 'Continuous load', min: 0 },
    noncontinuous: { label: 'Noncontinuous load', min: 0 },
    spare: { label: 'Spare margin', min: 0, max: 100 }
  },
  'transformer-package': {
    load: { label: 'Load', min: 0 },
    voltage_primary: { label: 'Primary voltage', min: 1 },
    voltage_secondary: { label: 'Secondary voltage', min: 1 }
  },
  'voltage-drop': {
    current: { label: 'Current', min: 0 },
    length: { label: 'Length', min: 0 },
    voltage: { label: 'Voltage', min: 1 }
  }
};
