"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
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
  const forceTopUntilHidden = useRef(false);
  const primedNavigationHref = useRef<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideLoader = useCallback(() => {
    const keepAtTop = forceTopUntilHidden.current;

    if (keepAtTop) window.scrollTo(0, 0);

    // Remove the opaque overlay synchronously only after the destination is
    // already at the top, so no intermediate scrolled frame can be painted.
    flushSync(() => setVisible(false));

    if (keepAtTop) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    forceTopUntilHidden.current = false;
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };

    const showLoader = (nextLabel: string, shouldResetScroll: boolean) => {
      clearTimers();
      startedAt.current = performance.now();
      forceTopUntilHidden.current = shouldResetScroll;

      // This listener runs outside React's event system. Flush the overlay
      // during the capture phase so it covers the old page before navigation
      // or scroll restoration gets a chance to paint.
      flushSync(() => {
        setLabel(nextLabel);
        setVisible(true);
      });

      if (shouldResetScroll) window.scrollTo(0, 0);

      safetyTimer.current = setTimeout(hideLoader, SAFETY_TIMEOUT_MS);
    };

    const getNavigation = (event: MouseEvent | PointerEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return null;
      }

      const target = event.target;
      if (!(target instanceof Element)) return null;

      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noLoader === "true"
      ) {
        return null;
      }

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.href === window.location.href ||
        (url.pathname === window.location.pathname && !url.search)
      ) {
        return null;
      }

      return url;
    };

    const handlePointerDown = (event: PointerEvent) => {
      const url = getNavigation(event);
      if (!url) return;

      primedNavigationHref.current = url.href;

      // Cover the current page on press, before the later click event. Scroll
      // is intentionally left untouched until the click confirms navigation.
      showLoader(getLoadingLabel(url), false);
    };

    const handlePointerCancel = () => {
      if (!primedNavigationHref.current) return;
      primedNavigationHref.current = null;
      clearTimers();
      hideLoader();
    };

    const handleClick = (event: MouseEvent) => {
      const url = getNavigation(event);
      if (!url) return;

      const shouldResetScroll = url.pathname !== window.location.pathname;

      if (primedNavigationHref.current === url.href) {
        forceTopUntilHidden.current = shouldResetScroll;
        if (shouldResetScroll) window.scrollTo(0, 0);
      } else {
        // Keyboard activation has no pointerdown, so mount synchronously here.
        showLoader(getLoadingLabel(url), shouldResetScroll);
      }

      primedNavigationHref.current = null;

      if (url.pathname === window.location.pathname) {
        hideTimer.current = setTimeout(hideLoader, MINIMUM_DISPLAY_MS);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointercancel", handlePointerCancel, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointercancel", handlePointerCancel, true);
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, [hideLoader]);

  useLayoutEffect(() => {
    if (pathname === previousPathname.current) return;

    previousPathname.current = pathname;

    if (forceTopUntilHidden.current) {
      // Shared App Router layouts can retain the outgoing page's scroll
      // position. Reset underneath the loader so every destination opens at
      // its own hero while same-page filters and hash links stay untouched.
      window.scrollTo(0, 0);
    }

    const elapsed = performance.now() - startedAt.current;
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

    hideTimer.current = setTimeout(hideLoader, remaining);
  }, [hideLoader, pathname]);

  return (
    <NavigationLoaderProvider value={visible}>
      {visible ? <RouteLoader label={label} primary /> : null}
      {children}
    </NavigationLoaderProvider>
  );
}
