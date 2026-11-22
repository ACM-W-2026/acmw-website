/**
 * SSN ACM-W Student Chapter · "The Thread We Carry"
 * Canonical Content Ledger & Media Asset Mapping
 * 
 * Sourced directly from docs/ACMW_CONTENT_LEDGER.md and docs/ACMW_ASSET_INVENTORY.md.
 * Retains all governance gates (historical student cohort, minor student privacy,
 * YŪGO'26 winner placement restrictions, and media clearance safeguards).
 */

export interface PioneerProfile {
  id: string;
  name: string;
  era: string;
  year: number;
  title: string;
  contribution: string;
  quote: string;
  portraitUrl?: string;
  accentField: string;
}

export interface EventRecord {
  id: string;
  title: string;
  edition: string;
  type: string;
  scale: string;
  date: string;
  participants?: string;
  description: string;
  highlights: string[];
  media: {
    gallery: string[];
    videoUrl?: string;
  };
}

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  lead: string;
  summary: string;
  impact: string;
  tags: string[];
}

export interface OutreachPillar {
  title: string;
  description: string;
}

export interface OutreachRecord {
  id: string;
  initiative: string;
  partner: string;
  focus: string;
  description: string;
  studentImpact: string;
  privacyNotice: string;
  curriculumPillars: OutreachPillar[];
  volunteerCta: {
    title: string;
    description: string;
    actionLabel: string;
    destination: string;
  };
}

export interface NewsletterRecord {
  id: string;
  volume: string;
  title: string;
  month: string;
  featured: boolean;
  opportunities: string[];
  tags: string[];
  pdfUrl: string;
  publicationStatus: "published";
  mediaClearanceStatus: "cleared-public";
}

export interface IntegrationRecord {
  id: string;
  name: string;
  type: "contact" | "social" | "membership";
  data: Record<string, string>;
}

export interface LeadershipRecord {
  role: string;
  name: string;
  designation: string;
  department: string;
  bio: string;
  avatarUrl?: string;
  isFaculty: boolean;
}

export interface OfficialDocumentRecord {
  id: string;
  title: string;
  fileName: string;
  category: "report" | "newsletter" | "roster";
  publicationStatus: "published" | "gated-pending-approval";
  distributionScope: "public" | "internal-only";
  description: string;
}

export const OFFICIAL_DOCUMENTS: OfficialDocumentRecord[] = [
  {
    id: "DOCS-01",
    title: "Official Code in Tandem Report",
    fileName: "3 - ACM-W Code in Tandem - Event Report.pdf",
    category: "report",
    publicationStatus: "published",
    distributionScope: "public",
    description: "Official event report for Code in Tandem pair-programming contest.",
  },
  {
    id: "DOCS-02",
    title: "Official Women's Day Report",
    fileName: "Womens-Day-Event-Report.pdf",
    category: "report",
    publicationStatus: "published",
    distributionScope: "public",
    description: "Official report for Women's Day celebration and AdZap challenge.",
  },
  {
    id: "DOCS-03",
    title: "Official Chapter Council Roster",
    fileName: "SSN ACM-W Team.pdf",
    category: "roster",
    publicationStatus: "gated-pending-approval",
    distributionScope: "internal-only",
    description: "Historical 2025-2026 student council roster; internal archival document excluded from public distribution pending formal council authorization.",
  },
];

