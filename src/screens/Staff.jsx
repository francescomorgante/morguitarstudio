import { useMemo, useState } from "react";
import Fretboard from "../components/Fretboard";
import { getNoteNames } from "../music/theory";


/* =========================================================
   CONFIGURAZIONE MUSICALE
   ========================================================= */

const TUNING_MIDI = [
  64, // MI cantino E4
  59, // SI B3
  55, // SOL G3
  50, // RE D3
  45, // LA A2
  40, // MI grave E2
];

const STAFF_RANGE = {
  start: 0,
  end: 22,
};

const NATURAL_PITCH_CLASSES = [
  0,  // DO
  2,  // RE
  4,  // MI
  5,  // FA
  7,  // SOL
  9,  // LA
  11, // SI
];

const DIATONIC_INDEX = {
  0: 0,
  2: 1,
  4: 2,
  5: 3,
  7: 4,
  9: 5,
  11: 6,
};


/*
 * Geometria del pentagramma.
 *
 * MI4 SCRITTO = prima linea = Y 144
 *
 * Nella notazione standard per chitarra
 * il suono reale viene scritto
 * un'ottava più in alto.
 */
const STAFF_E4_Y = 144;
const STAFF_STEP = 12;


/*
 * Area cliccabile del pentagramma.
 */
const STAFF_MIN_Y = 24;
const STAFF_MAX_Y = 204;


/* =========================================================
   UTILITY MIDI
   ========================================================= */

function midiToPitchClass(midi) {
  return midi % 12;
}


function midiToOctave(midi) {
  return Math.floor(midi / 12) - 1;
}


function fretMidi(stringIndex, fret) {
  return TUNING_MIDI[stringIndex] + fret;
}


/* =========================================================
   NOTAZIONE CHITARRISTICA
   ========================================================= */

/*
 * La chitarra suona un'ottava sotto
 * rispetto a quanto viene scritto.
 *
 * Il MIDI interno continua sempre
 * a rappresentare il SUONO REALE.
 */

function soundingToWrittenMidi(midi) {
  return midi + 12;
}


function writtenToSoundingMidi(midi) {
  return midi - 12;
}


/* =========================================================
   POSIZIONE DIATONICA
   ========================================================= */

function getDiatonicPosition(midi) {
  const pitchClass =
    midiToPitchClass(midi);

  const octave =
    midiToOctave(midi);

  return (
    octave * 7 +
    DIATONIC_INDEX[pitchClass]
  );
}


/* =========================================================
   CONVERSIONE POSIZIONE DIATONICA -> MIDI
   ========================================================= */

function diatonicPositionToMidi(position) {
  const octave =
    Math.floor(position / 7);

  const degree =
    ((position % 7) + 7) % 7;

  const pitchClasses = [
    0,  // C
    2,  // D
    4,  // E
    5,  // F
    7,  // G
    9,  // A
    11, // B
  ];

  const pitchClass =
    pitchClasses[degree];

  return (
    (octave + 1) * 12 +
    pitchClass
  );
}


/* =========================================================
   POSIZIONE VERTICALE DELLA NOTA
   ========================================================= */

function getStaffY(soundingMidi) {

  /*
   * selectedMidi rappresenta
   * l'altezza realmente suonata.
   *
   * Per disegnarla sul pentagramma
   * della chitarra la spostiamo
   * un'ottava sopra.
   */
  const writtenMidi =
    soundingToWrittenMidi(
      soundingMidi
    );

  /*
   * Prima linea del pentagramma:
   * MI4 scritto.
   */
  const writtenE4 =
    getDiatonicPosition(64);

  const current =
    getDiatonicPosition(
      writtenMidi
    );

  const steps =
    current - writtenE4;

  return (
    STAFF_E4_Y -
    steps * STAFF_STEP
  );
}


/* =========================================================
   CLICK SUL PENTAGRAMMA -> MIDI REALE
   ========================================================= */

