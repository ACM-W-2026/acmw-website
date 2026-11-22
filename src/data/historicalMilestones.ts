/**
 * SSN ACM-W — Historical Milestones Data Architecture
 * 
 * Sourced under ACMW_DESIGN_SPECIFICATION.md §4 and ACMW_DESIGN_DECISIONS.md (D-04, D-05).
 * Each milestone reveal is resolved from its measured SVG anchor on the canonical parent path.
 * 
 * NOTE: PION-04, PION-05, and PION-06 historical text, contributions, years and quotes are
 * preserved in full, but uncleared portrait, cutout, and silhouette paths are strictly omitted,
 * triggering the non-image MilestoneThematicSymbol fallback in all viewports.
 */

export interface HistoricalMilestone {
  id: string;
  person: string;
  yearLabel: string;
  year: number;
  contributionTitle: string;
  contributionSummary: string;
  quote: string;
  portraitUrl?: string;
  silhouetteUrl?: string;
  cutoutUrl?: string;
  verifiedSourceIds: string[];
  publicationStatus: "approved" | "draft" | "blocked";
  accentField: string;
  isHorizon: boolean;
  accentColor?: string;
  glowColor?: string;
}

export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    id: "PION-01",
    person: "Ada Lovelace",
    yearLabel: "1843",
    year: 1843,
    contributionTitle: "The First Algorithm",
    contributionSummary: "Authored Note G for Charles Babbage's Analytical Engine, describing the first step-by-step algorithm to compute Bernoulli numbers and recognizing computing as symbol manipulation beyond pure arithmetic.",
    quote: "The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.",
    portraitUrl: "/assets/pioneers/ada-lovelace.jpg",
    silhouetteUrl: "/assets/pioneers/silhouette/ada-lovelace-silhouette.webp",
    cutoutUrl: "/assets/pioneers/cutout/ada-lovelace-cutout.webp",
    verifiedSourceIds: ["HIST-01", "SRC-ADA"],
    publicationStatus: "approved",
    accentField: "Algorithmic Logic & Mathematics",
    isHorizon: false,
    accentColor: "#1595D0",
    glowColor: "rgba(21, 149, 208, 0.30)",
  },
  {
    id: "PION-02",
    person: "Grace Hopper",
    yearLabel: "1952",
    year: 1952,
    contributionTitle: "The Compiler & Machine Independence",
    contributionSummary: "Pioneered the concept of compiler-based programming languages with the A-0 system and B-0 (FLOW-MATIC), establishing machine independence and leading directly to COBOL.",
    quote: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    portraitUrl: "/assets/pioneers/grace-hopper.jpg",
    silhouetteUrl: "/assets/pioneers/silhouette/grace-hopper-silhouette.webp",
    cutoutUrl: "/assets/pioneers/cutout/grace-hopper-cutout.webp",
    verifiedSourceIds: ["HIST-02", "SRC-HOPPER"],
    publicationStatus: "approved",
    accentField: "Compilers & High-Level Languages",
    isHorizon: false,
    accentColor: "#278F9B",
    glowColor: "rgba(39, 143, 155, 0.30)",
  },
  {
    id: "PION-03",
    person: "Katherine Johnson",
    yearLabel: "1962",
    year: 1962,
    contributionTitle: "Orbital Trajectory & Space Navigation",
    contributionSummary: "Calculated flight trajectories, launch windows, and emergency return paths for Project Mercury and Apollo 11, pioneering critical digital computing validation for human spaceflight.",
    quote: "I counted everything. I counted the steps to the road, the steps up to church, the number of dishes and silverware I washed... anything that could be counted, I did.",
    portraitUrl: "/assets/pioneers/katherine-johnson.jpg",
    silhouetteUrl: "/assets/pioneers/silhouette/katherine-johnson-silhouette.webp",
    cutoutUrl: "/assets/pioneers/cutout/katherine-johnson-cutout.webp",
    verifiedSourceIds: ["HIST-03", "SRC-JOHNSON"],
    publicationStatus: "approved",
    accentField: "Orbital Mechanics & Celestial Navigation",
    isHorizon: false,
    accentColor: "#C96C8E",
    glowColor: "rgba(201, 108, 142, 0.30)",
  },
  {
    id: "PION-04",
    person: "Margaret Hamilton",
    yearLabel: "1969",
    year: 1969,
    contributionTitle: "Asynchronous Software Engineering",
    contributionSummary: "Director of the MIT Software Engineering Division for the Apollo 11 Guidance Computer. Created priority-scheduled asynchronous task execution that prevented lunar landing abort under radar overload.",
    quote: "There was no choice but to be pioneers; no one had done it before.",
    // Uncleared portrait paths omitted per asset governance; renders MilestoneThematicSymbol fallback
    verifiedSourceIds: ["HIST-04", "SRC-HAMILTON"],
    publicationStatus: "approved",
    accentField: "Systems & Fault-Tolerant Architectures",
    isHorizon: false,
    accentColor: "#1595D0",
    glowColor: "rgba(21, 149, 208, 0.30)",
  },
  {
    id: "PION-05",
    person: "Radia Perlman",
    yearLabel: "1985",
    year: 1985,
    contributionTitle: "The Algorithmic Foundation of the Internet",
    contributionSummary: "Invented the Spanning Tree Protocol (STP), transforming Ethernet from localized fragile loops into scalable, robust, self-healing networks that underpin modern telecommunications.",
    quote: "I wanted to invent something that people could just plug in and it would work without thinking.",
    // Uncleared portrait paths omitted per asset governance; renders MilestoneThematicSymbol fallback
    verifiedSourceIds: ["HIST-05", "SRC-PERLMAN"],
    publicationStatus: "approved",
    accentField: "Distributed Systems & Routing Protocols",
    isHorizon: false,
    accentColor: "#278F9B",
    glowColor: "rgba(39, 143, 155, 0.30)",
  },
  {
    id: "PION-06",
    person: "Fei-Fei Li",
    yearLabel: "2009",
    year: 2009,
    contributionTitle: "ImageNet & Modern Visual Intelligence",
    contributionSummary: "Spearheaded the creation of ImageNet, a massive ontological dataset of 14M+ annotated images that catalysed the deep learning revolution and transformed modern artificial intelligence.",
    quote: "If we want technology to serve humanity, it must be shaped by humanity as a whole.",
    // Uncleared portrait paths omitted per asset governance; renders MilestoneThematicSymbol fallback
    verifiedSourceIds: ["HIST-06", "SRC-LIFEEFEI"],
    publicationStatus: "approved",
    accentField: "Computer Vision & Cognitive Intelligence",
    isHorizon: false,
    accentColor: "#ED247A",
    glowColor: "rgba(237, 36, 122, 0.30)",
  },
  {
    id: "PION-07",
    person: "The Legacy Horizon",
    yearLabel: "Present & Beyond",
    year: 2026,
    contributionTitle: "...and many more",
    contributionSummary: "The open, continuing lineage of researchers, systems architects, and engineers weaving the next generation of computing.",
    quote: "The next chapter is yours to shape.",
    verifiedSourceIds: ["HIST-07", "D-05-PROVISIONAL"],
    publicationStatus: "draft", // D-05 Open notice - strictly excluded from public presentation
    accentField: "Open Future & Chapter Continuum",
    isHorizon: true,
  },
];

/**
 * Authoritative list of approved historical milestones for public visitor timeline presentation.
 * Excludes draft/provisional records (such as PION-07) until explicitly approved by the owner.
 */
export const APPROVED_HISTORICAL_MILESTONES: HistoricalMilestone[] = HISTORICAL_MILESTONES.filter(
  (m) => m.publicationStatus === "approved"
);
