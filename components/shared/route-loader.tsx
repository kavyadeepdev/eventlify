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
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-ink"
      role="status"
      aria-live="polite"
      aria-label={`${loadingText}…`}
    >
      <KineticTextGrid
        text={loadingText}
        textColor="#d7ff38"
        backgroundColor="#111116"
        rowCount={9}
        repeatCount={3}
        rowGap={14}
        wordGap={24}
        horizontalShiftPx={110}
        zoomScalePct={114}
        expandDurationSec={0.5}
        holdDurationSec={0.35}
        style={{
          position: "absolute",
          left: "-10vw",
          top: "-6vh",
          width: "120vw",
          height: "112vh",
          transform: "translateZ(0) rotate(-10deg)",
          transformOrigin: "center",
          contain: "layout paint style",
          textRendering: "optimizeSpeed",
        }}
        font={{
          fontFamily: "var(--font-anton), Arial Black, sans-serif",
          fontWeight: 400,
          fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
          lineHeight: "0.86em",
          letterSpacing: "-0.02em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      />
    </div>
  );
}
