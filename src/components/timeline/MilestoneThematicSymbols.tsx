"use client";

import React from "react";

interface ThematicSymbolProps {
  id: string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Custom-crafted thematic contribution talismans for each historical pioneer.
 * These vector symbols animate and unroll into the unbounded editorial text.
 */
export const MilestoneThematicSymbol: React.FC<ThematicSymbolProps> = ({
  id,
  className = "w-6 h-6",
  color: propColor = "#1595D0",
  style,
}) => {
  const color = (style?.color as string) || propColor;
  switch (id) {
    case "PION-01":
      // Ada Lovelace: Jacquard Loom / Babbage Analytical Cog
      return (
        <svg
          data-testid="thematic-symbol-pion-01"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="M4.93 4.93l2.12 2.12" />
          <path d="M16.95 16.95l2.12 2.12" />
          <path d="M4.93 19.07l2.12-2.12" />
          <path d="M16.95 7.05l2.12-2.12" />
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" opacity="0.6" />
        </svg>
      );

    case "PION-02":
      // Grace Hopper: Compiler & Terminal Logic Prompt
      return (
        <svg
          data-testid="thematic-symbol-pion-02"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
          <rect x="2" y="3" width="20" height="18" rx="3" opacity="0.4" />
        </svg>
      );

    case "PION-03":
      // Katherine Johnson: Orbital Mechanics & Space Trajectory
      return (
        <svg
          data-testid="thematic-symbol-pion-03"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <circle cx="12" cy="12" r="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)" />
          <circle cx="20" cy="8" r="1.5" fill={color} />
        </svg>
      );

    case "PION-04":
      // Margaret Hamilton: Apollo 11 Saturn V Rocket & Guidance Computer
      return (
        <svg
          data-testid="thematic-symbol-pion-04"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          <circle cx="15.5" cy="8.5" r="1.5" fill={color} />
        </svg>
      );

    case "PION-05":
      // Radia Perlman: Spanning Tree Protocol & Robust Network Mesh
      return (
        <svg
          data-testid="thematic-symbol-pion-05"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
          <circle cx="12" cy="13" r="2" />
          <line x1="12" y1="7.5" x2="12" y2="11" />
          <line x1="10.5" y1="14.5" x2="7.5" y2="17.5" />
          <line x1="13.5" y1="14.5" x2="16.5" y2="17.5" />
        </svg>
      );

    case "PION-06":
      // Fei-Fei Li: ImageNet & Visual Neural Intelligence
      return (
        <svg
          data-testid="thematic-symbol-pion-06"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <rect x="3" y="3" width="18" height="18" rx="3" opacity="0.5" />
          <circle cx="12" cy="12" r="3.5" />
          <line x1="3" y1="9" x2="21" y2="9" strokeDasharray="2 2" opacity="0.4" />
          <line x1="3" y1="15" x2="21" y2="15" strokeDasharray="2 2" opacity="0.4" />
          <line x1="9" y1="3" x2="9" y2="21" strokeDasharray="2 2" opacity="0.4" />
          <line x1="15" y1="3" x2="15" y2="21" strokeDasharray="2 2" opacity="0.4" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          className={className}
          style={style}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
};
