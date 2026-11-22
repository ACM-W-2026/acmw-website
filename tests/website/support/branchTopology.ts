/**
 * SSN ACM-W — Branch Topology & Non-Convergence Invariants
 * 
 * Sourced under ACMW_DESIGN_SPECIFICATION.md §5 and ACMW_DESIGN_DECISIONS.md (D-06, D-07, D-20).
 * Six independent website-facet strands and one distinct centre/Home continuation emerge from one terminal fork.
 * 
 * INVARIANT: Branches diverge and stay independent. Shared exit stems or convergence funnels are strictly prohibited.
 */

import { FacetId, FACET_DEFINITIONS } from "./facets";

export interface BranchTopology {
  id: FacetId;
  label: string;
  sourceNodeId: "historical-terminal";
  destinationNodeId: string; // Guaranteed unique terminal identifier
  route: string;
  badge: string;
  color: string;
  glowColor: string;
  desktopPath: string;
  mobilePath: string;
  terminalCoord: { x: number; y: number };
  mobileTerminalCoord: { x: number; y: number };
}

export const BRANCH_TOPOLOGY: BranchTopology[] = [
  {
    id: "about",
    label: FACET_DEFINITIONS.about.label,
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-about",
    route: "/about",
    badge: FACET_DEFINITIONS.about.badge,
    color: "#1595D0", // ACM-W Blue
    glowColor: "rgba(21, 149, 208, 0.5)",
    desktopPath: "M 500 40 C 420 40, 240 100, 140 180",
    mobilePath: "M 200 30 C 140 40, 70 80, 60 130",
    terminalCoord: { x: 140, y: 180 },
    mobileTerminalCoord: { x: 60, y: 130 },
  },
  {
    id: "projects",
    label: FACET_DEFINITIONS.projects.label,
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-projects",
    route: "/projects",
    badge: FACET_DEFINITIONS.projects.badge,
    color: "#1595D0", // ACM-W Blue
    glowColor: "rgba(21, 149, 208, 0.5)",
    desktopPath: "M 500 40 C 380 70, 190 220, 110 340",
    mobilePath: "M 200 30 C 130 90, 70 180, 60 260",
    terminalCoord: { x: 110, y: 340 },
    mobileTerminalCoord: { x: 60, y: 260 },
  },
  {
    id: "team",
    label: FACET_DEFINITIONS.team.label,
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-team",
    route: "/team",
    badge: FACET_DEFINITIONS.team.badge,
    color: "#F5F8FA", // Soft Pearl
    glowColor: "rgba(245, 248, 250, 0.4)",
    desktopPath: "M 500 40 C 400 120, 270 360, 220 500",
    mobilePath: "M 200 30 C 140 140, 70 290, 60 390",
    terminalCoord: { x: 220, y: 500 },
    mobileTerminalCoord: { x: 60, y: 390 },
  },
  {
    id: "events",
    label: FACET_DEFINITIONS.events.label,
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-events",
    route: "/events",
    badge: FACET_DEFINITIONS.events.badge,
    color: "#278F9B", // Ocean Teal
    glowColor: "rgba(39, 143, 155, 0.5)",
    desktopPath: "M 500 40 C 580 40, 760 100, 860 180",
    mobilePath: "M 200 30 C 260 40, 330 80, 340 130",
    terminalCoord: { x: 860, y: 180 },
    mobileTerminalCoord: { x: 340, y: 130 },
  },
  {
    id: "outreach",
    label: FACET_DEFINITIONS.outreach.label,
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-outreach",
    route: "/outreach",
    badge: FACET_DEFINITIONS.outreach.badge,
    color: "#C96C8E", // Dusty Rose
    glowColor: "rgba(201, 108, 142, 0.5)",
    desktopPath: "M 500 40 C 620 70, 810 220, 890 340",
    mobilePath: "M 200 30 C 270 90, 330 180, 340 260",
    terminalCoord: { x: 890, y: 340 },
    mobileTerminalCoord: { x: 340, y: 260 },
  },
  {
    id: "join-us",
    label: FACET_DEFINITIONS["join-us"] ? FACET_DEFINITIONS["join-us"].label : "Join Us · The Future",
    sourceNodeId: "historical-terminal",
    destinationNodeId: "terminal-join-us",
    route: "/join-us",
    badge: "NEXT HORIZON",
    color: "#ED247A", // ACM-W Pink
    glowColor: "rgba(237, 36, 122, 0.5)",
    desktopPath: "M 500 40 C 600 120, 730 360, 780 500",
    mobilePath: "M 200 30 C 260 140, 330 290, 340 390",
    terminalCoord: { x: 780, y: 500 },
    mobileTerminalCoord: { x: 340, y: 390 },
  },
];

export const CENTRE_STRAND = {
  id: "home" as const,
  label: "Chapter Living Mosaic",
  sourceNodeId: "historical-terminal" as const,
  destinationNodeId: "terminal-home",
  route: "/home",
  badge: "CHAPTER HOMEPAGE",
  color: "#F5F8FA",
  glowColor: "rgba(245, 248, 250, 0.6)",
  desktopPath: "M 500 40 C 500 200, 500 380, 500 540",
  mobilePath: "M 200 30 C 200 200, 200 380, 200 550",
  terminalCoord: { x: 500, y: 540 },
  mobileTerminalCoord: { x: 200, y: 550 },
};

/**
 * Validates that all branch terminals and routes are strictly unique and independent.
 * Rejects any duplicated destination or convergence attempts.
 */
export function assertNoConvergenceTopology(branches: BranchTopology[]): void {
  // 1. Destination Node IDs must all be distinct
  const terminals = branches.map((b) => b.destinationNodeId);
  if (new Set(terminals).size !== branches.length) {
    throw new Error(
      `Facet strands must terminate independently! Duplicate destinationNodeId detected.`
    );
  }

  // 2. Terminal Coordinates (Desktop) must all be distinct
  const desktopCoords = branches.map((b) => `${b.terminalCoord.x},${b.terminalCoord.y}`);
  if (new Set(desktopCoords).size !== branches.length) {
    throw new Error(
      `Facet strands must have unique spatial endpoints! Duplicate desktop terminal coordinates detected.`
    );
  }

  // 3. Terminal Coordinates (Mobile) must all be distinct
  const mobileCoords = branches.map((b) => `${b.mobileTerminalCoord.x},${b.mobileTerminalCoord.y}`);
  if (new Set(mobileCoords).size !== branches.length) {
    throw new Error(
      `Facet strands must have unique mobile spatial endpoints! Duplicate mobile terminal coordinates detected.`
    );
  }

  // 4. Centre route must not collide with any side branch
  if (terminals.includes(CENTRE_STRAND.destinationNodeId)) {
    throw new Error(`Centre route destinationNodeId collides with a side branch!`);
  }
  const centreDesktopCoord = `${CENTRE_STRAND.terminalCoord.x},${CENTRE_STRAND.terminalCoord.y}`;
  if (desktopCoords.includes(centreDesktopCoord)) {
    throw new Error(`Centre route terminalCoord collides with a side branch coordinate!`);
  }
}
