# SSN ACM-W Website — Content Preservation & Destination Ledger (Phase 1B & 1D)

> [!IMPORTANT]
> **DOCUMENT PRECEDENCE NOTICE**
> This document is the **sole authoritative record** for content inventory, preservation assurance, item-level publication approval gates, and media clearance statuses across the ACM-W website redesign.
> Any architectural proposals or legacy IA diagrams referencing superseded 4-stream topologies or unverified claims are superseded by this ledger and [`docs/ACMW_EXPERIENCE_SPECIFICATION.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ACMW_EXPERIENCE_SPECIFICATION.md).

**Document ID:** `ACMW-CONTENT-LEDGER-V1`
**Workstream:** Agent 2 — ACM-W Visitor-Facing Website
**Date:** 6 November 2026
**Status:** **AUTHORITATIVE PRESERVATION BASELINE (RECONCILED & GATED)**
**Inventory Authority:** [`docs/ACMW_CONTENT_INVENTORY.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ACMW_CONTENT_INVENTORY.md)
**Experience Authority:** [`docs/ACMW_EXPERIENCE_SPECIFICATION.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ACMW_EXPERIENCE_SPECIFICATION.md)
**Governing Architecture:** [`docs/ARCHITECTURE_V2.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ARCHITECTURE_V2.md)
**Narrative Contract:** [`docs/agent-handoffs/shared/EXPERIENCE_FLOW_CONTRACT.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/agent-handoffs/shared/EXPERIENCE_FLOW_CONTRACT.md)

---

## 1. Schema & Fail-Closed Preservation Rules

Every meaningful content item discovered during Phase 1 is indexed below using the formal ledger interface specified in [`docs/ACMW_IMPLEMENTATION_PLAN.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ACMW_IMPLEMENTATION_PLAN.md). To prevent unverified claims or uncleared minor imagery from appearing in production, verification, council approval, and media clearance are decoupled into independent gates:

```typescript
export interface LedgerClaimUnit {
  claimId: string;
  scope: string;
  verificationStatus: "verified-live-source" | "verified-approved-doc" | "historical-unconfirmed" | "candidate-prototype-unverified" | "missing-inaccessible";
  councilApprovalStatus: "approved" | "pending-review" | "rejected";
  mediaFiles?: string[];
  mediaClearanceStatus: "cleared-public" | "pending-consent-release" | "not-applicable";
  publicationStatus: "published" | "gated-pending-approval" | "draft" | "retired";
  distributionScope?: "public" | "internal-only"; // Defaults to "public"; "internal-only" restricts to private archive
  sourceOrEvidenceRef: string;
}

export interface ContentLedgerItem {
  id: string;
  title: string;
  category: "identity" | "pioneer" | "event" | "project" | "outreach" | "team" | "committee" | "newsletter" | "report" | "integration" | "candidate-prototype";
  canonicalUrl?: string;
  sourceFiles: string[];
  mediaFiles: string[];
  ownerOrApprover?: string;
  lastCheckedAt: string;

  // Independent Status Gates (Strict Scalar Enums):
  verificationStatus: "verified-live-source" | "verified-approved-doc" | "historical-unconfirmed" | "candidate-prototype-unverified" | "missing-inaccessible";
  councilApprovalStatus: "approved" | "pending-review" | "rejected";
  mediaClearanceStatus: "cleared-public" | "pending-consent-release" | "not-applicable";
  publicationStatus: "published" | "partially-published" | "gated-pending-approval" | "quarantined" | "retired";
  distributionScope?: "public" | "internal-only"; // Defaults to "public"; "internal-only" restricts to private archive

  destination: "branch" | "expanded-branch-view" | "mosaic-region" | "dedicated-route" | "archive" | "external-link" | "retired";
  notes: string[];

  // Structured Claim-Level Decomposition (for mixed-approval / partial records):
  claims?: LedgerClaimUnit[];
}
```

### 1.1 Canonical TypeScript Schema to Human-Readable Display Value Mapping

The TypeScript schema (`ContentLedgerItem` and `LedgerClaimUnit`) declares strict scalar enum values for machine verification, schema validation, and automated tooling. The human-readable tables in Section 2 and Section 2.1 use title-cased display labels for presentation readability. The following exhaustive table defines the unambiguous, bidirectional mapping between presentation display labels and canonical schema enum values:

