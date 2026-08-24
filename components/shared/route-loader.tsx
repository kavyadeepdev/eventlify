"use client";

import KineticTextGrid from "@/components/shared/kinetic-text-grid";
import AfterClassMark from "@/components/brand/afterclass-mark";
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
      className="route-loader fixed inset-0 z-[100] overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label={`${loadingText}…`}
    >
      <KineticTextGrid
        text={loadingText}
        textColor="#d7ff38"
        backgroundColor="transparent"
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

      <div className="route-loader__topbar pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <span className="flex items-center gap-2.5">
          <AfterClassMark className="size-8" />
          <span className="text-base font-extrabold tracking-[-0.055em] text-white sm:text-lg">
            After<span className="text-limepop">Class</span>
          </span>
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.24em] text-white/55 sm:text-[9px]">
          BMSCE · After hours
        </span>
      </div>

      <span className="route-loader__sticker" aria-hidden="true">
        BMSCE / 26
      </span>

      <div className="route-loader__hud pointer-events-none absolute bottom-4 left-4 right-4 sm:bottom-7 sm:left-1/2 sm:right-auto sm:w-[30rem] sm:-translate-x-1/2">
        <div className="flex items-end justify-between gap-5">
          <span>
            <span className="block text-[8px] font-black uppercase tracking-[0.24em] text-white/45">
              Now loading
            </span>
            <strong className="display mt-1 block text-3xl leading-none text-white sm:text-4xl">
              {label}
            </strong>
          </span>
          <span className="route-loader__ready text-[9px] font-black uppercase tracking-[0.16em] text-limepop">
            Getting it ready
          </span>
        </div>
        <div className="route-loader__progress mt-3" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