export const PIONEERS: PioneerProfile[] = [
  {
    id: "PION-01",
    name: "Ada Lovelace",
    era: "1843",
    year: 1843,
    title: "The First Algorithm",
    contribution: "Authored Note G for Charles Babbage's Analytical Engine, describing the first step-by-step algorithm to compute Bernoulli numbers and recognizing computing as symbol manipulation beyond pure arithmetic.",
    quote: "The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.",
    portraitUrl: "/assets/pioneers/ada-lovelace.jpg",
    accentField: "Algorithmic Logic & Mathematics",
  },
  {
    id: "PION-02",
    name: "Grace Hopper",
    era: "1950s",
    year: 1952,
    title: "The Compiler & Machine Independence",
    contribution: "Pioneered the concept of compiler-based programming languages with the A-0 system and B-0 (FLOW-MATIC), establishing machine independence and leading directly to COBOL.",
    quote: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    portraitUrl: "/assets/pioneers/grace-hopper.jpg",
    accentField: "Compilers & High-Level Languages",
  },
  {
    id: "PION-03",
    name: "Katherine Johnson",
    era: "1962",
    year: 1962,
    title: "Orbital Trajectory & Space Navigation",
    contribution: "Calculated flight trajectories, launch windows, and emergency return paths for Project Mercury and Apollo 11, pioneering critical digital computing validation for human spaceflight.",
    quote: "I counted everything. I counted the steps to the road, the steps up to church, the number of dishes and silverware I washed... anything that could be counted, I did.",
    portraitUrl: "/assets/pioneers/katherine-johnson.jpg",
    accentField: "Orbital Mechanics & Celestial Navigation",
  },
  {
    id: "PION-04",
    name: "Margaret Hamilton",
    era: "1969",
    year: 1969,
    title: "Asynchronous Software Engineering",
    contribution: "Director of the MIT Software Engineering Division for the Apollo 11 Guidance Computer. Created priority-scheduled asynchronous task execution that prevented lunar landing abort under radar overload.",
    quote: "There was no choice but to be pioneers; no one had done it before.",
    accentField: "Systems & Fault-Tolerant Architectures",
  },
  {
    id: "PION-05",
    name: "Radia Perlman",
    era: "1985",
    year: 1985,
    title: "The Algorithmic Foundation of the Internet",
    contribution: "Invented the Spanning Tree Protocol (STP), transforming Ethernet from localized fragile loops into scalable, robust, self-healing networks that underpin modern telecommunications.",
    quote: "I wanted to invent something that people could just plug in and it would work without thinking.",
    accentField: "Distributed Systems & Routing Protocols",
  },
  {
    id: "PION-06",
    name: "Fei-Fei Li",
    era: "2000s",
    year: 2009,
    title: "ImageNet & Modern Visual Intelligence",
    contribution: "Spearheaded the creation of ImageNet, a massive ontological dataset of 14M+ annotated images that catalysed the deep learning revolution and transformed modern artificial intelligence.",
    quote: "If we want technology to serve humanity, it must be shaped by humanity as a whole.",
    accentField: "Computer Vision & Cognitive Intelligence",
  },
];

export const CHAPTER_INFO = {
  name: "SSN ACM-W Student Chapter",
  charter: "Charter #108544",
  institution: "SSN College of Engineering",
  location: "Kalavakkam, Chennai, Tamil Nadu, India",
  established: "2018",
  mission: "Empowering women in computing, cultivating research fellowships, championing peer mentorship, and fostering technical excellence across competitive hackathons, open science, and community outreach.",
  facultyCoordinator: {
    name: "Dr. P. Mirunalini",
    title: "Faculty Coordinator",
    designation: "Associate Professor, Department of Computer Science and Engineering",
    department: "Department of Computer Science and Engineering",
    bio: "Guiding the SSN ACM-W Student Chapter towards academic excellence, global hackathon achievements, and rural digital literacy initiatives.",
    avatarUrl: "",
  },
  get facultySponsor() {
    return this.facultyCoordinator;
  },
};

export const FACULTY_COORDINATOR = CHAPTER_INFO.facultyCoordinator;

export const EVENTS: EventRecord[] = [
  {
    id: "EVNT-01",
    title: "YŪGO’26",
    edition: "2026 Edition",
    type: "National 24-Hour Hackathon",
    scale: "National 24-Hour Hackathon",
    date: "February 2026",
    description: "Our flagship 24-hour national hackathon bringing together students nationwide to solve real-world problems in Healthcare & AI for Accessibility.",
    highlights: [
      "Hardware-software convergence tracks",
      "Mentorship from leading industry practitioners",
      "Rigorous technical evaluation by faculty and domain experts",
    ],
    media: {
      gallery: [],
    },
  },
  {
    id: "EVNT-02",
    title: "Code in Tandem",
    edition: "Annual Edition",
    type: "Collaborative Pair-Programming",
    scale: "Inter-College Collaborative Contest",
    date: "September 2025",
    description: "Pairs alternate writing code and defining invariant test cases, emphasizing collaborative software craftsmanship and clean code principles.",
    highlights: [
      "Dynamic driver-navigator rotation model",
      "Automated edge-case evaluation test suites",
      "Debrief sessions on algorithmic complexity and code review",
    ],
    media: {
      gallery: [],
    },
  },
  {
    id: "EVNT-03",
    title: "Women’s Day Celebration",
    edition: "Annual Commemoration",
    type: "Panel & Creative Technical Challenge",
    scale: "Campus-Wide Symposium",
    date: "March 2026",
    description: "Annual on-campus commemoration celebrating women leaders in tech through invited keynotes, interactive panels, and the AdZap creative challenge.",
    highlights: [
      "Keynote addresses by women leaders in technology",
      "Interactive technical challenge and design sprint",
      "Release of the SSN ACM-W Featured Gazette edition",
    ],
    media: {
      gallery: [],
    },
  },
  {
    id: "EVNT-04",
    title: "Computational Thinking Workshop",
    edition: "CSpathshala Outreach",
    type: "Tactile Pedagogy & Problem-Solving",
    scale: "Regional School Network Initiative",
    date: "Periodic",
    description: "Hands-on computational thinking modules for school students, introducing algorithmic concepts through tactile, unplugged problem-solving activities.",
    highlights: [
      "Unplugged computing activities and logic puzzles",
      "Pattern recognition and decomposition games",
      "Interactive algorithmic thinking exercises",
    ],
    media: {
      gallery: [],
    },
  },
];

