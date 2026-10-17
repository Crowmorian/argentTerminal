// GAME KEEPER CONFIGURATION — public static-site puzzle data.
// 1. Edit each key's `sequence` below to change its full credential.
// 2. Edit `order` to change the required sequence of key IDs.
// 3. Edit `lockCode` to change the five-digit mechanical combination.
// 4. Edit each key's `protocol` and `status` for its authority record.
export const puzzle = {
  title: 'Sentinel Command Terminal',
  order: ['sec', 'bio', 'eng', 'arm', 'cmd'],
  lockCode: '48137',
  successText: 'BY ORDER OF THE ARGENTA CROWN, ACCESS IS GRANTED.',
  // This list is not the command order. NFC URLs keep their existing key IDs.
  keys: [
    {
      id: 'arm',
      route: 'armory',
      name: 'Armory',
      sequence: 'ARM-57865423-AUTH',
      designation: 'Sentinel armory authority',
      protocol: 'Armory authority does not stand adjacent to Security.',
      status: ['ARMORY CLEARANCE VERIFIED', 'MARTIAL AUTHORITY RECORD RESTORED']
    },
    {
      id: 'bio',
      route: 'biolab',
      name: 'Biolab',
      sequence: 'BIO-11842077-CLR',
      designation: 'Sentinel biological clearance',
      protocol: 'Biolab clearance precedes Engineering authority.',
      status: ['SANCTIONED CLEARANCE VERIFIED', 'BIOLOGICAL AUTHORITY RECORD INTACT']
    },
    {
      id: 'eng',
      route: 'engineering',
      name: 'Engineering',
      sequence: 'ENG-44095162-OVR',
      designation: 'Sentinel engineering authority',
      protocol: 'Engineering authority does not hold the final position.',
      status: ['ENGINEERING AUTHORITY VERIFIED', 'COMMAND RECORD PARTIALLY RESTORED']
    },
    {
      id: 'sec',
      route: 'security',
      name: 'Security',
      sequence: 'SEC-77230419-PRM',
      designation: 'Sentinel security authority',
      protocol: 'Security authority was established before Biolab authorization.',
      status: ['AUTHORITY RECORD VERIFIED', 'ARCHIVE INTEGRITY: STABLE']
    },
    {
      id: 'cmd',
      route: 'command',
      name: 'Command',
      sequence: 'CMD-90317655-MST',
      designation: 'Royal command authority',
      protocol: 'Armory stands nearer to Command authority than to Security. Armory authority precedes Command authority.',
      status: ['COMMAND AUTHORITY VERIFIED', 'ROYAL PROTOCOL ARCHIVE ACCESSED']
    }
  ]
};
