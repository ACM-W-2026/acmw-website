"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { LivingMosaic } from "../mosaic/LivingMosaic";
import { LivingFluidAtmosphere } from "../atmosphere/LivingFluidAtmosphere";
import { CHAPTER_INFO } from "../../data/acmwData";

interface MosaicHomePageProps {
  onNavigateTimeline?: () => void;
  onNavigateFacet?: (facetId: string) => void;
}

export const MosaicHomePage: React.FC<MosaicHomePageProps> = ({
  onNavigateTimeline,
  onNavigateFacet,
}) => {
  const router = useRouter();
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const handleTimeline = () => {
    if (onNavigateTimeline) onNavigateTimeline();
    else router.push("/");
  };

  const handleFacet = (id: string) => {
    if (onNavigateFacet) onNavigateFacet(id);
    else router.push(`/${id}`);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#04070C] text-[#F5F8FA] flex flex-col selection:bg-[#1595D0]/30 selection:text-white relative overflow-hidden">
      {/* Living Fluid Air-Pocket Physics Simulation behind the Mosaic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35" aria-hidden="true">
        <LivingFluidAtmosphere prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#04070C]/90 backdrop-blur-md border-b border-[#F5F8FA]/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTimeline}
              className="text-xs font-mono text-[#F5F8FA]/75 hover:text-[#1595D0] transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-[#1595D0]/30 hover:bg-[#1595D0]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Timeline Story</span>
            </button>
            <span className="text-[#F5F8FA]/30">|</span>
            <span className="font-serif font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              <span>SSN ACM-W · Living Mosaic Homepage</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-[#1595D0] px-3 py-1 rounded-full bg-[#1595D0]/15 border border-[#1595D0]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1595D0] animate-pulse" />
              {CHAPTER_INFO.charter}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Intro to Living Mosaic — Single Canonical Page H1 */}
      <section className="px-4 sm:px-8 pt-8 pb-3 max-w-7xl mx-auto w-full text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-[#1595D0] mb-2 px-3 py-1 rounded-full bg-[#1595D0]/10 border border-[#1595D0]/25">
          <Sparkles className="w-3 h-3 text-[#1595D0]" />
          <span>Interactive Chapter Universe</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F5F8FA] tracking-tight">
          The Living World of SSN ACM-W
        </h1>
      </section>

      {/* Centerpiece Living Mosaic Canvas */}
      <main className="flex-1 flex flex-col justify-center w-full relative z-10">
        <LivingMosaic
          focusedRegion={focusedRegion}
          setFocusedRegion={setFocusedRegion}
          onNavigateFacet={handleFacet}
        />
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-[#F5F8FA]/10 bg-[#04070C]/90 backdrop-blur-md px-4 sm:px-8 py-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F5F8FA]/60">
          <div className="flex items-center gap-2">
            <span className="text-[#1595D0] font-serif">✦</span>
            <span>{CHAPTER_INFO.charter} · Established {CHAPTER_INFO.established} · {CHAPTER_INFO.institution}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleTimeline}
              className="text-[#1595D0] hover:text-[#38BDF8] hover:underline transition-colors"
            >
              Revisit Timeline
            </button>
            <span className="text-white/20">|</span>
            <span>Faculty Sponsor: {CHAPTER_INFO.facultySponsor.name}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
