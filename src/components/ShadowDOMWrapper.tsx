/**
 * ShadowDOMWrapper — full CSS isolation for embedding the widget on third-party pages.
 *
 * ISOLATION MODEL:
 *
 *  Host → Widget:  Shadow DOM prevents host-page CSS from cascading into
 *                   the widget.  ✅ Full isolation.
 *
 *  Widget → Host:   Only widget-owned <style>/<link> tags are cloned into
 *                   the shadow root and disabled in <head>.  Host-page
 *                   styles are never touched.  ✅ Full isolation.
 *
 * HOW IT WORKS:
 *  1. Attaches an open shadow root to a host <div>.
 *  2. Identifies which <style>/<link> tags belong to the widget using:
 *     a. Vite dev mode: `data-vite-dev-id` attribute (highest priority)
 *     b. Production: host-style snapshot (pre-existing = host-owned)
 *     c. Fallback: content-based heuristics
 *  3. Clones ONLY widget-owned styles into the shadow root, rewriting
 *     `:root` → `:host` so Tailwind theme vars cascade correctly.
 *  4. Disables widget-owned originals in <head> (media="not all").
 *  5. Watches <head> with MutationObserver for Vite HMR re-syncs.
 *  6. Renders React children inside the shadow root via createPortal.
 *  7. Exposes the shadow container via ShadowRootContext for Radix UI
 *     portals.
 *  8. On unmount, re-enables disabled styles (HMR full-page reloads).
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/* ─── Context ────────────────────────────────────────────────────────────── */

const ShadowRootContext = createContext<HTMLElement | null>(null);

