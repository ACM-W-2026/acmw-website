import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D131C] text-[#F5F8FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase mb-6 bg-[#ED247A]/15 border border-[#ED247A]/30 text-[#ED247A]">
        <span>Error 404 · Signal Lost</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-serif text-white mb-4">
        Unknown Coordinate
      </h1>
      <p className="text-sm sm:text-base text-[#F5F8FA]/70 max-w-md mb-8">
        The branch you seek has not diverged from our narrative thread. Return to the journey or visit our living chapter mosaic.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#1595D0] text-white font-mono text-xs font-semibold hover:bg-[#1595D0]/80 transition-colors shadow-lg shadow-[#1595D0]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Timeline</span>
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs font-semibold hover:bg-white/10 transition-colors"
        >
          <Compass className="w-4 h-4 text-[#1595D0]" />
          <span>Living Mosaic Home</span>
        </Link>
      </div>
    </div>
  );
}
