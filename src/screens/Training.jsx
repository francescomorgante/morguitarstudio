import { useState } from "react";

import Fretboard from "../components/Fretboard";

import {
  NATURAL_NOTES,
  RANGES,
  getNoteNames,
  getCorrectPositions,
  positionKey,
} from "../music/theory";

function Training({
  notation,
  goHome,
}) {
  const noteNames =
    getNoteNames(notation);

  const [targetNote, setTargetNote] =
    useState(9);

  const [rangeIndex, setRangeIndex] =
    useState(0);

  const [selected, setSelected] =
    useState([]);

  const [verified, setVerified] =
    useState(false);

  const [showSolution, setShowSolution] =
    useState(false);

  const range = RANGES[rangeIndex];

  const correct =
    getCorrectPositions(
      targetNote,
      range
    );

  const correctSelected =
    selected.filter((key) =>
      correct.includes(key)
    );

  const wrongSelected =
    selected.filter(
      (key) =>
        !correct.includes(key)
    );

  const missing =
    correct.filter(
      (key) =>
        !selected.includes(key)
    );

  function resetExercise() {
    setSelected([]);
    setVerified(false);
    setShowSolution(false);
  }

  function changeTarget(note) {
    setTargetNote(note);
    resetExercise();
  }

  function changeRange(index) {
    setRangeIndex(index);
    resetExercise();
  }

  function togglePosition(
    stringIndex,
    fret
  ) {
    if (
      verified ||
      showSolution
    ) {
      return;
    }

    const key = positionKey(
      stringIndex,
      fret
    );

    setSelected((current) =>
      current.includes(key)
        ? current.filter(
            (item) => item !== key
          )
        : [...current, key]
    );
  }

  return (
    <section className="trainingScreen">
      <header className="trainingTopbar">
        <button
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>

        <span className="trainingNumber">
          TRAINING 01
        </span>
      </header>

      <div className="trainingHero">
        <div className="eyebrow trainingEyebrow">
          IMPARA IL MANICO
        </div>

        <h1>Trova le note</h1>

        <p>
          Scegli una nota e individua
          tutte le sue posizioni sul
          manico.
        </p>
      </div>

      <div className="trainingLabel">
        NOTA DA TROVARE
      </div>

      <div className="noteSelector">
        {NATURAL_NOTES.map(
          (note) => (
            <button
              key={note}
              className={
                targetNote === note
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeTarget(note)
              }
            >
              {noteNames[note]}
            </button>
          )
        )}
      </div>

      <div className="trainingLabel">
        ZONA DEL MANICO
      </div>

      <div className="rangeSelector">
        {RANGES.map(
          (item, index) => (
            <button
              key={item.label}
              className={
                rangeIndex === index
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeRange(index)
              }
            >
              {item.label}
            </button>
          )
        )}
      </div>

      <div className="mission">
        <span>MISSIONE</span>

        <strong>
          Trova tutti i{" "}
          {noteNames[targetNote]}
        </strong>

        <small>
          Tocca le posizioni corrette
          sul manico.
        </small>
      </div>

      <Fretboard
        range={range}
        noteNames={noteNames}
        mode="training"
        targetNote={targetNote}
        selected={selected}
        verified={verified}
        showSolution={showSolution}
        onPositionClick={
          togglePosition
        }
      />

      <div className="trainingActions">
        <button
          className="secondaryAction"
          onClick={resetExercise}
        >
          RIPROVA
        </button>

        <button
          className="secondaryAction"
          onClick={() =>
            setShowSolution(true)
          }
        >
          SOLUZIONE
        </button>

        <button
          className="verifyButton"
          onClick={() =>
            setVerified(true)
          }
        >
          ✓ VERIFICA
        </button>
      </div>

      <div className="feedbackPanel">
        {!verified &&
          !showSolution &&
          <>
            Le tue selezioni diventano{" "}
            <b>gialle</b>. Quando hai
            finito premi Verifica.
          </>
        }

        {verified &&
          missing.length === 0 &&
          wrongSelected.length === 0 &&
          <strong className="successText">
            Perfetto. Hai trovato tutte
            le posizioni.
          </strong>
        }

        {verified &&
          (missing.length > 0 ||
            wrongSelected.length > 0) &&
          <>
            Corrette:{" "}
            <strong>
              {correctSelected.length}
            </strong>
            {" · "}
            Mancanti:{" "}
            <strong>
              {missing.length}
            </strong>
            {" · "}
            Errori:{" "}
            <strong>
              {wrongSelected.length}
            </strong>
          </>
        }

        {showSolution &&
          <>
            Le posizioni corrette sono
            evidenziate sul manico.
          </>
        }
      </div>
    </section>
  );
}

export default Training;