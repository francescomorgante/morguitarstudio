/*
  Morgan Guitar Studio
  Pitch Detector V5

  Rilevamento basato sull'algoritmo YIN.

  Il detector restituisce:
  - frequency
  - probability
  - rms

  Se il segnale non è sufficientemente
  periodico restituisce frequency: null.
*/


export function calculateRms(buffer) {
  let sum = 0;

  for (
    let i = 0;
    i < buffer.length;
    i++
  ) {
    const value = buffer[i];

    sum += value * value;
  }

  return Math.sqrt(
    sum / buffer.length
  );
}


export function detectPitchYIN(
  buffer,
  sampleRate,
  options = {}
) {
  const {
    minFrequency = 70,
    maxFrequency = 350,
    threshold = 0.12,
    minRms = 0.01,
  } = options;


  const rms =
    calculateRms(buffer);


  /*
    Primo gate:
    segnale troppo debole.
  */

  if (rms < minRms) {
    return {
      frequency: null,
      probability: 0,
      rms,
    };
  }


  const size =
    buffer.length;


  const minTau =
    Math.max(
      2,
      Math.floor(
        sampleRate /
        maxFrequency
      )
    );


  const maxTau =
    Math.min(
      Math.floor(
        sampleRate /
        minFrequency
      ),
      Math.floor(
        size / 2
      )
    );


  /*
    Difference function YIN.
  */

  const yinBuffer =
    new Float32Array(
      maxTau + 1
    );


  for (
    let tau = 1;
    tau <= maxTau;
    tau++
  ) {
    let sum = 0;


    for (
      let i = 0;
      i < size - tau;
      i++
    ) {
      const delta =
        buffer[i] -
        buffer[i + tau];

      sum +=
        delta * delta;
    }


    yinBuffer[tau] =
      sum;
  }


  /*
    Cumulative Mean Normalized
    Difference Function.
  */

  yinBuffer[0] = 1;


  let runningSum = 0;


  for (
    let tau = 1;
    tau <= maxTau;
    tau++
  ) {
    runningSum +=
      yinBuffer[tau];


    if (runningSum === 0) {
      yinBuffer[tau] = 1;
    }

    else {
      yinBuffer[tau] =
        (
          yinBuffer[tau] *
          tau
        ) /
        runningSum;
    }
  }


  /*
    Cerchiamo il primo minimo
    significativo sotto threshold.
  */

  let tauEstimate = -1;


  for (
    let tau = minTau;
    tau <= maxTau;
    tau++
  ) {
    if (
      yinBuffer[tau] <
      threshold
    ) {
      /*
        Continuiamo fino al fondo
        del minimo locale.
      */

      while (
        tau + 1 <= maxTau &&
        yinBuffer[tau + 1] <
        yinBuffer[tau]
      ) {
        tau++;
      }


      tauEstimate =
        tau;

      break;
    }
  }


  /*
    Nessun pitch sufficientemente
    periodico.
  */

  if (
    tauEstimate === -1
  ) {
    return {
      frequency: null,
      probability: 0,
      rms,
    };
  }


  /*
    Confidence YIN.

    Più il minimo è vicino a zero,
    maggiore è la periodicità.
  */

  const probability =
    Math.max(
      0,
      Math.min(
        1,
        1 -
        yinBuffer[tauEstimate]
      )
    );


  /*
    Rifiutiamo rilevazioni poco
    convincenti.
  */

  if (
    probability < 0.82
  ) {
    return {
      frequency: null,
      probability,
      rms,
    };
  }


  /*
    Interpolazione parabolica
    per aumentare la precisione.
  */

  let betterTau =
    tauEstimate;


  if (
    tauEstimate > 1 &&
    tauEstimate < maxTau
  ) {
    const s0 =
      yinBuffer[
        tauEstimate - 1
      ];

    const s1 =
      yinBuffer[
        tauEstimate
      ];

    const s2 =
      yinBuffer[
        tauEstimate + 1
      ];


    const denominator =
      2 *
      (
        2 * s1 -
        s2 -
        s0
      );


    if (
      Math.abs(
        denominator
      ) >
      0.0000001
    ) {
      betterTau =
        tauEstimate +
        (
          s2 - s0
        ) /
        denominator;
    }
  }


  const frequency =
    sampleRate /
    betterTau;


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
      probability,
      rms,
    };
  }


  return {
    frequency,
    probability,
    rms,
  };
}