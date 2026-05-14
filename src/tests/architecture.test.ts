import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const srcRoot = new URL("../", import.meta.url).pathname;

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

describe("architecture boundaries", () => {
  it("keeps domain/application free from React imports", () => {
    const files = [...filesUnder(join(srcRoot, "domain")), ...filesUnder(join(srcRoot, "application"))].filter((file) => file.endsWith(".ts"));
    const offenders = files.filter((file) => /from ["']react["']|react\/jsx-runtime/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
