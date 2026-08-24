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
  // loader. Rendering only the primary grid avoids animating two grids at once.
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
        rowCount={13}
        repeatCount={3}
        rowGap={14}
        wordGap={24}
        horizontalShiftPx={110}
        zoomScalePct={112}
        font={{
          fontFamily: "var(--font-anton), Arial Black, sans-serif",
          fontWeight: 400,
          // Sized off viewport *height* so a fixed row count fills the screen
          // on any device. Width-based sizing left phones with a thin band of
          // text floating in an empty field.
          fontSize: "clamp(1.75rem, max(6vw, 8.2vh), 5.5rem)",
          lineHeight: "0.86em",
          letterSpacing: "-0.02em",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      />
    </div>
  );
}