| Schema Field | Human-Readable Display Label | Canonical TypeScript Schema Enum | Status Definition & Governance Scope |
|---|---|---|---|
| `verificationStatus` | Verified live source | `"verified-live-source"` | Extracted and verified directly from the deployed production website DOM (`gkavinrajanCodes/acmw-web-2026`). |
| `verificationStatus` | Verified approved doc | `"verified-approved-doc"` | Sourced from a signed, approved official PDF publication (`DOCS-01`, `DOCS-02`, `DOCS-03`). |
| `verificationStatus` | Historical unconfirmed | `"historical-unconfirmed"` | Sourced from legacy archives or past-year records; pending active council confirmation. |
| `verificationStatus` | Candidate prototype unverified | `"candidate-prototype-unverified"` | Found in unapproved prototype codebases; unverified against live production source. |
| `verificationStatus` | Missing inaccessible | `"missing-inaccessible"` | Asset or document referenced in legacy records but inaccessible or missing from storage. |
| `councilApprovalStatus` | Approved | `"approved"` | Formally approved by Chapter Council, Faculty Coordinator (`OFF-01`), or official faculty sponsor. |
| `councilApprovalStatus` | Pending review | `"pending-review"` | Held pending formal council resolution, faculty sign-off, or financial disbursement audit. |
| `councilApprovalStatus` | Rejected | `"rejected"` | Formally rejected or disqualified by chapter leadership. |
| `mediaClearanceStatus` | Cleared public | `"cleared-public"` | Media assets are public domain, adult student cleared, or officially released for publication. |
| `mediaClearanceStatus` | Pending consent release | `"pending-consent-release"` | Imagery depicts minor school students; gated pending signed parental consent releases. |
| `mediaClearanceStatus` | Not applicable | `"not-applicable"` | Text-only narrative or structured data item with zero public media dependencies. |
| `publicationStatus` | Published | `"published"` | Fully approved and media-cleared; authorized for public production deployment. |
| `publicationStatus` | Partially published | `"partially-published"` | Parent record contains both published approved sub-claims and gated sub-claims/media. |
| `publicationStatus` | Gated pending approval | `"gated-pending-approval"` | Held fail-closed; public serving blocked until council approval or consent release is logged. |
| `publicationStatus` | Quarantined | `"quarantined"` | Candidate prototype or discrepant item isolated from production; barred from public build. |
| `publicationStatus` | Retired | `"retired"` | Deprecated, superseded, or obsolete content permanently excluded from V2 redesign. |

### 1.2 Claim-Level Field Mapping (`LedgerClaimUnit`)

Every claim unit row in Section 2.1 maps directly to the declared `LedgerClaimUnit` fields:

| Claim Table Column Header | `LedgerClaimUnit` TypeScript Field | TypeScript Type | Value Source / Mapping Rule |
|---|---|---|---|
| `Record ID` | (Parent Record Link) | `string` | Foreign key referencing the parent `ContentLedgerItem.id`. |
| `Claim Unit ID` | `claimId` | `string` | Unique claim identifier (e.g., `EVNT-01-C1`). |
| `Claim Scope / Description` | `scope` | `string` | Granular factual scope or proposition of this sub-claim. |
| `Verification Status` | `verificationStatus` | strict enum string | Maps via Section 1.1 table to canonical verification enum. |
| `Council Approval` | `councilApprovalStatus` | strict enum string | Maps via Section 1.1 table to canonical approval enum. |
| `Media Files` | `mediaFiles` | `string[]` (optional) | Exact filenames from asset inventory; evaluated independently per claim. |
| `Media Clearance` | `mediaClearanceStatus` | strict enum string | Maps via Section 1.1 table to canonical clearance enum. |
| `Publication Status` | `publicationStatus` | strict enum string | Maps via Section 1.1 table to canonical publication enum. |
| `Supporting Source / Evidence Reference` | `sourceOrEvidenceRef` | `string` | File path, DOM route, or document evidence citation. |

### 1.3 Core Preservation & Gate Mandates
1. **Zero Silent Drops**: No verified live item may be omitted from the V2 redesign.
2. **Central Thread Purity**: The central thread is a visual path only; **zero ledger items** reside on the central thread itself. All content lives in branches, expanded views, mosaic cells, or archives.
3. **Fail-Closed Publishing Policy**:
   - A record or claim is **Published** (`publicationStatus: "published"`) ONLY if:
     1. Its narrative is formally approved (`councilApprovalStatus === "approved"`); AND
     2. Its media clearance is satisfied: `mediaClearanceStatus === "cleared-public"` (for items with public media assets) OR `mediaClearanceStatus === "not-applicable"` (for text-only items with zero public media dependencies).
     3. All sub-claims (if decomposed) are approved and cleared.
   - A record is **Partially Published** (`publicationStatus: "partially-published"`) if its core narrative or specific sub-claims are verified and approved, but certain sub-claims remain `councilApprovalStatus === "pending-review"` (e.g. unverified cash prize amounts) or certain media assets remain `mediaClearanceStatus === "pending-consent-release"` (e.g. minor classroom photos). Gated sub-claims are suppressed or flagged with explicit approval disclaimers; un-cleared media assets are replaced with privacy fallbacks (silhouette/blur).
   - **Claim-Level Media Evaluation**: For decomposed records, media assets are evaluated and bound at the claim unit level (`mediaFiles`). Public display of any media file is governed strictly by the `publicationStatus` and `mediaClearanceStatus` of the specific claim unit that references it, not merely by the parent record's aggregate status. Media files attached to a gated claim (such as winner showcase photos in `EVNT-01-C3` or classroom photos in `OUTR-04-C2` and `OUTR-05-C2`) must never be served in the published view of parent or sibling claims.
   - A record is **Gated Pending Approval** (`publicationStatus: "gated-pending-approval"`) if formal council authorization to publish on the redesigned website is outstanding (`councilApprovalStatus === "pending-review"`), or if all associated public media lacks required consent. Gated records cannot be served to public visitors without explicit council sign-off.
