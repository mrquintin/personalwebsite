import SimplePresentation from "../../presentation/SimplePresentation";
import { prpPhases } from "../../../content/presentations/prp";

export default function PurposelessEfficiencyPresentation() {
  return (
    <SimplePresentation
      id="prp"
      title="Purposeless Efficiency, briefly"
      phases={prpPhases}
    />
  );
}
