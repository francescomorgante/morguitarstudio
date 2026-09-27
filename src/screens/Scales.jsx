import { useState } from "react";

import Fretboard from "../components/Fretboard";

import {
  CHROMATIC_NOTES,
  RANGES,
  SCALES,
  getNoteNames,
  getBestCagedPosition,
} from "../music/theory";

function Scales({
  notation,
  goHome,
}) {
  const noteNames =
    getNoteNames(notation);

  const [root, setRoot] =
    useState(9);

  const [scaleId, setScaleId] =
    useState("minorPentatonic");

  const [rangeIndex, setRangeIndex] =
    useState(4);

  const [view, setView] =
    useState("fretboard");

  const [display, setDisplay] =
    useState("notes");

  const [cagedShape, setCagedShape] =
    useState("E");

  const [
    showContinuity,
    setShowContinuity,
  ] = useState(true);

  const [
    showChordShape,
    setShowChordShape,
  ] = useState(true);

  const scale =
    SCALES[scaleId];

  const range =
    RANGES[rangeIndex];

  const cagedPosition =
    getBestCagedPosition(
      root,
      cagedShape,
      range,
      scale.quality
    );

  return (
    <section className="scalesScreen">

      <header className="trainingTopbar">
        <button
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>

        <span className="moduleNumber">
          SCALE
        </span>
      </header>

      <div className="trainingHero">
        <div className="eyebrow">
          COMPRENDI LE SCALE
        </div>

        <h1>Scale</h1>

        <p>
          Visualizza note,
          intervalli e forme CAGED
          lungo tutto il manico.
        </p>
      </div>

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

      <div className="trainingLabel">
        SCALA
      </div>

      <select
        className="scaleSelect"
        value={scaleId}
        onChange={(event) =>
          setScaleId(
            event.target.value
          )
        }
      >
        {Object.values(
          SCALES
        ).map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}
      </select>

      <div className="scaleIdentity">
        <span>
          STAI STUDIANDO
        </span>

        <strong>
          {noteNames[root]}{" "}
          {scale.name}
        </strong>

        <div className="scaleFormula">
          {scale.labels.map(
            (interval, index) => (
              <span
                key={
                  interval + index
                }
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

      <div className="trainingLabel">
        VISUALIZZAZIONE
      </div>

      <div className="modeSelector scaleViewSelector">
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
          MANICO
        </button>

        <button
          className={
            view === "caged"
              ? "active"
              : ""
          }
          onClick={() =>
            setView("caged")
          }
        >
          CAGED
        </button>
      </div>

      {view === "caged" && (
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
                  setCagedShape(
                    shape
                  )
                }
              >
                {shape}
              </button>
            ))}
          </div>

          <div className="cagedInfo">
            <div>
              <span>FORMA</span>

              <strong>
                {cagedShape}
                {scale.quality ===
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

          <label className="continuitySwitch">
            <input
              type="checkbox"
              checked={showChordShape}
              onChange={(event) =>
                setShowChordShape(
                  event.target.checked
                )
              }
            />

            <span />

            <div>
              <strong>
                FORMA ACCORDO
              </strong>

              <small>
                Evidenzia l'accordo
                dentro la scala
              </small>
            </div>
          </label>

          <label className="continuitySwitch">
            <input
              type="checkbox"
              checked={showContinuity}
              onChange={(event) =>
                setShowContinuity(
                  event.target.checked
                )
              }
            />

            <span />

            <div>
              <strong>
                CONTINUITÀ
              </strong>

              <small>
                Mostra la scala
                oltre la forma
              </small>
            </div>
          </label>
        </>
      )}

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
          <i className="legendRoot" />
          Tonica
        </span>

        <span>
          <i className="legendScale" />
          Scala
        </span>

        {view === "caged" &&
          showChordShape && (
            <span>
              <i className="legendChord" />
              Accordo
            </span>
          )}

        {view === "caged" &&
          showContinuity && (
            <span>
              <i className="legendGhost" />
              Continuità
            </span>
          )}
      </div>

      <Fretboard
        range={range}
        noteNames={noteNames}

        mode="scale"

        scale={scale}
        scaleRoot={root}
        scaleDisplay={display}

        cagedEnabled={
          view === "caged"
        }

        cagedPosition={
          cagedPosition
        }

        cagedShape={
          cagedShape
        }

        cagedQuality={
          scale.quality
        }

        showChordShape={
          showChordShape
        }

        showContinuity={
          showContinuity
        }
      />

    </section>
  );
}

export default Scales;