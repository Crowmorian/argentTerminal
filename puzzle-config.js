// Public party-game data. GitHub Pages cannot keep browser-delivered answers secret.
// The order of this array is the required order at the terminal.
export const puzzle = {
  title: 'Argent Terminal',
  lockCode: '48137',
  successText: 'The covenant is restored. The vault yields to your command. Take this final cipher to the sealed reliquary and claim what lies within.',
  keys: [
    {
      id: 'arm',
      name: 'Armory',
      sequence: 'ARM-57865423-AUTH',
      designation: 'Weapons authorization',
      clue: 'Before the march, the warrior must be armed. Let steel awaken the covenant.'
    },
    {
      id: 'bio',
      name: 'Biologics',
      sequence: 'BIO-11842077-CLR',
      designation: 'Biological clearance',
      clue: 'Steel alone cannot carry the burden. After the armory, prove that living blood remains.'
    },
    {
      id: 'eng',
      name: 'Engineering',
      sequence: 'ENG-44095162-OVR',
      designation: 'Engine override',
      clue: 'When steel and blood stand ready, wake the engine beneath the stone.'
    },
    {
      id: 'sec',
      name: 'Security',
      sequence: 'SEC-77230419-PRM',
      designation: 'Security permission',
      clue: 'The engine must burn before the wardens will release their seal. Command must wait.'
    },
    {
      id: 'cmd',
      name: 'Command',
      sequence: 'CMD-90317655-MST',
      designation: 'Master command',
      clue: 'Armed, living, awakened, and permitted. Only then may the final command be spoken.'
    }
  ]
};