4. **Deterministic Scalar Representation**: Compound status strings (such as combining multiple approvals into one string) are prohibited in schema fields. Mixed states must be decomposed into typed `claims` arrays.
5. **Traceability**: Every record and sub-claim traces directly to a verified live URL, DOM component, or official document.

### 1.4 Canonical Counting Methodology & Status Reconciliation
Content metrics are rigorously classified across distinct units to avoid mixing ledger records, sub-claims, physical media files, and human review topics:

* **Master Ledger Active Records**: Exactly **47 active items** across 10 functional groups (`IDEN`: 2, `PION`: 7, `EVNT`: 4, `PROJ`: 3, `OUTR`: 6, `OFF`: 8, `COMM`: 6, `NEWS`: 5, `DOCS`: 3, `INTG`: 3).
* **Quarantined Prototype Items**: Exactly **9 items** (`PROTO-01` through `PROTO-09`) safely isolated from production.
* **Domain Committee Personnel**: Exactly **27 student members** represented collectively across the 6 domain committee rows (`COMM-01` through `COMM-06`).
* **Cataloged Media Assets**: Exactly **61 physical media files** (8 official PDFs, 2 videos, 49 raster images [41 JPEGs, 8 PNGs], 2 vector SVGs, totaling 95.23 MB) indexed in [`docs/ACMW_ASSET_INVENTORY.md`](file:///home/nkandasamy/Desktop/acmw_website_revamp/docs/ACMW_ASSET_INVENTORY.md).

#### Reconciled Publication Status Distribution (All 47 Active Rows)
Following the rigorous application of the structured approval schema and the evidentiary review of historical cohort approvals, the 47 active ledger rows are distributed as follows:

1. **Fully Published Records: 29 active items (61.7%)**
   - **Identity & Chapter Mission (2)**: `IDEN-01`, `IDEN-02` (Approved narrative; text-only, media clearance not-applicable).
   - **Computing Pioneers (7)**: `PION-01` through `PION-07` (6 historical portraits cleared public; 1 horizon text entry).
   - **Flagship Events & Workshops (3)**: `EVNT-02` (Code in Tandem), `EVNT-03` (Women's Day), `EVNT-04` (Computational Thinking Workshop) (Approved reports and cleared event media).
   - **Systems Projects (3)**: `PROJ-01` (Orderbook), `PROJ-02` (IIsy), `PROJ-03` (TCP Sniffer) (Approved technical write-ups and GitHub links; text-only).
   - **Outreach Framework (3)**: `OUTR-01` (CS Pathshala Mission), `OUTR-03` (Curriculum Pillars), `OUTR-06` (Volunteer CTA) (Approved pedagogy and forms; text-only).
   - **Faculty Coordinator (1)**: `OFF-01` (Dr. P. Mirunalini) (Approved official faculty coordinator profile and cleared photo).
   - **Monthly Newsletters (5)**: `NEWS-01` through `NEWS-05` (Vol 1.0 to Vol 5.0, Sep 2025–Mar 2026: fully verified, approved, and cleared public archival editions with PDFs).
   - **Official Chapter Reports (2)**: `DOCS-01`, `DOCS-02` (Signed official PDF event reports cleared for public download).
   - **Global Actions & Integrations (3)**: `INTG-01`, `INTG-02`, `INTG-03` (Approved contact info, social links, ACM membership modal).

2. **Partially Published Records (Containing Gated Claims or Assets): 4 active items (8.5%)**
   - `EVNT-01` (YŪGO’26 Healthcare AI Hackathon): Event recap narrative and ordinary event presentation photos (`yugo1.jpeg` through `yugo6.jpg`, `ACMctFinal.mp4`) published under claim `EVNT-01-C1`; ₹30K+ prize pool (`EVNT-01-C2`) and official winner rankings/winner showcase photos (`yugo_winner1.jpeg`, `yugo_winner2.jpeg` under `EVNT-01-C3`) gated pending council disbursement confirmation.
   - `OUTR-02` (CS Pathshala Metrics): Verified program scale published (5+ schools/yr, 10+ sessions, 1.6M national context); internal detailed student attendance logs gated pending review.
   - `OUTR-04` (CS Pathshala Nov 2025 Gallery): Session I narrative recap published; 6 minor classroom photos gated with privacy silhouette/blur fallback pending signed releases.
   - `OUTR-05` (CS Pathshala Feb 2026 Gallery): Session II narrative recap published; 6 minor classroom photos gated with privacy silhouette/blur fallback pending signed releases.

3. **Fully Gated Records: 14 active items (29.8%)**
   - **7 Executive Student Officers**: `OFF-02` through `OFF-08` (Ankitha Reddy, Akshayalakshmi S, Oviasree Sampath, Ananya Raman, Ann Maria Thomas, G Kavin Rajan, Rethanya P).
   - **6 Domain Committees**: `COMM-01` through `COMM-06` (Editorial, Social Media, Technical, Visual Media, Design, CSpathshala Coordinators, comprising 27 student members).
   - **1 Archival Council Roster Document**: `DOCS-03` (`SSN ACM-W Team.pdf`). Retains archival authenticity as a verified historical document, but public redistribution on V2 is strictly gated pending formal chapter council authorization (`distributionScope: "internal-only"`).
   - *Evidentiary Rationale:* Factual verification is established via the live `/team` DOM and `SSN ACM-W Team.pdf` (`DOCS-03`). However, an explicit council resolution or faculty coordinator sign-off authorising the republication of this historical 2025–2026 student cohort on the V2 redesigned website has not yet been executed. In accordance with strict non-fabrication rules, presence on the legacy website or in an archived PDF does not constitute formal publication authorization for the new platform. These 14 records are held in `gated-pending-approval` pending explicit council sign-off (see Section 2.2).

*Accounting Summary:* 29 fully published + 4 partially published + 14 fully gated = **47 active rows (100%)**.
*Approval Gate Summary:* **15 active rows** have pending council approval at the row or claim level (13 historical cohort rows + 2 partially published rows with pending claims `EVNT-01` and `OUTR-02`). **2 active rows** (`OUTR-04`, `OUTR-05`) have pending media consent releases for 12 classroom photographs.

---

## 2. Master Preservation Ledger Table

| Item ID | Title / Entity | Category | Verification Status | Council Approval | Media Clearance | Publication Status | Source Reference | Proposed V2 Destination | Preservation Priority |
|---|---|---|---|---|---|---|---|---|---|
| `IDEN-01` | Chapter Identity & About | `identity` | Verified live source | Approved | Not applicable | **Published** | `app/page.tsx`, `components/sections/about-section.tsx` | Mosaic Region & Branch Overview | **P0 (Critical)** |
| `IDEN-02` | Global ACM-W & SSN Metrics | `identity` | Verified live source | Approved | Not applicable | **Published** | `components/sections/about-section.tsx` | Mosaic Telemetry Region & Branch Header | **P0 (Critical)** |
| `PION-01` | Ada Lovelace | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-02` | Grace Hopper | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-03` | Katherine Johnson | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-04` | Margaret Hamilton | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-05` | Radia Perlman | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-06` | Fei-Fei Li | `pioneer` | Verified live source | Approved | Cleared public | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` & Expanded View | **P0 (Critical)** |
| `PION-07` | Legacy Horizon ("...and many more") | `pioneer` | Verified live source | Approved | Not applicable | **Published** | `components/sections/pioneers-section.tsx` | Branch 1: `branch-heritage` (Horizon Conclusion) | **P1 (High)** |
| `EVNT-01` | YŪGO’26 Healthcare AI Hackathon | `event` | Verified live source | Pending review | Cleared public | **Partially published** | `app/events/page.tsx` | Branch 3: `branch-events` & Expanded Route | **P0 (Critical)** |
| `EVNT-02` | Code in Tandem Pair Programming | `event` | Verified live source & report | Approved | Cleared public | **Published** | `app/events/page.tsx`, `3 - ACM-W Code in Tandem - Event Report.pdf` | Branch 3: `branch-events` & PDF Drawer | **P0 (Critical)** |
| `EVNT-03` | Women's Day Celebration | `event` | Verified live source & report | Approved | Cleared public | **Published** | `app/events/page.tsx`, `Womens-Day-Event-Report.pdf` | Branch 3: `branch-events` & Community Archive | **P0 (Critical)** |
| `EVNT-04` | Computational Thinking Workshop | `event` | Verified live source | Approved | Cleared public | **Published** | `app/events/page.tsx` | Branch 4: `branch-outreach` (Workshop Module) | **P1 (High)** |
| `PROJ-01` | Orderbook (C++ HFT Engine) | `project` | Verified live source (Mutex concurrency) | Approved | Not applicable | **Published** | `app/projects/page.tsx`, GitHub | Branch 2: `branch-systems` & Dedicated Route | **P0 (Critical)** |
| `PROJ-02` | IIsy (In-Network ML Switch) | `project` | Verified live source (IEEE/ACM Trans.) | Approved | Not applicable | **Published** | `app/projects/page.tsx`, IEEE/ACM Trans. | Branch 2: `branch-systems` & Dedicated Route | **P0 (Critical)** |
| `PROJ-03` | TCP Sniffer (C++ Network Analyzer) | `project` | Verified live source | Approved | Not applicable | **Published** | `app/projects/page.tsx`, GitHub | Branch 2: `branch-systems` & Dedicated Route | **P0 (Critical)** |
| `OUTR-01` | CS Pathshala Initiative & Mission | `outreach` | Verified live source | Approved | Not applicable | **Published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` & Dedicated Route | **P0 (Critical)** |
| `OUTR-02` | CS Pathshala Metrics | `outreach` | Verified live source (SSN: 5+ schools/yr, 10+ sessions; 1.6M national context) | Pending review | Not applicable | **Partially published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` Header | **P0 (Critical)** |
| `OUTR-03` | CS Pathshala Curriculum Pillars | `outreach` | Verified live source | Approved | Not applicable | **Published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` (Pedagogy) | **P1 (High)** |
| `OUTR-04` | CS Pathshala Nov 2025 Gallery | `outreach` | Verified live source | Approved | Pending consent release | **Partially published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` (Session I Carousel) | **P0 (Critical)** |
| `OUTR-05` | CS Pathshala Feb 2026 Gallery | `outreach` | Verified live source | Approved | Pending consent release | **Partially published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` (Session II Carousel) | **P0 (Critical)** |
| `OUTR-06` | CS Pathshala Volunteer Call-to-Action | `outreach` | Verified live source | Approved | Not applicable | **Published** | `app/cspathshala/page.tsx` | Branch 4: `branch-outreach` (Action Drawer) | **P1 (High)** |
| `OFF-01` | Dr. P. Mirunalini (Faculty Coordinator) | `team` | Verified live source | Approved | Cleared public | **Published** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-02` | Ankitha Reddy (Chairperson, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-03` | Akshayalakshmi S (Vice-Chair, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-04` | Oviasree Sampath (Secretary, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-05` | Ananya Raman (Joint Sec, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-06` | Ann Maria Thomas (Treasurer, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-07` | G Kavin Rajan (Webmaster, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `OFF-08` | Rethanya P (CSpathshala Coord, 2025–2026) | `team` | Verified live source (2025–2026 Cohort) | Pending review | Cleared public | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P0 (Critical)** |
| `COMM-01` | Editorial Committee (5 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `COMM-02` | Social Media Committee (4 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `COMM-03` | Technical Committee (6 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `COMM-04` | Visual Media Committee (4 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `COMM-05` | Design Committee (4 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `COMM-06` | CSpathshala Coordinators (4 members, 2025–2026) | `committee` | Verified live source | Pending review | Not applicable | **Gated pending approval** | `app/team/page.tsx` | Branch 5: `branch-council-gazette` | **P1 (High)** |
| `NEWS-01` | Newsletter March 2026 (Vol 5.0) | `newsletter` | Verified live source | Approved | Cleared public | **Published** | `app/blog/page.tsx` | Branch 5: `branch-council-gazette` & PDF Drawer (Featured Issue) | **P0 (Critical)** |
| `NEWS-02` | Newsletter February 2026 (Vol 4.0) | `newsletter` | Verified live source | Approved | Cleared public | **Published** | `app/blog/page.tsx` | Branch 5: `branch-council-gazette` & PDF Drawer | **P0 (Critical)** |
| `NEWS-03` | Newsletter January 2026 (Vol 3.0) | `newsletter` | Verified live source | Approved | Cleared public | **Published** | `app/blog/page.tsx` | Branch 5: `branch-council-gazette` & PDF Drawer | **P0 (Critical)** |
| `NEWS-04` | Newsletter December 2025 (Vol 2.0) | `newsletter` | Verified live source | Approved | Cleared public | **Published** | `app/blog/page.tsx` | Branch 5: `branch-council-gazette` & PDF Drawer | **P0 (Critical)** |
| `NEWS-05` | Newsletter September 2025 (Vol 1.0) | `newsletter` | Verified live source | Approved | Cleared public | **Published** | `app/blog/page.tsx` | Branch 5: `branch-council-gazette` & PDF Drawer | **P0 (Critical)** |
| `DOCS-01` | Official Code in Tandem Report | `report` | Verified approved doc | Approved | Cleared public | **Published** | `3 - ACM-W Code in Tandem - Event Report.pdf` | Branch 3: `branch-events` & PDF Drawer | **P1 (High)** |
| `DOCS-02` | Official Women's Day Report | `report` | Verified approved doc | Approved | Cleared public | **Published** | `Womens-Day-Event-Report.pdf` | Branch 3: `branch-events` & PDF Drawer | **P1 (High)** |
| `DOCS-03` | Official Chapter Council Roster | `report` | Verified approved doc | **Pending review** | Cleared public | **Gated pending approval** | `SSN ACM-W Team.pdf` | Archive only (`distributionScope: "internal-only"`) | **P1 (High)** |
| `INTG-01` | Contact Info & Physical Address | `integration` | Verified live source | Approved | Not applicable | **Published** | `components/navigation/footer.tsx` | Persistent System Dock & Drawer | **P0 (Critical)** |
| `INTG-02` | Social Media Channels (LinkedIn, IG, YT) | `integration` | Verified live source | Approved | Not applicable | **Published** | `components/navigation/footer.tsx` | Persistent System Dock & Drawer | **P0 (Critical)** |
| `INTG-03` | Global ACM Join Modal & Routing | `integration` | Verified live source | Approved | Not applicable | **Published** | `components/navigation/navbar.tsx` | Persistent System Dock & Intercept Modal | **P0 (Critical)** |

---

## 2.1 Structured Claim-Level Decomposition for Mixed-Approval Records

To prevent unverified claims or uncleared minor imagery from conflating with verified narrative, records with `publicationStatus: "partially-published"` are decomposed into discrete, machine-typed claim units. Under the fail-closed policy, only sub-claims with `councilApprovalStatus === "approved"` and satisfied media clearance may be served in public production builds:

| Record ID | Claim Unit ID | Claim Scope / Description | Verification Status | Council Approval | Media Files | Media Clearance | Publication Status | Supporting Source / Evidence Reference |
|---|---|---|---|---|---|---|---|---|
| `EVNT-01` | `EVNT-01-C1` | Event recap narrative, dates, healthcare AI tracks, and general presentation photos | Verified live source | Approved | `yugo1.jpeg`, `yugo2.jpeg`, `yugo3.jpeg`, `yugo4.jpg`, `yugo5.jpg`, `yugo6.jpg`, `ACMctFinal.mp4` | Cleared public | **Published** | `app/events/page.tsx`, event gallery (`yugo1-3.jpeg`, `yugo4-6.jpg`, `ACMctFinal.mp4`) |
| `EVNT-01` | `EVNT-01-C2` | Claimed cash prize pool amount ("₹30K+ Cash Pool") | Verified live source | **Pending review** | None | Not applicable | **Gated pending approval** | `app/events/page.tsx` (Official disbursement ledger pending council confirmation) |
| `EVNT-01` | `EVNT-01-C3` | Official winner team rankings (Champions Team Nexus / Runners-Up Team Synapse) | Verified live source | **Pending review** | `yugo_winner1.jpeg`, `yugo_winner2.jpeg` | Cleared public | **Gated pending approval** | `app/events/page.tsx`, winner showcase cards (`yugo_winner1.jpeg`, `yugo_winner2.jpeg`) (Council placement confirmation pending; fallback: standard hackathon presentation photos) |
| `OUTR-02` | `OUTR-02-C1` | Aggregate program scale (5+ schools/yr, 10+ documented sessions; 1.6M national context of ACM India) | Verified live source | Approved | None | Not applicable | **Published** | `app/cspathshala/page.tsx`, ACM India National Context (1.6M schools nationwide is national context, not SSN ACM-W reach) |
| `OUTR-02` | `OUTR-02-C2` | Detailed internal student attendance and engagement logs | Historical unconfirmed | **Pending review** | None | Not applicable | **Gated pending approval** | Council internal attendance ledger (pending formal submission & verification) |
| `OUTR-04` | `OUTR-04-C1` | Session I narrative recap, curriculum topic ("Algorithm Design"), and date | Verified live source | Approved | None | Not applicable | **Published** | `app/cspathshala/page.tsx` |
| `OUTR-04` | `OUTR-04-C2` | 6 minor student classroom photographs (`csp1.jpeg` through `csp6.jpeg`) | Verified live source | Approved | `csp1.jpeg`, `csp2.jpeg`, `csp3.jpeg`, `csp4.jpeg`, `csp5.jpeg`, `csp6.jpeg` | **Pending consent release** | **Gated pending approval** | Staged in asset inventory; locked in privacy silhouette/blur fallback pending signed releases |
| `OUTR-05` | `OUTR-05-C1` | Session II narrative recap, curriculum topic ("Conditionals & Loops"), and date | Verified live source | Approved | None | Not applicable | **Published** | `app/cspathshala/page.tsx` |
| `OUTR-05` | `OUTR-05-C2` | 6 minor student classroom photographs (`cspfeb1.jpg` through `cspfeb6.jpg`) | Verified live source | Approved | `cspfeb1.jpg`, `cspfeb2.jpg`, `cspfeb3.jpg`, `cspfeb4.jpg`, `cspfeb5.jpg`, `cspfeb6.jpg` | **Pending consent release** | **Gated pending approval** | Staged in asset inventory; locked in privacy silhouette/blur fallback pending signed releases |
| `DOCS-03` | `DOCS-03-C1` | Official Chapter Council Roster PDF document (`SSN ACM-W Team.pdf`) | Verified approved doc | **Pending review** | `SSN ACM-W Team.pdf` | Cleared public | **Gated pending approval** | `public/SSN ACM-W Team.pdf` (Contains historical 2025–2026 student cohort; internal archival authenticity preserved under `distributionScope: "internal-only"`; public redistribution strictly gated pending chapter council sign-off) |

---

## 2.2 Evidentiary Review & Governance Status of Historical 2025–2026 Cohort

An independent audit of the 13 governance cohort records (`OFF-02` through `OFF-08` and `COMM-01` through `COMM-06`) establishes a critical distinction between factual verification and formal publication approval:

1. **Available Source Evidence**:
   - Live website `/team` route (`app/team/page.tsx`).
   - Official chapter roster document `public/SSN ACM-W Team.pdf` (`DOCS-03`).
2. **Factual Verification Evaluation**:
   - The names, titles, and committee memberships of the 7 executive student officers and 27 committee members accurately describe the elected student leadership for the 2025–2026 academic year as deployed on the legacy production site. Their `verificationStatus` is confirmed as `"verified-live-source"` (and `"verified-approved-doc"`).
3. **Publication Approval Evaluation for V2 Redesign**:
   - **No explicit approval record exists**: The Chapter Council and Faculty Coordinator (`OFF-01` Dr. P. Mirunalini) have not executed a formal resolution, meeting minutes, or written sign-off authorising the republication of this historical 2025–2026 student cohort on the V2 redesigned website.
   - **Non-Inference Rule Enforced**: In accordance with project governance standards, formal council approval cannot be inferred merely from the presence of names on the legacy website, nor from the historical existence of `SSN ACM-W Team.pdf`.
4. **Governing Disposition**:
   - `councilApprovalStatus`: Strictly `"pending-review"`.
   - `publicationStatus`: Strictly `"gated-pending-approval"`.
   - Under the fail-closed publishing policy, publication eligibility is gated until explicit chapter council/owner sign-off is logged.
5. **Separation from 2026–2027 Freshness**:
   - The historical 2025–2026 cohort is preserved for future historical display in the Chapter Leadership & Alumni Archive once approved.
   - The current 2026–2027 council roster remains a separate pending submission when elections conclude. The historical cohort is never conflated with or implied to be the active 2026–2027 chapter leadership.

---

## 3. Discrepant & Retired Prototype Candidates

The following table explicitly accounts for every synthetic, unverified, or outdated item currently in [`acmw-production-website/src/data/content.ts`](file:///home/nkandasamy/Desktop/acmw_website_revamp/acmw-production-website/src/data/content.ts), recording why each item cannot be carried forward to production without independent chapter approval:

| Prototype Item ID | Entity Claimed in Prototype | Stated Category | Verification Classification | Reason for Quarantine / Retirement | Recommended Action |
|---|---|---|---|---|---|
| `PROTO-01` | "VisionAssist Edge" | Project | `candidate-prototype-unverified` | No public repo, no paper publication, not present on live site; synthetic prototype mock data. | **Retire** (replace with verified *Orderbook*). |
| `PROTO-02` | "Thirukkural Semantic Engine" | Project | `candidate-prototype-unverified` | No public repo, not present on live site; synthetic mock data. | **Retire** (replace with verified *IIsy*). |
| `PROTO-03` | "EcoPulse Sensor Mesh" | Project | `candidate-prototype-unverified` | No public repo, not present on live site; synthetic mock data. | **Retire** (replace with verified *TCP Sniffer*). |
| `PROTO-04` | "OpenCare Triage PWA" | Project | `candidate-prototype-unverified` | No public repo, not present on live site; synthetic mock data. | **Retire**. |
| `PROTO-05` | "Technovate '26" (36hr symposium) | Event / Hackathon | `candidate-prototype-unverified` | Marked "Dates to be finalized by Council", ₹1.5L prize pool, unverified tracks; not on live site. | **Quarantine in archive** as draft concept; promote verified *YŪGO’26* instead. |
| `PROTO-06` | Dr. Chitra Babu & Dr. B. Prabavathy | Faculty Sponsors | `historical-unconfirmed` | Current live site lists Dr. P. Mirunalini as official Faculty Coordinator. | **Preserve as historical founders** in chapter archives; display Dr. P. Mirunalini as current active coordinator. |
| `PROTO-07` | Nithya S. (Chairperson), Priyadarshini M., Sahana R., Dharshini K. | Team | `historical-unconfirmed` | Outdated prior-year office bearers (pre-2025). Live site has elected 2025-2026 council. | **Preserve in Chapter Alumni / Past Councils Archive**; feature current elected council on active roster. |
| `PROTO-08` | "1,400+ students mentored", "18 partner schools" | Outreach Metrics | `candidate-prototype-unverified` | Unsupported metrics in prototype contradicting verified live site metrics (100+ students, 2 sessions). | **Replace with verified live metrics**. |
| `PROTO-09` | Testimonials from "Mrs. Meenakshi S." and "Dharshini K." | Outreach Testimonials | `candidate-prototype-unverified` | Fabricated or unverified quotes not present on the live site. | **Retire**. |

---

## 4. Preservation Assurance Matrix

To guarantee that no live-site capability or content is degraded during the V2 redesign, the matrix below verifies coverage across all 6 live routes mapped strictly into the canonical 5-branch architecture:

```
Live Route: / (Homepage)
├── Hero Narrative & Pioneers (7 items) ───────> Mapped to Branch 1: branch-heritage (Pioneers Gallery)
├── About ACM-W & Chapter Vision (2 items) ────> Mapped to Organic Mosaic (Identity Region)
├── Chapter Metrics & Scale (2 items) ─────────> Mapped to Organic Mosaic (Telemetry Banner)
├── Global Navigation & Links (6 routes) ──────> Mapped to Persistent System Dock
└── Global ACM Membership Intercept (1 item) ──> Mapped to Global Intercept Modal

Live Route: /events
├── YŪGO’26 Healthcare AI Hackathon (1 item) ──> Mapped to Branch 3: branch-events (Flagship Events Arena)
├── Code in Tandem Pair Programming (1 item) ──> Mapped to Branch 3: branch-events & PDF Report Drawer
├── Women's Day Celebration (1 item) ──────────> Mapped to Branch 3: branch-events & Community Archive
└── Computational Thinking Workshop (1 item) ──> Mapped to Branch 4: branch-outreach (Workshop Module)

Live Route: /projects
├── Orderbook C++ HFT Matching Engine ─────────> Mapped to Branch 2: branch-systems (Systems Engineering)
├── IIsy Hybrid In-Network ML P4 Switch ───────> Mapped to Branch 2: branch-systems (Systems Engineering)
├── TCP Sniffer C++ Raw Socket Analyzer ───────> Mapped to Branch 2: branch-systems (Systems Engineering)
└── GitHub External Integration ───────────────> Mapped to Branch 2 Project Action Links

Live Route: /cspathshala
├── Initiative Purpose & Philosophy ───────────> Mapped to Branch 4: branch-outreach (Grassroots Outreach)
├── Unplugged Pedagogy Pillars (3 items) ──────> Mapped to Branch 4: branch-outreach (Pedagogy Module)
├── Session I November 2025 Gallery (6 photos) > Mapped to Branch 4: branch-outreach (Session I Carousel)
├── Session II February 2026 Gallery (6 photos)> Mapped to Branch 4: branch-outreach (Session II Carousel)
└── Student Volunteer Onboarding CTA ──────────> Mapped to Branch 4 Action Drawer & Volunteer Form

Live Route: /team
├── Faculty Coordinator Dr. P. Mirunalini ─────> Mapped to Branch 5: branch-council-gazette (Leadership)
├── 7 Elected Executive Student Officers ──────> Mapped to Branch 5: branch-council-gazette (2025–2026 Cohort)
├── 6 Domain Committees (27 members) ──────────> Mapped to Branch 5: branch-council-gazette (Committees Grid)
└── Official Team Roster PDF ──────────────────> Mapped to Branch 5 Dedicated Document Drawer

Live Route: /blog
├── March 2026 Newsletter (Vol 5.0) + PDF ─────> Mapped to Branch 5: branch-council-gazette (Featured Issue)
├── February 2026 Newsletter (Vol 4.0) + PDF ──> Mapped to Branch 5: branch-council-gazette (Archive)
├── January 2026 Newsletter (Vol 3.0) + PDF ───> Mapped to Branch 5: branch-council-gazette (Archive)
├── December 2025 Newsletter (Vol 2.0) + PDF ──> Mapped to Branch 5: branch-council-gazette (Archive)
└── September 2025 Newsletter (Vol 1.0) + PDF ─> Mapped to Branch 5: branch-council-gazette (Archive)
```

**Coverage Verification**: **100%** of all live content elements, media assets, downloadable publications, and navigational pathways have an explicit, confirmed destination in the canonical 5-branch V2 architecture.
