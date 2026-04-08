export const sections = [
  { id:'code', title:'Electrical Code', subtitle:'NEC-compliant sizing and field-ready circuit packages.', groups:[
      { id:'sizing', title:'Circuit & Transformer Sizing', tools:['branch-circuit','transformer-package','parallel-wire'] },
      { id:'path', title:'Path & Voltage Drop', tools:['voltage-drop'] }
    ]
  },
  { id:'power', title:'Power Systems', subtitle:'System conversions, phasors, and waveform analysis.', groups:[
      { id:'conversion', title:'Power & Phasors', tools:['power-triangle','phasor-plotter','harmonic-spectrum'] }
    ]
  },
  { id:'electronics', title:'Electronics', subtitle:'Component decoding, circuit helpers, and board-level design tools.', groups:[
      { id:'decoders', title:'Component Decoders', tools:['resistor-color','smd-code','capacitor-code','inductor-code'] },
      { id:'circuits', title:'Circuit & Signal Helpers', tools:['series-parallel','voltage-divider','rc-filter','led-resistor','timer-555','opamp-gain','adc-dac','pcb-trace'] }
    ]
  },
  { id:'controls', title:'Controls & PLC', subtitle:'Logic simulation, seal-in circuits, timers, counters, and troubleshooting views.', groups:[
      { id:'simulation', title:'Simulation Workbench', tools:['logic-gate','flex-logic','ladder-sim'] }
    ]
  },
  { id:'reference', title:'Reference', subtitle:'Saved work and practical engineering notes.', groups:[
      { id:'saved', title:'Saved Work', tools:['project-manager'] }
    ]
  },
  { id:'optimization', title:'Optimization', subtitle:'System sizing, demand optimization, and lifecycle cost analysis.', groups:[
      { id:'sizing', title:'Energy System Sizing', tools:['genset-battery-optimizer','transformer-tradeoff'] },
      { id:'dispatch', title:'Demand & Dispatch', tools:['peak-shaving-optimizer','load-scheduler'] },
      { id:'lifecycle', title:'Lifecycle Cost', tools:['conductor-lifecycle'] },
      { id:'scenarios', title:'Saved Scenarios', tools:['scenario-manager'] }
    ]
  }
];

export function getSection(id){ return sections.find(s=>s.id===id) || sections[0]; }
export function getGroup(section, id){ return section.groups.find(g=>g.id===id) || section.groups[0]; }
export function findToolGroup(toolId){ for (const section of sections){ for (const group of section.groups){ if (group.tools.includes(toolId)) return { section: section.id, group: group.id }; }} return { section: sections[0].id, group: sections[0].groups[0].id }; }
