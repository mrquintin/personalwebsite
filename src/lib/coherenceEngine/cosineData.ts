// Cosine Paradox precomputed fixtures.
// Per CE3 §2-§4. All values precomputed from the published magnitudes.

export type NliLabel = "contradiction" | "entailment" | "neutral";

export interface NliPair {
  id: string;
  a: string;
  b: string;
  label: NliLabel;
  cosAB: number;
  differenceHoyer: number;
  projectionOnCHat: number;
  perpMagnitude: number;
  nearestReflection: null | {
    alpha2: { text: string; cosToTruth: number; isTrueContradiction: boolean };
    alpha4: { text: string; cosToTruth: number; isTrueContradiction: boolean };
    alpha8: { text: string; cosToTruth: number; isTrueContradiction: boolean };
  };
}

export const NLI_PAIRS: NliPair[] = [
  // contradictions
  {
    id: "ce-pair-01", a: "The kettle is boiling.", b: "The kettle is not boiling.", label: "contradiction",
    cosAB: 0.621, differenceHoyer: 0.447, projectionOnCHat: 0.83, perpMagnitude: 0.42,
    nearestReflection: {
      alpha2: { text: "The kettle has not started boiling yet.", cosToTruth: 0.79, isTrueContradiction: true },
      alpha4: { text: "The kettle is cold.", cosToTruth: 0.71, isTrueContradiction: true },
      alpha8: { text: "The pot is empty and unheated.", cosToTruth: 0.66, isTrueContradiction: true },
    },
  },
  {
    id: "ce-pair-02", a: "It rained throughout the morning.", b: "The morning stayed dry.", label: "contradiction",
    cosAB: 0.594, differenceHoyer: 0.452, projectionOnCHat: 0.91, perpMagnitude: 0.39,
    nearestReflection: {
      alpha2: { text: "No precipitation fell before noon.", cosToTruth: 0.81, isTrueContradiction: true },
      alpha4: { text: "Sun lit the streets all morning.", cosToTruth: 0.74, isTrueContradiction: true },
      alpha8: { text: "Drought conditions held into early afternoon.", cosToTruth: 0.61, isTrueContradiction: false },
    },
  },
  {
    id: "ce-pair-03", a: "The bus arrived ahead of schedule.", b: "The bus arrived late.", label: "contradiction",
    cosAB: 0.642, differenceHoyer: 0.430, projectionOnCHat: 0.76, perpMagnitude: 0.45,
    nearestReflection: {
      alpha2: { text: "The bus was several minutes behind the timetable.", cosToTruth: 0.84, isTrueContradiction: true },
      alpha4: { text: "Service was delayed at the depot.", cosToTruth: 0.72, isTrueContradiction: true },
      alpha8: { text: "The transit network had a system-wide delay.", cosToTruth: 0.65, isTrueContradiction: true },
    },
  },
  {
    id: "ce-pair-04", a: "The recipe calls for sugar.", b: "The recipe excludes sugar.", label: "contradiction",
    cosAB: 0.625, differenceHoyer: 0.451, projectionOnCHat: 0.88, perpMagnitude: 0.41,
    nearestReflection: {
      alpha2: { text: "The recipe is sugar-free.", cosToTruth: 0.86, isTrueContradiction: true },
      alpha4: { text: "Sweeteners are absent from the ingredient list.", cosToTruth: 0.74, isTrueContradiction: true },
      alpha8: { text: "All sweetening agents are omitted by design.", cosToTruth: 0.63, isTrueContradiction: true },
    },
  },
  // entailments
  {
    id: "ce-pair-05", a: "A robin landed on the windowsill.", b: "A bird landed on the windowsill.", label: "entailment",
    cosAB: 0.681, differenceHoyer: 0.214, projectionOnCHat: -0.04, perpMagnitude: 0.31, nearestReflection: null,
  },
  {
    id: "ce-pair-06", a: "She watered the basil and the mint.", b: "She watered some of her plants.", label: "entailment",
    cosAB: 0.612, differenceHoyer: 0.198, projectionOnCHat: 0.02, perpMagnitude: 0.27, nearestReflection: null,
  },
  {
    id: "ce-pair-07", a: "The 7:14 train carries commuters into the city.", b: "A morning train carries passengers.", label: "entailment",
    cosAB: 0.659, differenceHoyer: 0.225, projectionOnCHat: -0.11, perpMagnitude: 0.28, nearestReflection: null,
  },
  {
    id: "ce-pair-08", a: "He simmered the broth for two hours.", b: "He cooked the broth slowly.", label: "entailment",
    cosAB: 0.638, differenceHoyer: 0.207, projectionOnCHat: 0.07, perpMagnitude: 0.29, nearestReflection: null,
  },
  // neutrals
  {
    id: "ce-pair-09", a: "The ferry runs every two hours on Sundays.", b: "Tomatoes grow well in raised beds.", label: "neutral",
    cosAB: 0.041, differenceHoyer: 0.092, projectionOnCHat: 0.01, perpMagnitude: 0.18, nearestReflection: null,
  },
  {
    id: "ce-pair-10", a: "Wool sweaters keep their shape if hung to dry.", b: "The library opens at nine on weekdays.", label: "neutral",
    cosAB: 0.058, differenceHoyer: 0.085, projectionOnCHat: -0.03, perpMagnitude: 0.16, nearestReflection: null,
  },
  {
    id: "ce-pair-11", a: "Cyclists prefer routes with fewer intersections.", b: "Soup tastes better with fresh herbs.", label: "neutral",
    cosAB: 0.038, differenceHoyer: 0.087, projectionOnCHat: 0.04, perpMagnitude: 0.19, nearestReflection: null,
  },
  {
    id: "ce-pair-12", a: "The walking path circles the small lake twice.", b: "Bicycle tires lose pressure in cold weather.", label: "neutral",
    cosAB: 0.063, differenceHoyer: 0.084, projectionOnCHat: -0.02, perpMagnitude: 0.17, nearestReflection: null,
  },
];

