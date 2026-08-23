export interface IndustryVocabulary {
  name: string;
  keywords: string[];
  promptInstructions: string;
  sampleEntities: {
    jobCategories: string[];
    commonParts: string[];
  };
}

export const INDUSTRY_VOCABULARIES: Record<string, IndustryVocabulary> = {
  hvac: {
    name: 'HVAC & Refrigeration',
    keywords: [
      'capacitor', '45/5 MFD', 'condenser unit', 'refrigerant R-410A', 'R-22',
      'evaporator coil', 'contactor', 'TXV valve', 'compressor', 'SEER rating',
      'ductwork', 'static pressure', 'thermostat', 'heat pump', 'blower motor',
      'subcooling', 'superheat', 'flue pipe', 'filter drier', 'purge valve',
      'defrost board', 'line set', 'air handler', 'dual run capacitor'
    ],
    promptInstructions: 'Pay close attention to HVAC component names, capacitor microfarad ratings (e.g. 45/5 MFD), refrigerant types (R-410A, R-22), pressure readings, and diagnostic labor hours.',
    sampleEntities: {
      jobCategories: ['HVAC Emergency Repair', 'Seasonal Maintenance', 'AC Installation', 'Furnace Tune-up'],
      commonParts: ['45/5 MFD Dual Round Capacitor', 'Single Pole Contactor 30A', 'R-410A Refrigerant (lbs)', 'Honeywell Programmable Thermostat'],
    },
  },

  plumbing: {
    name: 'Plumbing & Pipefitting',
    keywords: [
      'PEX', 'copper pipe', 'PVC', 'backflow preventer', 'PRV valve',
      'pressure reducing valve', 'trap seal', 'cleanout', 'sump pump',
      'water heater', 'expansion tank', 'flapper', 'wax ring', 'ball valve',
      'shutoff valve', 'hydro jetting', 'drain snake', 'cartridge', 'garbage disposal'
    ],
    promptInstructions: 'Extract pipe dimensions, material types (PEX, Copper, PVC), fixture models, pressure readings, and fixture replacement line items.',
    sampleEntities: {
      jobCategories: ['Water Heater Replacement', 'Drain Clearing & Jetting', 'Leak Detection', 'Fixture Rough-In'],
      commonParts: ['50-Gallon Rheem Water Heater', '3/4" Lead-Free PRV Valve', 'Brass Ball Valve 3/4"', 'Wax Ring with Flange'],
    },
  },

  electrical: {
    name: 'Electrical & Power Systems',
    keywords: [
      'breaker panel', '200 amp service', 'GFCI', 'AFCI', 'conduit',
      'Romex 12/2', 'Romex 14/2', 'bus bar', 'disconnect switch', 'ground fault',
      'subpanel', 'three-phase', 'voltage drop', 'junction box', 'receptacle',
      'inverter', 'EV charger', 'dimmer switch', 'neutral bar', 'bonding jumper'
    ],
    promptInstructions: 'Identify electrical voltage/amperage specifications, circuit numbers, wire gauges (12/2, 14/2), panel manufacturers (Square D, Siemens), and safety inspection notes.',
    sampleEntities: {
      jobCategories: ['Electrical Service Upgrade', 'EV Charger Installation', 'Panel Replacement', 'Circuit Troubleshooting'],
      commonParts: ['Square D 200A Main Breaker Panel', 'Siemens 20A Single Pole AFCI Breaker', 'NEMA 14-50 50A Outlet', 'Romex 12/2 Wire (50ft)'],
    },
  },

  inspection: {
    name: 'Home & Commercial Inspection',
    keywords: [
      'foundation crack', 'mold remediation', 'grading', 'flashing', 'fascia',
      'soffit', 'joist', 'truss', 'radon mitigation', 'GFCI missing', 'double tapped breaker',
      'knob and tube', 'lead paint', 'asbestos', 'thermal bridging', 'roof pitch',
      'water intrusion', 'efflorescence', 'crawlspace vapor barrier'
    ],
    promptInstructions: 'Extract room-by-room findings, safety hazard severities, code compliance notes, and required remediation action items.',
    sampleEntities: {
      jobCategories: ['Pre-Purchase Home Inspection', 'Radon & Environmental Testing', 'Roof & Attic Diagnostic', 'Commercial Due Diligence'],
      commonParts: ['Radon Continuous Monitor', 'Moisture Meter Probing', 'Thermal Infrared Scan'],
    },
  },

  general: {
    name: 'General Contracting & Construction',
    keywords: [
      'framing', 'drywall', 'mudding', 'subfloor', 'load-bearing header',
      'footing', 'rebar', 'rough-in', 'punch list', 'permit inspection',
      'change order', 'subcontractor', 'square footage', 'milestone billing'
    ],
    promptInstructions: 'Extract project milestones, subcontractor assignments, materials delivered, change orders requested, and punch list tasks.',
    sampleEntities: {
      jobCategories: ['Residential Remodel', 'Framing & Drywall Rough-In', 'Site Inspection & Punch List', 'Customer Estimate Walkthrough'],
      commonParts: ['1/2" Sheetrock Drywall (4x8)', '2x4x8 SPF Framing Studs', 'Joint Compound 5-Gallon', 'Deck Screws 3" Box'],
    },
  },
};

export class IndustryVocabularyService {
  static normalizeIndustryKey(industry?: string): string {
    if (!industry) return 'general';
    const lower = industry.toLowerCase();
    if (lower.includes('hvac') || lower.includes('air') || lower.includes('heat') || lower.includes('cooling')) return 'hvac';
    if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('water')) return 'plumbing';
    if (lower.includes('electr') || lower.includes('wire') || lower.includes('power')) return 'electrical';
    if (lower.includes('inspect') || lower.includes('estate') || lower.includes('apprais')) return 'inspection';
    return 'general';
  }

  static getVocabulary(industry?: string): IndustryVocabulary {
    const key = this.normalizeIndustryKey(industry);
    return INDUSTRY_VOCABULARIES[key] || INDUSTRY_VOCABULARIES.general;
  }

  static getKeywordsForSTT(industry?: string): string[] {
    const vocab = this.getVocabulary(industry);
    return vocab.keywords;
  }

  static getPromptInstructions(industry?: string): string {
    const vocab = this.getVocabulary(industry);
    return vocab.promptInstructions;
  }
}
