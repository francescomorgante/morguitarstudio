import {
  TUNING,
  noteAt,
  positionKey,
  getScaleNotes,
  getScaleDegree,
  getChordNotes,
  getChordDegree,
  isInsideCagedBox,
  getCagedChordPositions,
  getCagedScaleBoxes,
  isInsideCagedScaleBox,
} from "../music/theory";

const TUNING_MIDI = [
  64, // MI cantino E4
  59, // SI B3
  55, // SOL G3
  50, // RE D3
  45, // LA A2
  40, // MI grave E2
];

function midiAt(stringIndex, fret) {
  return TUNING_MIDI[stringIndex] + fret;
}

function Fretboard({
  range,
  noteNames,

  mode = "study",

  targetNote = null,
  targetMidi = null,

  selected = [],
  verified = false,
  showSolution = false,

  onPositionClick = null,

  showLabels = false,

  scale = null,
  scaleRoot = null,
  scaleDisplay = "notes",

  chord = null,
  chordRoot = null,
  chordDisplay = "notes",

  chordShapePositions = null,

  cagedPosition = null,
  cagedEnabled = false,
  cagedShape = "E",
  cagedQuality = "major",

  showChordShape = false,
  showContinuity = true,
}) {
  const frets = [];

  for (
    let fret = range.start;
    fret <= range.end;
    fret++
  ) {
    frets.push(fret);
  }

  const scaleNotes =
    scale && scaleRoot !== null
      ? getScaleNotes(
          scaleRoot,
          scale
        )
      : [];

  const chordNotes =
    chord && chordRoot !== null
      ? getChordNotes(
        chordRoot,
        chord
      )
    : [];

  /* =========================
     POSIZIONI ACCORDO CAGED
     ========================= */

  const chordPositions =
    cagedEnabled &&
    showChordShape &&
    cagedPosition &&
    scaleRoot !== null
      ? getCagedChordPositions(
          scaleRoot,
          cagedShape,
          cagedQuality,
          cagedPosition
        )
      : [];

  function isChordPosition(
    stringIndex,
    fret
  ) {
    return chordPositions.some(
      (position) =>
        position.string ===
          stringIndex &&
        position.fret === fret
    );
  }

  /* =========================
     BOX CAGED DELLA SCALA
     ========================= */

  const cagedScaleBoxes =
    cagedEnabled &&
    scale &&
    scaleRoot !== null
      ? getCagedScaleBoxes(
          scaleRoot,
          scale,
          cagedShape,
          range
        )
      : null;

  const cagedScaleBox =
    cagedScaleBoxes?.active
      ?.positions ?? null;

  const repeatedScaleBoxes =
    cagedScaleBoxes?.repeated ??
    [];

  function isRepeatedBoxPosition(
    stringIndex,
    fret
  ) {
    return repeatedScaleBoxes.some(
      (box) =>
        isInsideCagedScaleBox(
          stringIndex,
          fret,
          box.positions
        )
    );
  }

  function getState(
    stringIndex,
    fret
  ) {
    const key =
      positionKey(
        stringIndex,
        fret
      );

    const note =
      noteAt(
        stringIndex,
        fret
      );

    /* =====================
       TRAINING
       ===================== */

    if (mode === "training") {
      const isSelected =
        selected.includes(key);

      const isCorrect =
        note === targetNote;

      if (
        showSolution &&
        isCorrect
      ) {
        return "solution";
      }

      if (
        verified &&
        isSelected &&
        isCorrect
      ) {
        return "correct";
      }

      if (
        verified &&
        isSelected &&
        !isCorrect
      ) {
        return "wrong";
      }

      if (isSelected) {
        return "selected";
      }

      return "";
    }
/* =====================
   ALTEZZA REALE / MIDI
   ===================== */

if (mode === "pitch") {
  const midi = midiAt(
    stringIndex,
    fret
  );

  return midi === targetMidi
    ? "studyNote"
    : "";
}
    /* =====================
       NOTA SINGOLA
       ===================== */

    if (mode === "single-note") {
      return note === targetNote
        ? "studyNote"
        : "";
    }

    /* =====================
       TUTTE LE NOTE
       ===================== */

    if (mode === "all-notes") {
      const naturalNotes = [
        0,
        2,
        4,
        5,
        7,
        9,
        11,
      ];

      return naturalNotes.includes(
        note
      )
        ? "studyNote"
        : "";
    }

    /* =====================
       LIBERO
       ===================== */

    if (mode === "free") {
      return selected.includes(key)
        ? "freeNote"
        : "";
    }
/* =====================
   FORMA ACCORDO
   ===================== */

if (
  mode === "chord-shape" &&
  chordShapePositions
) {
  const isPosition =
    chordShapePositions.some(
      (position) =>
        position.string === stringIndex &&
        position.fret === fret
    );

  if (!isPosition) {
    return "";
  }

  return note === chordRoot
    ? "fretChordRoot"
    : "fretChordNote";
}
/* =====================
   ACCORDI
   ===================== */

if (
  mode === "chord" &&
  chord &&
  chordRoot !== null
) {
  const belongsToChord =
    chordNotes.includes(note);

  if (!belongsToChord) {
    return "";
  }

  return note === chordRoot
    ? "fretChordRoot"
    : "fretChordNote";
}
    /* =====================
       SCALE
       ===================== */

    if (
      mode === "scale" &&
      scale
    ) {
      const belongsToScale =
        scaleNotes.includes(note);

      if (!belongsToScale) {
        return "";
      }

      /* =====================
         MANICO COMPLETO
         ===================== */

      if (!cagedEnabled) {
        return note === scaleRoot
          ? "scaleRoot"
          : "scaleNote";
      }

      /* =====================
         NESSUNA POSIZIONE
         ===================== */

      if (!cagedPosition) {
        return note === scaleRoot
          ? "scaleRoot"
          : "scaleNote";
      }

      /* =====================
         BOX CAGED ATTIVO
         ===================== */

      const insideActiveBox =
        cagedScaleBox
          ? isInsideCagedScaleBox(
              stringIndex,
              fret,
              cagedScaleBox
            )
          : isInsideCagedBox(
              fret,
              cagedPosition
            );

      if (insideActiveBox) {
        return note === scaleRoot
          ? "scaleRoot"
          : "scaleNote";
      }

      /* =====================
         RIPETIZIONE BOX
         ===================== */

      if (
        showContinuity &&
        isRepeatedBoxPosition(
          stringIndex,
          fret
        )
      ) {
        return note === scaleRoot
          ? "scaleRootRepeat"
          : "scaleRepeat";
      }

      /* =====================
         CONTINUITÀ
         ===================== */

      if (showContinuity) {
        return note === scaleRoot
          ? "scaleRootGhost"
          : "scaleGhost";
      }

      return "";
    }

    return "";
  }

  function getDisplayLabel(
    stringIndex,
    fret
  ) {
    const note =
      noteAt(
        stringIndex,
        fret
      );
if (
  mode === "chord-shape" &&
  chord &&
  chordRoot !== null
) {
  const degree =
    getChordDegree(
      note,
      chordRoot,
      chord
    );

  if (
    chordDisplay === "intervals"
  ) {
    return degree;
  }

  if (
    chordDisplay === "both"
  ) {
    return `${noteNames[note]} ${degree}`;
  }

  return noteNames[note];
}
if (
  mode === "chord" &&
  chord &&
  chordRoot !== null
) {
  const degree =
    getChordDegree(
      note,
      chordRoot,
      chord
    );

  if (
    chordDisplay === "intervals"
  ) {
    return degree;
  }

  if (
    chordDisplay === "both"
  ) {
    return `${noteNames[note]} ${degree}`;
  }

  return noteNames[note];
}
    if (
      mode !== "scale" ||
      !scale
    ) {
      return noteNames[note];
    }

    const degree =
      getScaleDegree(
        note,
        scaleRoot,
        scale
      );

    if (
      scaleDisplay ===
      "intervals"
    ) {
      return degree;
    }

    if (
      scaleDisplay === "both"
    ) {
      return `${noteNames[note]} ${degree}`;
    }

    return noteNames[note];
  }

  function showMarker(state) {
    return [
      "scaleNote",
      "scaleRoot",

      "scaleRepeat",
      "scaleRootRepeat",

      "scaleGhost",
      "scaleRootGhost",

       "fretChordNote",
       "fretChordRoot",
    ].includes(state);
  }

  function showStandardLabel(
    state
  ) {
    if (
      mode === "all-notes" &&
      state === "studyNote"
    ) {
      return true;
    }

    if (
      mode === "pitch" &&
      state === "studyNote"
    ) {
  return true;
}

    if (
      mode === "free" &&
      state === "freeNote"
    ) {
      return true;
    }

    if (
      showLabels &&
      state !== ""
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className="fretboardScroll">

      <div
        className="trainingFretboard"
        style={{
          "--fret-count":
            frets.length,
        }}
      >

        {/* NOMI CORDE */}

        <div className="stringNames">
          {TUNING.map(
            (note, index) => (
              <span key={index}>
                {noteNames[note]}
              </span>
            )
          )}
        </div>

        {/* MANICO */}

        <div className="fretArea">

          {/* BOX CAGED */}

          {cagedEnabled &&
            cagedPosition && (
              <div
                className="cagedBoxBackground"
                style={{
                  "--box-start":
                    Math.max(
                      0,
                      cagedPosition.start -
                        range.start
                    ),

                  "--box-width":
                    Math.max(
                      0,
                      Math.min(
                        cagedPosition.end,
                        range.end
                      ) -
                        Math.max(
                          cagedPosition.start,
                          range.start
                        ) +
                        1
                    ),
                }}
              />
            )}

          {/* CORDE */}

          {TUNING.map(
            (_, stringIndex) => (

              <div
                className="guitarString"
                key={stringIndex}
              >

                {frets.map(
                  (fret) => {

                    const note =
                      noteAt(
                        stringIndex,
                        fret
                      );

                    const state =
                      getState(
                        stringIndex,
                        fret
                      );

                    const chordTone =
                      isChordPosition(
                        stringIndex,
                        fret
                      );

                    return (
                      <button
                        key={fret}
                        type="button"
                        className={`fretPosition ${
                        fret === 0 ? "openStringPosition" : ""
                        } ${state}`}
                        onClick={() =>
                          onPositionClick?.(
                            stringIndex,
                            fret
                          )
                        }
                        aria-label={
                          fret === 0
                          ? `${noteNames[note]}, corda a vuoto`
                          : `${noteNames[note]}, tasto ${fret}`
                        }
                      >

                        {/* MARKER SCALE */}

                        {showMarker(
                          state
                        ) && (
                          <span
                            className={`noteMarker ${state} ${
                              chordTone
                                ? "chordTone"
                                : ""
                            }`}
                          >
                            {getDisplayLabel(
                              stringIndex,
                              fret
                            )}
                          </span>
                        )}

                        {/* LABEL NOTE/TRAINING */}

                        {!showMarker(
                          state
                        ) &&
                          showStandardLabel(
                            state
                          ) && (
                            <span>
                              {
                                noteNames[
                                  note
                                ]
                              }
                            </span>
                          )}

                        {/* marker vuoto necessario
                            per Training */}

                        {!showMarker(
                          state
                        ) &&
                          !showStandardLabel(
                            state
                          ) && (
                            <span />
                          )}

                      </button>
                    );
                  }
                )}

              </div>
            )
          )}

          {/* NUMERI TASTI */}

<div className="fretNumbers">
  {frets.map((fret) => {
    const showNumber =
      fret === 12 ||
      (fret >= 1 &&
        fret <= 21 &&
        fret % 2 !== 0);

    return (
      <span
        key={fret}
        className={
          fret === 12
            ? "octaveFret"
            : ""
        }
      >
       {fret === 0
  ? "VUOTA"
  : showNumber
    ? fret
    : ""}
      </span>
    );
  })}
</div>

        </div>
      </div>
    </div>
  );
}

export default Fretboard;