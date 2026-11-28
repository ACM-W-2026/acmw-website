"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FacetId, FACET_DEFINITIONS } from "../../data/facets";
import { FacetPageShell } from "../layout/FacetPageShell";
import {
  CHAPTER_INFO,
  EVENTS,
  PROJECTS,
  OUTREACH,
  INTEGRATIONS,
  NEWSLETTERS,
} from "../../data/acmwData";
import {
  ExternalLink,
  Shield,
  Users,
  CheckCircle2,
  FileText,
  Play,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Cleared public event documentation reports (DOCS-01, DOCS-02)
const PUBLIC_REPORTS = [
  {
    id: "DOCS-01",
    title: "Official Code in Tandem Report",
    fileName: "3 - ACM-W Code in Tandem - Event Report.pdf",
    category: "report",
    description: "Official event report for Code in Tandem pair-programming contest.",
  },
  {
    id: "DOCS-02",
    title: "Official Women's Day Report",
    fileName: "Womens-Day-Event-Report.pdf",
    category: "report",
    description: "Official report for Women's Day celebration and AdZap challenge.",
  },
];

interface FacetPageProps {
  facetId: FacetId;
  onNavigateHome?: () => void;
  onNavigateTimeline?: () => void;
  onNavigateFacet?: (id: string) => void;
}

export const FacetPage: React.FC<FacetPageProps> = ({
  facetId,
  onNavigateHome,
  onNavigateTimeline,
  onNavigateFacet,
}) => {
  const router = useRouter();
  const facet = FACET_DEFINITIONS[facetId];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleHome = () => {
    if (onNavigateHome) onNavigateHome();
    else router.push("/home");
  };

  const handleTimeline = () => {
    if (onNavigateTimeline) onNavigateTimeline();
    else router.push("/");
  };

  const handleFacet = (id: string) => {
    if (onNavigateFacet) onNavigateFacet(id);
    else router.push(`/${id}`);
  };

  // Keep full-page item details in browser history so Back/Forward and the
  // explicit return control behave identically. Preserve the collection scroll
  // position on the collection history entry before pushing a detail entry.
  useEffect(() => {
    const syncDetailFromLocation = (restoreCollectionScroll = false) => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash.startsWith("event-")) {
        setSelectedEventId(hash.slice("event-".length));
        setSelectedProjectId(null);
        return;
      }
      if (hash.startsWith("proj-")) {
        setSelectedProjectId(hash.slice("proj-".length));
        setSelectedEventId(null);
        return;
      }

      setSelectedEventId(null);
      setSelectedProjectId(null);
      const savedScrollY = window.history.state?.facetCollectionScrollY;
      if (restoreCollectionScroll && typeof savedScrollY === "number") {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollY, behavior: "instant" });
        });
      }
    };

    const handlePopState = () => syncDetailFromLocation(true);
    const handleHashChange = () => syncDetailFromLocation(false);

    syncDetailFromLocation(false);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const pushDetailHistoryEntry = (detailType: "event" | "project", id: string) => {
    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};
    window.history.replaceState(
      { ...currentState, facetCollectionScrollY: window.scrollY },
      "",
      window.location.pathname
    );
    const hash = detailType === "event" ? `event-${id}` : `proj-${id}`;
    window.history.pushState(
      { facetDetail: true, detailType, detailId: id },
      "",
      `${window.location.pathname}#${hash}`
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const openEventDetail = (id: string) => {
    pushDetailHistoryEntry("event", id);
    setSelectedEventId(id);
    setSelectedProjectId(null);
  };

  const openProjectDetail = (id: string) => {
    pushDetailHistoryEntry("project", id);
    setSelectedProjectId(id);
    setSelectedEventId(null);
  };

  const closeDetail = () => {
    if (window.history.state?.facetDetail === true) {
      window.history.back();
      return;
    }
    // A direct deep link may not have a matching collection entry to go back to.
    window.history.replaceState(null, "", window.location.pathname);
    setSelectedEventId(null);
    setSelectedProjectId(null);
  };

  if (!facet) return <div>Facet not found</div>;

  const activeEvent = selectedEventId ? EVENTS.find((e) => e.id === selectedEventId) : null;
  const activeProject = selectedProjectId ? PROJECTS.find((p) => p.id === selectedProjectId) : null;

  return (
    <FacetPageShell
      facet={facet}
      onNavigateHome={handleHome}
      onNavigateTimeline={handleTimeline}
      onNavigateFacet={handleFacet}
    >
      {/* ========================================================================= */}
      {/* 1. ROUTE-AWARE FULL-PAGE EVENT DETAIL VIEW                                */}
      {/* Occupies normal document flow, restoring collection on return             */}
      {/* ========================================================================= */}
      {facetId === "events" && activeEvent ? (
        <div className="space-y-8 animate-fadeIn max-w-5xl">
          <button
            data-testid="return-to-collection"
            onClick={closeDetail}
            className="inline-flex items-center gap-2 text-xs font-mono min-h-[44px] px-2 py-1 rounded text-[#278F9B] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#278F9B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Return to Events Collection</span>
          </button>

          <article className="relative p-6 sm:p-10 rounded-2xl bg-[#0D121D]/95 border border-[#278F9B]/40 shadow-2xl space-y-6 overflow-hidden">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#278F9B]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#278F9B]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#278F9B]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#278F9B]/50" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-[#278F9B]/20 text-[#278F9B] border border-[#278F9B]/30 text-xs font-mono font-semibold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B] animate-pulse" />
                {activeEvent.scale}
              </span>
              <span className="text-xs font-mono text-[#F5F8FA]/60">
                {activeEvent.date}{activeEvent.participants ? ` · ${activeEvent.participants}` : ""}
              </span>
            </div>

            <h2 id="event-modal-title" className="text-3xl sm:text-4xl font-serif text-white">
              {activeEvent.title}{activeEvent.id !== "EVNT-01" ? ` ${activeEvent.edition}` : ""}
            </h2>

            <p className="text-base sm:text-lg text-[#F5F8FA]/85 leading-relaxed max-w-4xl">
              {activeEvent.description}
            </p>

            {/* Highlights Grid */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono text-[#278F9B] uppercase tracking-wider mb-3">Key Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeEvent.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-[#F5F8FA]/80">
                    <CheckCircle2 className="w-4 h-4 text-[#278F9B] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            {activeEvent.media.gallery && activeEvent.media.gallery.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-mono text-[#278F9B] uppercase tracking-wider mb-3">
                  Event Gallery ({activeEvent.media.gallery.length} Cleared Photographs)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeEvent.media.gallery.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={img}
                        alt={`${activeEvent.title} photograph ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 2. ROUTE-AWARE FULL-PAGE PROJECT DETAIL VIEW                              */}
      {/* Occupies normal document flow, restoring collection on return             */}
      {/* ========================================================================= */}
      {facetId === "projects" && activeProject ? (
        <div className="space-y-8 animate-fadeIn max-w-5xl">
          <button
            data-testid="return-to-collection"
            onClick={closeDetail}
            className="inline-flex items-center gap-2 text-xs font-mono min-h-[44px] px-2 py-1 rounded text-[#1595D0] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Return to Projects Collection</span>
          </button>

          <article className="relative p-6 sm:p-10 rounded-2xl bg-[#0D121D]/95 border border-[#1595D0]/40 shadow-2xl space-y-6 overflow-hidden">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#1595D0]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#1595D0]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#1595D0]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#1595D0]/50" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-[#1595D0]/20 text-[#1595D0] border border-[#1595D0]/30 text-xs font-mono font-semibold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0] animate-pulse" />
                {activeProject.category}
              </span>
              <span className="text-xs font-mono text-[#1595D0]">
                Implementation note: {activeProject.impact}
              </span>
            </div>

            <h2 id="project-modal-title" className="text-3xl sm:text-4xl font-serif text-white">
              {activeProject.title}
            </h2>

            <p className="text-base sm:text-lg text-[#F5F8FA]/85 leading-relaxed max-w-4xl">
              {activeProject.summary}
            </p>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono text-[#1595D0] uppercase tracking-wider mb-3">Technical Taxonomy</h3>
              <div className="flex flex-wrap gap-2">
                {activeProject.tags.map((t, i) => (
                  <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#F5F8FA]/90">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[#F5F8FA]/60">Lead: {activeProject.lead}</span>
              <a
                href="https://github.com/SSN-ACM-W"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#1595D0]/20 text-[#1595D0] border border-[#1595D0]/30 hover:bg-[#1595D0]/30 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
              >
                <span>SSN ACM-W GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 3. ABOUT FACET COLLECTION                                                 */}
      {/* ========================================================================= */}
      {facetId === "about" && (
        <div className="space-y-12">
          {/* Chapter Overview Card */}
          <section className="relative p-6 sm:p-8 rounded-2xl bg-[#0D131C]/90 border border-[#1595D0]/30 shadow-xl overflow-hidden">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#1595D0]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#1595D0]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#1595D0]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#1595D0]/50" />

            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1595D0]/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F8FA] mb-4">
              Advancing Women in Computing Since 2018
            </h2>
            <p className="text-sm sm:text-base text-[#F5F8FA]/80 leading-relaxed mb-6 max-w-3xl">
              Chartered in 2018 at SSN College of Engineering, the SSN ACM-W Student Chapter supports,
              celebrates, and advocates for women in technology through rigorous research, competitive
              programming, technical systems development, and grassroots community outreach.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F5F8FA]/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xs font-mono text-[#1595D0] mb-1">OFFICIAL CHARTER</span>
                <span className="text-base font-serif font-semibold text-white">{CHAPTER_INFO.charter}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xs font-mono text-[#1595D0] mb-1">ESTABLISHED</span>
                <span className="text-base font-serif font-semibold text-white">{CHAPTER_INFO.established}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-xs font-mono text-[#1595D0] mb-1">FACULTY SPONSOR</span>
                <span className="text-base font-serif font-semibold text-white">{CHAPTER_INFO.facultySponsor.name}</span>
              </div>
            </div>
          </section>

          {/* Official Document Reports */}
          <section>
            <h3 className="text-xl font-serif text-[#F5F8FA] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1595D0]" />
              Official Documentation & Event Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PUBLIC_REPORTS.map((doc) => (
                <div
                  key={doc.id}
                  className="relative p-5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4 hover:border-[#1595D0]/40 transition-all duration-300 shadow-md group overflow-hidden"
                >
                  <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#1595D0]/30 group-hover:border-[#1595D0]/70 transition-colors" />
                  <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#1595D0]/30 group-hover:border-[#1595D0]/70 transition-colors" />
                  <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#1595D0]/30 group-hover:border-[#1595D0]/70 transition-colors" />
                  <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#1595D0]/30 group-hover:border-[#1595D0]/70 transition-colors" />

                  <div>
                    <span className="text-[10px] font-mono text-[#1595D0] uppercase block mb-1 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0]" />
                      {doc.category}
                    </span>
                    <h4 className="text-base font-serif font-medium text-white mb-1 group-hover:text-[#38BDF8] transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-[#F5F8FA]/70">{doc.description}</p>
                  </div>
                  <span className="text-xs font-mono text-[#F5F8FA]/50 shrink-0 px-2.5 py-1 rounded bg-black/50 border border-white/10 group-hover:border-[#1595D0]/40 transition-colors">
                    {doc.fileName.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EVENTS FACET COLLECTION                                                */}
      {/* ========================================================================= */}
      {facetId === "events" && !activeEvent && (
        <div className="space-y-12">
          {/* Marquee Event: YŪGO'26 */}
          {(() => {
            const yugo = EVENTS.find((e) => e.id === "EVNT-01");
            if (!yugo) return null;
            return (
              <section className="relative p-6 sm:p-8 rounded-2xl bg-[#0D131C]/90 border border-[#278F9B]/40 shadow-xl overflow-hidden group">
                {/* Archival corner brackets */}
                <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#278F9B]/50" />
                <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#278F9B]/50" />
                <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#278F9B]/50" />
                <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#278F9B]/50" />

                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#278F9B]/20 text-[#278F9B] border border-[#278F9B]/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B] animate-pulse" />
                    {yugo.scale}
                  </span>
                  <span className="text-xs font-mono text-[#F5F8FA]/60">{yugo.date}{yugo.participants ? ` · ${yugo.participants}` : ""}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif text-white mb-3">
                  {yugo.title}
                </h2>
                <p className="text-sm sm:text-base text-[#F5F8FA]/80 leading-relaxed mb-6 max-w-4xl">
                  {yugo.description}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {yugo.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F5F8FA]/80">
                      <CheckCircle2 className="w-4 h-4 text-[#278F9B] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Cleared Photo Gallery */}
                {yugo.media.gallery && yugo.media.gallery.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-[#278F9B] tracking-wider uppercase mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B]" />
                      Cleared Event Photo Gallery ({yugo.media.gallery.length} Images)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {yugo.media.gallery.map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner">
                          <img
                            src={img}
                            alt={`YŪGO'26 Event photograph ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="eager"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Actions & Full-Page Detail Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                  {yugo.media.videoUrl && (
                    <div className="flex items-center gap-2 text-[#278F9B]">
                      <Play className="w-4 h-4" />
                      <span>Highlight Reel: {yugo.media.videoUrl.split("/").pop()}</span>
                    </div>
                  )}
                  <button
                    data-testid="open-event-detail"
                    onClick={() => openEventDetail(yugo.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#278F9B]/20 text-[#278F9B] border border-[#278F9B]/30 hover:bg-[#278F9B]/30 hover:shadow-[0_0_16px_rgba(39,143,155,0.3)] transition-all font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#278F9B]"
                  >
                    <span>View Event Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            );
          })()}

          {/* Bespoke Collegiate Exhibition Cards */}
          <section>
            <h3 className="text-xl font-serif text-white mb-4">Collegiate Competitions & Regional Gatherings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {EVENTS.filter((e) => e.id !== "EVNT-01").map((evt) => (
                <article
                  key={evt.id}
                  className="relative p-5 sm:p-6 rounded-2xl bg-[#0D121D]/90 border border-[#278F9B]/30 flex flex-col justify-between shadow-lg transition-all duration-300 hover:border-[#278F9B]/60 hover:shadow-[0_0_20px_rgba(39,143,155,0.2)] group overflow-hidden"
                >
                  {/* Metallic corner brackets */}
                  <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t border-l border-[#278F9B]/40 group-hover:border-[#278F9B]/80 transition-colors" />
                  <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t border-r border-[#278F9B]/40 group-hover:border-[#278F9B]/80 transition-colors" />
                  <div className="pointer-events-none absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#278F9B]/40 group-hover:border-[#278F9B]/80 transition-colors" />
                  <div className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#278F9B]/40 group-hover:border-[#278F9B]/80 transition-colors" />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#278F9B]/15 text-[#278F9B] border border-[#278F9B]/30 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B]" />
                        {evt.scale}
                      </span>
                      <span className="text-[11px] font-mono text-[#F5F8FA]/50">{evt.date}</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-white mb-2 leading-snug group-hover:text-[#38BDF8] transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-[#F5F8FA]/75 line-clamp-3 leading-relaxed mb-4">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F5F8FA]/10 flex items-center justify-between">
                    {evt.participants && (
                      <span className="text-[11px] font-mono text-[#F5F8FA]/50">{evt.participants}</span>
                    )}
                    <button
                      data-testid={`open-event-detail-${evt.id}`}
                      onClick={() => openEventDetail(evt.id)}
                      className="text-xs font-mono text-[#278F9B] hover:underline flex items-center gap-1 font-semibold min-h-[44px] px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#278F9B]"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PROJECTS FACET COLLECTION                                              */}
      {/* ========================================================================= */}
      {facetId === "projects" && !activeProject && (
        <div className="space-y-12">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map((proj) => (
              <article
                key={proj.id}
                className="relative p-6 rounded-2xl bg-[#0D121D]/95 border border-[#1595D0]/30 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-[#1595D0]/70 hover:shadow-[0_0_25px_rgba(21,149,208,0.2)] group overflow-hidden"
              >
                {/* Metallic corner brackets */}
                <div className="pointer-events-none absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#1595D0]/40 group-hover:border-[#1595D0]/80 transition-colors" />
                <div className="pointer-events-none absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-[#1595D0]/40 group-hover:border-[#1595D0]/80 transition-colors" />
                <div className="pointer-events-none absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-[#1595D0]/40 group-hover:border-[#1595D0]/80 transition-colors" />
                <div className="pointer-events-none absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[#1595D0]/40 group-hover:border-[#1595D0]/80 transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#1595D0]/15 text-[#1595D0] border border-[#1595D0]/30 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0] animate-pulse" />
                      {proj.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#38BDF8] transition-colors">{proj.title}</h3>
                  <p className="text-xs text-[#F5F8FA]/80 leading-relaxed mb-4">{proj.summary}</p>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                    <span className="block text-[10px] font-mono text-[#1595D0] uppercase mb-1">Implementation</span>
                    <span className="text-xs text-[#F5F8FA]/90">{proj.impact}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {proj.tags.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#F5F8FA]/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F5F8FA]/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#F5F8FA]/50">{proj.lead}</span>
                  <button
                    data-testid={`open-project-detail-${proj.id}`}
                    onClick={() => openProjectDetail(proj.id)}
                    className="inline-flex items-center gap-1 text-[#1595D0] hover:underline font-semibold min-h-[44px] px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
                  >
                    <span>Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. OUTREACH FACET COLLECTION                                              */}
      {/* ========================================================================= */}
      {facetId === "outreach" && (
        <div className="space-y-12">
          {/* Key Initiative: CSpathshala */}
          <section className="relative p-6 sm:p-8 rounded-2xl bg-[#0D131C]/90 border border-[#278F9B]/30 shadow-xl overflow-hidden group">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#278F9B]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#278F9B]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#278F9B]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#278F9B]/50" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#278F9B]/15 text-[#278F9B] border border-[#278F9B]/30 text-xs font-mono font-semibold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B] animate-pulse" />
                Primary Chapter Initiative
              </span>
              <span className="text-xs font-mono text-[#F5F8FA]/60">{OUTREACH.initiative}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white mb-3">
              Computational Thinking for Rural Tamil Nadu
            </h2>
            <p className="text-sm sm:text-base text-[#F5F8FA]/80 leading-relaxed mb-6 max-w-3xl">
              {OUTREACH.description}
            </p>

            {/* Verified Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 mb-6">
              <div className="relative p-4 rounded-xl bg-black/40 border border-[#278F9B]/30 shadow-inner group/stat hover:border-[#278F9B]/60 transition-colors">
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#278F9B]">
                  5+
                </span>
                <span className="text-xs font-mono text-[#F5F8FA]/70">Schools Adopted Annually</span>
              </div>
              <div className="relative p-4 rounded-xl bg-black/40 border border-[#278F9B]/30 shadow-inner group/stat hover:border-[#278F9B]/60 transition-colors">
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#278F9B]">
                  10+
                </span>
                <span className="text-xs font-mono text-[#F5F8FA]/70">Interactive Workshops</span>
              </div>
              <div className="relative p-4 rounded-xl bg-black/40 border border-[#278F9B]/30 shadow-inner group/stat hover:border-[#278F9B]/60 transition-colors">
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-[#278F9B]">
                  1.6M
                </span>
                <span className="text-xs font-mono text-[#F5F8FA]/70">National Reach Across India</span>
              </div>
            </div>

            {/* Strict Child Privacy Notice */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-[#278F9B]/30 flex items-center gap-3 text-xs font-mono text-[#278F9B]">
              <Shield className="w-4 h-4 shrink-0 text-[#278F9B]" />
              <span>{OUTREACH.privacyNotice}</span>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TEAM FACET COLLECTION                                                  */}
      {/* ========================================================================= */}
      {facetId === "team" && (
        <div className="space-y-12">
          {/* Faculty Leadership */}
          <section className="relative p-6 sm:p-8 rounded-2xl bg-[#0D131C]/90 border border-[#C96C8E]/30 shadow-xl flex flex-col sm:flex-row items-center gap-6 overflow-hidden group">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C96C8E]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#C96C8E]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#C96C8E]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#C96C8E]/50" />

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-[#C96C8E]/60 shadow-[0_0_16px_rgba(201,108,142,0.25)] bg-black/40 flex items-center justify-center">
              {CHAPTER_INFO.facultySponsor.avatarUrl ? (
                <img
                  src={CHAPTER_INFO.facultySponsor.avatarUrl}
                  alt={`Portrait of ${CHAPTER_INFO.facultySponsor.name}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#C96C8E]/15 text-[#C96C8E]">
                  <span className="font-serif font-bold text-2xl">PM</span>
                  <span className="text-[9px] font-mono tracking-wider uppercase mt-0.5 text-[#C96C8E]/75">SSN CSE</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-mono text-[#1595D0] tracking-wider uppercase block mb-1 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0] animate-pulse" />
                FACULTY ADVISOR & SPONSOR
              </span>
              <h2 className="text-2xl font-serif text-white mb-1">
                {CHAPTER_INFO.facultySponsor.name}
              </h2>
              <p className="text-sm font-sans text-[#F5F8FA]/75 mb-2">
                {CHAPTER_INFO.facultySponsor.title} · {CHAPTER_INFO.facultySponsor.department}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F5F8FA]/60 px-2.5 py-1 rounded bg-white/5 border border-white/5">
                <Mail className="w-3.5 h-3.5 text-[#1595D0]" />
                <span>{INTEGRATIONS.find((i) => i.id === "INTG-01")?.data.chapterEmail || "acm-w@ssn.edu.in"}</span>
              </div>
            </div>
          </section>

          {/* Institutional Governance Pillars */}
          <section>
            <h3 className="text-xl font-serif text-white mb-4">Chapter Governance & Institutional Pillars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <article className="relative p-5 rounded-2xl bg-[#0D121D]/90 border border-white/10 hover:border-[#C96C8E]/50 transition-colors flex flex-col justify-between shadow-lg overflow-hidden group">
                <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#C96C8E]/40" />
                <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#C96C8E]/40" />
                <div>
                  <span className="text-[10px] font-mono text-[#C96C8E] uppercase block mb-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C96C8E]" />
                    GOVERNANCE CHARTER
                  </span>
                  <h4 className="text-base font-serif font-bold text-white mb-1">
                    {CHAPTER_INFO.charter}
                  </h4>
                  <p className="text-xs font-sans text-[#F5F8FA]/60">Established {CHAPTER_INFO.established}</p>
                </div>
              </article>
              <article className="relative p-5 rounded-2xl bg-[#0D121D]/90 border border-white/10 hover:border-[#1595D0]/50 transition-colors flex flex-col justify-between shadow-lg overflow-hidden group">
                <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#1595D0]/40" />
                <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#1595D0]/40" />
                <div>
                  <span className="text-[10px] font-mono text-[#1595D0] uppercase block mb-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0]" />
                    HOST INSTITUTION
                  </span>
                  <h4 className="text-base font-serif font-bold text-white mb-1">
                    {CHAPTER_INFO.institution}
                  </h4>
                  <p className="text-xs font-sans text-[#F5F8FA]/60">{CHAPTER_INFO.location}</p>
                </div>
              </article>
              <article className="relative p-5 rounded-2xl bg-[#0D121D]/90 border border-white/10 hover:border-[#278F9B]/50 transition-colors flex flex-col justify-between shadow-lg overflow-hidden group">
                <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#278F9B]/40" />
                <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#278F9B]/40" />
                <div>
                  <span className="text-[10px] font-mono text-[#278F9B] uppercase block mb-1 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#278F9B]" />
                    TECHNICAL MISSION
                  </span>
                  <h4 className="text-base font-serif font-bold text-white mb-1">
                    Women in Computing
                  </h4>
                  <p className="text-xs font-sans text-[#F5F8FA]/60">Research, Systems &amp; Hackathons</p>
                </div>
              </article>
            </div>
          </section>

          {/* Published chapter newsletters — all five editions are cleared for public distribution. */}
          <section aria-labelledby="chapter-gazette-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-[#C96C8E] uppercase font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C96C8E]" />
                  Published archive
                </span>
                <h3 id="chapter-gazette-heading" className="text-xl sm:text-2xl font-serif text-white mt-1">
                  Chapter Gazette
                </h3>
              </div>
              <span className="text-xs font-mono text-[#F5F8FA]/55">
                {NEWSLETTERS.filter((issue) => issue.publicationStatus === "published" && issue.mediaClearanceStatus === "cleared-public").length} public editions
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {NEWSLETTERS
                .filter((issue) => issue.publicationStatus === "published" && issue.mediaClearanceStatus === "cleared-public")
                .map((issue) => (
                  <article
                    key={issue.id}
                    data-testid={`newsletter-card-${issue.id}`}
                    className="relative flex flex-col p-5 rounded-2xl bg-[#0D121D]/90 border border-[#C96C8E]/25 hover:border-[#C96C8E]/60 hover:shadow-[0_0_20px_rgba(201,108,142,0.18)] transition-all duration-300 shadow-lg overflow-hidden group"
                  >
                    {/* Metallic corner brackets */}
                    <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t border-l border-[#C96C8E]/40 group-hover:border-[#C96C8E]/80 transition-colors" />
                    <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t border-r border-[#C96C8E]/40 group-hover:border-[#C96C8E]/80 transition-colors" />
                    <div className="pointer-events-none absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#C96C8E]/40 group-hover:border-[#C96C8E]/80 transition-colors" />
                    <div className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#C96C8E]/40 group-hover:border-[#C96C8E]/80 transition-colors" />

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[10px] font-mono tracking-wider text-[#C96C8E] uppercase font-semibold">
                        {issue.volume}
                      </span>
                      {issue.featured && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#278F9B] px-2 py-0.5 rounded-full bg-[#278F9B]/15 border border-[#278F9B]/30 font-semibold">
                          Featured issue
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-serif font-semibold text-white leading-snug">
                      {issue.title}
                    </h4>
                    <p className="text-xs font-mono text-[#F5F8FA]/55 mt-1 mb-3">
                      {issue.month}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {issue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono px-2 py-1 rounded-md bg-white/5 text-[#F5F8FA]/65"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#F5F8FA]/75 leading-relaxed flex-1 mb-5">
                      {issue.opportunities.slice(0, 2).map((opportunity) => (
                        <li key={opportunity} className="flex items-start gap-2">
                          <span className="text-[#C96C8E] mt-0.5">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                      {issue.opportunities.length > 2 && (
                        <li className="text-[#F5F8FA]/45 pl-3">
                          +{issue.opportunities.length - 2} more in this issue
                        </li>
                      )}
                    </ul>
                    <a
                      data-testid={`newsletter-link-${issue.id}`}
                      href={issue.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 rounded-lg border border-[#C96C8E]/35 text-[#C96C8E] hover:bg-[#C96C8E]/10 transition-colors text-xs font-mono font-semibold w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C96C8E]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Read issue
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </article>
                ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. JOIN US FACET COLLECTION                                               */}
      {/* ========================================================================= */}
      {facetId === "join-us" && (
        <div className="space-y-12">
          <section className="relative p-6 sm:p-8 rounded-2xl bg-[#0D131C]/90 border border-[#ED247A]/30 shadow-xl overflow-hidden group">
            {/* Archival corner brackets */}
            <div className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t border-l border-[#ED247A]/50" />
            <div className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t border-r border-[#ED247A]/50" />
            <div className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#ED247A]/50" />
            <div className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#ED247A]/50" />

            <h2 className="text-2xl sm:text-3xl font-serif text-white mb-4">
              Step Into Our Living Story
            </h2>
            <p className="text-sm sm:text-base text-[#F5F8FA]/80 leading-relaxed mb-8 max-w-3xl">
              SSN ACM-W is an open technical community. Whether you are an undergraduate exploring your first algorithm,
              a senior preparing for systems research, or a faculty collaborator, we offer structured mentorship, peer fellowship,
              and hackathon development teams.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Chapter Membership */}
              <div className="relative p-6 rounded-2xl bg-[#0D121D]/90 border border-[#1595D0]/30 hover:border-[#1595D0]/60 transition-all duration-300 flex flex-col justify-between shadow-lg overflow-hidden group/path">
                <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t border-l border-[#1595D0]/40" />
                <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t border-r border-[#1595D0]/40" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#1595D0] uppercase mb-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0] animate-pulse" />
                    <Users className="w-4 h-4" />
                    <span>Student Pathways</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover/path:text-[#38BDF8] transition-colors">
                    Chapter Registration (INTG-01)
                  </h3>
                  <p className="text-xs text-[#F5F8FA]/75 mb-6 leading-relaxed">
                    Official registration for current SSN students. Access peer mentorship, hackathon sponsorship, and reading groups.
                  </p>
                </div>
                <a
                  href={INTEGRATIONS.find((i) => i.id === "INTG-01")?.data.googleFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#1595D0]/20 text-[#1595D0] border border-[#1595D0]/30 hover:bg-[#1595D0]/30 hover:shadow-[0_0_16px_rgba(21,149,208,0.25)] transition-all text-xs font-mono font-semibold w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
                >
                  <span>Student Application Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Global ACM-W Community */}
              <div className="relative p-6 rounded-2xl bg-[#0D121D]/90 border border-[#ED247A]/30 hover:border-[#ED247A]/60 transition-all duration-300 flex flex-col justify-between shadow-lg overflow-hidden group/path">
                <div className="pointer-events-none absolute top-2 left-2 w-2 h-2 border-t border-l border-[#ED247A]/40" />
                <div className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t border-r border-[#ED247A]/40" />
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#ED247A] uppercase mb-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ED247A] animate-pulse" />
                    <Users className="w-4 h-4" />
                    <span>Global Membership</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover/path:text-[#F472B6] transition-colors">
                    ACM Global Onboarding (INTG-03)
                  </h3>
                  <p className="text-xs text-[#F5F8FA]/75 mb-6 leading-relaxed">
                    Join the Association for Computing Machinery globally to unlock student chapters and publications.
                  </p>
                </div>
                <a
                  href={INTEGRATIONS.find((i) => i.id === "INTG-03")?.data.membershipUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#ED247A]/20 text-[#ED247A] border border-[#ED247A]/30 hover:bg-[#ED247A]/30 hover:shadow-[0_0_16px_rgba(237,36,122,0.25)] transition-all text-xs font-mono font-semibold w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED247A]"
                >
                  <span>ACM Membership Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Official Contact */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#F5F8FA]/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1595D0]" />
                <span>
                  Chapter Inquiries:{" "}
                  {INTEGRATIONS.find((i) => i.id === "INTG-01")?.data.chapterEmail}
                </span>
              </div>
              <div>
                <span>Location: {CHAPTER_INFO.location}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </FacetPageShell>
  );
};
