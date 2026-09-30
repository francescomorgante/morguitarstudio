import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  calculateRms,
  detectPitchYIN,
} from "../audio/pitchDetector";


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
   PARAMETRI V5
   ========================================= */

const HISTORY_SIZE = 9;

const MIN_HISTORY = 4;

const STRING_CONFIRM_FRAMES = 3;

const ENTER_TUNE_CENTS = 4;

const EXIT_TUNE_CENTS = 7;

const TUNE_HOLD_MS = 400;

const LOST_SIGNAL_MS = 300;


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

  let difference =
    Infinity;


  for (
    const string of STRINGS
  ) {
    const cents =
      Math.abs(
        centsBetween(
          frequency,
          string.frequency
        )
      );


    if (
      cents < difference
    ) {
      difference =
        cents;

      closest =
        string;
    }
  }


  return closest;
}


function median(values) {
  if (!values.length) {
    return null;
  }


  const sorted =
    [...values].sort(
      (a, b) => a - b
    );


  const middle =
    Math.floor(
      sorted.length / 2
    );


  if (
    sorted.length % 2
  ) {
    return sorted[middle];
  }


  return (
    sorted[middle - 1] +
    sorted[middle]
  ) / 2;
}


/* =========================================
   COMPONENTE
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


  const [
    cents,
    setCents,
  ] =
    useState(0);


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


  /*
    Diagnostica temporanea.
  */

  const [
    confidence,
    setConfidence,
  ] =
    useState(0);


  /* =========================================
     AUDIO REFS
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
     FILTER REFS
     ========================================= */

  const historyRef =
    useRef([]);


  const lockedStringRef =
    useRef(null);


  const candidateStringRef =
    useRef(null);


  const candidateFramesRef =
    useRef(0);


  const tuneStartRef =
    useRef(null);


  const tunedRef =
    useRef(false);


  const lastGoodPitchRef =
    useRef(0);


  /*
    Noise floor.

    Serve soltanto per il meter MIC.
    Non decide da solo quale nota
    visualizzare.
  */

  const noiseFloorRef =
    useRef(0.005);


  /* =========================================
     RESET
     ========================================= */

  function resetDetection() {

    historyRef.current =
      [];

    lockedStringRef.current =
      null;

    candidateStringRef.current =
      null;

    candidateFramesRef.current =
      0;

    tuneStartRef.current =
      null;

    tunedRef.current =
      false;

    lastGoodPitchRef.current =
      0;


    setFrequency(null);

    setCurrentString(null);

    setCents(0);

    setDisplayCents(0);

    setIsTuned(false);

    setConfidence(0);

  }


  /* =========================================
     START
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
          "Il browser non supporta il microfono."
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


      resetDetection();


      noiseFloorRef.current =
        0.005;


      setMicLevel(0);

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
     ANALYSIS
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


      const now =
        performance.now();


      /*
        RMS puro.
      */

      const rms =
        calculateRms(
          buffer
        );


      /*
        Aggiorniamo lentamente
        il noise floor quando il
        segnale è relativamente basso.
      */

      if (
        rms <
        noiseFloorRef.current *
          1.5
      ) {

        noiseFloorRef.current =
          noiseFloorRef.current *
            0.98 +
          rms *
            0.02;

      }


      /*
        Meter MIC.

        Sottraiamo il fondo.
      */

      const usefulLevel =
        Math.max(
          0,
          rms -
          noiseFloorRef.current
        );


      setMicLevel(
        Math.min(
          100,
          usefulLevel * 600
        )
      );


      /*
        Gate RMS.

        Non è una soglia microscopica:
        deve esserci un segnale
        significativamente superiore
        al rumore.
      */

      const rmsGate =
        Math.max(
          0.012,
          noiseFloorRef.current *
            1.8
        );


      const result =
        detectPitchYIN(
          buffer,
          audioContext.sampleRate,
          {
            minFrequency: 70,
            maxFrequency: 350,

            /*
              YIN threshold.
            */

            threshold: 0.12,

            /*
              Primo gate.
            */

            minRms: rmsGate,
          }
        );


      setConfidence(
        result.probability
      );


      /* =================================
         NESSUN PITCH AFFIDABILE
         ================================= */

      if (
        !result.frequency
      ) {

        /*
          Se abbiamo perso il segnale
          per un po', smettiamo di
          muovere l'interfaccia.
        */

        if (
          lastGoodPitchRef.current &&
          now -
            lastGoodPitchRef.current >
            LOST_SIGNAL_MS
        ) {

          historyRef.current =
            [];

          candidateStringRef.current =
            null;

          candidateFramesRef.current =
            0;

          tuneStartRef.current =
            null;

        }


        animationRef.current =
          requestAnimationFrame(
            update
          );

        return;

      }


      lastGoodPitchRef.current =
        now;


      const detectedString =
        findClosestString(
          result.frequency
        );


      /* =================================
         CONFERMA CORDA
         ================================= */

      if (
        !lockedStringRef.current ||
        detectedString.number !==
          lockedStringRef.current.number
      ) {

        if (
          candidateStringRef
            .current?.number ===
          detectedString.number
        ) {

          candidateFramesRef.current +=
            1;

        }

        else {

          candidateStringRef.current =
            detectedString;

          candidateFramesRef.current =
            1;

        }


        /*
          Non cambiamo corda con
          una singola rilevazione.
        */

        if (
          candidateFramesRef.current >=
          STRING_CONFIRM_FRAMES
        ) {

          lockedStringRef.current =
            detectedString;


          candidateStringRef.current =
            null;


          candidateFramesRef.current =
            0;


          historyRef.current =
            [];


          tuneStartRef.current =
            null;


          tunedRef.current =
            false;


          setIsTuned(false);


          setCurrentString(
            detectedString
          );


          setFrequency(null);

          setCents(0);

          setDisplayCents(0);

        }


        animationRef.current =
          requestAnimationFrame(
            update
          );

        return;

      }


      /*
        Stessa corda:
        reset candidato.
      */

      candidateStringRef.current =
        null;


      candidateFramesRef.current =
        0;


      const locked =
        lockedStringRef.current;


      const rawCents =
        centsBetween(
          result.frequency,
          locked.frequency
        );


      /*
        Se siamo troppo lontani dalla
        corda attesa, ignoriamo il frame.
      */

      if (
        Math.abs(rawCents) > 80
      ) {

        animationRef.current =
          requestAnimationFrame(
            update
          );

        return;

      }


      /* =================================
         HISTORY
         ================================= */

      historyRef.current.push(
        result.frequency
      );


      if (
        historyRef.current.length >
        HISTORY_SIZE
      ) {

        historyRef.current.shift();

      }


      if (
        historyRef.current.length <
        MIN_HISTORY
      ) {

        animationRef.current =
          requestAnimationFrame(
            update
          );

        return;

      }


      const stableFrequency =
        median(
          historyRef.current
        );


      const stableCents =
        centsBetween(
          stableFrequency,
          locked.frequency
        );


      /* =================================
         FREQUENZA
         ================================= */

      setFrequency(
        (previous) => {

          if (
            previous === null
          ) {
            return stableFrequency;
          }


          return (
            previous * 0.85 +
            stableFrequency * 0.15
          );

        }
      );


      /* =================================
         CENT
         ================================= */

      setCents(
        (previous) =>
          previous * 0.82 +
          stableCents * 0.18
      );


      /* =================================
         CURSORE
         ================================= */

      let cursorTarget =
        stableCents;


      /*
        Dead zone.
      */

      if (
        Math.abs(
          cursorTarget
        ) < 1.5
      ) {

        cursorTarget = 0;

      }


      setDisplayCents(
        (previous) => {

          if (
            tunedRef.current
          ) {
            return 0;
          }


          const difference =
            Math.abs(
              cursorTarget -
              previous
            );


          /*
            Movimento piccolo:
            filtraggio molto forte.

            Movimento grande:
            risposta più veloce.
          */

          const factor =
            difference > 10
              ? 0.24
              : difference > 4
                ? 0.14
                : 0.07;


          return (
            previous *
              (1 - factor) +
            cursorTarget *
              factor
          );

        }
      );


      /* =================================
         ACCORDATA
         ================================= */

      const absCents =
        Math.abs(
          stableCents
        );


      if (
        !tunedRef.current
      ) {

        if (
          absCents <=
          ENTER_TUNE_CENTS
        ) {

          if (
            tuneStartRef.current ===
            null
          ) {

            tuneStartRef.current =
              now;

          }


          if (
            now -
              tuneStartRef.current >=
            TUNE_HOLD_MS
          ) {

            tunedRef.current =
              true;


            setIsTuned(
              true
            );


            setDisplayCents(
              0
            );

          }

        }

        else {

          tuneStartRef.current =
            null;

        }

      }

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


      animationRef.current =
        requestAnimationFrame(
          update
        );

    }


    update();

  }


  /* =========================================
     STOP
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


    resetDetection();


    setListening(false);

    setMicLevel(0);

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
     STATUS
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
     CURSOR
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
     MIC
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
              notation === "italian"
                ? currentString.italian
                : currentString.english
            )
            : "—"}

        </div>


        {/* CORDA */}

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


        {/* METER */}

        <div className="tunerMeter">


          <div className="tunerMeterLabels">

            <span>−50</span>
            <span>−25</span>
            <span>0</span>
            <span>+25</span>
            <span>+50</span>

          </div>


          <div className="tunerTrack">

            <div className="tunerTrackLine" />

            <span className="tunerTick tickMinus50" />
            <span className="tunerTick tickMinus25" />
            <span className="tunerTick tickZero" />
            <span className="tunerTick tickPlus25" />
            <span className="tunerTick tickPlus50" />


            <div
              className={
                `tunerSweetSpot ${
                  isTuned
                    ? "tuned"
                    : ""
                }`
              }
            />


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


        {/* CORDE */}

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


        {/* MIC */}

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


        {/* DIAGNOSTICA V5 */}

        {listening && (

          <div
            style={{
              marginTop: "10px",
              textAlign: "center",
              color: "#9299a3",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: ".05em",
            }}
          >

            YIN CONFIDENCE{" "}

            {Math.round(
              confidence * 100
            )}

            %

          </div>

        )}


        {/* CONTROLLI */}

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