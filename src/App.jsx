import { useState } from "react";
import "./App.css";

import Notes from "./screens/Notes";
import Training from "./screens/Training";
import Scales from "./screens/Scales";
import Chords from "./screens/Chords";
import Tuner from "./screens/Tuner";
import Staff from "./screens/Staff";

const previewNotes = [
  { id: 1, fret: 1, string: 2, type: "note" },
  { id: 2, fret: 3, string: 5, type: "note" },
  { id: 3, fret: 5, string: 3, type: "root" },
  { id: 4, fret: 7, string: 1, type: "note" },
];

function MiniFretboard({ playing, onPlay }) {
  return (
    <button
      className={`fretboardPreview ${
        playing ? "playing" : ""
      }`}
      onClick={onPlay}
    >
      <div className="previewTop">
        <span>ANTEPRIMA MANICO</span>

        <span className="touchLabel">
          {playing
            ? "IN RIPRODUZIONE"
            : "TOCCA"}
        </span>
      </div>

      <div className="miniFretboard">

        <div className="strings">
          {[0, 1, 2, 3, 4, 5].map(
            (s) => (
              <span key={s} />
            )
          )}
        </div>

        <div className="frets">
          {[
            0, 1, 2, 3,
            4, 5, 6, 7,
          ].map((f) => (
            <span key={f} />
          ))}
        </div>

        {previewNotes.map(
          (note, index) => (
            <span
              key={note.id}
              className={`previewNote ${note.type}`}
              style={{
                "--fret": note.fret,
                "--string": note.string,
                "--delay": `${index * 180}ms`,
              }}
            />
          )
        )}

      </div>

      <div className="previewClaim">
        Conosci il manico. Capisci la musica. Suona.
      </div>
    </button>
  );
}


function StudyCard({
  symbol,
  title,
  text,
  training = false,
  onClick,
}) {
  return (
    <button
      className={`studyCard ${
        training
          ? "trainingCard"
          : ""
      }`}
      onClick={onClick}
    >
      <span className="cardSymbol">
        {symbol}
      </span>

      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      <span className="cardArrow">
        →
      </span>
    </button>
  );
}


function NotationSelector({
  notation,
  setNotation,
}) {
  return (
    <section className="notationPanel">

      <div>
        <strong>
          NOTAZIONE
        </strong>

        <small>
          Vale per tutta l'app
        </small>
      </div>

      <div className="notationSwitch">

        <button
          className={
            notation === "italian"
              ? "active"
              : ""
          }
          onClick={() =>
            setNotation("italian")
          }
        >
          DO RE MI
        </button>

        <button
          className={
            notation === "english"
              ? "active"
              : ""
          }
          onClick={() =>
            setNotation("english")
          }
        >
          C D E
        </button>

      </div>

    </section>
  );
}


