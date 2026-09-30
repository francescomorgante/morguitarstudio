export const NOTES_IT = [
  "DO", "DO♯", "RE", "RE♯", "MI", "FA",
  "FA♯", "SOL", "SOL♯", "LA", "LA♯", "SI"
];

export const NOTES_EN = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

export const NATURAL_NOTES = [
  0, 2, 4, 5, 7, 9, 11
];

export const CHROMATIC_NOTES = [
  0, 1, 2, 3, 4, 5,
  6, 7, 8, 9, 10, 11
];

/*
  Visualizzazione dall'alto:

  0 = MI cantino
  1 = SI
  2 = SOL
  3 = RE
  4 = LA
  5 = MI grave
*/

export const TUNING = [
  4, 11, 7, 2, 9, 4
];

export const RANGES = [
  { label: "1–5", start: 1, end: 5 },
  { label: "5–9", start: 5, end: 9 },
  { label: "8–12", start: 8, end: 12 },
  { label: "12–17", start: 12, end: 17 },

  // MANICO COMPLETO
  { label: "0–22", start: 0, end: 22 },
];


/* =========================
   NOTE
   ========================= */

export function getNoteNames(notation) {
  return notation === "italian"
    ? NOTES_IT
    : NOTES_EN;
}

export function noteAt(
  stringIndex,
  fret
) {
  return (
    TUNING[stringIndex] +
    fret
  ) % 12;
}

export function positionKey(
  stringIndex,
  fret
) {
  return `${stringIndex}-${fret}`;
}

export function getCorrectPositions(
  targetNote,
  range
) {
  const positions = [];

  for (
    let fret = range.start;
    fret <= range.end;
    fret++
  ) {
    for (
      let stringIndex = 0;
      stringIndex < 6;
      stringIndex++
    ) {
      if (
        noteAt(
          stringIndex,
          fret
        ) === targetNote
      ) {
        positions.push(
          positionKey(
            stringIndex,
            fret
          )
        );
      }
    }
  }

  return positions;
}


/* =========================
   SCALE
   ========================= */

export const SCALES = {

  major: {
    id: "major",
    name: "Maggiore",

    quality: "major",

    intervals: [
      0, 2, 4, 5, 7, 9, 11
    ],

    labels: [
      "1", "2", "3", "4",
      "5", "6", "7"
    ],
  },

  naturalMinor: {
    id: "naturalMinor",
    name: "Minore naturale",

    quality: "minor",

    intervals: [
      0, 2, 3, 5, 7, 8, 10
    ],

    labels: [
      "1", "2", "♭3", "4",
      "5", "♭6", "♭7"
    ],
  },

  majorPentatonic: {
    id: "majorPentatonic",
    name: "Pentatonica maggiore",

    quality: "major",

    intervals: [
      0, 2, 4, 7, 9
    ],

    labels: [
      "1", "2", "3", "5", "6"
    ],
  },

  minorPentatonic: {
    id: "minorPentatonic",
    name: "Pentatonica minore",

    quality: "minor",

    intervals: [
      0, 3, 5, 7, 10
    ],

    labels: [
      "1", "♭3", "4", "5", "♭7"
    ],
  },

  blues: {
    id: "blues",
    name: "Blues",

    quality: "minor",

    intervals: [
      0, 3, 5, 6, 7, 10
    ],

    labels: [
      "1", "♭3", "4",
      "♭5", "5", "♭7"
    ],
  },
};


export function getScaleNotes(
  root,
  scale
) {
  return scale.intervals.map(
    (interval) =>
      (root + interval) % 12
  );
}


export function getScaleDegree(
  note,
  root,
  scale
) {
  const distance =
    (note - root + 12) % 12;

  const index =
    scale.intervals.indexOf(
      distance
    );

  if (index === -1) {
    return null;
  }

  return scale.labels[index];
}

/* =========================================
   ACCORDI
   ========================================= */

