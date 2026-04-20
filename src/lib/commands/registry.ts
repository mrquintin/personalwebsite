import type { Command } from "./types";
import { navCommands } from "./providers/nav";
import { projectCommands } from "./providers/projects";
import { actionCommands } from "./providers/actions";
import { queryCommands } from "./providers/queries";

export function buildRegistry(buildVersion: string): Command[] {
  return [
    ...navCommands(),
    ...projectCommands(),
    ...actionCommands(),
    ...queryCommands(buildVersion),
  ];
}
