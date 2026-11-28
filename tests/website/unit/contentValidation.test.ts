import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import fs from "fs";
import path from "path";
import {
  PIONEERS,
  CHAPTER_INFO,
  EVENTS,
  PROJECTS,
  OUTREACH,
  OFFICIAL_DOCUMENTS,
  NEWSLETTERS,
  INTEGRATIONS,
} from "@/data/acmwData";
import { FacetPage } from "@/components/pages/FacetPage";
import { FACET_LIST } from "@/data/facets";
import { CANONICAL_LEDGER_47 } from "@/data/canonicalLedgerMapping";

describe("Canonical Content Ledger & Experience Verification Suite", () => {
  it("verifies SSN ACM-W Chapter Charter, 2018 establishment year, and Faculty Coordinator", () => {
    expect(CHAPTER_INFO.charter).toBe("Charter #108544");
    expect(CHAPTER_INFO.established).toBe("2018");
    expect(CHAPTER_INFO.institution).toContain("SSN College of Engineering");

    expect(CHAPTER_INFO.facultyCoordinator.name).toBe("Dr. P. Mirunalini");
    expect(CHAPTER_INFO.facultyCoordinator.title).toBe("Faculty Coordinator");
    expect(CHAPTER_INFO.facultyCoordinator.designation).toContain("Associate Professor");
    expect(CHAPTER_INFO.facultyCoordinator.department).toContain("Computer Science and Engineering");
  });

  it("verifies approved computing pioneers lineage (PION-01 to PION-06) and exclusion of PION-07", () => {
    expect(PIONEERS.length).toBe(6);

    expect(PIONEERS[0].id).toBe("PION-01");
    expect(PIONEERS[0].name).toBe("Ada Lovelace");
    expect(PIONEERS[0].year).toBe(1843);
    expect(PIONEERS[0].contribution).toContain("Note G");

    expect(PIONEERS[1].id).toBe("PION-02");
    expect(PIONEERS[1].name).toBe("Grace Hopper");
    expect(PIONEERS[1].year).toBe(1952);

    expect(PIONEERS[2].id).toBe("PION-03");
    expect(PIONEERS[2].name).toBe("Katherine Johnson");
    expect(PIONEERS[2].year).toBe(1962);

    expect(PIONEERS[3].id).toBe("PION-04");
    expect(PIONEERS[3].name).toBe("Margaret Hamilton");
    expect(PIONEERS[3].year).toBe(1969);

    expect(PIONEERS[4].id).toBe("PION-05");
    expect(PIONEERS[4].name).toBe("Radia Perlman");
    expect(PIONEERS[4].year).toBe(1985);

    expect(PIONEERS[5].id).toBe("PION-06");
    expect(PIONEERS[5].name).toBe("Fei-Fei Li");
    expect(PIONEERS[5].year).toBe(2009);
    expect(PIONEERS[5].contribution).toContain("ImageNet");

    // PION-07 is draft/quarantined and must NOT be in public PIONEERS
    expect(PIONEERS.some((p) => p.id === "PION-07")).toBe(false);
  });

  it("verifies canonical systems projects portfolio (PROJ-01 to PROJ-03)", () => {
    expect(PROJECTS.length).toBe(3);

    const p1 = PROJECTS.find((p) => p.id === "PROJ-01")!;
    expect(p1).toBeDefined();
    expect(p1.tags).toContain("C++17");
    expect(p1.tags).toContain("Mutex");

    const p2 = PROJECTS.find((p) => p.id === "PROJ-02")!;
    expect(p2).toBeDefined();
    expect(p2.tags).toContain("P4");

    const p3 = PROJECTS.find((p) => p.id === "PROJ-03")!;
    expect(p3).toBeDefined();
    expect(p3.tags).toContain("libpcap");
  });

  it("verifies flagship event records and publication safeguards", () => {
    const canonicalEventIds = ["EVNT-01", "EVNT-02", "EVNT-03", "EVNT-04"];
    for (const id of canonicalEventIds) {
      expect(EVENTS.some((e) => e.id === id), `Missing canonical event ${id}`).toBe(true);
    }

    const yugo = EVENTS.find((e) => e.id === "EVNT-01")!;
    expect(yugo.scale).toBe("National 24-Hour Hackathon");
    expect(yugo.date).toBe("February 2026");
    expect(yugo.highlights.join(" ")).not.toMatch(/60\+|13 On-Campus Finalists|₹30K\+|winner rankings/i);

    const cit = EVENTS.find((e) => e.id === "EVNT-02")!;
    expect(cit.title).toBe("Code in Tandem");

    const wise = EVENTS.find((e) => e.id === "EVNT-03")!;
    expect(wise.title).toContain("Women’s Day Celebration");

    const ctp = EVENTS.find((e) => e.id === "EVNT-04")!;
    expect(ctp.title).toBe("Computational Thinking Workshop");
    expect(ctp.media.gallery).toHaveLength(0); // Privacy-safe fallback
  });

  it("verifies CSpathshala outreach scale matches canonical ledger", () => {
    expect(OUTREACH.id).toBe("OUTR-01");
    expect(OUTREACH.initiative).toContain("CSpathshala");
    expect(OUTREACH.curriculumPillars).toHaveLength(3);
    expect(OUTREACH.privacyNotice).toBeDefined();
  });

  it("verifies canonical monthly newsletters (NEWS-01 to NEWS-05) and integrations (INTG-01 to INTG-03)", () => {
    const canonicalNewsIds = ["NEWS-01", "NEWS-02", "NEWS-03", "NEWS-04", "NEWS-05"];
    canonicalNewsIds.forEach((id) => {
      expect(NEWSLETTERS.some((n) => n.id === id), `Missing canonical newsletter ${id}`).toBe(true);
    });
    const marchFeatured = NEWSLETTERS.find((n) => n.id === "NEWS-01")!;
    expect(marchFeatured.featured).toBe(true);
    expect(marchFeatured.volume).toBe("Vol 5.0");
    expect(marchFeatured.pdfUrl).toContain("March 2026");

    const canonicalIntgIds = ["INTG-01", "INTG-02", "INTG-03"];
    canonicalIntgIds.forEach((id) => {
      expect(INTEGRATIONS.some((i) => i.id === id), `Missing canonical integration ${id}`).toBe(true);
    });
    const intg01 = INTEGRATIONS.find((i) => i.id === "INTG-01")!;
    expect(intg01.data.chapterEmail).toBe("acm-w@ssn.edu.in");

    const intg03 = INTEGRATIONS.find((i) => i.id === "INTG-03")!;
    expect(intg03.data.membershipUrl).toBe("https://www.acm.org/membership");
  });

  it("verifies official documents schema and DOCS-03 internal-only distribution scope", () => {
    expect(OFFICIAL_DOCUMENTS.length).toBe(3);
    const docs03 = OFFICIAL_DOCUMENTS.find((d) => d.id === "DOCS-03")!;
    expect(docs03).toBeDefined();
    expect(docs03.title).toBe("Official Chapter Council Roster");
    expect(docs03.fileName).toBe("SSN ACM-W Team.pdf");
    expect(docs03.publicationStatus).toBe("gated-pending-approval");
    expect(docs03.distributionScope).toBe("internal-only");

    const docs01 = OFFICIAL_DOCUMENTS.find((d) => d.id === "DOCS-01")!;
    expect(docs01.publicationStatus).toBe("published");
    expect(docs01.distributionScope).toBe("public");
  });

  it("validates website content against the actual authoritative markdown content ledger", () => {
    const ledgerPath = path.resolve(process.cwd(), "docs/governance/ACMW_CONTENT_LEDGER.md");
    expect(fs.existsSync(ledgerPath), `Authoritative ledger missing at ${ledgerPath}`).toBe(true);

    const ledgerContent = fs.readFileSync(ledgerPath, "utf-8");
    const masterSection = ledgerContent.split("## 2. Master Preservation Ledger Table")[1]?.split("## 2.1")[0] || "";
    const parsedRows: Array<{ id: string; title: string; category: string; status: string }> = [];

    const rowRegex = /\|\s*`([A-Z]+-\d+)`\s*\|\s*([^|]+)\|\s*`?([^|`]+)`?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*\*\*?([^*|]+)\*\*?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
    let match;
    while ((match = rowRegex.exec(masterSection)) !== null) {
      parsedRows.push({
        id: match[1].trim(),
        title: match[2].trim(),
        category: match[3].trim(),
        status: match[7].trim().toLowerCase().replace(/\s+/g, "-"),
      });
    }

    expect(parsedRows).toHaveLength(47);
    expect(CANONICAL_LEDGER_47).toHaveLength(47);

    for (const row of parsedRows) {
      const canonical = CANONICAL_LEDGER_47.find((c) => c.id === row.id);
      expect(canonical, `Ledger entry ${row.id} found in markdown but missing in canonical mapping`).toBeDefined();
      expect(row.category).toBe(canonical!.category);
      expect(row.status).toBe(canonical!.publicationStatus);
    }

    const publishedCount = CANONICAL_LEDGER_47.filter((i) => i.publicationStatus === "published").length;
    const partialCount = CANONICAL_LEDGER_47.filter((i) => i.publicationStatus === "partially-published").length;
    const gatedCount = CANONICAL_LEDGER_47.filter((i) => i.publicationStatus === "gated-pending-approval").length;

    expect(publishedCount).toBe(29);
    expect(partialCount).toBe(4);
    expect(gatedCount).toBe(14);
    expect(publishedCount + partialCount + gatedCount).toBe(47);

    const regions = FACET_LIST.map((facet) => facet.id);
    expect(regions).toEqual(["about", "events", "projects", "outreach", "team", "join-us"]);
    for (const r of regions) {
      const mappedItems = CANONICAL_LEDGER_47.filter((i) => i.mosaicRegion === r);
      expect(mappedItems.length, `Mosaic region ${r} has no mapped ledger items`).toBeGreaterThan(0);
    }
    const internalArchiveItems = CANONICAL_LEDGER_47.filter((i) => i.mosaicRegion === "internal-only");
    expect(internalArchiveItems).toHaveLength(14);

    let renderedHtml = "";
    for (const facetId of regions) {
      renderedHtml += renderToStaticMarkup(
        React.createElement(FacetPage, {
          facetId,
          onNavigateHome: () => {},
          onNavigateTimeline: () => {},
          onNavigateFacet: () => {},
        })
      );
    }

    // Zero leak of gated student officer names
    const gatedOfficerNames = [
      "Ankitha Reddy",
      "Akshayalakshmi",
      "Oviasree",
      "Ananya Raman",
      "Ann Maria Thomas",
      "G Kavin Rajan",
      "Rethanya P",
    ];
    for (const name of gatedOfficerNames) {
      expect(renderedHtml).not.toContain(name);
    }

    // Zero leak of DOCS-03 internal PDF link
    expect(renderedHtml).not.toContain("SSN ACM-W Team.pdf");

    // Zero leak of unapproved cash figures
    expect(renderedHtml).not.toContain("₹30K+");
    expect(renderedHtml).not.toContain("₹30,000");
    expect(renderedHtml).not.toContain("₹1,00,000");

    // Zero leak of candidate Anita Borg
    expect(renderedHtml).not.toContain("Anita Borg");

    // Zero leak of unledgered Discord invite
    expect(renderedHtml).not.toContain("discord.gg");
  });
});