export const CHORDS = {

  major: {
    id: "major",
    name: "Maggiore",
    symbol: "",
    quality: "major",

    intervals: [
      0, 4, 7
    ],

    labels: [
      "1", "3", "5"
    ],
  },

  minor: {
    id: "minor",
    name: "Minore",
    symbol: "m",
    quality: "minor",

    intervals: [
      0, 3, 7
    ],

    labels: [
      "1", "♭3", "5"
    ],
  },

  dominant7: {
    id: "dominant7",
    name: "Settima",
    symbol: "7",
    quality: "major",

    intervals: [
      0, 4, 7, 10
    ],

    labels: [
      "1", "3", "5", "♭7"
    ],
  },

  major7: {
    id: "major7",
    name: "Maj7",
    symbol: "maj7",
    quality: "major",

    intervals: [
      0, 4, 7, 11
    ],

    labels: [
      "1", "3", "5", "7"
    ],
  },

  minor7: {
    id: "minor7",
    name: "Minore 7",
    symbol: "m7",
    quality: "minor",

    intervals: [
      0, 3, 7, 10
    ],

    labels: [
      "1", "♭3", "5", "♭7"
    ],
  },
};


/* =========================================
   NOTE DELL'ACCORDO
   ========================================= */

export function getChordNotes(
  root,
  chord
) {
  if (
    root === null ||
    !chord
  ) {
    return [];
  }

  return chord.intervals.map(
    (interval) =>
      (root + interval) % 12
  );
}


/* =========================================
   GRADO DELL'ACCORDO
   ========================================= */

export function getChordDegree(
  note,
  root,
  chord
) {
  if (
    root === null ||
    !chord
  ) {
    return null;
  }

  const distance =
    (note - root + 12) % 12;

  const index =
    chord.intervals.indexOf(
      distance
    );

  if (index === -1) {
    return null;
  }

  return chord.labels[index];
}


/* =========================================
   NOME COMPLETO ACCORDO
   ========================================= */

export function getChordName(
  root,
  chord,
  noteNames
) {
  if (
    root === null ||
    !chord ||
    !noteNames
  ) {
    return "";
  }

  return (
    noteNames[root] +
    chord.symbol
  );
}
/* =========================================
   CAGED
   ========================================= */

export const CAGED_SHAPES = {

  C: {
    id: "C",
    templateRoot: 0,

    major: [
      { string: 4, fret: 3 },
      { string: 3, fret: 2 },
      { string: 2, fret: 0 },
      { string: 1, fret: 1 },
      { string: 0, fret: 0 },
    ],

    minor: [
      { string: 4, fret: 3 },
      { string: 3, fret: 1 },
      { string: 2, fret: 0 },
      { string: 1, fret: 1 },
      { string: 0, fret: -1 },
    ],
  },

  A: {
    id: "A",
    templateRoot: 9,

    major: [
      { string: 4, fret: 0 },
      { string: 3, fret: 2 },
      { string: 2, fret: 2 },
      { string: 1, fret: 2 },
      { string: 0, fret: 0 },
    ],

    minor: [
      { string: 4, fret: 0 },
      { string: 3, fret: 2 },
      { string: 2, fret: 2 },
      { string: 1, fret: 1 },
      { string: 0, fret: 0 },
    ],
  },

  G: {
    id: "G",
    templateRoot: 7,

    major: [
      { string: 5, fret: 3 },
      { string: 4, fret: 2 },
      { string: 3, fret: 0 },
      { string: 2, fret: 0 },
      { string: 1, fret: 0 },
      { string: 0, fret: 3 },
    ],

    minor: [
      { string: 5, fret: 3 },
      { string: 4, fret: 1 },
      { string: 3, fret: 0 },
      { string: 2, fret: 0 },
      { string: 1, fret: -1 },
      { string: 0, fret: 3 },
    ],
  },

  E: {
    id: "E",
    templateRoot: 4,

    major: [
      { string: 5, fret: 0 },
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 1 },
      { string: 1, fret: 0 },
      { string: 0, fret: 0 },
    ],

    minor: [
      { string: 5, fret: 0 },
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 0 },
      { string: 1, fret: 0 },
      { string: 0, fret: 0 },
    ],
  },

  D: {
    id: "D",
    templateRoot: 2,

    major: [
      { string: 3, fret: 0 },
      { string: 2, fret: 2 },
      { string: 1, fret: 3 },
      { string: 0, fret: 2 },
    ],

    minor: [
      { string: 3, fret: 0 },
      { string: 2, fret: 2 },
      { string: 1, fret: 3 },
      { string: 0, fret: 1 },
    ],
  },
};


