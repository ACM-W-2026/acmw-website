import { describe, it, expect } from "vitest";
import { FACET_LIST, CENTRE_ROUTE, assertIndependentTerminals } from "@/data/facets";
import { BRANCH_TOPOLOGY, CENTRE_STRAND, assertNoConvergenceTopology } from "@/data/branchTopology";
import { HISTORICAL_MILESTONES, APPROVED_HISTORICAL_MILESTONES } from "@/data/historicalMilestones";

describe("Phase 1 — Data & Route Architecture (Timeline-to-Facet Revamp)", () => {
  it("defines exactly six official website facets in FACET_LIST", () => {
    expect(FACET_LIST).toHaveLength(6);
    const facetIds = FACET_LIST.map((f) => f.id);
    expect(facetIds).toEqual([
      "about",
      "events",
      "projects",
      "outreach",
      "team",
      "join-us",
    ]);

    // Ensure old computing-discipline taxonomy is completely absent
    const forbiddenDomains = ["systems", "compilers", "networks", "ai", "community"];
    forbiddenDomains.forEach((domain) => {
      expect(facetIds).not.toContain(domain);
    });
  });

  it("enforces independent terminal invariant: no duplicate terminal IDs or routes", () => {
    expect(() => assertIndependentTerminals(FACET_LIST)).not.toThrow();

    // Verify all routes begin with '/'
    FACET_LIST.forEach((f) => {
      expect(f.route).toMatch(/^\/[a-z-]+$/);
      expect(f.terminalId).toMatch(/^terminal-[a-z-]+$/);
    });

    expect(CENTRE_ROUTE.route).toBe("/home");
    expect(CENTRE_ROUTE.terminalId).toBe("terminal-home");
  });

  it("enforces no-convergence topology across all 6 branch strands and centre strand", () => {
    expect(() => assertNoConvergenceTopology(BRANCH_TOPOLOGY)).not.toThrow();

    expect(BRANCH_TOPOLOGY).toHaveLength(6);

    // Verify each branch has unique desktop and mobile terminal coordinates
    const desktopCoords = BRANCH_TOPOLOGY.map((b) => `${b.terminalCoord.x},${b.terminalCoord.y}`);
    expect(new Set(desktopCoords).size).toBe(6);

    const mobileCoords = BRANCH_TOPOLOGY.map((b) => `${b.mobileTerminalCoord.x},${b.mobileTerminalCoord.y}`);
    expect(new Set(mobileCoords).size).toBe(6);

    // Ensure centre strand has a distinct destination coordinate
    const centreDesktop = `${CENTRE_STRAND.terminalCoord.x},${CENTRE_STRAND.terminalCoord.y}`;
    expect(desktopCoords).not.toContain(centreDesktop);

    // Verify all branches emerge from "historical-terminal" (the single fork)
    BRANCH_TOPOLOGY.forEach((b) => {
      expect(b.sourceNodeId).toBe("historical-terminal");
    });
    expect(CENTRE_STRAND.sourceNodeId).toBe("historical-terminal");
  });

  it("keeps historical milestones chronological and derives reveal timing from path geometry", () => {
    expect(HISTORICAL_MILESTONES).toHaveLength(7);

    // Content order remains chronological; animation timing is no longer stored
    // as manually guessed percentages that can drift from the SVG anchor points.
    for (let i = 0; i < HISTORICAL_MILESTONES.length - 1; i++) {
      expect(
        HISTORICAL_MILESTONES[i].year,
        `Milestone ${HISTORICAL_MILESTONES[i].person} must precede ${HISTORICAL_MILESTONES[i + 1].person}`
      ).toBeLessThanOrEqual(HISTORICAL_MILESTONES[i + 1].year);
      expect(HISTORICAL_MILESTONES[i]).not.toHaveProperty("revealAt");
    }
    expect(HISTORICAL_MILESTONES[HISTORICAL_MILESTONES.length - 1]).not.toHaveProperty("revealAt");

    // Verify final milestone is the Legacy Horizon anchor with D-05 provisional status
    const finalMilestone = HISTORICAL_MILESTONES[HISTORICAL_MILESTONES.length - 1];
    expect(finalMilestone.isHorizon).toBe(true);
    expect(finalMilestone.publicationStatus).toBe("draft");
    expect(finalMilestone.verifiedSourceIds).toContain("D-05-PROVISIONAL");

    // APPROVED_HISTORICAL_MILESTONES must exclude draft PION-07
    expect(APPROVED_HISTORICAL_MILESTONES).toHaveLength(6);
    expect(APPROVED_HISTORICAL_MILESTONES.some((m) => m.id === "PION-07")).toBe(false);
  });

  it("strictly excludes Anita Borg from historical milestones per governance rules", () => {
    const names = HISTORICAL_MILESTONES.map((m) => m.person.toLowerCase());
    expect(names.some((n) => n.includes("anita") || n.includes("borg"))).toBe(false);
  });
});
