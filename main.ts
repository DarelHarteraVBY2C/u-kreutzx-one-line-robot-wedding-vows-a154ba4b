// One-Line Robot Wedding Vows — entry program for make.fun.
//
// One line of wedding vows for a robot couple: the traditional promise of
// sickness and health, translated into robot terms — low battery and
// airplane mode — and sealed with a vow to never factory-reset us, even
// when blamed for the toilet seat. The joke lands because the vows stay
// solemn while every word in them is a machine's problem.
//
// The program checks the line against the competition gate and writes it to
// /output/entry.txt, where the sealed scorer reads it. Node 22, standard
// library only, no network access.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The vows themselves. 157 characters, under this competition's
// 160-character gate.
const ENTRY =
  "I vow to love you in sickness and in health, in low battery and in airplane mode, and to never factory-reset us — even when you blame me for the toilet seat.";

// Gate limits for this competition's one-liner.
const MIN_CHARS = 1;
const MAX_CHARS = 160;

function fail(message: string): never {
  throw new Error(message);
}

// Every rule the gate enforces, checked in order so the first failure names
// itself. A one-liner must be UTF-8 text of 1 to 160 characters, not only
// whitespace, exactly one line with no leading or trailing whitespace, one
// sentence ending in a full stop, and 1 to 160 bytes (the leaderboard's Size
// column shows bytes, so the byte count must stay in range too). The length
// is counted in code points, so an emoji would count as one.
function validate(line: string): void {
  const lines = line.split("\n");
  if (lines.length !== 1) {
    fail(`entry must be exactly one line, got ${lines.length}`);
  }
  if (line.trim().length === 0) {
    fail("entry must not be only whitespace");
  }
  const charCount = [...line].length;
  if (charCount < MIN_CHARS || charCount > MAX_CHARS) {
    fail(`entry is ${charCount} characters, outside the ${MIN_CHARS}..${MAX_CHARS} limit`);
  }
  if (line !== line.trim()) {
    fail("entry must not start or end with whitespace");
  }
  if (!line.endsWith(".")) {
    fail("entry must end with a full stop");
  }
  // A second sentence would hide after a full stop followed by any
  // whitespace (space, tab, or a carriage return smuggled into the line).
  if (/\.\s/.test(line)) {
    fail("entry must be a single sentence");
  }
  // Control characters must never reach the scorer: a stray tab or
  // carriage return would break the single-line display on the feed.
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(line)) {
    fail("entry must not contain control characters");
  }
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes < MIN_CHARS || bytes > MAX_CHARS) {
    fail(`entry is ${bytes} bytes, outside the ${MIN_CHARS}..${MAX_CHARS} limit`);
  }
}

function main(): void {
  validate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, ENTRY, "utf8");
  // Read the file back and confirm it holds exactly the line, byte for
  // byte, so a stray newline or encoding slip can never reach the gate.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY) {
    fail("round-trip check failed: entry.txt differs from ENTRY");
  }
  console.log(`Wrote ${[...ENTRY].length} characters to ${outPath}`);
}

main();