function staffYToMidi(y) {

  /*
   * Prima linea:
   * MI4 scritto.
   */
  const writtenE4 =
    getDiatonicPosition(64);

  const rawSteps =
    (STAFF_E4_Y - y) /
    STAFF_STEP;

  /*
   * Snap automatico alla linea
   * o allo spazio più vicino.
   */
  const steps =
    Math.round(rawSteps);

  const writtenPosition =
    writtenE4 + steps;

  /*
   * Nota così come viene
   * SCRITTA sul pentagramma.
   */
  const writtenMidi =
    diatonicPositionToMidi(
      writtenPosition
    );

  /*
   * Convertiamo la nota scritta
   * nel suono reale della chitarra.
   */
  return writtenToSoundingMidi(
    writtenMidi
  );
}


/* =========================================================
   LINEE ADDIZIONALI
   ========================================================= */

function getLedgerLines(soundingMidi) {

  /*
   * Anche le linee addizionali
   * devono essere calcolate sulla
   * NOTA SCRITTA.
   */
  const writtenMidi =
    soundingToWrittenMidi(
      soundingMidi
    );

  const notePosition =
    getDiatonicPosition(
      writtenMidi
    );

  const writtenE4 =
    getDiatonicPosition(64);

  /*
   * Quinta linea:
   * FA5 scritto = MIDI 77.
   */
  const writtenF5 =
    getDiatonicPosition(77);

  const lines = [];


  /* -------------------------
     SOTTO IL PENTAGRAMMA
     ------------------------- */

  if (
    notePosition <=
    writtenE4 - 2
  ) {

    for (
      let position =
        writtenE4 - 2;

      position >=
      notePosition;

      position -= 2
    ) {

      const steps =
        position -
        writtenE4;

      lines.push(
        STAFF_E4_Y -
        steps * STAFF_STEP
      );
    }
  }


  /* -------------------------
     SOPRA IL PENTAGRAMMA
     ------------------------- */

  if (
    notePosition >=
    writtenF5 + 2
  ) {

    for (
      let position =
        writtenF5 + 2;

      position <=
      notePosition;

      position += 2
    ) {

      const steps =
        position -
        writtenE4;

      lines.push(
        STAFF_E4_Y -
        steps * STAFF_STEP
      );
    }
  }


  return lines;
}


/* =========================================================
   NOTE DISPONIBILI NEL RANGE DEL MANICO
   ========================================================= */

function getAvailableMidiNotes() {
  const values = new Set();

  for (
    let stringIndex = 0;
    stringIndex < 6;
    stringIndex += 1
  ) {

    for (
      let fret = STAFF_RANGE.start;
      fret <= STAFF_RANGE.end;
      fret += 1
    ) {

      const midi =
        fretMidi(
          stringIndex,
          fret
        );

      const pitchClass =
        midiToPitchClass(midi);

      /*
       * Per ora lavoriamo
       * solo sulle note naturali.
       */
      if (
        NATURAL_PITCH_CLASSES.includes(
          pitchClass
        )
      ) {
        values.add(midi);
      }
    }
  }

  return Array.from(values).sort(
    (a, b) => a - b
  );
}


const AVAILABLE_MIDI =
  getAvailableMidiNotes();


/* =========================================================
   PENTAGRAMMA INTERATTIVO
   ========================================================= */