/* =========================================
   TRASPOSIZIONE CAGED
   ========================================= */

export function getCagedShapeCandidates(
  root,
  shapeId,
  quality = "major"
) {
  const shape =
    CAGED_SHAPES[shapeId];

  if (!shape) {
    return [];
  }

  const template =
    shape[quality] ||
    shape.major;

  const baseShift =
    (
      root -
      shape.templateRoot +
      12
    ) % 12;

  const candidates = [];

  for (
    let octave = -1;
    octave <= 3;
    octave++
  ) {
    const shift =
      baseShift +
      octave * 12;

    const positions =
      template
        .map((position) => ({
          string:
            position.string,

          fret:
            position.fret +
            shift,
        }))
        .filter(
          (position) =>
            position.fret >= 0 &&
            position.fret <= 24
        );

    if (!positions.length) {
      continue;
    }

    if (
      positions.length !==
      template.length
    ) {
      continue;
    }

    const frets =
      positions.map(
        (position) =>
          position.fret
      );

    candidates.push({
      shift,
      positions,

      start:
        Math.min(...frets),

      end:
        Math.max(...frets),
    });
  }

  return candidates;
}


/* =========================================
   BOX REALI PENTATONICA MINORE
   ========================================= */

/*
  Riferimento: LA pentatonica minore.

  Sequenza canonica:

  E -> D -> C -> A -> G
*/

export const MINOR_PENTATONIC_CAGED_BOXES = {

  E: {
    referenceRoot: 9,

    positions: [
      { string: 0, fret: 5 },
      { string: 0, fret: 8 },

      { string: 1, fret: 5 },
      { string: 1, fret: 8 },

      { string: 2, fret: 5 },
      { string: 2, fret: 7 },

      { string: 3, fret: 5 },
      { string: 3, fret: 7 },

      { string: 4, fret: 5 },
      { string: 4, fret: 7 },

      { string: 5, fret: 5 },
      { string: 5, fret: 8 },
    ],
  },

  D: {
    referenceRoot: 9,

    positions: [
      { string: 0, fret: 8 },
      { string: 0, fret: 10 },

      { string: 1, fret: 8 },
      { string: 1, fret: 10 },

      { string: 2, fret: 7 },
      { string: 2, fret: 9 },

      { string: 3, fret: 7 },
      { string: 3, fret: 10 },

      { string: 4, fret: 7 },
      { string: 4, fret: 10 },

      { string: 5, fret: 8 },
      { string: 5, fret: 10 },
    ],
  },

  C: {
    referenceRoot: 9,

    positions: [
      { string: 0, fret: 10 },
      { string: 0, fret: 12 },

      { string: 1, fret: 10 },
      { string: 1, fret: 13 },

      { string: 2, fret: 9 },
      { string: 2, fret: 12 },

      { string: 3, fret: 10 },
      { string: 3, fret: 12 },

      { string: 4, fret: 10 },
      { string: 4, fret: 12 },

      { string: 5, fret: 10 },
      { string: 5, fret: 12 },
    ],
  },

  A: {
    referenceRoot: 9,

    positions: [
      { string: 0, fret: 12 },
      { string: 0, fret: 15 },

      { string: 1, fret: 13 },
      { string: 1, fret: 15 },

      { string: 2, fret: 12 },
      { string: 2, fret: 14 },

      { string: 3, fret: 12 },
      { string: 3, fret: 14 },

      { string: 4, fret: 12 },
      { string: 4, fret: 15 },

      { string: 5, fret: 12 },
      { string: 5, fret: 15 },
    ],
  },

  G: {
    referenceRoot: 9,

    positions: [
      { string: 0, fret: 15 },
      { string: 0, fret: 17 },

      { string: 1, fret: 15 },
      { string: 1, fret: 17 },

      { string: 2, fret: 14 },
      { string: 2, fret: 17 },

      { string: 3, fret: 14 },
      { string: 3, fret: 17 },

      { string: 4, fret: 15 },
      { string: 4, fret: 17 },

      { string: 5, fret: 15 },
      { string: 5, fret: 17 },
    ],
  },
};


