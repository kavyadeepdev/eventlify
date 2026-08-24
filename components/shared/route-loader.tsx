"use client";

import KineticTextGrid from "@/components/shared/kinetic-text-grid";
import { useNavigationLoaderActive } from "@/components/shared/route-loader-context";

type RouteLoaderProps = {
  label: string;
  primary?: boolean;
};

export default function RouteLoader({ label, primary = false }: RouteLoaderProps) {
  const navigationLoaderActive = useNavigationLoaderActive();
  const loadingText = `LOADING ${label}`.toUpperCase();

  // Route-level loading boundaries can mount underneath the global navigation
  // loader. Rendering only the primary grid avoids animating two expensive
  // clip-path fields at the same time.
  if (navigationLoaderActive && !primary) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-ink"
      role="status"
      aria-live="polite"
      aria-label={`${loadingText}…`}
    >
      <KineticTextGrid
        text={loadingText}
        textColor="#d7ff38"
        backgroundColor="#111116"
        rowCount={13}
        repeatCount={5}
        rowGap={16}
        wordGap={28}
        horizontalShiftPx={140}
        zoomScalePct={118}
        expandDurationSec={0.62}
        holdDurationSec={0.5}
        style={{
          position: "absolute",
          left: "-14vw",
          top: "-17.5vh",
          width: "128vw",
          height: "135vh",
          transform: "translateZ(0) rotate(-8deg)",
          transformOrigin: "center",
          contain: "layout paint style",
          textRendering: "optimizeSpeed",
        }}
        font={{
          fontFamily: "var(--font-anton), Arial Black, sans-serif",
          fontWeight: 400,
          fontSize: "clamp(3rem, 6vw, 5.8rem)",
          lineHeight: "0.86em",
          letterSpacing: "-0.02em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between border-b border-white/20 px-5 py-4 text-[9px] font-black uppercase tracking-[0.22em] text-white/55 sm:px-8">
        <span>AfterClass / BMSCE live</span>
        <span className="text-limepop">Please stand by</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/20 px-5 py-4 text-[9px] font-black uppercase tracking-[0.22em] text-white/55 sm:px-8">
        <span>{loadingText}</span>
        <span aria-hidden="true">● ● ●</span>
      </div>
    </div>
  );
}
