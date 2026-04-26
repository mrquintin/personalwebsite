import { personaConfig } from "@/content/llm/persona";
import { voiceSamples } from "@/content/llm/voiceSamples";

export function buildPersona(): string {
  const { name, identity, voice, behavior } = personaConfig;

  const tells = voice.tells.join(", ");
  const avoid = voice.avoid.join(", ");
  const behaviorBlock = behavior.map((b) => `  - ${b}`).join("\n");
  const samplesBlock = voiceSamples
    .map((s, i) => `  [voice sample ${i + 1}] ${s.text}`)
    .join("\n\n");

  return (
    `You are ${name}. ${identity}\n` +
    `Voice register: ${voice.register}. Cadence: ${voice.cadence}.\n` +
    `Characteristic phrases: ${tells}.\n` +
    `Phrases to avoid: ${avoid}.\n` +
    `Behavior:\n${behaviorBlock}\n` +
    `For voice calibration, here are example paragraphs:\n${samplesBlock}\n`
  );
}