function InteractiveStaff({
  selectedMidi,
  onSelectMidi,
  noteNames,
}) {

  const pitchClass =
    midiToPitchClass(selectedMidi);

  const name =
    noteNames[pitchClass];

  /*
   * Qui mostriamo ancora l'ottava
   * del SUONO REALE.
   *
   * In questo modo MI2 continua
   * a identificare correttamente
   * la sesta corda a vuoto.
   */
  const octave =
    midiToOctave(selectedMidi);

  const noteY =
    getStaffY(selectedMidi);

  const ledgerLines =
    getLedgerLines(selectedMidi);


  function handleStaffClick(event) {

    const rect =
      event.currentTarget
        .getBoundingClientRect();

    const y =
      event.clientY -
      rect.top;

    /*
     * Evitiamo click fuori dalla
     * zona musicale prevista.
     */
    if (
      y < STAFF_MIN_Y ||
      y > STAFF_MAX_Y
    ) {
      return;
    }

    /*
     * Il click viene convertito
     * direttamente nel MIDI reale
     * della chitarra.
     */
    const midi =
      staffYToMidi(y);

    /*
     * Se la nota non esiste nel
     * range 0-22 del manico,
     * non la selezioniamo.
     */
    if (
      !AVAILABLE_MIDI.includes(midi)
    ) {
      return;
    }

    onSelectMidi(midi);
  }


  return (
    <section className="staffCard">

      <div className="staffCardTop">

        <div>

          <span className="staffEyebrow">
            PENTAGRAMMA
          </span>

          <h2>
            Tocca una linea o uno spazio
          </h2>

        </div>


        <div className="staffCurrentNote">

          <strong>
            {name}
          </strong>

          <span>
            {name}
            {octave}
          </span>

        </div>

      </div>


      <div className="staffExplorer">

        <button
          type="button"
          className="staffVisual staffClickable"
          onClick={handleStaffClick}
          aria-label="Pentagramma interattivo"
        >

          {/* CHIAVE DI SOL */}

          <span
            className="trebleClef"
            aria-hidden="true"
          >
            𝄞
          </span>


          {/* CINQUE LINEE */}

          <span className="staffFixedLines">

            {[0, 1, 2, 3, 4].map(
              (line) => (

                <span
                  key={line}
                  style={{
                    top:
                      `${
                        48 +
                        line * 24
                      }px`,
                  }}
                />

              )
            )}

          </span>


          {/* LINEE ADDIZIONALI */}

          {ledgerLines.map(
            (y, index) => (

              <span
                key={`${y}-${index}`}
                className="staffLedgerLine"
                style={{
                  top: `${y}px`,
                }}
              />

            )
          )}


          {/* NOTA */}

          <span
            className="staffNoteGlyph"
            style={{
              top: `${noteY}px`,
            }}
          >

            <span
              className="staffNoteHead"
            />

            <span
              className="staffNoteStem"
            />

          </span>


          {/* ISTRUZIONE */}

          <span className="staffClickHint">
            CLICCA SUL PENTAGRAMMA
          </span>

        </button>

      </div>

    </section>
  );
}


/* =========================================================
   SELETTORE COMPATTO
   ========================================================= */