export const PROJECTS: ProjectRecord[] = [
  {
    id: "PROJ-01",
    title: "High-Performance Limit Order Book",
    category: "Systems & Financial Infrastructure",
    lead: "Technical Committee",
    summary: "Ultra-low-latency price-time priority matching engine in modern C++20 with cache-conscious memory layout and sub-microsecond tick processing.",
    impact: "Provides students hands-on systems experience with cache alignment, lock-free ring buffers, and benchmarked matching performance.",
    tags: ["C++20", "Lock-Free", "Low-Latency", "Systems"],
  },
  {
    id: "PROJ-02",
    title: "IIsy: In-Network Machine Learning",
    category: "Programmable Data Planes",
    lead: "Systems & Networking Group",
    summary: "Hardware-accelerated random forest classification pipeline directly within programmable network switches using P4 and SmartNIC targets.",
    impact: "Enables line-rate packet classification without server telemetry round-trips for distributed anomaly detection.",
    tags: ["P4", "SmartNIC", "Distributed ML", "Networking"],
  },
  {
    id: "PROJ-03",
    title: "TCP Packet Sniffer & Analysis Engine",
    category: "Network Telemetry & Security",
    lead: "Cybersecurity & Infrastructure Wing",
    summary: "Raw socket inspection and protocol reconstruction tool for Linux data planes, providing deep packet inspection and network telemetry visualization.",
    impact: "Serves as an educational diagnostic foundation for network protocols, socket architecture, and stream reassembly.",
    tags: ["Linux", "Raw Sockets", "TCP/IP", "Telemetry"],
  },
];

export const OUTREACH: OutreachRecord = {
  id: "OUTR-01",
  initiative: "CSpathshala Outreach Programme",
  partner: "Association for Computing Machinery (ACM) India",
  focus: "Unplugged Computational Thinking for Secondary Education",
  description: "SSN ACM-W partners with ACM India's CSpathshala initiative to bring computational thinking into secondary school curricula across the region, replacing passive computer literacy with active algorithmic reasoning.",
  studentImpact: "Over 200+ secondary students across 5+ schools engaged through tactile workshops, graph puzzles, and logic decomposition modules.",
  privacyNotice: "In accordance with child privacy protection principles, student names, school identifiers, and unconsented classroom photographs are excluded from public presentation.",
  curriculumPillars: [
    {
      title: "Algorithmic Thinking without Screens",
      description: "Teaching search algorithms, sorting techniques, and recursion through physical card-sorting and maze routing.",
    },
    {
      title: "Pattern Recognition & Decomposition",
      description: "Breaking complex real-world puzzles into manageable sub-problems and identifying recurring structural motifs.",
    },
    {
      title: "Collaborative Logic Challenges",
      description: "Team-based graph traversals, parity-bit error detection games, and boolean logic circuit enactments.",
    },
  ],
  volunteerCta: {
    title: "Become a Student Volunteer",
    description: "Join the chapter's outreach wing to mentor school students, design unplugged computing modules, and assist in school visits.",
    actionLabel: "Apply for Outreach Wing",
    destination: "https://docs.google.com/forms/d/e/1FAIpQLSfvolunteer-placeholder/viewform",
  },
};

export const LEADERSHIP: LeadershipRecord[] = [
  {
    role: "Faculty Coordinator",
    name: "Dr. P. Mirunalini",
    designation: "Associate Professor",
    department: "Department of Computer Science and Engineering",
    bio: "Guiding the chapter's research culture, student mentorship initiatives, and technical programmes since establishment in 2018.",
    isFaculty: true,
  },
];

