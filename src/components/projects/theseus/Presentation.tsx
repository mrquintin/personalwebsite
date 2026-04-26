import SimplePresentation from "../../presentation/SimplePresentation";
import { thsPhases } from "../../../content/presentations/ths";

export default function TheseusPresentation() {
  return (
    <SimplePresentation
      id="ths"
      title="Theseus, briefly"
      phases={thsPhases}
    />
  );
}
