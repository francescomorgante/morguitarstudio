import { useEffect, useRef, useState } from "react";


/* =========================================
   ACCORDATURA STANDARD
   ========================================= */

const STRINGS = [
  {
    number: 6,
    italian: "MI",
    english: "E",
    octave: 2,
    frequency: 82.41,
  },
  {
    number: 5,
    italian: "LA",
    english: "A",
    octave: 2,
    frequency: 110.0,
  },
  {
    number: 4,
    italian: "RE",
    english: "D",
    octave: 3,
    frequency: 146.83,
  },
  {
    number: 3,
    italian: "SOL",
    english: "G",
    octave: 3,
    frequency: 196.0,
  },
  {
    number: 2,
    italian: "SI",
    english: "B",
    octave: 3,
    frequency: 246.94,
  },
  {
    number: 1,
    italian: "MI",
    english: "E",
    octave: 4,
    frequency: 329.63,
  },
];


/* =========================================
   PARAMETRI STABILIZZAZIONE
   ========================================= */

const ENTER_TUNE_CENTS = 4;
const EXIT_TUNE_CENTS = 7;

const TUNE_HOLD_MS = 450;

const STRING_LOCK_MS = 900;

const HISTORY_SIZE = 12;


/* =========================================
   UTILITÀ
   ========================================= */

function centsBetween(
  frequency,
  target
) {
  return (
    1200 *
    Math.log2(
      frequency / target
    )
  );
}


function findClosestString(
  frequency
) {
  let closest =
    STRINGS[0];

  let smallestDifference =
    Infinity;


  for (
    const string of STRINGS
  ) {
    const difference =
      Math.abs(
        centsBetween(
          frequency,
          string.frequency
        )
      );


    if (
      difference <
      smallestDifference
    ) {
      smallestDifference =
        difference;

      closest =
        string;
    }
  }


  return closest;
}


/* =========================================
   MEDIANA
   ========================================= */

function median(values) {
  if (!values.length) {
    return null;
  }


  const sorted =
    [...values].sort(
      (a, b) =>
        a - b
    );


  const middle =
    Math.floor(
      sorted.length / 2
    );


  if (
    sorted.length % 2 ===
    0
  ) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }


  return sorted[middle];
}


/* =========================================
   FREQUENZA STABILIZZATA
   ========================================= */

function stableFrequency(
  values
) {
  if (!values.length) {
    return null;
  }


  const center =
    median(values);


  /*
    Eliminiamo letture che
    differiscono troppo dalla
    mediana.
  */

  const filtered =
    values.filter(
      (value) => {

        const distance =
          Math.abs(
            centsBetween(
              value,
              center
            )
          );


        return (
          distance < 18
        );
      }
    );


  if (
    !filtered.length
  ) {
    return center;
  }


  return (
    filtered.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    filtered.length
  );
}


/* =========================================
   RILEVATORE PITCH
   ========================================= */

