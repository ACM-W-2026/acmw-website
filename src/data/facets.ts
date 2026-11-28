/**
 * SSN ACM-W — Facet Definitions & Independent Route Architecture
 * 
 * Sourced under ACMW_DESIGN_SPECIFICATION.md and ACMW_DESIGN_DECISIONS.md (D-06, D-08, D-13).
 * Canonical 6 website facets: About, Events, Projects, Outreach, Team, Join Us.
 */

export type FacetId =
  | "about"
  | "events"
  | "projects"
  | "outreach"
  | "team"
  | "join-us";

export interface FacetDefinition {
  id: FacetId;
  label: string;
  route: string;
  summary: string;
  terminalId: string; // Guaranteed unique terminal identifier
  badge: string;
  color: string;
  glowColor: string;
  contentKeys: string[];
  assetKeys: string[];
  publicationStatus: "approved" | "provisional";
}

export const FACET_LIST: FacetDefinition[] = [
  {
    id: "about",
    label: "About ACM-W",
    route: "/about",
    summary: "Charter #108544 identity, core mission, faculty coordination, and 2018 establishment history.",
    terminalId: "terminal-about",
    badge: "CHAPTER IDENTITY",
    color: "#1595D0", // ACM-W Blue
    glowColor: "rgba(21, 149, 208, 0.4)",
    contentKeys: ["CHARTER-01", "GOV-01", "HIST-01"],
    assetKeys: ["DOCS-01", "DOCS-02"],
    publicationStatus: "approved",
  },
  {
    id: "events",
    label: "Events & Flagships",
    route: "/events",
    summary: "YŪGO'26, Code in Tandem, WISE, and CS Pathshala workshops.",
    terminalId: "terminal-events",
    badge: "FLAGSHIPS & GATHERINGS",
    color: "#ED247A", // ACM-W Pink
    glowColor: "rgba(237, 36, 122, 0.4)",
    contentKeys: ["EVNT-01", "EVNT-02", "EVNT-03", "EVNT-04"],
    assetKeys: ["DOCS-01", "DOCS-02"],
    publicationStatus: "approved",
  },
  {
    id: "projects",
    label: "Projects & Tech",
    route: "/projects",
    summary: "C++ orderbook engineering, in-network ML classification, and TCP network analysis.",
    terminalId: "terminal-projects",
    badge: "TECHNICAL SYSTEMS",
    color: "#1595D0", // ACM-W Blue
    glowColor: "rgba(21, 149, 208, 0.4)",
    contentKeys: ["PROJ-01", "PROJ-02", "PROJ-03"],
    assetKeys: ["repo-orderbook", "repo-switch-ml", "repo-sniffer"],
    publicationStatus: "approved",
  },
  {
    id: "outreach",
    label: "Outreach & CSpathshala",
    route: "/outreach",
    summary: "Tactile computational thinking workshops across rural secondary schools with strict child privacy protection.",
    terminalId: "terminal-outreach",
    badge: "COMMUNITY IMPACT",
    color: "#278F9B", // Ocean Teal
    glowColor: "rgba(39, 143, 155, 0.4)",
    contentKeys: ["OUTR-01"],
    assetKeys: [],
    publicationStatus: "approved",
  },
  {
    id: "team",
    label: "Team & Leadership",
    route: "/team",
    summary: "Faculty coordination, chapter governance, and the five-volume published newsletter archive.",
    terminalId: "terminal-team",
    badge: "GOVERNANCE & ARCHIVE",
    color: "#C96C8E", // Dusty Rose
    glowColor: "rgba(201, 108, 142, 0.4)",
    contentKeys: ["FAC-01", "NEWS-01", "NEWS-02", "NEWS-03", "NEWS-04", "NEWS-05"],
    assetKeys: ["newsletter-vol1-vol5"],
    publicationStatus: "approved",
  },
  {
    id: "join-us",
    label: "Join Us · The Future",
    route: "/join-us",
    summary: "Student chapter registration and the global ACM membership pathway.",
    terminalId: "terminal-join-us",
    badge: "NEXT HORIZON",
    color: "#ED247A", // ACM-W Pink
    glowColor: "rgba(237, 36, 122, 0.4)",
    contentKeys: ["INTG-01", "INTG-02", "INTG-03"],
    assetKeys: ["linkedin-badge", "acm-global-onboarding"],
    publicationStatus: "approved",
  },
];

export const FACET_DEFINITIONS: Record<FacetId, FacetDefinition> = FACET_LIST.reduce(
  (acc, facet) => {
    acc[facet.id] = facet;
    return acc;
  },
  {} as Record<FacetId, FacetDefinition>
);

export const CENTRE_ROUTE = {
  id: "home" as const,
  label: "Chapter Living Mosaic",
  route: "/home",
  terminalId: "terminal-home",
  badge: "CHAPTER HOMEPAGE",
  color: "#F5F8FA",
  glowColor: "rgba(245, 248, 250, 0.5)",
  summary: "The organic butterfly-like centerpiece where the continuing thread unfolds into chapter boundaries.",
};

/**
 * Enforces topology invariant: all facet terminals and routes must be strictly unique.
 * Shared branch endpoints or destination collisions are strictly forbidden.
 */
export function assertIndependentTerminals(facets: FacetDefinition[]): void {
  const terminalIds = facets.map((f) => f.terminalId);
  const uniqueTerminals = new Set(terminalIds);
  if (uniqueTerminals.size !== facets.length) {
    throw new Error(
      `Facet strands must terminate independently! Duplicate terminal detected. Total: ${facets.length}, Unique: ${uniqueTerminals.size}`
    );
  }

  const routes = facets.map((f) => f.route);
  const uniqueRoutes = new Set(routes);
  if (uniqueRoutes.size !== facets.length) {
    throw new Error(
      `Facet routes must be distinct! Duplicate route detected.`
    );
  }

  // Ensure centre route doesn't collide with any facet terminal or route
  if (terminalIds.includes(CENTRE_ROUTE.terminalId)) {
    throw new Error(`Centre route terminalId collides with facet terminal!`);
  }
  if (routes.includes(CENTRE_ROUTE.route)) {
    throw new Error(`Centre route collides with facet route!`);
  }
}