/* =========================================
   UTILITY
   ========================================= */

function getNearestTonalShift(
  root,
  referenceRoot = 9
) {
  let shift =
    root - referenceRoot;

  if (shift > 6) {
    shift -= 12;
  }

  if (shift < -6) {
    shift += 12;
  }

  return shift;
}


function getPositionsBounds(
  positions
) {
  if (!positions.length) {
    return null;
  }

  const frets =
    positions.map(
      (position) =>
        position.fret
    );

  return {
    start:
      Math.min(...frets),

    end:
      Math.max(...frets),
  };
}


/* =========================================
   CANDIDATI BOX ±12
   ========================================= */

function getMinorPentatonicBoxCandidates(
  root,
  shapeId
) {
  const box =
    MINOR_PENTATONIC_CAGED_BOXES[
      shapeId
    ];

  if (!box) {
    return [];
  }

  const tonalShift =
    getNearestTonalShift(
      root,
      box.referenceRoot
    );

  const candidates = [];

  for (
    let octave = -2;
    octave <= 2;
    octave++
  ) {
    const octaveShift =
      octave * 12;

    const shift =
      tonalShift +
      octaveShift;

    const positions =
      box.positions.map(
        (position) => ({
          string:
            position.string,

          fret:
            position.fret +
            shift,
        })
      );

    const complete =
      positions.every(
        (position) =>
          position.fret >= 0 &&
          position.fret <= 24
      );

    if (!complete) {
      continue;
    }

    const bounds =
      getPositionsBounds(
        positions
      );

    candidates.push({
      positions,
      shift,
      octaveShift,

      canonical:
        octaveShift === 0,

      start:
        bounds.start,

      end:
        bounds.end,
    });
  }

  return candidates;
}


/* =========================================
   BOX ATTIVO + RIPETIZIONI
   ========================================= */

export function getMinorPentatonicCagedBoxes(
  root,
  shapeId,
  range
) {
  const candidates =
    getMinorPentatonicBoxCandidates(
      root,
      shapeId
    );

  if (!candidates.length) {
    return {
      active: null,
      repeated: [],
    };
  }

  /*
    Il box principale è la posizione
    canonica della forma.

    In LA minore:

    E = 5–8
    D = 7–10
    C = 9–13
    A = 12–15
    G = 14–17
  */

  let active =
    candidates.find(
      (candidate) =>
        candidate.canonical
    );

  /*
    Fallback nel caso in cui la copia
    canonica non sia disponibile sul
    manico 0–24.
  */

  if (!active) {
    active =
      candidates.reduce(
        (best, candidate) => {

          if (!best) {
            return candidate;
          }

          return (
            Math.abs(
              candidate.octaveShift
            ) <
            Math.abs(
              best.octaveShift
            )
          )
            ? candidate
            : best;
        },
        null
      );
  }

  /*
    Le altre copie ±12 diventano
    ripetizioni visibili soltanto
    quando intersecano il range.
  */

  const repeated =
    candidates.filter(
      (candidate) => {

        if (candidate === active) {
          return false;
        }

        return (
          candidate.end >=
            range.start &&
          candidate.start <=
            range.end
        );
      }
    );

  return {
    active,
    repeated,
  };
}


/* =========================================
   MIGLIORE POSIZIONE CAGED
   ========================================= */

