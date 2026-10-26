// Handpan tunings and playing patterns.
//
// A tuning has a ding (center note), top tone fields (listed low to high; they
// are laid out in the usual zig-zag around the ring), and optional bottom notes
// with an angle (degrees, 0 = right, 90 = toward the player).
//
// Pattern steps are space-separated tokens, one eighth note each:
//   D      ding            .      rest            T   tak (shell)
//   1..10  the notes of whatever you play over, low to high, top and
//          bottom together (on a chord, wrapping around if it has fewer)
//   D+5    notes struck together
//   1..N   run up all of them   N..1  run down   N-1..2  down, skipping the top
//   N      the highest of them  N-1   the one below it
//   A4     a fixed note by name (only in a tuning's own scale patterns)
//
// Chord progressions are generated for every tuning from the chords it has
// (see PROGRESSIONS in model.js). A tuning can add its own as `progressions`:
//   { name, chords: ['B', 'Em'], desc }  chords by selection name

// Arpeggios (`arpeggio: true`) play a chord's notes one at a time, so they
// are only offered over a chord or a progression.
window.HANDPAN_PATTERNS = [
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
  {
    name: 'Up and back',
    level: 'Beginner',
    steps: '1..N N-1..2',
    desc: 'Every note, up and back down. On a chord this is an arpeggio; let each note ring into the next.',
  },
  {
    name: 'Broken steps',
    level: 'Intermediate',
    steps: '1 T 3 2 T 4 3 T',
    desc: 'Notes out of order, with taks filling the gaps.',
  },
  {
    name: 'Rising rain',
    level: 'Intermediate',
    steps: '1 2 3 . 2 3 4 . 3 4 5 . 4 5 6 T',
    desc: 'Three-note cells that climb one note at a time.',
  },
  {
    name: 'Double stops',
    level: 'Advanced',
    steps: '1+3 . 2 T 1+4 . 3 T',
    desc: 'Two notes struck together, answered by a single note and a tak.',
  },
  {
    name: 'Rocking',
    level: 'Beginner',
    steps: 'D 1 2 . 3 2 1 .',
    desc: 'Three neighbouring notes rocking back and forth. A gentle way to get your hands moving.',
  },
  {
    name: 'Echo',
    level: 'Beginner',
    steps: 'D 3 . 3 D 4 . 4 D 5 . 5 D 4 . 4',
    desc: 'Every note twice, the second one softer, like an echo. Listen for the ding between them.',
  },
  {
    name: 'Slow walk',
    level: 'Beginner',
    steps: 'D . 1 . 2 . 3 . 4 . 3 . 2 . 1 .',
    desc: 'One note every beat with space in between. Focus on a clean, bouncing strike.',
  },
  {
    name: 'Wide leaps',
    level: 'Intermediate',
    steps: 'D 1 5 2 6 3 7 T',
    desc: 'Jump across the pan in big intervals. Your hands cross from one side to the other.',
  },
  {
    name: 'Rolling triplets',
    level: 'Intermediate',
    steps: 'D 3 4 5 4 3 D 4 5 6 5 4',
    desc: 'Groups of three that roll up and back. Count 1-2-3, 1-2-3 for a waltz-like sway.',
  },
  {
    name: 'Ghost taks',
    level: 'Intermediate',
    steps: 'D T T 2 T T 3 T 4 T T 3 T T 2 T',
    desc: 'Light taks fill every gap so the melody floats on a constant pulse. Keep the taks quiet.',
  },
  {
    name: 'Ostinato',
    level: 'Intermediate',
    steps: '1 4 2 4 3 4 2 4',
    desc: 'One hand repeats the same note while the other moves. A classic way to build hypnotic loops.',
  },
  {
    name: 'Syncopation',
    level: 'Advanced',
    steps: 'D . 3 T . 4 T 5 D . 3 T 2 . T .',
    desc: 'Notes land between the beats. Keep counting steadily and let the accents fall off the grid.',
  },
  {
    name: 'Ding rolls',
    level: 'Advanced',
    steps: 'D D D T 3 4 D D D T 5 4 3 .',
    desc: 'Fast repeated dings, alternating hands, answered by a short melody.',
  },
  {
    name: 'Bass walk',
    level: 'Advanced',
    steps: 'D+4 T 5 T 1+4 T 6 T D+5 T 7 T 2+5 T 6 T',
    desc: 'A low note and a melody note together, with taks in between. One hand keeps the bass, the other sings.',
  },
  {
    name: 'Crossing hands',
    level: 'Advanced',
    steps: 'D+7 6 1+5 4 D+6 5 1+4 3',
    desc: 'Pairs that close in from the outside while a single note answers. Watch that your hands do not collide.',
  },
  {
    name: 'Arpeggio up',
    level: 'Beginner',
    arpeggio: true,
    steps: '1..N . .',
    desc: 'Every note of the chord on your pan, low to high, top and bottom. Bigger chords take longer: keep the pulse steady.',
  },
  {
    name: 'Arpeggio down',
    level: 'Beginner',
    arpeggio: true,
    steps: 'N..1 . .',
    desc: 'Every chord note falling from the top. Land softly on the lowest one.',
  },
  {
    name: 'Arpeggio up and down',
    level: 'Beginner',
    arpeggio: true,
    steps: '1..N N-1..2',
    desc: 'Up through the whole chord and straight back, so the loop never stops moving.',
  },
  {
    name: 'Low triad',
    level: 'Beginner',
    arpeggio: true,
    steps: '1 2 3 . 1 2 3 .',
    desc: 'Only the three lowest chord notes, twice. A small shape to learn first; Arpeggio up adds the rest.',
  },
  {
    name: 'Alberti',
    level: 'Intermediate',
    arpeggio: true,
    steps: '1 3 2 3 1 3 2 3',
    desc: 'Low, high, middle, high on the three lowest chord notes: the classical piano accompaniment, for under a melody.',
  },
  {
    name: 'Arpeggio and tak',
    level: 'Intermediate',
    arpeggio: true,
    steps: '1..N T N-1..1 T',
    desc: 'Up the whole chord, a tak, back down, a tak, so the harmony gets a beat.',
  },
  {
    name: 'Bell on top',
    level: 'Advanced',
    arpeggio: true,
    steps: '1 N 2 N 1 N 2 N',
    desc: 'The chord\'s highest note rings like a bell between its two lowest, a hand span apart.',
  },
  {
    name: 'Rolled chord',
    level: 'Advanced',
    arpeggio: true,
    steps: '1+3 . 2 3 1+3 . 2 1',
    desc: 'Two chord notes struck together, then the one between them.',
  },
];

