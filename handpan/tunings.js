// Handpan tunings and playing patterns.
//
// A tuning has a ding (center note), top tone fields (listed low to high; they
// are laid out in the usual zig-zag around the ring), and optional bottom notes
// with an angle (degrees, 0 = right, 90 = toward the player).
//
// Pattern steps are space-separated tokens, one eighth note each:
//   D      ding            1..10  top tone field by pitch order
//   T      tak (shell)     .      rest
//   A4     any note by name (also reaches bottom notes)
//   D+5    notes struck together
//   1..N   run up all top fields   N..1  run down

window.HANDPAN_PATTERNS = [
  {
    name: 'Heartbeat',
    level: 'Beginner',
    steps: 'D . T . D D T .',
    desc: 'The first groove everyone learns. Ding on the beat, a tak on the off-beat. Keep it steady before adding notes.',
  },
  {
    name: 'Ding and walk',
    level: 'Beginner',
    steps: 'D 1 2 3 D 4 3 2',
    desc: 'Return to the ding every four steps. It anchors your ear in the key while the melody wanders.',
  },
  {
    name: 'Full ascent',
    level: 'Beginner',
    steps: 'D 1..N . . .',
    desc: 'Climb the zig-zag from the ding to the top note. Notice how each step flips sides: that is the layout doing the work.',
  },
  {
    name: 'Pendulum',
    level: 'Intermediate',
    steps: 'D 1 3 2 4 3 5 4 6 5 7 6 8 . T .',
    desc: 'Up two, back one. A classic finger exercise that builds a flowing melody out of the scale.',
  },
  {
    name: 'Arpeggio rain',
    level: 'Intermediate',
    steps: 'D 1 3 5 8 5 3 1',
    desc: 'Skip every other note to outline the main chord. Let it ring; this is where the instrument sings.',
  },
  {
    name: 'Tak groove',
    level: 'Intermediate',
    steps: 'D T 3 T D T 4 5',
    desc: 'Fill the gaps with taks so the rhythm never stops. Taks are quiet; play them with your fingertips near the rim.',
  },
  {
    name: 'Call and answer',
    level: 'Intermediate',
    steps: 'D 5 4 3 . 2 3 . D 3 4 5 . 6 5 .',
    desc: 'A phrase falls, then answers by rising. Ending each half on a rest gives it room to breathe.',
  },
  {
    name: 'Cascade',
    level: 'Beginner',
    steps: 'N..1 D . . .',
    desc: 'Pour down from the top to the ding. Try it slowly with a crescendo into the final ding.',
  },
  {
    name: 'Bass and melody',
    level: 'Advanced',
    steps: 'D+5 . 3 T 1+6 . 4 T D+7 . 5 T 2+6 . D .',
    desc: 'Two hands at once: one plays a low note or the ding, the other the melody above it. Strike both at exactly the same time.',
  },
];

