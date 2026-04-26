import { existsSync } from "node:fs";
import { join } from "node:path";

const PORTRAIT_PATH = join(process.cwd(), "public", "portrait.jpg");

export const portraitPresent: boolean = existsSync(PORTRAIT_PATH);
export const portraitSrc = "/portrait.jpg";
