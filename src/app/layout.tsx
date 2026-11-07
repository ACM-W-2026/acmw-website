import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSN ACM-W Student Chapter",
  description: "The SSN ACM-W Student Chapter website.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
