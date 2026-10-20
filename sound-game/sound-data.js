// Set volume per clip before the event: 1 = original level, 0.5 = quieter, 0 = silent.
// These are playback multipliers, not decibels. Lower louder clips to match the quietest.
// The game has no volume controls. After editing, bump sound-01 in index.html and sound.js.
export const soundGame = {
  title: 'Name That Sound',
  sounds: [
    { id: 'sound-1', src: './sounds/Sound1-Nostromo.mp3', answer: 'Alien – Self destruct sequence', volume: 1 },
    { id: 'sound-2', src: './sounds/Sound2-DeadPeople.mp3', answer: 'The Sixth Sense', volume: 1 },
    { id: 'sound-3', src: './sounds/Sound3-MotionTracker.mp3', answer: 'Aliens – Motion Tracker', volume: 1 },
    { id: 'sound-4', src: './sounds/Sound4-Shotgun.mp3', answer: 'DOOM – Shotgun', volume: 1 },
    { id: 'sound-5', src: './sounds/Sound5-ProtonPack.mp3', answer: 'Ghostbusters – Proton Pack', volume: 1 },
    { id: 'sound-6', src: './sounds/Sound6-Penywise.mp3', answer: 'IT – Pennywise the Clown', volume: 1 },
    { id: 'sound-7', src: './sounds/Sound7-Jaws.mp3', answer: 'Jaws – Theme song', volume: 1 },
    { id: 'sound-8', src: './sounds/Sound8-ResidentEvil.mp3', answer: 'Resident Evil – Theme song', volume: 1 },
    { id: 'sound-9', src: './sounds/Sound9-Nazghul.mp3', answer: 'The Lord of the Rings – Nazgûl Screech', volume: 1 },
    { id: 'sound-10', src: './sounds/Sound10-Predator.mp3', answer: 'Predator – Predator Roar', volume: 1 }
  ]
};