export function getBestCagedPosition(
  root,
  shapeId,
  range,
  quality = "major"
) {

  /*
    Per le forme minori agganciamo
    l'accordo al box canonico.
  */

  if (quality === "minor") {

    const boxes =
      getMinorPentatonicCagedBoxes(
        root,
        shapeId,
        range
      );

    if (boxes.active) {

      const chordCandidates =
        getCagedShapeCandidates(
          root,
          shapeId,
          quality
        );

      if (
        chordCandidates.length
      ) {
        const boxCenter =
          (
            boxes.active.start +
            boxes.active.end
          ) / 2;

        const ranked =
          chordCandidates
            .map(
              (candidate) => {

                const chordCenter =
                  (
                    candidate.start +
                    candidate.end
                  ) / 2;

                return {
                  ...candidate,

                  distance:
                    Math.abs(
                      chordCenter -
                      boxCenter
                    ),
                };
              }
            )
            .sort(
              (a, b) =>
                a.distance -
                b.distance
            );

        return {
          ...ranked[0],

          boxStart:
            boxes.active.start,

          boxEnd:
            boxes.active.end,
        };
      }
    }
  }


  /*
    FALLBACK GENERALE
  */

  const candidates =
    getCagedShapeCandidates(
      root,
      shapeId,
      quality
    );

  if (!candidates.length) {
    return null;
  }

  const rangeCenter =
    (
      range.start +
      range.end
    ) / 2;

  const ranked =
    candidates.map(
      (candidate) => {

        const visibleStart =
          Math.max(
            candidate.start,
            range.start
          );

        const visibleEnd =
          Math.min(
            candidate.end,
            range.end
          );

        const overlap =
          Math.max(
            0,
            visibleEnd -
              visibleStart +
              1
          );

        const center =
          (
            candidate.start +
            candidate.end
          ) / 2;

        return {
          ...candidate,
          overlap,

          distance:
            Math.abs(
              center -
              rangeCenter
            ),
        };
      }
    );

  ranked.sort(
    (a, b) => {

      if (
        b.overlap !==
        a.overlap
      ) {
        return (
          b.overlap -
          a.overlap
        );
      }

      return (
        a.distance -
        b.distance
      );
    }
  );

  return ranked[0];
}


/* =========================================
   POSIZIONI ACCORDO
   ========================================= */

export function getCagedChordPositions(
  root,
  shapeId,
  quality,
  cagedPosition
) {
  if (!cagedPosition) {
    return [];
  }

  const shape =
    CAGED_SHAPES[shapeId];

  if (!shape) {
    return [];
  }

  const template =
    shape[quality] ||
    shape.major;

  return template
    .map(
      (position) => ({
        string:
          position.string,

        fret:
          position.fret +
          cagedPosition.shift,
      })
    )
    .filter(
      (position) =>
        position.fret >= 0 &&
        position.fret <= 24
    );
}


/* =========================================
   FALLBACK CAGED GENERICO
   ========================================= */

export function isInsideCagedBox(
  fret,
  position
) {
  if (!position) {
    return false;
  }

  return (
    fret >= position.start &&
    fret <= position.end
  );
}


/* =========================================
   API BOX SCALA
   ========================================= */

export function getCagedScaleBoxes(
  root,
  scale,
  shapeId,
  range
) {
  if (
    root === null ||
    !scale ||
    !shapeId ||
    !range
  ) {
    return null;
  }

  if (
    scale.id ===
    "minorPentatonic"
  ) {
    return (
      getMinorPentatonicCagedBoxes(
        root,
        shapeId,
        range
      )
    );
  }

  return null;
}


/*
  Compatibilità temporanea con il
  codice precedente.
*/

export function getCagedScaleBox(
  root,
  scale,
  shapeId,
  cagedPosition
) {
  if (
    root === null ||
    !scale ||
    !shapeId ||
    !cagedPosition
  ) {
    return null;
  }

  if (
    scale.id !==
    "minorPentatonic"
  ) {
    return null;
  }

  const candidates =
    getMinorPentatonicBoxCandidates(
      root,
      shapeId
    );

  const active =
    candidates.find(
      (candidate) =>
        candidate.canonical
    );

  return active
    ? active.positions
    : null;
}


export function isInsideCagedScaleBox(
  stringIndex,
  fret,
  positions
) {
  if (!positions) {
    return false;
  }

  return positions.some(
    (position) =>
      position.string ===
        stringIndex &&
      position.fret === fret
  );
}