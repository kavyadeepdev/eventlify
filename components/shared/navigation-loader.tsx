"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import RouteLoader from "@/components/shared/route-loader";
import { NavigationLoaderProvider } from "@/components/shared/route-loader-context";

const MINIMUM_DISPLAY_MS = 650;
const SAFETY_TIMEOUT_MS = 5000;

function humanizeSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getLoadingLabel(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] === "events") {
    if (segments[1]) return "event";
    return "events";
  }

  if (segments[0] === "clubs") {
    if (segments[1]) return "club";
    return "clubs";
  }

  if (segments[0] === "dashboard") return "your pass";
  if (segments[0] === "login") return "sign in";
  if (segments[0] === "signup") return "your account";
  if (segments.length === 0) return "BMSCE";

  return humanizeSegment(segments.at(-1) ?? "BMSCE");
}

export default function NavigationLoader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [label, setLabel] = useState("BMSCE");
  const [visible, setVisible] = useState(false);
  const startedAt = useRef(0);
  const previousPathname = useRef(pathname);
  const resetScrollOnNavigation = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };

    const showLoader = (nextLabel: string) => {
      clearTimers();
      startedAt.current = performance.now();
      setLabel(nextLabel);
      setVisible(true);
      safetyTimer.current = setTimeout(
        () => setVisible(false),
        SAFETY_TIMEOUT_MS
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noLoader === "true"
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.href === window.location.href ||
        (url.pathname === window.location.pathname && !url.search)
      ) {
        return;
      }

      resetScrollOnNavigation.current =
        url.pathname !== window.location.pathname;

      showLoader(getLoadingLabel(url));

      if (url.pathname === window.location.pathname) {
        hideTimer.current = setTimeout(
          () => setVisible(false),
          MINIMUM_DISPLAY_MS
        );
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  useLayoutEffect(() => {
    if (pathname === previousPathname.current) return;

    previousPathname.current = pathname;

    if (resetScrollOnNavigation.current) {
      // Shared App Router layouts can retain the outgoing page's scroll
      // position. Reset underneath the loader so every destination opens at
      // its own hero while same-page filters and hash links stay untouched.
      window.scrollTo(0, 0);
      resetScrollOnNavigation.current = false;
    }

    const elapsed = performance.now() - startedAt.current;
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

    hideTimer.current = setTimeout(() => setVisible(false), remaining);
  }, [pathname]);

  return (
    <NavigationLoaderProvider value={visible}>
      {visible ? <RouteLoader label={label} primary /> : null}
      {children}
    </NavigationLoaderProvider>
  );
}