function detectPitch(
  buffer,
  sampleRate
) {
  const size =
    buffer.length;


  /*
    Calcolo livello RMS.
  */

  let sumSquares = 0;


  for (
    let i = 0;
    i < size;
    i++
  ) {
    sumSquares +=
      buffer[i] *
      buffer[i];
  }


  const rms =
    Math.sqrt(
      sumSquares /
      size
    );


  /*
    Rumore troppo debole:
    non analizziamo.
  */

  if (
    rms < 0.006
  ) {
    return {
      frequency: null,
      level: rms,
    };
  }


  /*
    Range utile della
    chitarra standard.
  */

  const minFrequency =
    70;

  const maxFrequency =
    350;


  const minLag =
    Math.floor(
      sampleRate /
      maxFrequency
    );


  const maxLag =
    Math.min(
      Math.floor(
        sampleRate /
        minFrequency
      ),

      Math.floor(
        size / 2
      )
    );


  let bestLag = -1;

  let bestDifference =
    Infinity;


  /*
    Confronto tra segnale
    e copie ritardate.
  */

  for (
    let lag = minLag;
    lag <= maxLag;
    lag++
  ) {

    let difference = 0;


    for (
      let i = 0;
      i < size - lag;
      i++
    ) {

      difference +=
        Math.abs(
          buffer[i] -
          buffer[i + lag]
        );

    }


    difference /=
      size - lag;


    if (
      difference <
      bestDifference
    ) {

      bestDifference =
        difference;

      bestLag =
        lag;

    }

  }


  if (
    bestLag <= 0
  ) {

    return {
      frequency: null,
      level: rms,
    };

  }


  /*
    Funzione locale per
    interpolazione.
  */

  function differenceAt(
    lag
  ) {

    if (
      lag < minLag ||
      lag > maxLag
    ) {
      return null;
    }


    let difference = 0;


    for (
      let i = 0;
      i < size - lag;
      i++
    ) {

      difference +=
        Math.abs(
          buffer[i] -
          buffer[i + lag]
        );

    }


    return (
      difference /
      (size - lag)
    );

  }


  let refinedLag =
    bestLag;


  const left =
    differenceAt(
      bestLag - 1
    );

  const center =
    differenceAt(
      bestLag
    );

  const right =
    differenceAt(
      bestLag + 1
    );


  /*
    Interpolazione
    parabolica.
  */

  if (
    left !== null &&
    right !== null
  ) {

    const denominator =
      left -
      2 * center +
      right;


    if (
      Math.abs(
        denominator
      ) > 0.000001
    ) {

      const correction =
        0.5 *
        (left - right) /
        denominator;


      if (
        Math.abs(
          correction
        ) <= 1
      ) {

        refinedLag +=
          correction;

      }

    }

  }


  const frequency =
    sampleRate /
    refinedLag;


  if (
    !Number.isFinite(
      frequency
    ) ||
    frequency <
      minFrequency ||
    frequency >
      maxFrequency
  ) {

    return {
      frequency: null,
      level: rms,
    };

  }


  return {
    frequency,
    level: rms,
  };
}


/* =========================================
   COMPONENTE TUNER
   ========================================= */

