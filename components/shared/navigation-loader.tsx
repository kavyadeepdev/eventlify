"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import RouteLoader from "@/components/shared/route-loader";
import { NavigationLoaderProvider } from "@/components/shared/route-loader-context";

const MINIMUM_DISPLAY_MS = 650;
const SAFETY_TIMEOUT_MS = 5000;

/** Jump to the top with no smooth-scroll animation to interrupt. */
function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

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
  const router = useRouter();
  const [label, setLabel] = useState("BMSCE");
  const [visible, setVisible] = useState(false);
  const startedAt = useRef(0);
  const previousPathname = useRef(pathname);
  const [isNavigating, startNavigation] = useTransition();
  const pendingPathname = useRef<string | null>(null);
  const forceTopUntilHidden = useRef(false);
  const primedNavigationHref = useRef<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideLoader = useCallback(() => {
    const keepAtTop = forceTopUntilHidden.current;

    // The safety net has done its job (or wasn't needed) — don't let it fire
    // a second time and re-run the scroll reset under the destination.
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }

    if (keepAtTop) scrollToTop();

    // Remove the opaque overlay synchronously only after the destination is
    // already at the top, so no intermediate scrolled frame can be painted.
    flushSync(() => setVisible(false));

    if (keepAtTop) scrollToTop();

    forceTopUntilHidden.current = false;
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };

    const cancelPendingNavigation = () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
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

      if (shouldResetScroll) scrollToTop();

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
        if (shouldResetScroll) scrollToTop();
      } else {
        // Keyboard activation has no pointerdown, so mount synchronously here.
        showLoader(getLoadingLabel(url), shouldResetScroll);
      }

      primedNavigationHref.current = null;

      if (shouldResetScroll) {
        // Stop Next's Link handler from swapping the route in the same frame.
        // Giving the opaque loader one paint first prevents any part of the
        // outgoing, scrolled page from flashing during the transition.
        event.preventDefault();

        // A hash target owns its own scroll position; everything else opens
        // at the top.
        forceTopUntilHidden.current = !url.hash;
        if (forceTopUntilHidden.current) scrollToTop();

        const href = `${url.pathname}${url.search}${url.hash}`;
        pendingPathname.current = url.pathname;

        // Minimum display time runs from the navigation itself, not from
        // pointerdown — otherwise holding the mouse down satisfies it before
        // the destination has done any work.
        startedAt.current = performance.now();

        // `router.push` keeps its default scroll handling on purpose: it is
        // the only reset that runs *after* the destination segment commits.
        //
        // Wrapped in a transition so `isNavigating` stays true until the new
        // route has actually rendered its content. Hiding the overlay on a
        // timer instead uncovered a half-built page for the ~900ms between
        // the URL changing and the streamed content committing.
        //
        // Scheduled with a timer rather than requestAnimationFrame — rAF is
        // paused in background tabs, which silently dropped the navigation.
        navigationTimer.current = setTimeout(() => {
          startNavigation(() => router.push(href));
        }, 0);
      } else {
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
      cancelPendingNavigation();
    };
  }, [hideLoader, router]);

  useLayoutEffect(() => {
    if (pathname === previousPathname.current) return;

    previousPathname.current = pathname;

    if (forceTopUntilHidden.current) {
      // Shared App Router layouts can retain the outgoing page's scroll
      // position. Reset underneath the loader so every destination opens at
      // its own hero while same-page filters and hash links stay untouched.
      scrollToTop();
    }
  }, [pathname]);

  // Uncover only once the destination is genuinely ready: the URL has caught
  // up, React has finished the navigation transition (so the streamed content
  // is committed, not just the loading stub), and the loader has been up long
  // enough not to strobe.
  useEffect(() => {
    if (!visible) return;
    if (isNavigating) return;

    const target = pendingPathname.current;
    if (target && pathname !== target) return;

    const remaining = Math.max(
      0,
      MINIMUM_DISPLAY_MS - (performance.now() - startedAt.current)
    );

    const timer = setTimeout(() => {
      pendingPathname.current = null;
      hideLoader();
    }, remaining);

    return () => clearTimeout(timer);
  }, [visible, isNavigating, pathname, hideLoader]);

  return (
    <NavigationLoaderProvider value={visible}>
      {visible ? <RouteLoader label={label} primary /> : null}
      {children}
    </NavigationLoaderProvider>
  );
}
