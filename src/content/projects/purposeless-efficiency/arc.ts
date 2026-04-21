// TODO(michael): provisional working titles for II–V
export type ArcVolume = {
  numeral: "I" | "II" | "III" | "IV" | "V";
  title: string;
  status: "writing" | "planning" | "drafting" | "complete";
};

const arc: ArcVolume[] = [
  { numeral: "I",   title: "Purposeless Efficiency", status: "writing" },
  { numeral: "II",  title: "{TBD · provisional}",    status: "planning" },
  { numeral: "III", title: "{TBD · provisional}",    status: "planning" },
  { numeral: "IV",  title: "{TBD · provisional}",    status: "planning" },
  { numeral: "V",   title: "{TBD · provisional}",    status: "planning" },
];
export default arc;
