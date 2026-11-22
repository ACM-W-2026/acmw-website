import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { TerminalFork } from "@/components/fork/TerminalFork";
import { ThreadTimeline } from "@/components/timeline/ThreadTimeline";
import { MilestoneThematicSymbol } from "@/components/timeline/MilestoneThematicSymbols";
import { LivingMosaic } from "@/components/mosaic/LivingMosaic";

describe("Component Rendering & Visual Hierarchy Suite", () => {
  it("renders MilestoneThematicSymbol with id, className, color, and style", () => {
    const html04 = renderToStaticMarkup(
      <MilestoneThematicSymbol
        id="PION-04"
        className="w-12 h-12"
        color="#278F9B"
        style={{ transform: "scale(1)" }}
      />
    );
    expect(html04).toContain('data-testid="thematic-symbol-pion-04"');
    expect(html04).toContain('stroke="#278F9B"');
    expect(html04).toContain('class="w-12 h-12"');

    const html05 = renderToStaticMarkup(
      <MilestoneThematicSymbol
        id="PION-05"
        className="w-10 h-10"
        color="#1595D0"
      />
    );
    expect(html05).toContain('data-testid="thematic-symbol-pion-05"');
    expect(html05).toContain('stroke="#1595D0"');

    const html06 = renderToStaticMarkup(
      <MilestoneThematicSymbol
        id="PION-06"
        className="w-8 h-8"
        color="#C96C8E"
      />
    );
    expect(html06).toContain('data-testid="thematic-symbol-pion-06"');
    expect(html06).toContain('stroke="#C96C8E"');
  });

  it("renders ThreadTimeline with non-image fallback emblems for PION-04, PION-05, and PION-06", () => {
    const html = renderToStaticMarkup(
      <ThreadTimeline
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    // Verified non-image fallback emblems are rendered
    expect(html).toContain('data-testid="thematic-symbol-pion-04"');
    expect(html).toContain('data-testid="thematic-symbol-pion-05"');
    expect(html).toContain('data-testid="thematic-symbol-pion-06"');

    // Dual-stroke halo without rasterized glow filter
    expect(html).toContain('id="timeline-light-strobe-halo"');
    expect(html).toContain('id="timeline-light-strobe-pulse"');
    expect(html).not.toContain('filter="url(#timelineStrobeGlow)"');

    // Initial cream-gold travelling spark
    expect(html).toContain('data-testid="travelling-golden-bead"');
  });

  it("renders Terminal Fork with seven independent continuations and zero convergence", () => {
    const html = renderToStaticMarkup(
      <TerminalFork
        onSelectFacet={() => {}}
        onSelectCentre={() => {}}
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    expect(html).toContain("When the thread reaches the present, you choose the path.");
    expect(html).toContain("Chapter Living Mosaic");
    expect(html).not.toContain("Anita Borg");

    // Monumental dimensions
    expect(html).toContain('width="320"');
    expect(html).toContain('height="106"');

    // Ceremonial Chapter Nexus Crown Jewel
    expect(html).toContain("✦ CHAPTER NEXUS ✦");

    // All 7 facet branch test IDs present
    const branchIds = ["about", "projects", "team", "events", "outreach", "join-us"];
    for (const id of branchIds) {
      expect(html).toContain(`data-testid="fork-branch-${id}"`);
      expect(html).toContain(`data-testid="mobile-fork-branch-${id}"`);
    }
    expect(html).toContain('data-testid="fork-branch-centre"');
    expect(html).toContain('data-testid="mobile-fork-branch-centre"');
  });

  it("keeps all seven outgoing fibre paths and their portals hidden in the initial server render", () => {
    const html = renderToStaticMarkup(
      <TerminalFork
        onSelectFacet={() => {}}
        onSelectCentre={() => {}}
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    const pathTags = html.match(/<path\b[^>]*>/g) ?? [];
    const branchIds = ["about", "projects", "team", "events", "outreach", "join-us", "home"];

    for (const branchId of branchIds) {
      for (const fibre of ["core", "f2", "f3"]) {
        const tag = pathTags.find((candidate) =>
          candidate.includes(`data-testid="branch-${fibre}-${branchId}"`)
        );
        expect(tag, `Missing ${fibre} fibre for ${branchId}`).toBeDefined();
        expect(tag).toContain('opacity="0"');
      }

      const handleTag = (html.match(/<g\b[^>]*>/g) ?? []).find((candidate) =>
        candidate.includes(`data-testid="handle-${branchId}"`)
      );
      const plaqueTag = (html.match(/<g\b[^>]*>/g) ?? []).find((candidate) =>
        candidate.includes(`data-testid="endpoint-group-${branchId}"`)
      );
      expect(handleTag).toContain('opacity="0"');
      expect(handleTag).toContain('visibility="hidden"');
      expect(plaqueTag).toContain('opacity="0"');
      expect(plaqueTag).toContain('visibility="hidden"');
    }

    const mobileRoot = (html.match(/<div[^>]*data-testid="mobile-fork-root"[^>]*>/) ?? [])[0];
    const mobileChoices = (html.match(/<div[^>]*data-testid="mobile-fork-choice-list"[^>]*>/) ?? [])[0];
    expect(mobileRoot).toBeDefined();
    expect(mobileChoices).toBeDefined();
    expect(mobileRoot).toContain("opacity:0");
    expect(mobileRoot).toContain("visibility:hidden");
    expect(mobileChoices).toContain("opacity:0");
    expect(mobileChoices).toContain("visibility:hidden");
  });

  it("renders LivingMosaic with all 6 organic regions and vector lattice texture", () => {
    const html = renderToStaticMarkup(
      <LivingMosaic focusedRegion={null} setFocusedRegion={() => {}} />
    );
    expect(html).toContain('viewBox="0 0 1200 700"');
    expect(html).toContain("About ACM-W");
    expect(html).toContain("Events &amp; Flagships");
    expect(html).toContain("Projects &amp; Tech");
    expect(html).toContain("Outreach &amp; CSpathshala");
    expect(html).toContain("Team &amp; Leadership");
    expect(html).toContain("Join Us · The Future");

    // Events diamond vector pattern instead of yugo1.jpeg raster
    expect(html).toContain('id="eventsPattern"');
    expect(html).not.toContain("yugo1.jpeg");
  });

  it("verifies accessible keyboard focus and touch target attributes across Mosaic and Fork controls", () => {
    const mosaicHtml = renderToStaticMarkup(
      <LivingMosaic focusedRegion={null} setFocusedRegion={() => {}} />
    );
    expect(mosaicHtml).toContain('aria-label="Open About ACM-W facet (CHAPTER IDENTITY)"');
    expect(mosaicHtml).toContain("focus-visible:ring-2");
    expect(mosaicHtml).toContain("touch-manipulation");

    const forkHtml = renderToStaticMarkup(
      <TerminalFork
        onSelectFacet={() => {}}
        onSelectCentre={() => {}}
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    expect(forkHtml).toContain("focus-visible:ring-2");
    expect(forkHtml).toContain("min-h-[48px]");
  });

  it("verifies strict brand palette compliance across rendered output", () => {
    const forkHtml = renderToStaticMarkup(
      <TerminalFork
        onSelectFacet={() => {}}
        onSelectCentre={() => {}}
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    const mosaicHtml = renderToStaticMarkup(
      <LivingMosaic focusedRegion={null} setFocusedRegion={() => {}} />
    );
    const timelineHtml = renderToStaticMarkup(
      <ThreadTimeline
        journeyProgressRef={{ current: { history: null, fork: null, sync: null, historyMap: null } }}
      />
    );
    const allHtml = [forkHtml, mosaicHtml, timelineHtml].join(" ").toLowerCase();

    const prohibitedHexes = [
      "#a855f7", "#c084fc", "#9333ea", "#7c3aed", "#6b21a8", "#581c87",
      "#800080", "#ff00ff", "#ee82ee", "#da70d6", "#ba55d3", "#9932cc",
      "#9400d3", "#8a2be2"
    ];

    for (const hex of prohibitedHexes) {
      expect(
        allHtml.includes(hex),
        `PALETTE VIOLATION: Prohibited color token "${hex}" found in rendered component HTML!`
      ).toBe(false);
    }
  });
});
