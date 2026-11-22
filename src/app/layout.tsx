import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSN ACM-W Student Chapter",
  description: "The official student chapter website of SSN ACM-W. Experience 'The Thread We Carry' and our Living Mosaic.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth bg-[#0D131C] text-[#F5F8FA]">
      <body className="min-h-screen bg-[#0D131C] text-[#F5F8FA] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:items-center focus:min-h-[44px] focus:px-4 focus:py-2 focus:bg-[#1595D0] focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-mono font-semibold tracking-wide"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