function Tuner({
  notation,
  goHome,
}) {

  const [
    listening,
    setListening,
  ] =
    useState(false);


  const [
    frequency,
    setFrequency,
  ] =
    useState(null);


  const [
    currentString,
    setCurrentString,
  ] =
    useState(null);


  /*
    Valore tecnico filtrato.
  */

  const [
    cents,
    setCents,
  ] =
    useState(0);


  /*
    Valore separato
    per il cursore.
  */

  const [
    displayCents,
    setDisplayCents,
  ] =
    useState(0);


  const [
    micLevel,
    setMicLevel,
  ] =
    useState(0);


  const [
    isTuned,
    setIsTuned,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  /* =========================================
     REFS AUDIO
     ========================================= */

  const audioContextRef =
    useRef(null);

  const analyserRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const animationRef =
    useRef(null);


  /* =========================================
     REFS STABILIZZAZIONE
     ========================================= */

  const historyRef =
    useRef([]);

  const lockedStringRef =
    useRef(null);

  const lastStringSeenRef =
    useRef(0);

  const tuneStartRef =
    useRef(null);

  const tunedRef =
    useRef(false);


  /* =========================================
     AVVIA ACCORDATORE
     ========================================= */

  async function startTuner() {

    try {

      setError("");


      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {

        setError(
          "Il browser non supporta l'accesso al microfono."
        );

        return;

      }


      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({

            audio: {

              echoCancellation:
                false,

              noiseSuppression:
                false,

              autoGainControl:
                false,

            },

          });


      streamRef.current =
        stream;


      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


      if (!AudioContext) {

        setError(
          "Web Audio non è supportato da questo browser."
        );

        return;

      }


      const audioContext =
        new AudioContext();


      audioContextRef.current =
        audioContext;


      if (
        audioContext.state ===
        "suspended"
      ) {

        await audioContext.resume();

      }


      const analyser =
        audioContext
          .createAnalyser();


      /*
        Buffer ampio per
        migliorare soprattutto
        il MI basso.
      */

      analyser.fftSize =
        8192;


      analyser
        .smoothingTimeConstant =
        0;


      analyserRef.current =
        analyser;


      const source =
        audioContext
          .createMediaStreamSource(
            stream
          );


      source.connect(
        analyser
      );


      /*
        Reset stato.
      */

      historyRef.current =
        [];

      lockedStringRef.current =
        null;

      tuneStartRef.current =
        null;

      tunedRef.current =
        false;


      setFrequency(null);

      setCurrentString(null);

      setCents(0);

      setDisplayCents(0);

      setMicLevel(0);

      setIsTuned(false);

      setListening(true);


      startAnalysis();

    }

    catch (err) {

      console.error(err);


      setError(
        "Impossibile accedere al microfono."
      );

    }

  }


  /* =========================================
     ANALISI CONTINUA
     ========================================= */

  function startAnalysis() {

    const analyser =
      analyserRef.current;


    const audioContext =
      audioContextRef.current;


    if (
      !analyser ||
      !audioContext
    ) {

      return;

    }


    const buffer =
      new Float32Array(
        analyser.fftSize
      );


    function update() {

      analyser
        .getFloatTimeDomainData(
          buffer
        );


      const result =
        detectPitch(
          buffer,
          audioContext
            .sampleRate
        );


      /*
        Livello microfono
        normalizzato 0–100.
      */

      const visualLevel =
        Math.min(
          100,
          result.level * 500
        );


      setMicLevel(
        visualLevel
      );


      if (
        result.frequency
      ) {

        const now =
          performance.now();


        const detectedString =
          findClosestString(
            result.frequency
          );


        /* =================================
           LOCK CORDA
           ================================= */

        if (
          !lockedStringRef
            .current
        ) {

          lockedStringRef.current =
            detectedString;


          lastStringSeenRef.current =
            now;


          historyRef.current =
            [];

        }


        const locked =
          lockedStringRef.current;


        const distanceFromLocked =
          Math.abs(
            centsBetween(
              result.frequency,
              locked.frequency
            )
          );


        /*
          La frequenza appartiene
          ancora plausibilmente
          alla corda bloccata.
        */

        if (
          distanceFromLocked <=
          100
        ) {

          lastStringSeenRef.current =
            now;


          historyRef.current.push(
            result.frequency
          );


          if (
            historyRef.current
              .length >
            HISTORY_SIZE
          ) {

            historyRef.current
              .shift();

          }


          const stable =
            stableFrequency(
              historyRef.current
            );


          if (stable) {

            const stableCents =
              centsBetween(
                stable,
                locked.frequency
              );


            /* =============================
               FREQUENZA VISUALIZZATA
               ============================= */

            setFrequency(
              (previous) => {

                if (
                  previous ===
                  null
                ) {

                  return stable;

                }


                return (
                  previous *
                    0.82 +
                  stable *
                    0.18
                );

              }
            );


            setCurrentString(
              locked
            );


            /* =============================
               CENT TECNICI
               ============================= */

            setCents(
              (previous) =>
                previous *
                  0.82 +
                stableCents *
                  0.18
            );


            /* =============================
               CURSORE STABILIZZATO
               ============================= */

            setDisplayCents(
              (previous) => {

                /*
                  Quando la corda è
                  accordata il cursore
                  viene attratto
                  verso il centro.
                */

                if (
                  tunedRef.current
                ) {

                  return (
                    previous *
                    0.72
                  );

                }


                const distance =
                  Math.abs(
                    stableCents
                  );


                let response;


                /*
                  Molto vicino
                  alla frequenza.
                */

                if (
                  distance <= 7
                ) {

                  response =
                    0.08;

                }


                /*
                  Zona intermedia.
                */

                else if (
                  distance <= 15
                ) {

                  response =
                    0.14;

                }


                /*
                  Lontano:
                  risposta più rapida.
                */

                else {

                  response =
                    0.28;

                }


                return (
                  previous *
                    (1 - response) +
                  stableCents *
                    response
                );

              }
            );


            /* =============================
               CONFERMA ACCORDATURA
               ============================= */

            const absCents =
              Math.abs(
                stableCents
              );


            /*
              Non ancora accordata.
            */

            if (
              !tunedRef.current
            ) {

              if (
                absCents <=
                ENTER_TUNE_CENTS
              ) {

                if (
                  tuneStartRef
                    .current ===
                  null
                ) {

                  tuneStartRef.current =
                    now;

                }


                /*
                  Deve restare nella
                  zona corretta per
                  almeno 450 ms.
                */

                if (
                  now -
                    tuneStartRef
                      .current >=
                  TUNE_HOLD_MS
                ) {

                  tunedRef.current =
                    true;


                  setIsTuned(
                    true
                  );

                }

              }

              else {

                tuneStartRef.current =
                  null;

              }

            }


            /*
              Già accordata.
              Isteresi ±7 cent.
            */

            else {

              if (
                absCents >
                EXIT_TUNE_CENTS
              ) {

                tunedRef.current =
                  false;


                tuneStartRef.current =
                  null;


                setIsTuned(
                  false
                );

              }

            }

          }

        }


        /* =================================
           POSSIBILE CAMBIO CORDA
           ================================= */

        else {

          if (
            now -
              lastStringSeenRef
                .current >
            STRING_LOCK_MS
          ) {

            lockedStringRef.current =
              detectedString;


            lastStringSeenRef.current =
              now;


            historyRef.current =
              [];


            tuneStartRef.current =
              null;


            tunedRef.current =
              false;


            setIsTuned(
              false
            );


            setDisplayCents(
              0
            );

          }

        }

      }


      animationRef.current =
        requestAnimationFrame(
          update
        );

    }


    update();

  }


  /* =========================================
     FERMA ACCORDATORE
     ========================================= */

  function stopTuner() {

    if (
      animationRef.current
    ) {

      cancelAnimationFrame(
        animationRef.current
      );

    }


    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

    }


    if (
      audioContextRef.current
    ) {

      audioContextRef.current
        .close();

    }


    audioContextRef.current =
      null;

    analyserRef.current =
      null;

    streamRef.current =
      null;


    historyRef.current =
      [];

    lockedStringRef.current =
      null;

    tuneStartRef.current =
      null;

    tunedRef.current =
      false;


    setListening(false);

    setFrequency(null);

    setCurrentString(null);

    setCents(0);

    setDisplayCents(0);

    setMicLevel(0);

    setIsTuned(false);

  }


  /* =========================================
     CLEANUP
     ========================================= */

  useEffect(() => {

    return () => {

      if (
        animationRef.current
      ) {

        cancelAnimationFrame(
          animationRef.current
        );

      }


      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

      }


      if (
        audioContextRef.current
      ) {

        audioContextRef.current
          .close();

      }

    };

  }, []);


  /* =========================================
     STATO TESTUALE
     ========================================= */

  let status = "";


  if (currentString) {

    if (isTuned) {

      status =
        "✓ ACCORDATA";

    }

    else if (
      cents < 0
    ) {

      status =
        "CALANTE";

    }

    else {

      status =
        "CRESCENTE";

    }

  }


  /* =========================================
     POSIZIONE CURSORE
     ========================================= */

  const visualCents =
    isTuned
      ? 0
      : Math.max(
          -50,
          Math.min(
            50,
            displayCents
          )
        );


  const indicatorPosition =
    (
      (visualCents + 50) /
      100
    ) * 100;


  /* =========================================
     LIVELLO MICROFONO A BARRE
     ========================================= */

  const micBars =
    10;


  const activeMicBars =
    Math.round(
      (
        Math.min(
          100,
          micLevel
        ) /
        100
      ) *
      micBars
    );


  /* =========================================
     RENDER
     ========================================= */

  return (

    <section className="tunerScreen">


      {/* =====================================
          TOP BAR
          ===================================== */}

      <div className="trainingTopbar">

        <button
          className="backButton"
          onClick={goHome}
        >
          ← HOME
        </button>


        <span className="trainingNumber">
          STANDARD · EADGBE
        </span>

      </div>


      {/* =====================================
          HERO
          ===================================== */}

      <div className="trainingHero">

        <div className="trainingEyebrow">
          ACCORDATORE
        </div>


        <h1>
          Trova il centro.
        </h1>


        <p>
          Suona una corda alla volta.
          Mantieni il suono finché
          l'indicatore raggiunge il centro.
        </p>

      </div>


      {/* =====================================
          AREA ACCORDATORE
          ===================================== */}

      <div className="tunerMain">


        {/* NOTA */}

        <div
          className={
            `tunerNote ${
              !currentString
                ? "idle"
                : ""
            } ${
              isTuned
                ? "tuned"
                : ""
            }`
          }
        >

          {currentString
            ? (
              notation ===
              "italian"
                ? currentString
                    .italian
                : currentString
                    .english
            )
            : "—"}

        </div>


        {/* CORDA RICONOSCIUTA */}

        <div className="tunerDetectedString">

          {currentString
            ? (
              <>
                CORDA{" "}
                {currentString.number}
                {" · "}
                {currentString.english}
                {currentString.octave}
              </>
            )
            : (
              listening
                ? "SUONA UNA CORDA"
                : "MICROFONO DISATTIVATO"
            )}

        </div>


        {/* =================================
            MISURATORE
            ================================= */}

        <div className="tunerMeter">


          {/* LABEL */}

          <div className="tunerMeterLabels">

            <span>
              −50
            </span>

            <span>
              −25
            </span>

            <span>
              0
            </span>

            <span>
              +25
            </span>

            <span>
              +50
            </span>

          </div>


          {/* TRACK */}

          <div className="tunerTrack">


            <div className="tunerTrackLine" />


            {/* TACCHE */}

            <span
              className="
                tunerTick
                tickMinus50
              "
            />

            <span
              className="
                tunerTick
                tickMinus25
              "
            />

            <span
              className="
                tunerTick
                tickZero
              "
            />

            <span
              className="
                tunerTick
                tickPlus25
              "
            />

            <span
              className="
                tunerTick
                tickPlus50
              "
            />


            {/* ZONA CENTRALE */}

            <div
              className={
                `tunerSweetSpot ${
                  isTuned
                    ? "tuned"
                    : ""
                }`
              }
            />


            {/* CURSORE */}

            {currentString && (

              <div
                className={
                  `tunerCursor ${
                    isTuned
                      ? "tuned"
                      : ""
                  }`
                }

                style={{
                  left:
                    `${indicatorPosition}%`,
                }}
              />

            )}

          </div>


          {/* STATO */}

          <div
            className={
              `tunerStatus ${
                isTuned
                  ? "tuned"
                  : ""
              }`
            }
          >

            {currentString
              ? status
              : "\u00A0"}

          </div>


          {/* DATI */}

          <div className="tunerReading">

            {currentString &&
             frequency
              ? (
                <>
                  {cents > 0
                    ? "+"
                    : ""}

                  {cents.toFixed(1)}

                  {" cent · "}

                  {frequency.toFixed(2)}

                  {" Hz"}
                </>
              )
              : "\u00A0"}

          </div>

        </div>


        {/* =================================
            SEI CORDE
            ================================= */}

        <div className="tunerStrings">

          {STRINGS.map(
            (string) => {

              const active =
                currentString &&
                currentString.number ===
                  string.number;


              const tuned =
                active &&
                isTuned;


              return (

                <div
                  key={
                    string.number
                  }

                  className={
                    `tunerString ${
                      active
                        ? "active"
                        : ""
                    } ${
                      tuned
                        ? "tuned"
                        : ""
                    }`
                  }
                >

                  <div className="tunerStringCircle">

                    {notation ===
                    "italian"
                      ? string.italian
                      : string.english}

                  </div>


                  <span className="tunerStringNumber">

                    {string.number}

                  </span>

                </div>

              );

            }
          )}

        </div>


        {/* =================================
            MICROFONO
            ================================= */}

        {listening && (

          <div
            className={
              `tunerMic ${
                isTuned
                  ? "tuned"
                  : ""
              }`
            }
          >

            <span className="tunerMicLabel">
              MIC
            </span>


            <div className="tunerMicBars">

              {Array
                .from({
                  length:
                    micBars,
                })
                .map(
                  (_, index) => (

                    <span
                      key={index}

                      className={
                        `tunerMicBar ${
                          index <
                          activeMicBars
                            ? "active"
                            : ""
                        }`
                      }
                    />

                  )
                )}

            </div>

          </div>

        )}


        {/* =================================
            CONTROLLI
            ================================= */}

        <div className="tunerControls">

          {!listening
            ? (

              <button
                className="tunerStartButton"
                onClick={startTuner}
              >
                AVVIA MICROFONO
              </button>

            )
            : (

              <button
                className="tunerStopButton"
                onClick={stopTuner}
              >
                FERMA ACCORDATORE
              </button>

            )}

        </div>


        {/* =================================
            ERRORE
            ================================= */}

        {error && (

          <div className="tunerError">
            {error}
          </div>

        )}

      </div>

    </section>

  );

}


export default Tuner;