export function useShadowContainer(): HTMLElement | null {
  return useContext(ShadowRootContext);
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Inside shadow DOM, `:root` selectors don't match anything.
 * Rewrite `:root` → `:host` so CSS custom properties cascade correctly.
 */
function rewriteRootToHost(css: string): string {
  return css
    .replace(/:root\.(\w+)/g, ':host(.$1)')
    .replace(/:root(?=[^-\w]|$)/g, ':host');
}

/* ─── Marker attributes ──────────────────────────────────────────────────── */

const CLONE_ATTR = 'data-locly-shadow-clone';
const DISABLED_ATTR = 'data-locly-shadow-disabled';

/* ─── Host-style snapshot ────────────────────────────────────────────────
 *
 *  In a production embed the embed script would call
 *  `snapshotHostStyles()` BEFORE loading the widget bundle.
 *  That way every pre-existing stylesheet is guaranteed to be host-owned.
 *
 *  In Vite dev mode all CSS is injected before React renders, so the
 *  snapshot is unreliable.  We skip it and rely on `data-vite-dev-id`.
 * ─────────────────────────────────────────────────────────────────────── */

const hostOwnedElements = new WeakSet<Element>();
let snapshotTaken = false;

/** Call BEFORE loading the widget bundle (production embed scripts). */
export function snapshotHostStyles() {
  if (snapshotTaken) return;
  snapshotTaken = true;
  document.head
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((el) => hostOwnedElements.add(el));
}

/* ─── Widget-style identification ────────────────────────────────────────
 *
 *  Priority order:
 *    1. Vite dev ID  (most reliable in dev — takes priority over snapshot)
 *    2. Host snapshot (production embed — pre-existing = host)
 *    3. Content / path heuristics (production fallback)
 * ─────────────────────────────────────────────────────────────────────── */

/** Known Vite dev-id fragments that belong to the widget */
const VITE_WIDGET_PATTERNS = [
  '/src/',        // Our source files
  'tailwindcss',  // Tailwind theme/utilities
  'tw-animate',   // tw-animate-css
  'sonner',       // Toast library
  '@tailwindcss',// @tailwindcss/vite injected styles
];

function isWidgetStyle(el: HTMLStyleElement | HTMLLinkElement): boolean {
  // ── 0. Embed (IIFE) build: the css-injected-by-js plugin tags our
  //    bundled stylesheet with this attribute. Wins over any other check
  //    because it's a first-party marker. ──
  if (el.hasAttribute('data-locly-widget-css')) return true;

  // ── 1. Vite dev mode: data-vite-dev-id is most reliable ──
  const viteId = el.getAttribute('data-vite-dev-id') || '';
  if (viteId) {
    return VITE_WIDGET_PATTERNS.some((p) => viteId.includes(p));
  }

  // ── 1b. Runtime-injected library CSS (no vite-dev-id, pre-exists in snapshot) ──
  // Sonner injects its CSS via __insertCSS at module load time, before React renders.
  // It ends up in the host snapshot but must be cloned into the shadow root.
  if (el instanceof HTMLStyleElement) {
    const text = el.textContent || '';
    if (text.includes('data-sonner-toaster')) return true;
  }

  // ── 2. Production: host snapshot (pre-existing = host, not ours) ──
  if (hostOwnedElements.has(el)) return false;

  // ── 3. Production <link>: check href path ──
  if (el instanceof HTMLLinkElement) {
    const href = el.href || '';
    return href.includes('/assets/') && href.endsWith('.css');
  }

  // ── 4. Production <style>: content heuristics ──
  const text = (el as HTMLStyleElement).textContent || '';
  return (
    text.includes('.locly-widget') ||
    text.includes('--tw-border-style') ||
    text.includes('--color-background') ||
    text.includes('--tw-translate') ||
    text.includes('--tw-ring') ||
    text.includes('--tw-shadow') ||
    text.includes('tw-animate')
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

interface ShadowDOMWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ShadowDOMWrapper({
  children,
  className = '',
}: ShadowDOMWrapperProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  /* ── Sync styles from <head> → shadow root ──────────────────────────── */

  const syncStyles = useCallback(() => {
    const shadow = shadowRef.current;
    const mount = mountRef.current;
    if (!shadow || !mount) return;

    // Remove old clones from shadow root
    shadow.querySelectorAll(`[${CLONE_ATTR}]`).forEach((el) => el.remove());

    // Clone only WIDGET-owned <style> tags
    document.head.querySelectorAll('style').forEach((style) => {
      if (!isWidgetStyle(style)) return;

      const clone = style.cloneNode(true) as HTMLStyleElement;
      clone.setAttribute(CLONE_ATTR, '');
      clone.removeAttribute(DISABLED_ATTR);  // clone shouldn't carry this
      clone.media = '';                       // ← FIX: reset media (original may be disabled)

      // Rewrite :root → :host for shadow DOM compatibility
      if (clone.textContent) {
        clone.textContent = rewriteRootToHost(clone.textContent);
      }

      shadow.insertBefore(clone, mount);

      // Disable original so it doesn't leak to host page
      style.setAttribute(DISABLED_ATTR, '');
      style.media = 'not all';
    });

    // Clone only WIDGET-owned <link rel="stylesheet"> tags
    document.head
      .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      .forEach((link) => {
        if (!isWidgetStyle(link)) return;

        const clone = link.cloneNode(true) as HTMLLinkElement;
        clone.setAttribute(CLONE_ATTR, '');
        clone.removeAttribute(DISABLED_ATTR);
        clone.removeAttribute('disabled');
        clone.media = '';
        shadow.insertBefore(clone, mount);

        link.setAttribute(DISABLED_ATTR, '');
        link.media = 'not all';
      });
  }, []);

  /* ── Lifecycle ─────────────────────────────────────────────────────── */

  useEffect(() => {
    const host = hostRef.current;
    if (!host || shadowRef.current) return;

    // Take snapshot of host styles (useful in production embed only;
    // in Vite dev mode, isWidgetStyle uses data-vite-dev-id instead)
    snapshotHostStyles();

    // 1. Attach shadow root
    const shadow = host.attachShadow({ mode: 'open' });
    shadowRef.current = shadow;

    // 2. Create container for React portal
    const mount = document.createElement('div');
    if (className) mount.className = className;
    shadow.appendChild(mount);
    mountRef.current = mount;

    // 3. Initial style sync
    syncStyles();

    // 4. Watch <head> for new/removed nodes (Vite HMR)
    const observer = new MutationObserver((mutations) => {
      let needsSync = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (
            (node instanceof HTMLStyleElement &&
              !node.hasAttribute(DISABLED_ATTR)) ||
            (node instanceof HTMLLinkElement &&
              node.rel === 'stylesheet' &&
              !node.hasAttribute(DISABLED_ATTR))
          ) {
            needsSync = true;
          }
        }
        if (m.removedNodes.length > 0) needsSync = true;
      }
      if (needsSync) {
        requestAnimationFrame(() => syncStyles());
      }
    });
    observer.observe(document.head, { childList: true });

    // 5. Watch for in-place content changes (Vite CSS HMR)
    const contentObserver = new MutationObserver(() => {
      requestAnimationFrame(() => syncStyles());
    });
    contentObserver.observe(document.head, {
      childList: false,
      subtree: true,
      characterData: true,
    });

    setReady(true);

    return () => {
      observer.disconnect();
      contentObserver.disconnect();

      // Re-enable our disabled styles (HMR full-page reload support)
      document.head
        .querySelectorAll(`[${DISABLED_ATTR}]`)
        .forEach((el) => {
          (el as HTMLStyleElement | HTMLLinkElement).media = '';
          el.removeAttribute(DISABLED_ATTR);
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <>
      <div ref={hostRef} />
      {ready &&
        mountRef.current &&
        createPortal(
          <ShadowRootContext.Provider value={mountRef.current}>
            {children}
          </ShadowRootContext.Provider>,
          mountRef.current,
        )}
    </>
  );
}