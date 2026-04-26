import SimplePresentation from "../../presentation/SimplePresentation";
import { hvmPhases } from "../../../content/presentations/hvm";

export default function HivemindPresentation() {
  return (
    <SimplePresentation id="hvm" title="Hivemind, briefly" phases={hvmPhases} />
  );
}
