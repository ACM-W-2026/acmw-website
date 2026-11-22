import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Gated Asset Exclusion & Build-Artifact Protection Test (Next.js Edition)
 * 
 * Verifies that all gated and quarantined assets are strictly excluded from:
 * 1. public/ tree (fail-closed scan)
 * 2. .next/ build output (manifests, HTML, static JS/CSS bundles, RSC payloads)
 */

describe("Gated Asset Exclusion & Next.js Build-Artifact Protection", () => {
  // Gated files from content ledger
  const GATED_FILENAMES = [
    // 7 Executive Student Officer Portraits (OFF-02 through OFF-08)
    "Ankitha -2024.jpeg",
    "Akshayalakshmi S -2024.jpg",
    "Oviasree Sampath -2024.jpg",
    "Ananya -2024.jpeg",
    "AnnMariaThomas -2024.jpeg",
    "GKavinRajan-2024.jpeg",
    "RethanyaP-2024.jpeg",

    // 12 Minor Student School Outreach Photographs (OUTR-04-C2, OUTR-05-C2)
    "csp1.jpeg",
    "csp2.jpeg",
    "csp3.jpeg",
    "csp4.jpeg",
    "csp5.jpeg",
    "csp6.jpeg",
    "cspfeb1.jpg",
    "cspfeb2.jpg",
    "cspfeb3.jpg",
    "cspfeb4.jpg",
    "cspfeb5.jpg",
    "cspfeb6.jpg",

    // 2 YŪGO'26 Winner Showcase Photographs (EVNT-01-C3)
    "yugo_winner1.jpeg",
    "yugo_winner2.jpeg",

    // 1 Signed Chapter Executive Roster PDF (DOCS-03)
    "SSN ACM-W Team.pdf",

    // 1 Physical Byte-Duplicate of csp2.jpeg
    "placeholder.jpeg",

    // Additional quarantined unverified/unlicensed media
    "fei-fei-li.jpg",
    "fei-fei-li-cutout.webp",
    "fei-fei-li-silhouette.webp",
    "margaret-hamilton.jpg",
    "margaret-hamilton-cutout.webp",
    "margaret-hamilton-silhouette.webp",
    "radia-perlman.jpg",
    "radia-perlman-cutout.webp",
    "radia-perlman-silhouette.webp",
    "PMirunalini.jpeg",
    "ACMctFinal.mov",
    "ACMctFinal.mp4",
  ];

  const projectRoot = process.cwd();
  const publicDir = path.resolve(projectRoot, "public");
  const publicAssetsDir = path.resolve(projectRoot, "public/assets");
  const nextDir = path.resolve(projectRoot, ".next");

  /**
   * Recursively collect all file paths under a directory.
   */
  function getAllFiles(dirPath: string): string[] {
    let files: string[] = [];
    if (!fs.existsSync(dirPath)) return files;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("scans the entire public/ tree fail-closed and ensures zero gated files exist", () => {
    // Fail closed if expected directories are missing
    expect(
      fs.existsSync(publicDir),
      "SECURITY CHECK FAILED: public/ directory does not exist!"
    ).toBe(true);

    expect(
      fs.existsSync(publicAssetsDir),
      "SECURITY CHECK FAILED: public/assets directory does not exist!"
    ).toBe(true);

    const allPublicFiles = getAllFiles(publicDir);
    expect(allPublicFiles.length).toBeGreaterThan(0);

    for (const filePath of allPublicFiles) {
      const baseName = path.basename(filePath);
      for (const gated of GATED_FILENAMES) {
        expect(
          baseName.toLowerCase() === gated.toLowerCase(),
          `SECURITY VIOLATION: Gated asset "${gated}" was found in public directory at "${filePath}"!`
        ).toBe(false);
      }
    }

    // Exactly 16 cleared assets must be present in public/
    expect(allPublicFiles.length).toBe(16);
  });

  it("verifies Next.js production build output exists and contains zero gated assets", () => {
    expect(
      fs.existsSync(nextDir),
      "SECURITY CHECK FAILED: .next/ directory does not exist! Run 'npm run build' before running gated asset verification."
    ).toBe(true);

    const allNextFiles = getAllFiles(nextDir);
    expect(allNextFiles.length).toBeGreaterThan(0);

    for (const filePath of allNextFiles) {
      const baseName = path.basename(filePath);
      for (const gated of GATED_FILENAMES) {
        expect(
          baseName.toLowerCase() === gated.toLowerCase(),
          `SECURITY VIOLATION: Gated asset "${gated}" leaked into .next output at "${filePath}"!`
        ).toBe(false);
      }
    }
  });

  it("scans Next.js manifests, bundles, and route output for embedded gated references", () => {
    expect(
      fs.existsSync(nextDir),
      "SECURITY CHECK FAILED: .next/ directory does not exist! Run 'npm run build' before running gated asset verification."
    ).toBe(true);

    const allNextFiles = getAllFiles(nextDir);
    // Explicitly scan text, JSON, manifest, and bundle formats emitted by Next.js
    const scannedExtensions = [
      ".html",
      ".js",
      ".mjs",
      ".cjs",
      ".css",
      ".json",
      ".txt",
      ".rsc",
    ];

    const textFiles = allNextFiles.filter((fp) =>
      scannedExtensions.some((ext) => fp.toLowerCase().endsWith(ext))
    );

    expect(textFiles.length).toBeGreaterThan(0);

    for (const filePath of textFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const filename of GATED_FILENAMES) {
        const encoded = encodeURIComponent(filename);
        expect(
          content.includes(filename),
          `SECURITY VIOLATION: Reference to gated asset "${filename}" leaked into build artifact at "${filePath}"!`
        ).toBe(false);

        if (encoded !== filename) {
          expect(
            content.includes(encoded),
            `SECURITY VIOLATION: URL-encoded reference to gated asset "${encoded}" leaked into build artifact at "${filePath}"!`
          ).toBe(false);
        }
      }
    }
  });
});
