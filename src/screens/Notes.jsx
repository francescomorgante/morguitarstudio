import { useState } from "react";

import Fretboard from "../components/Fretboard";

import {
  NATURAL_NOTES,
  RANGES,
  getNoteNames,
  noteAt,
  positionKey,
} from "../music/theory";

function Notes({
  notation,
  goHome,
}) {
  const noteNames =
    getNoteNames(notation);

  const [mode, setMode] =
    useState("single-note");

  const [targetNote, setTargetNote] =
    useState(9);

  const [rangeIndex, setRangeIndex] =
    useState(4);

  const [selected, setSelected] =
    useState([]);

  const range = RANGES[rangeIndex];

  function changeMode(newMode) {
    setMode(newMode);
    setSelected([]);
  }

  function changeRange(index) {
    setRangeIndex(index);
    setSelected([]);
  }

  function handleFreeClick(
    stringIndex,
    fret
  ) {
    if (mode !== "free") return;

    const key = positionKey(
      stringIndex,
      fret
    );

    setSelected((current) =>
      current.includes(key)
        ? current.filter(
            (item) => item !== key
          )
        : [key]
    );
  }

  let selectedNote = null;

  if (
    mode === "free" &&
    selected.length
  ) {
    const [
      stringIndex,
      fret,
    ] = selected[0]
      .split("-")
      .map(Number);

    selectedNote =
      noteNames[
        noteAt(
          stringIndex,
          fret
        )
      ];
  }

  return (
    <section className="notesScreen">
      <header className="trainingTopbar">
        <button
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>

        <span className="moduleNumber">
          NOTE
        </span>
      </header>

      <div className="trainingHero">
        <div className="eyebrow">
          ESPLORA IL MANICO
        </div>

        <h1>Note</h1>

        <p>
          Visualizza le note sul manico
          oppure tocca una posizione per
          scoprire cosa stai suonando.
        </p>
      </div>

      <div className="modeSelector">
        <button
          className={
            mode === "single-note"
              ? "active"
              : ""
          }
          onClick={() =>
            changeMode("single-note")
          }
        >
          NOTA
        </button>

        <button
          className={
            mode === "all-notes"
              ? "active"
              : ""
          }
          onClick={() =>
            changeMode("all-notes")
          }
        >
          TUTTE
        </button>

        <button
          className={
            mode === "free"
              ? "active"
              : ""
          }
          onClick={() =>
            changeMode("free")
          }
        >
          LIBERO
        </button>
      </div>

      {mode === "single-note" && (
        <>
          <div className="trainingLabel">
            NOTA
          </div>

          <div className="noteSelector studyNoteSelector">
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
                    setTargetNote(note)
                  }
                >
                  {noteNames[note]}
                </button>
              )
            )}
          </div>
        </>
      )}

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

      <div className="notesInfo">
        {mode === "single-note" && (
          <>
            <span>VISUALIZZAZIONE</span>

            <strong>
              Tutti i{" "}
              {noteNames[targetNote]}
            </strong>
          </>
        )}

        {mode === "all-notes" && (
          <>
            <span>VISUALIZZAZIONE</span>

            <strong>
              Note naturali
            </strong>
          </>
        )}

        {mode === "free" && (
          <>
            <span>ESPLORAZIONE LIBERA</span>

            <strong>
              {selectedNote
                ? `Hai toccato ${selectedNote}`
                : "Tocca una posizione"}
            </strong>
          </>
        )}
      </div>

      <Fretboard
        range={range}
        noteNames={noteNames}
        mode={mode}
        targetNote={targetNote}
        selected={selected}
        onPositionClick={
          handleFreeClick
        }
      />

      {mode === "free" && (
        <div className="freeHint">
          Tocca qualsiasi posizione del
          manico. La nota verrà mostrata
          direttamente sul punto scelto.
        </div>
      )}
    </section>
  );
}

export default Notes;