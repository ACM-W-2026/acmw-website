"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Home, Sparkles } from "lucide-react";
import { FacetDefinition, FACET_LIST } from "../../data/facets";
import { CHAPTER_INFO } from "../../data/acmwData";

interface FacetPageShellProps {
  facet: FacetDefinition;
  onNavigateHome?: () => void;
  onNavigateTimeline?: () => void;
  onNavigateFacet?: (facetId: string) => void;
  children: React.ReactNode;
}

export const FacetPageShell: React.FC<FacetPageShellProps> = ({
  facet,
  onNavigateHome,
  onNavigateTimeline,
  onNavigateFacet,
  children,
}) => {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#0D131C] text-[#F5F8FA] selection:bg-[#1595D0]/30 selection:text-white flex flex-col relative overflow-hidden">
      {/* Subtle Atmospheric Facet Accent Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div
          className="acmw-air-pocket-1 absolute -top-[15%] right-[5%] w-[680px] h-[680px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${facet.color}22 0%, ${facet.color}06 45%, transparent 70%)`,
          }}
        />
        <div
          className="acmw-air-pocket-2 absolute top-[45%] -left-[12%] w-[580px] h-[580px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(21,149,208,0.12) 0%, rgba(21,149,208,0.03) 45%, transparent 68%)",
          }}
        />
      </div>

      {/* Top Breadcrumb & Site Return Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0D131C]/90 backdrop-blur-md border-b border-[#F5F8FA]/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#F5F8FA]/60">
            <button
              onClick={handleTimeline}
              className="hover:text-[#1595D0] transition-colors flex items-center gap-1 min-h-[44px] px-1.5 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
              aria-label="Return to History Timeline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <span>/</span>
            <button
              onClick={handleHome}
              className="hover:text-[#1595D0] transition-colors flex items-center gap-1 min-h-[44px] px-1.5 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
              aria-label="Return to Mosaic Homepage"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Mosaic Home</span>
            </button>
            <span>/</span>
            <span className="text-[#1595D0] font-semibold">{facet.label}</span>
          </div>

          {/* Quick Facet Switcher */}
          <nav aria-label="Other Facets" className="hidden lg:flex items-center gap-1">
            {FACET_LIST.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFacet(f.id)}
                className={`text-xs px-3 py-2 min-h-[44px] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] ${
                  f.id === facet.id
                    ? "bg-[#1595D0]/20 text-[#1595D0] font-semibold border border-[#1595D0]/30"
                    : "text-[#F5F8FA]/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile/Tablet Swipeable Facet Navigation Strip */}
      <div
        className="lg:hidden border-b border-[#F5F8FA]/10 bg-[#0D131C]/80 backdrop-blur-md px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2 z-30"
        aria-label="Mobile Facet Selection"
      >
        {FACET_LIST.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFacet(f.id)}
            className={`text-xs whitespace-nowrap px-3.5 py-1.5 min-h-[40px] rounded-full transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] ${
              f.id === facet.id
                ? "bg-[#1595D0]/20 text-[#1595D0] font-semibold border border-[#1595D0]/40"
                : "text-[#F5F8FA]/60 hover:text-white hover:bg-white/5 border border-white/10"
            }`}
          >
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Main Page Header */}
      <section className="relative px-4 sm:px-8 pt-12 pb-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          {/* Badge Pill */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase mb-4 border"
            style={{
              backgroundColor: `${facet.color}15`,
              borderColor: `${facet.color}40`,
              color: facet.color,
            }}
          >
            <Sparkles className="w-3 h-3" />
            {facet.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-[#F5F8FA] tracking-tight">
            {facet.label}
          </h1>
        </div>
      </section>

      {/* Page Content Body */}
      <main id="main-content" className="flex-1 px-4 sm:px-8 pb-16 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Institutional Governance Footer */}
      <footer className="border-t border-[#F5F8FA]/10 bg-[#0D131C] px-4 sm:px-8 py-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-serif font-semibold text-lg text-white">
                SSN ACM-W Student Chapter
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1595D0]/20 text-[#1595D0] border border-[#1595D0]/30">
                {CHAPTER_INFO.charter}
              </span>
            </div>
            <p className="text-xs text-[#F5F8FA]/60 font-sans max-w-md">
              {CHAPTER_INFO.institution} · {CHAPTER_INFO.location}. Faculty Coordinator: {CHAPTER_INFO.facultySponsor.name}.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleHome}
              className="text-xs font-mono min-h-[44px] px-4 py-2.5 rounded-lg bg-[#1595D0]/10 border border-[#1595D0]/30 text-[#1595D0] hover:bg-[#1595D0]/20 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Return to Living Mosaic</span>
            </button>
            <button
              onClick={handleTimeline}
              className="text-xs font-mono min-h-[44px] px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#F5F8FA]/75 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
            >
              Revisit Timeline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