export const NEWSLETTERS: NewsletterRecord[] = [
  {
    id: "NEWS-01",
    volume: "Vol 5.0",
    title: "March 2026 Edition",
    month: "March 2026",
    featured: true,
    opportunities: [
      "A*STAR Singapore: Singapore International Pre-Graduate Award (SIPGA)",
      "IIT Bhubaneswar: Summer Research Internship Programme",
      "French Government: Charpak Master's Scholarship",
    ],
    tags: ["Scholarships", "Internships", "Global"],
    pdfUrl: "/assets/SSN ACM-W Newsletter March 2026 (1).pdf",
    publicationStatus: "published",
    mediaClearanceStatus: "cleared-public",
  },
  {
    id: "NEWS-02",
    volume: "Vol 4.0",
    title: "February 2026 Edition",
    month: "February 2026",
    featured: false,
    opportunities: [
      "IIT Madras: Summer Fellowship Programme (SFP)",
      "Caltech (USA): Summer Undergraduate Research Fellowship (SURF)",
      "IISc Bangalore: Centre for Networked Intelligence (CNI) Internship",
      "ETH Zurich (Switzerland): Robotics Student Fellowship",
    ],
    tags: ["Research", "Fellowships", "Robotics"],
    pdfUrl: "/assets/SSN ACM-W Newsletter February 2026.pdf",
    publicationStatus: "published",
    mediaClearanceStatus: "cleared-public",
  },
  {
    id: "NEWS-03",
    volume: "Vol 3.0",
    title: "January 2026 Edition",
    month: "January 2026",
    featured: false,
    opportunities: [
      "ISRO: Student Project Trainee Scheme",
      "SNU Chennai: Research Internship",
      "Mitacs Globalink (Canada): Research Award",
    ],
    tags: ["Space Science", "Domestic Research", "International"],
    pdfUrl: "/assets/SSN ACM-W Newsletter January 2026.pdf",
    publicationStatus: "published",
    mediaClearanceStatus: "cleared-public",
  },
  {
    id: "NEWS-04",
    volume: "Vol 2.0",
    title: "December 2025 Edition",
    month: "December 2025",
    featured: false,
    opportunities: [
      "NUS (Singapore): IRIS Fully Funded Research Programme",
      "CERN (Switzerland): CERN Summer Student Programme 2026",
      "Santa Fe Institute (USA): Undergraduate Complexity Research (UCR)",
      "IISc Bangalore: CNI Research Internship",
    ],
    tags: ["CERN", "Singapore", "Complexity Science"],
    pdfUrl: "/assets/SSN ACM-W_December_2025.pdf",
    publicationStatus: "published",
    mediaClearanceStatus: "cleared-public",
  },
  {
    id: "NEWS-05",
    volume: "Vol 1.0",
    title: "September 2025 Edition (Inaugural Issue)",
    month: "September 2025",
    featured: false,
    opportunities: [
      "Google: Application Engineering Intern (Winter 2026)",
      "ACM-W India: Lady Ada National Programming Contest",
      "Tata Crucible: Campus Quiz 2025",
      "OIST (Japan): Research Internship",
    ],
    tags: ["Google", "ACM-W India", "OIST Japan"],
    pdfUrl: "/assets/SSN ACM-W Newsletter September 2025.pdf",
    publicationStatus: "published",
    mediaClearanceStatus: "cleared-public",
  },
];

export const INTEGRATIONS: IntegrationRecord[] = [
  {
    id: "INTG-01",
    name: "Chapter Official Contacts",
    type: "contact",
    data: {
      chapterEmail: "acm-w@ssn.edu.in",
      facultyEmail: "mirunalini@ssn.edu.in",
      institution: "SSN College of Engineering",
      address: "Rajiv Gandhi Salai (OMR), Kalavakkam, Chennai – 603110, Tamil Nadu, India",
    },
  },
  {
    id: "INTG-02",
    name: "Official Social Media Channels",
    type: "social",
    data: {
      linkedin: "https://www.linkedin.com/company/ssn-acm-w-student-chapter",
      instagram: "https://www.instagram.com/acmw__ssn/",
      youtube: "https://www.youtube.com/channel/UCd6XWQr408WoWJFThGfychw",
    },
  },
  {
    id: "INTG-03",
    name: "Global ACM Onboarding",
    type: "membership",
    data: {
      heading: "Join ACM Global",
      copy: "To officially join the SSN chapter, you require an active global ACM Membership. Clicking proceed will securely route you to the official ACM portal.",
      membershipUrl: "https://www.acm.org/membership",
      acmwGlobalUrl: "https://women.acm.org/",
    },
  },
];