export interface ParadoxAggregates {
  means: {
    cosine: { contradiction: number; entailment: number; neutral: number };
    hoyer: { contradiction: number; entailment: number; neutral: number };
  };
  pValue: number;
  dimensionalConcentration: { contradictionDims: number; totalDims: number; f1At20PCs: number; f1At50PCs: number };
  reflection: { alpha2RecoveryRate: number; alpha8RecoveryCeiling: number };
  linearSvm: { featureDim: number; inDomainF1: number; generalDomainF1: number; crossDomainWithoutAdaptationF1Range: [number, number] };
}

export const PARADOX_AGGREGATES: ParadoxAggregates = {
  means: {
    cosine: { contradiction: 0.62, entailment: 0.64, neutral: 0.05 },
    hoyer: { contradiction: 0.445, entailment: 0.212, neutral: 0.087 },
  },
  pValue: 0.73,
  dimensionalConcentration: { contradictionDims: 42, totalDims: 768, f1At20PCs: 0.50, f1At50PCs: 0.54 },
  reflection: { alpha2RecoveryRate: 0.843, alpha8RecoveryCeiling: 0.86 },
  linearSvm: { featureDim: 2308, inDomainF1: 0.882, generalDomainF1: 0.777, crossDomainWithoutAdaptationF1Range: [0.50, 0.65] },
};

// Synthetic dimensional concentration shapes faithful to CE3 §3.
// Sorted desc; the contradiction array has a sharp knee at 42; entailment is more uniform.
function makeContradictionDims(): number[] {
  const out: number[] = [];
  for (let i = 0; i < 768; i++) {
    if (i < 42) out.push(1.0 - (i / 42) * 0.55); // 1.0 down to 0.45, top 42
    else out.push(0.18 * Math.exp(-(i - 42) / 180));
  }
  return out;
}

function makeEntailmentDims(): number[] {
  const out: number[] = [];
  for (let i = 0; i < 768; i++) {
    out.push(0.55 * Math.exp(-i / 350) + 0.05);
  }
  return out;
}

export const DIM_WEIGHTS_CONTRADICTION = makeContradictionDims();
export const DIM_WEIGHTS_ENTAILMENT = makeEntailmentDims();

export function findPair(id: string): NliPair {
  return NLI_PAIRS.find((p) => p.id === id) ?? NLI_PAIRS[0];
}
