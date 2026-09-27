import { useState } from "react";

import Fretboard from "../components/Fretboard";

import {
  CHROMATIC_NOTES,
  CHORDS,
  RANGES,
  getNoteNames,
  getChordNotes,
  getBestCagedPosition,
  getCagedChordPositions,
} from "../music/theory";

function Chords({
  notation,
  goHome,
}) {
  const noteNames =
    getNoteNames(notation);

  /* =========================
     STATO
     ========================= */

  const [root, setRoot] =
    useState(9);

  const [chordId, setChordId] =
    useState("major");

  const [view, setView] =
    useState("shapes");

  const [cagedShape, setCagedShape] =
    useState("E");

  const [display, setDisplay] =
    useState("notes");

  const [rangeIndex, setRangeIndex] =
    useState(4);

  /* =========================
     DATI ACCORDO
     ========================= */

  const chord =
    CHORDS[chordId];

  const chordNotes =
    getChordNotes(
      root,
      chord
    );

  const range =
    RANGES[rangeIndex];

  /* =========================
     POSIZIONE CAGED
     ========================= */

  const shapeSearchRange = {
    start: 0,
    end: 17,
  };

  const cagedPosition =
    getBestCagedPosition(
      root,
      cagedShape,
      shapeSearchRange,
      chord.quality
    );

  const chordShapePositions =
    cagedPosition
      ? getCagedChordPositions(
          root,
          cagedShape,
          chord.quality,
          cagedPosition
        )
      : [];

  /* =========================
     RANGE AUTOMATICO FORMA
     ========================= */

  const shapeRange =
  cagedPosition
    ? {
        start: cagedPosition.start,
        end: cagedPosition.end,
      }
    : {
        start: 1,
        end: 5,
      };

  return (
    <section className="chordsScreen">

      {/* TOP BAR */}

      <header className="trainingTopbar">
        <button
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>

        <span className="moduleNumber">
          ACCORDI
        </span>
      </header>


      {/* HERO */}

      <div className="trainingHero">

        <div className="eyebrow">
          COMPRENDI GLI ACCORDI
        </div>

        <h1>
          Accordi
        </h1>

        <p>
          Scopri come sono costruiti
          gli accordi e visualizzali
          lungo tutto il manico.
        </p>

      </div>


      {/* TONICA */}

      <div className="trainingLabel">
        TONICA
      </div>

      <div className="noteSelector scaleRootSelector">

        {CHROMATIC_NOTES.map(
          (note) => (
            <button
              key={note}
              className={
                root === note
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoot(note)
              }
            >
              {noteNames[note]}
            </button>
          )
        )}

      </div>


      {/* TIPO ACCORDO */}

      <div className="trainingLabel">
        TIPO DI ACCORDO
      </div>

      <select
        className="scaleSelect"
        value={chordId}
        onChange={(event) =>
          setChordId(
            event.target.value
          )
        }
      >

        {Object.values(
          CHORDS
        ).map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}

      </select>


      {/* IDENTITÀ */}

      <div className="scaleIdentity">

        <span>
          STAI STUDIANDO
        </span>

        <strong>
          {noteNames[root]}
          {chord.symbol}
        </strong>

        <div className="scaleFormula">

          {chord.labels.map(
            (interval, index) => (
              <span
                key={`${interval}-${index}`}
                className={
                  index === 0
                    ? "rootInterval"
                    : ""
                }
              >
                {interval}
              </span>
            )
          )}

        </div>

      </div>


      {/* COSTRUZIONE */}

      <div className="trainingLabel">
        COM'È COSTRUITO
      </div>

      <div className="chordConstruction">

        {chordNotes.map(
          (note, index) => (
            <div
              className="chordConstructionTone"
              key={`${note}-${index}`}
            >

              <span className="chordDegree">
                {chord.labels[index]}
              </span>

              <strong>
                {noteNames[note]}
              </strong>

            </div>
          )
        )}

      </div>


      {/* VISUALIZZAZIONE */}

      <div className="trainingLabel">
        VISUALIZZAZIONE
      </div>

      <div className="modeSelector scaleViewSelector">

        <button
          className={
            view === "shapes"
              ? "active"
              : ""
          }
          onClick={() =>
            setView("shapes")
          }
        >
          FORME
        </button>

        <button
          className={
            view === "fretboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setView("fretboard")
          }
        >
          NOTE SUL MANICO
        </button>

      </div>


      {/* =================================
          FORME CAGED
          ================================= */}

      {view === "shapes" && (
        <>

          <div className="trainingLabel">
            FORMA CAGED
          </div>

          <div className="cagedSelector">

            {[
              "C",
              "A",
              "G",
              "E",
              "D",
            ].map((shape) => (
              <button
                key={shape}
                className={
                  cagedShape === shape
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCagedShape(shape)
                }
              >
                {shape}
              </button>
            ))}

          </div>


          <div className="cagedInfo">

            <div>
              <span>
                FORMA
              </span>

              <strong>
                {cagedShape}
                {chord.quality ===
                "minor"
                  ? "m"
                  : ""}
              </strong>
            </div>

            {cagedPosition && (
              <small>
                tasti{" "}
                {cagedPosition.start}
                {" – "}
                {cagedPosition.end}
              </small>
            )}

          </div>


          {/* MOSTRA */}

          <div className="trainingLabel">
            MOSTRA
          </div>

          <div className="modeSelector">

            <button
              className={
                display === "notes"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay("notes")
              }
            >
              NOTE
            </button>

            <button
              className={
                display === "intervals"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay(
                  "intervals"
                )
              }
            >
              INTERVALLI
            </button>

            <button
              className={
                display === "both"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay("both")
              }
            >
              ENTRAMBI
            </button>

          </div>


          {/* LEGENDA */}

          <div className="scaleLegend chordShapeLegend">
            <span>
          <i className="legendChordRoot" />
          Note da suonare
            </span>
         </div>


{/* MANICO DELLA FORMA */}

<div className="chordShapeFretboard">
  <Fretboard
    range={shapeRange}
    noteNames={noteNames}

    mode="chord-shape"

    chord={chord}
    chordRoot={root}
    chordDisplay={display}

    chordShapePositions={
      chordShapePositions
    }
  />
</div>

</>
)}
      {/* =================================
          NOTE SUL MANICO
          ================================= */}

      {view === "fretboard" && (
        <>

          <div className="trainingLabel">
            MOSTRA
          </div>

          <div className="modeSelector">

            <button
              className={
                display === "notes"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay("notes")
              }
            >
              NOTE
            </button>

            <button
              className={
                display === "intervals"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay(
                  "intervals"
                )
              }
            >
              INTERVALLI
            </button>

            <button
              className={
                display === "both"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setDisplay("both")
              }
            >
              ENTRAMBI
            </button>

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
                    setRangeIndex(index)
                  }
                >
                  {item.label}
                </button>
              )
            )}

          </div>


          <div className="scaleLegend">

            <span>
              <i className="legendChordRoot" />
              Tonica
            </span>

            <span>
              <i className="legendChordNote" />
              Nota accordo
            </span>

          </div>


          <Fretboard
            range={range}
            noteNames={noteNames}

            mode="chord"

            chord={chord}
            chordRoot={root}
            chordDisplay={display}
          />

        </>
      )}

    </section>
  );
}

export default Chords;