window.HANDPAN_TUNINGS = [
  {
    id: 'b-hijaz',
    name: 'B Hijaz',
    ding: 'B2',
    top: ['F#3', 'A3', 'B3', 'C4', 'D#4', 'E4', 'F#4', 'A4'],
    bottom: [['Eb3', 90], ['G3', 45], ['Ab3', 135], ['D4', 180], ['G4', 0], ['B4', 225], ['Eb5', 315], ['E5', 270]],
    mood: 'Middle-Eastern and dramatic. The half step from C down to B is the signature sound. Bottom notes complete the scale and open up extra chords.',
    selections: [
      { name: 'B Hijaz scale', root: 11, pcs: [11, 0, 3, 4, 6, 7, 9], desc: 'Complete with the bottom G. C to B is the signature.' },
      { name: 'Hijaz motif', root: 11, seq: ['A4', 'F#4', 'E4', 'D#4', 'C4', 'B3', 'C4', 'B3', 'B2'], desc: 'Walk down from A4 and let C fall onto B.' },
      { name: 'B major', root: 11, pcs: [11, 3, 6], desc: 'B D# F#. Home chord; end phrases here.' },
      { name: 'B7', root: 11, pcs: [11, 3, 6, 9], desc: 'B D# F# A. Tension that wants E minor or back to B.' },
      { name: 'E minor', root: 4, pcs: [4, 7, 11], desc: 'E G B. Restful; uses the bottom G notes.' },
      { name: 'A minor', root: 9, pcs: [9, 0, 4], desc: 'A C E. Melancholic; resolve to B major.' },
      { name: 'E major', root: 4, pcs: [4, 8, 11], desc: 'E G# B. Bright surprise via the bottom Ab.' },
      { name: 'D# diminished', root: 3, pcs: [3, 6, 9, 0], desc: 'D# F# A C. Maximum tension; release onto E or B.' },
    ],
    patterns: [
      {
        name: 'Hijaz motif',
        level: 'Beginner',
        steps: 'A4 F#4 E4 D#4 C4 B3 C4 B3 D . . .',
        desc: 'The essential Hijaz phrase: walk down from A4 and lean on the C before it falls onto B.',
      },
      {
        name: 'Snake charmer',
        level: 'Intermediate',
        steps: 'D 3 4 3 5 4 3 . 3 4 6 5 4 3 4 .',
        desc: 'Circle around B and C, reach up to D# and E, and always come back to B.',
      },
      {
        name: 'Bottom bloom',
        level: 'Advanced',
        steps: 'D G3 3 G4 6 B4 . T D Eb3 5 Ab3 6 E5 . T',
        desc: 'Alternate top fields with bottom notes to play E minor, then a bright E major. Reach under with one hand.',
      },
    ],
  },
  {
    id: 'd-kurd-9',
    name: 'D Kurd 9',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
    mood: 'The most common handpan scale: D natural minor. Soft, melancholic and impossible to play wrong.',
  },
  {
    id: 'd-kurd-10',
    name: 'D Kurd 10',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5'],
    mood: 'D Kurd with an extra high C. More room for melodies above the octave.',
  },
  {
    id: 'd-celtic',
    name: 'D Celtic Minor',
    ding: 'D3',
    top: ['A3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5'],
    mood: 'Dorian-flavored minor without the dark Bb. Open, folky, a little hopeful.',
  },
  {
    id: 'd-integral',
    name: 'D Integral',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'A4'],
    mood: 'A spacious minor with no G. Fewer notes, lots of air between them; great for meditation.',
  },
  {
    id: 'd-hijaz',
    name: 'D Hijaz',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C#4', 'D4', 'E4', 'F4', 'G4', 'A4'],
    mood: 'Exotic and tense. The jump from Bb to C# gives it a desert, Andalusian character.',
  },
  {
    id: 'f-low-pygmy',
    name: 'F Low Pygmy',
    ding: 'F3',
    top: ['G3', 'Ab3', 'C4', 'Eb4', 'F4', 'G4', 'Ab4', 'C5'],
    mood: 'A pentatonic-style minor with an earthy, tribal feel. Every combination sounds good.',
  },
  {
    id: 'f-equinox',
    name: 'F Equinox',
    ding: 'F3',
    top: ['Ab3', 'C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'C5'],
    mood: 'Deep and warm minor. The Db gives it a soft, dreamy weight.',
  },
  {
    id: 'c-major',
    name: 'C Major',
    ding: 'C3',
    top: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
    mood: 'Bright and happy. Folk tunes and lullabies fall naturally under your hands.',
  },
  {
    id: 'cs-annaziska',
    name: 'C# Annaziska',
    ding: 'C#3',
    top: ['G#3', 'B3', 'C#4', 'D#4', 'E4', 'F#4', 'G#4', 'B4', 'C#5'],
    mood: 'C# minor with a lifted second. Cinematic and emotional, with a wide range.',
  },
];