// Shared by D Kurd 9 and 10.
const KURD_PROGRESSIONS = [
  { name: 'Lament', chords: ['Dm', 'Gm', 'C', 'F'], desc: 'Walks the circle of fifths from home to F: a sad song that finds its feet.' },
  { name: 'Night drive', chords: ['Dm', 'Am', 'Bb', 'C'], desc: 'Home, the dark fifth, then a two-step climb that leads back.' },
  { name: 'Open breath', chords: ['Dsus2', 'Bb', 'Fsus2', 'C'], desc: 'Open sus2 chords around Bb and C: floating and unresolved, made for long rings.' },
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
      { name: 'B Hijaz scale', scale: true, root: 11, pcs: [11, 0, 3, 4, 6, 7, 9], desc: 'Complete with the bottom G. C to B is the signature.' },
      { name: 'B', root: 11, pcs: [11, 3, 6], desc: 'B D# F#. Home chord; end phrases here.' },
      { name: 'B7', root: 11, pcs: [11, 3, 6, 9], desc: 'B D# F# A. Tension that wants E minor or back to B.' },
      { name: 'Em', root: 4, pcs: [4, 7, 11], desc: 'E G B. Restful; uses the bottom G notes.' },
      { name: 'Am', root: 9, pcs: [9, 0, 4], desc: 'A C E. Melancholic; resolve to B major.' },
      { name: 'E', root: 4, pcs: [4, 8, 11], desc: 'E G# B. Bright surprise via the bottom Ab.' },
      { name: 'D#dim', root: 3, pcs: [3, 6, 9, 0], desc: 'D# F# A C. Maximum tension; release onto E or B.' },
    ],
    progressions: [
      { name: 'Hijaz cadence', chords: ['B', 'Em', 'Am', 'B7'], desc: 'Out to E minor and A minor, then B7 pulls back home.' },
      { name: 'Dark side', chords: ['Em', 'Am', 'B7', 'B'], desc: 'Starts in the minor chords that give Hijaz its dark colour, then climbs back to its major home.' },
      { name: 'Tension and release', chords: ['B', 'D#dim', 'Em', 'B7'], desc: 'D# diminished leans into E minor; B7 brings it home.' },
    ],
    patterns: [
      {
        name: 'Hijaz motif',
        scaleOnly: true,
        level: 'Beginner',
        steps: 'A4 F#4 E4 D#4 C4 B3 C4 B3 D . . .',
        desc: 'The essential Hijaz phrase: walk down from A4 and lean on the C before it falls onto B.',
      },
      {
        name: 'Snake charmer',
        scaleOnly: true,
        level: 'Intermediate',
        steps: 'D 5 6 5 7 6 5 . 5 6 8 7 6 5 6 .',
        desc: 'Circle around B and C, reach up to D# and E, and always come back to B.',
      },
      {
        name: 'Bottom bloom',
        scaleOnly: true,
        level: 'Double',
        steps: 'D G3 5 G4 8 B4 . T D Eb3 7 Ab3 8 E5 . T',
        desc: 'Alternate top fields with bottom notes to play E minor, then a bright E major. Reach under with one hand.',
      },
      {
        name: 'Waterfall',
        scaleOnly: true,
        level: 'Double',
        steps: 'E5 Eb5 B4 11 G4 9 8 7 6 5 D . . .',
        desc: 'Pour down the whole range, swapping between bottom and top. The underside notes fill the gaps in the top ring.',
      },
      {
        name: 'Bass below',
        scaleOnly: true,
        level: 'Double',
        steps: 'Eb3+7 . 8 9 G3+8 . 7 6 G3+5 . 6 . D . T .',
        desc: 'One hand holds a bass note underneath while the other plays the melody on top. Strike both at once.',
      },
      {
        name: 'Answer from below',
        scaleOnly: true,
        level: 'Double',
        steps: '7 8 9 . Eb5 E5 B4 . 5 6 7 . G3 Eb3 D .',
        desc: 'The top plays a phrase, the bottom answers it. Turn the pan slightly so you can reach underneath.',
      },
    ],
  },
  {
    id: 'd-kurd-9',
    name: 'D Kurd 9',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
    mood: 'The most common handpan scale: D natural minor. Soft, melancholic and impossible to play wrong.',
    progressions: KURD_PROGRESSIONS,
  },
  {
    id: 'd-kurd-10',
    name: 'D Kurd 10',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5'],
    mood: 'D Kurd with an extra high C. More room for melodies above the octave.',
    progressions: KURD_PROGRESSIONS,
  },
  {
    id: 'd-celtic',
    name: 'D Celtic Minor',
    ding: 'D3',
    top: ['A3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5'],
    mood: 'Dorian-flavored minor without the dark Bb. Open, folky, a little hopeful.',
    progressions: [
      { name: 'Reel', chords: ['Dm', 'C', 'Dm', 'Am'], desc: 'The shape of a folk reel: a step down to C, home, then out to A minor.' },
      { name: 'Dorian lift', chords: ['Dm', 'Gsus2', 'Dm', 'Csus2'], desc: 'With no Bb, Gsus2 hints at G major: hopeful without leaving minor.' },
      { name: 'Hills', chords: ['F', 'C', 'Dm', 'Am'], desc: 'Starts on the bright F and settles into minor.' },
    ],
  },
  {
    id: 'd-integral',
    name: 'D Integral',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'A4'],
    mood: 'A spacious minor with no G. Fewer notes, lots of air between them; great for meditation.',
    progressions: [
      { name: 'Meditation', chords: ['Dsus2', 'Bbsus2'], desc: 'Two open chords and lots of air. Play slowly and let them ring.' },
      { name: 'Deep tide', chords: ['Dm', 'Bb', 'F', 'Am'], desc: 'Rises to F and sinks back through A minor.' },
      { name: 'Still water', chords: ['Dm7', 'F', 'Bb', 'F'], desc: 'Dm7 and F share most of their notes; Bb adds the only shadow.' },
    ],
  },
  {
    id: 'd-hijaz',
    name: 'D Hijaz',
    ding: 'D3',
    top: ['A3', 'Bb3', 'C#4', 'D4', 'E4', 'F4', 'G4', 'A4'],
    mood: 'Exotic and tense. The jump from Bb to C# gives it a desert, Andalusian character.',
    progressions: [
      { name: 'Hijaz cadence', chords: ['Dm', 'Gm', 'Bb', 'A'], desc: 'Gm and Bb climb to A major, which falls hard back home: the Andalusian sound.' },
      { name: 'Half step', chords: ['A', 'Bb', 'A', 'Dm'], desc: 'A to Bb and back is the Hijaz signature; Dm lets it rest.' },
      { name: 'Tension and release', chords: ['Dm', 'Bbm', 'Edim', 'A'], desc: 'Bb minor darkens, E diminished tightens, A major snaps back to Dm.' },
    ],
  },
  {
    id: 'f-low-pygmy',
    name: 'F Low Pygmy',
    ding: 'F3',
    top: ['G3', 'Ab3', 'C4', 'Eb4', 'F4', 'G4', 'Ab4', 'C5'],
    mood: 'A pentatonic-style minor with an earthy, tribal feel. Every combination sounds good.',
    progressions: [
      { name: 'Earth', chords: ['Fm', 'Ab', 'Cm', 'Ab'], desc: 'Rises through Ab to C minor and floats back. No wrong notes anywhere.' },
      { name: 'Rain', chords: ['Fm', 'Cm', 'Fsus2', 'Ab'], desc: 'Fsus2 opens the home chord halfway through, so the loop never quite lands.' },
      { name: 'Drum circle', chords: ['Fm7', 'Fsus2'], desc: 'Two colours of the same home: run a steady groove and let the harmony shimmer.' },
    ],
  },
  {
    id: 'f-equinox',
    name: 'F Equinox',
    ding: 'F3',
    top: ['Ab3', 'C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'C5'],
    mood: 'Deep and warm minor. The Db gives it a soft, dreamy weight.',
    progressions: [
      { name: 'Equinox', chords: ['Fm', 'Db', 'Ab', 'Cm'], desc: 'Db brings the weight, Ab the light, and C minor turns it home.' },
      { name: 'Dusk', chords: ['Fm7', 'Db', 'Fm7', 'Cm'], desc: 'Sways between home and the warm Db.' },
      { name: 'Slow rise', chords: ['Db', 'Ab', 'Cm', 'Fm'], desc: 'Starts warm on Db and climbs to the minor home.' },
    ],
  },
  {
    id: 'c-major',
    name: 'C Major',
    ding: 'C3',
    top: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
    mood: 'Bright and happy. Folk tunes and lullabies fall naturally under your hands.',
    progressions: [
      { name: 'Canon', chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'], desc: 'Pachelbel\'s Canon: eight chords stepping down like bells.' },
      { name: 'Lullaby', chords: ['C', 'Am', 'Dm', 'G'], desc: 'The gentle loop under countless lullabies and old standards.' },
      { name: 'Sunny', chords: ['C', 'Em', 'F', 'G'], desc: 'Climbs one chord at a time to G, which drops back home.' },
    ],
  },
  {
    id: 'cs-annaziska',
    name: 'C# Annaziska',
    ding: 'C#3',
    top: ['G#3', 'B3', 'C#4', 'D#4', 'E4', 'F#4', 'G#4', 'B4', 'C#5'],
    mood: 'C# minor with a lifted second. Cinematic and emotional, with a wide range.',
    progressions: [
      { name: 'Soundtrack', chords: ['C#m', 'E', 'B', 'F#sus2'], desc: 'The lifted F#sus2 keeps it hanging: big and cinematic.' },
      { name: 'Anthem', chords: ['E', 'B', 'C#m', 'G#m'], desc: 'Starts bright on E and lands in minor: emotional and wide.' },
      { name: 'Open sky', chords: ['C#sus2', 'Bsus2', 'Esus2', 'C#m'], desc: 'Open sus2 chords drift down and finally settle on C# minor.' },
    ],
  },
];