function CompactNoteSelector({
  selectedMidi,
  onSelectMidi,
  noteNames,
}) {

  const selectedPitchClass =
    midiToPitchClass(selectedMidi);

  const selectedOctave =
    midiToOctave(selectedMidi);


  /*
   * Ottave realmente disponibili
   * per la nota selezionata.
   */
  const availableOctaves =
    useMemo(() => {

      const octaves =
        AVAILABLE_MIDI
          .filter(
            (midi) =>
              midiToPitchClass(midi) ===
              selectedPitchClass
          )
          .map(
            (midi) =>
              midiToOctave(midi)
          );

      return [
        ...new Set(octaves),
      ];

    }, [selectedPitchClass]);


  function selectPitchClass(
    pitchClass
  ) {

    /*
     * Cerchiamo prima la stessa
     * ottava attualmente selezionata.
     */
    const sameOctave =
      AVAILABLE_MIDI.find(
        (midi) =>
          midiToPitchClass(midi) ===
            pitchClass &&
          midiToOctave(midi) ===
            selectedOctave
      );

    if (sameOctave !== undefined) {
      onSelectMidi(sameOctave);
      return;
    }


    /*
     * Altrimenti scegliamo la
     * posizione disponibile più vicina.
     */
    const candidates =
      AVAILABLE_MIDI.filter(
        (midi) =>
          midiToPitchClass(midi) ===
          pitchClass
      );

    if (!candidates.length) {
      return;
    }

    const nearest =
      candidates.reduce(
        (best, midi) => {

          if (
            Math.abs(
              midi - selectedMidi
            ) <
            Math.abs(
              best - selectedMidi
            )
          ) {
            return midi;
          }

          return best;

        },
        candidates[0]
      );

    onSelectMidi(nearest);
  }


  function selectOctave(octave) {

    const midi =
      AVAILABLE_MIDI.find(
        (value) =>
          midiToPitchClass(value) ===
            selectedPitchClass &&
          midiToOctave(value) ===
            octave
      );

    if (midi !== undefined) {
      onSelectMidi(midi);
    }
  }


  return (
    <section className="compactNoteSelector">

      <div className="compactSelectorHeader">

        <span className="staffEyebrow">
          SELEZIONA NOTA
        </span>

        <strong>
          {
            noteNames[
              selectedPitchClass
            ]
          }
          {selectedOctave}
        </strong>

      </div>


      {/* NOTA */}

      <div className="compactSelectorGroup">

        <span className="compactLabel">
          NOTA
        </span>

        <div className="compactNoteButtons">

          {NATURAL_PITCH_CLASSES.map(
            (pitchClass) => {

              const active =
                pitchClass ===
                selectedPitchClass;

              return (

                <button
                  key={pitchClass}
                  type="button"
                  className={
                    active
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    selectPitchClass(
                      pitchClass
                    )
                  }
                >
                  {noteNames[pitchClass]}
                </button>

              );
            }
          )}

        </div>

      </div>


      {/* OTTAVA */}

      <div className="compactSelectorGroup">

        <span className="compactLabel">
          OTTAVA
        </span>

        <div className="compactOctaveButtons">

          {availableOctaves.map(
            (octave) => (

              <button
                key={octave}
                type="button"
                className={
                  octave ===
                  selectedOctave
                    ? "active"
                    : ""
                }
                onClick={() =>
                  selectOctave(octave)
                }
              >
                {octave}
              </button>

            )
          )}

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   SCHERMATA PRINCIPALE
   ========================================================= */

function Staff({
  notation,
  goHome,
}) {

  const noteNames =
    getNoteNames(notation);

  const [
    selectedMidi,
    setSelectedMidi,
  ] = useState(60);

  const [
    displayMode,
    setDisplayMode,
  ] = useState("exact");

  const [
    selectedPosition,
    setSelectedPosition,
  ] = useState(null);


  const selectedPitchClass =
    midiToPitchClass(selectedMidi);

  const selectedOctave =
    midiToOctave(selectedMidi);

  const selectedName =
    noteNames[selectedPitchClass];


  /* =====================================================
     POSIZIONI DELLA STESSA ALTEZZA
     ===================================================== */

  const exactPositions =
    useMemo(() => {

      const positions = [];

      for (
        let stringIndex = 0;
        stringIndex < 6;
        stringIndex += 1
      ) {

        for (
          let fret =
            STAFF_RANGE.start;
          fret <=
            STAFF_RANGE.end;
          fret += 1
        ) {

          if (
            fretMidi(
              stringIndex,
              fret
            ) === selectedMidi
          ) {

            positions.push({
              stringIndex,
              fret,
            });

          }
        }
      }

      return positions;

    }, [selectedMidi]);


  /* =====================================================
     CLICK SUL MANICO
     ===================================================== */

  function handleFretClick(
    stringIndex,
    fret
  ) {

    const midi =
      fretMidi(
        stringIndex,
        fret
      );

    const pitchClass =
      midiToPitchClass(midi);

    /*
     * Gli alterati verranno aggiunti
     * nella fase successiva.
     */
    if (
      !NATURAL_PITCH_CLASSES.includes(
        pitchClass
      )
    ) {
      return;
    }

    setSelectedMidi(midi);

    setSelectedPosition({
      stringIndex,
      fret,
    });
  }


  function selectMidi(midi) {
    setSelectedMidi(midi);
    setSelectedPosition(null);
  }


  return (
    <div className="staffScreen">

      {/* HEADER */}

      <header className="screenHeader">

        <button
          type="button"
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>

        <div>

          <span className="screenEyebrow">
            IMPARA
          </span>

          <h1>
            PENTAGRAMMA
          </h1>

        </div>

      </header>


      {/* INTRO */}

      <section className="staffIntro">

        <span className="staffIntroLabel">
          DAL PENTAGRAMMA AL MANICO
        </span>

        <h2>
          Leggi la nota.
          <br />

          <span>
            Trovala sulla chitarra.
          </span>
        </h2>

        <p>
          Tocca il pentagramma, scegli
          una nota oppure seleziona una
          posizione direttamente sul
          manico.
        </p>

      </section>


      {/* PENTAGRAMMA */}

      <InteractiveStaff
        selectedMidi={selectedMidi}
        onSelectMidi={selectMidi}
        noteNames={noteNames}
      />


      {/* SELETTORE COMPATTO */}

      <CompactNoteSelector
        selectedMidi={selectedMidi}
        onSelectMidi={selectMidi}
        noteNames={noteNames}
      />


      {/* COLLEGAMENTO */}

      <div className="staffBridge">

        <span>
          PENTAGRAMMA
        </span>

        <strong>
          ⇄
        </strong>

        <span>
          MANICO
        </span>

      </div>


      {/* MODALITÀ */}

      <section className="staffModePanel">

        <div>

          <span className="staffEyebrow">
            VISUALIZZA
          </span>

          <strong>
            {selectedName}
            {selectedOctave}
          </strong>

        </div>


        <div className="staffModeSwitch">

          <button
            type="button"
            className={
              displayMode === "exact"
                ? "active"
                : ""
            }
            onClick={() =>
              setDisplayMode("exact")
            }
          >
            STESSA ALTEZZA
          </button>


          <button
            type="button"
            className={
              displayMode === "class"
                ? "active"
                : ""
            }
            onClick={() =>
              setDisplayMode("class")
            }
          >
            TUTTI I {selectedName}
          </button>

        </div>

      </section>


      {/* MANICO */}

      <section className="staffFretboardSection">

        <div className="staffSectionTitle">

          <div>

            <span className="staffEyebrow">
              MANICO
            </span>

            <h2>
              Dove si trova?
            </h2>

          </div>

          <span className="staffHint">
            Tocca una posizione
          </span>

        </div>


        {displayMode === "exact" ? (

          <Fretboard
            range={STAFF_RANGE}
            noteNames={noteNames}
            mode="pitch"
            targetMidi={selectedMidi}
            showLabels
            onPositionClick={
              handleFretClick
            }
          />

        ) : (

          <Fretboard
            range={STAFF_RANGE}
            noteNames={noteNames}
            mode="single-note"
            targetNote={
              selectedPitchClass
            }
            showLabels
            onPositionClick={
              handleFretClick
            }
          />

        )}


        {/* POSIZIONI */}

        {displayMode === "exact" && (

          <div className="exactPositions">

            <span>
              POSIZIONI DI{" "}
              {selectedName}
              {selectedOctave}
            </span>

            <div>

              {exactPositions.map(
                (position) => (

                  <button
                    key={
                      `${position.stringIndex}-${position.fret}`
                    }
                    type="button"
                    onClick={() =>
                      setSelectedPosition(
                        position
                      )
                    }
                  >
                    CORDA{" "}
                    {6 -
                      position.stringIndex}
                    {" · "}
                    TASTO{" "}
                    {position.fret}
                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* INFO POSIZIONE */}

        {selectedPosition && (

          <div className="selectedFretInfo">

            <span>
              POSIZIONE SELEZIONATA
            </span>

            <strong>
              {selectedName}
              {selectedOctave}
            </strong>

            <small>
              Corda{" "}
              {6 -
                selectedPosition.stringIndex}
              {" · "}
              tasto{" "}
              {selectedPosition.fret}
            </small>

          </div>

        )}

      </section>

    </div>
  );
}


export default Staff;