function Home({
  notation,
  setNotation,
  setScreen,
}) {
  const [playing, setPlaying] =
    useState(false);

  function playPreview() {
    setPlaying(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPlaying(true);
      });
    });

    setTimeout(() => {
      setPlaying(false);
    }, 1900);
  }

  return (
    <>

      {/* =========================
          TOP BAR
          ========================= */}

      <header className="topbar">

        <div className="logo">
          <span>M</span>ORGAN

          <small>
            GUITAR STUDIO
          </small>
        </div>

        <div className="version">
          v0.3
        </div>

      </header>


      {/* =========================
          HERO
          ========================= */}

      <section className="hero">

        <div className="eyebrow">
          LEARN · PLAY · IMPROVISE
        </div>

        <h1>
          Studia il manico.
          <br />

          <span>
            Suona davvero.
          </span>
        </h1>

        <p className="intro">
          Note, scale, accordi e training
          in un unico ambiente visivo,
          progettato per studiare con la
          chitarra in mano.
        </p>

        <MiniFretboard
          playing={playing}
          onPlay={playPreview}
        />

      </section>


      {/* =========================
          MODULI
          ========================= */}

      <section className="study">

        <div className="sectionHeading">

          <span>
            STUDIA COME VUOI
          </span>

          <small>
            Scegli un modulo
          </small>

        </div>


        <div className="studyGrid">

          {/* NOTE */}

          <StudyCard
            symbol="●"
            title="NOTE"
            text="Impara il manico"
            onClick={() =>
              setScreen("notes")
            }
          />

          {/* PENTAGRAMMA */}

          <StudyCard
            symbol="𝄞"
            title="PENTAGRAMMA"
            text="Dal pentagramma al manico"
            onClick={() =>
              setScreen("staff")
           }
          />

          {/* SCALE */}

          <StudyCard
            symbol="◉"
            title="SCALE"
            text="Visualizza e comprendi"
            onClick={() =>
              setScreen("scales")
            }
          />


          {/* ACCORDI */}

          <StudyCard
            symbol="⌁"
            title="ACCORDI"
            text="Costruisci e suona"
            onClick={() =>
              setScreen("chords")
            }
          />


          {/* TRAINING */}

          <StudyCard
            symbol="⚡"
            title="TRAINING"
            text="Mettiti alla prova"
            training
            onClick={() =>
              setScreen("training")
            }
          />

        </div>

      </section>


      {/* =========================
          STRUMENTI
          ========================= */}

      <section className="tools">

        <div className="sectionHeading">

          <span>
            STRUMENTI
          </span>

          <small>
            Utilità per suonare
          </small>

        </div>


        {/* ACCORDATORE */}

        <button
          className="toolCard tunerCard"
          onClick={() =>
            setScreen("tuner")
          }
        >

          <span className="toolSymbol tunerWave">
  <svg
    viewBox="0 0 48 24"
    aria-hidden="true"
  >
    <path
      d="
        M2 12
        C6 12, 6 4, 10 4
        C14 4, 14 20, 18 20
        C22 20, 22 4, 26 4
        C30 4, 30 20, 34 20
        C38 20, 38 12, 46 12
      "
    />
  </svg>
</span>

          <div className="toolInfo">

            <h2>
              ACCORDATORE
            </h2>

            <p>
              Accordatura standard · E A D G B E
            </p>

          </div>

          <span className="cardArrow">
            →
          </span>

        </button>

      </section>


      {/* =========================
          NOTAZIONE
          ========================= */}

      <NotationSelector
        notation={notation}
        setNotation={setNotation}
      />

    </>
  );
}


function App() {
  const [screen, setScreen] =
    useState("home");

  const [notation, setNotation] =
    useState("italian");

  return (
    <main className="app">

      {/* HOME */}

      {screen === "home" && (
        <Home
          notation={notation}
          setNotation={setNotation}
          setScreen={setScreen}
        />
      )}


      {/* NOTE */}

      {screen === "notes" && (
        <Notes
          notation={notation}
          goHome={() =>
            setScreen("home")
          }
        />
      )}

       {/* PENTAGRAMMA */}

      {screen === "staff" && (
       <Staff
        notation={notation}
        goHome={() =>
         setScreen("home")
       }
      />
      )}

      {/* SCALE */}

      {screen === "scales" && (
        <Scales
          notation={notation}
          goHome={() =>
            setScreen("home")
          }
        />
      )}


      {/* ACCORDI */}

      {screen === "chords" && (
        <Chords
          notation={notation}
          goHome={() =>
            setScreen("home")
          }
        />
      )}


      {/* ACCORDATORE */}

      {screen === "tuner" && (
        <Tuner
          notation={notation}
          goHome={() =>
            setScreen("home")
          }
        />
      )}


      {/* TRAINING */}

      {screen === "training" && (
        <Training
          notation={notation}
          goHome={() =>
            setScreen("home")
          }
        />
      )}

    </main>
  );
}

export default App;