import { REFLECTED } from './reflected.js';
import { STORED } from './stored.js';
import { DOM } from './dom.js';
import { BYPASS } from './bypass.js';
import { BLIND } from './blind.js';
import { SELF } from './self.js';
import { SCENARIOS } from './scenario.js';

export const LABS = [
  ...REFLECTED,
  ...STORED,
  ...DOM,
  ...BYPASS,
  ...BLIND,
  ...SELF,
  ...SCENARIOS,
];

export const CATEGORIES = [
  {
    id: 'reflected',
    label: 'Reflected',
    blurb: 'The payload is in the request and is echoed into the response. Delivery needs a link or a form.',
  },
  {
    id: 'stored',
    label: 'Stored',
    blurb: 'The payload is saved and runs for everyone who loads the page later, often inside a privileged session.',
  },
  {
    id: 'dom',
    label: 'DOM-based',
    blurb: 'Client-side JavaScript moves attacker-controlled data into a dangerous sink. The server never sees the payload.',
  },
  {
    id: 'bypass',
    label: 'Filters, CSP & sanitisers',
    blurb: 'The app filters, encodes or constrains what you send. Every one of these defences has a known failure mode.',
  },
  {
    id: 'blind',
    label: 'Blind',
    blurb: 'The payload fires in a tool you cannot see, in someone else\'s browser. You only get an out-of-band callback.',
  },
  {
    id: 'self',
    label: 'Self-XSS',
    blurb: 'The victim executes the payload themselves because someone asked them to. Social engineering, not a server bug.',
  },
  {
    id: 'scenario',
    label: 'Real-world scenarios',
    blurb: 'Full attack chains with realistic app surfaces, privilege boundaries and business impact.',
  },
];

export const DIFFICULTY = {
  apprentice: { n: 1, label: 'Apprentice' },
  practitioner: { n: 2, label: 'Practitioner' },
  expert: { n: 3, label: 'Expert' },
};
