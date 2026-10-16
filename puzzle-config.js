// GAME KEEPER CONFIGURATION — public static-site puzzle data.
// 1. Edit each key's `sequence` below to change its full credential.
// 2. Edit `order` to change the required sequence of key IDs.
// 3. Edit `lockCode` to change the five-digit mechanical combination.
export const puzzle = {
  title: 'Sentinel Command Terminal',
  order: ['sec', 'eng', 'arm', 'bio', 'cmd'],
  lockCode: '48137',
  successText: 'BY ORDER OF THE ARGENTA CROWN, ACCESS IS GRANTED.',
  // This list is not the command order. NFC URLs keep their existing key IDs.
  keys: [
    {
      id: 'arm',
      name: 'Armory',
      sequence: 'ARM-57865423-AUTH',
      designation: 'Sentinel armory authority',
      clue: 'By Sentinel decree: the armory shall remain secured until Engineering has restored the fortress machinery. Biolab clearance shall follow the release of arms.'
    },
    {
      id: 'bio',
      name: 'Biolab',
      sequence: 'BIO-11842077-CLR',
      designation: 'Sentinel biological clearance',
      clue: 'By Sentinel decree: Biolab authority shall be presented after the armory has answered. No authority shall stand between this clearance and royal command.'
    },
    {
      id: 'eng',
      name: 'Engineering',
      sequence: 'ENG-44095162-OVR',
      designation: 'Sentinel engineering authority',
      clue: 'By Sentinel decree: Engineering shall answer once Security has secured the approach. The armory shall await the restoration of the fortress machinery.'
    },
    {
      id: 'sec',
      name: 'Security',
      sequence: 'SEC-77230419-PRM',
      designation: 'Sentinel security authority',
      clue: 'By Sentinel decree: first secure the approach. No other authority may precede Security when access to the reliquary is sought.'
    },
    {
      id: 'cmd',
      name: 'Command',
      sequence: 'CMD-90317655-MST',
      designation: 'Royal command authority',
      clue: 'By royal command: the four sanctioned authorities shall answer before Command. The final authority belongs to the Argenta Crown.'
    }
  ]
};
