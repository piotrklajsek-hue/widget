import { useRef, useEffect } from 'react';

const RECENT_INPUT_WINDOW_MS = 1000;

/**
 * Pin-to-top scroll behavior for chat containers.
 *
 * Attach containerRef to the scrollable messages div and spacerRef to
 * an empty div at the very end of the message list. Call pinMessageToTop
 * after every new user message. Pass handleScrollEvent to onScroll.
 *
 * isActive should be true while the container is mounted in the DOM
 * (observers are only attached then).
 */
export function useChatScroll(
  containerRef: React.RefObject<HTMLDivElement>,
  isActive: boolean,
) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const pinnedMsgIdRef = useRef<string | null>(null);
  const ignoreScrollUntilRef = useRef(0);
  const userInputAtRef = useRef(0);
  const userScrollFlagRef = useRef(false);

  // Track user input so we can distinguish real scrolls from browser auto-clamp.
  useEffect(() => {
    if (!isActive) return;
    const el = containerRef.current;
    if (!el) return;
    const mark = () => { userInputAtRef.current = performance.now(); };
    el.addEventListener('wheel', mark, { passive: true });
    el.addEventListener('touchstart', mark, { passive: true });
    el.addEventListener('pointerdown', mark);
    el.addEventListener('keydown', mark);
    return () => {
      el.removeEventListener('wheel', mark);
      el.removeEventListener('touchstart', mark);
      el.removeEventListener('pointerdown', mark);
      el.removeEventListener('keydown', mark);
    };
  }, [isActive, containerRef]);

  const updateSpacer = () => {
    const container = containerRef.current;
    const spacer = spacerRef.current;
    if (!container || !spacer) return;
    const msgId = pinnedMsgIdRef.current;
    if (msgId === null) { spacer.style.height = '0'; return; }
    const msgEl = container.querySelector<HTMLElement>(`[data-message-id="${msgId}"]`);
    if (!msgEl) { spacer.style.height = '0'; return; }
    const msgTop =
      msgEl.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    const spacerHeight = parseFloat(spacer.style.height) || 0;
    const scrollHeightWithout = container.scrollHeight - spacerHeight;
    const needed = Math.max(0, container.clientHeight + msgTop - 32 - scrollHeightWithout);
    spacer.style.height = needed + 'px';
  };

  const ensurePinAlignment = () => {
    const container = containerRef.current;
    if (!container) return;
    const msgId = pinnedMsgIdRef.current;
    if (msgId === null || userScrollFlagRef.current) return;
    const msgEl = container.querySelector<HTMLElement>(`[data-message-id="${msgId}"]`);
    if (!msgEl) return;
    const drift = msgEl.getBoundingClientRect().top - container.getBoundingClientRect().top - 32;
    if (Math.abs(drift) < 0.5) return;
    ignoreScrollUntilRef.current = performance.now() + 150;
    container.scrollTo({ top: container.scrollTop + drift, behavior: 'auto' });
  };

  // ResizeObserver + MutationObserver: re-pin on every content/layout change.
  useEffect(() => {
    if (!isActive) return;
    const el = containerRef.current;
    if (!el) return;

    let prevWidth = 0;
    let prevScrollHeight = 0;

    const update = () => {
      requestAnimationFrame(() => {
        const current = containerRef.current;
        if (!current) return;
        const widthChanged = prevWidth > 0 && prevWidth !== current.clientWidth;
        const heightChanged = prevScrollHeight > 0 && current.scrollHeight !== prevScrollHeight;
        if (pinnedMsgIdRef.current !== null && (heightChanged || widthChanged)) {
          updateSpacer();
          ensurePinAlignment();
        }
        prevWidth = current.clientWidth;
        prevScrollHeight = current.scrollHeight;
      });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    return () => { ro.disconnect(); mo.disconnect(); };
  }, [isActive, containerRef]);

  const pinMessageToTop = (msgId: string, smooth = false): void => {
    pinnedMsgIdRef.current = msgId;
    userScrollFlagRef.current = false;
    const scrollOnce = () => {
      const container = containerRef.current;
      if (!container) return;
      updateSpacer();
      const el = container.querySelector<HTMLElement>(`[data-message-id="${msgId}"]`);
      if (!el) return;
      const delta = el.getBoundingClientRect().top - container.getBoundingClientRect().top - 32;
      if (Math.abs(delta) < 0.5) return;
      ignoreScrollUntilRef.current = performance.now() + 200;
      container.scrollTo({ top: container.scrollTop + delta, behavior: smooth ? 'smooth' : 'auto' });
    };
    requestAnimationFrame(() => { scrollOnce(); requestAnimationFrame(scrollOnce); });
  };

  const handleScrollEvent = (el: HTMLDivElement): void => {
    if (performance.now() < ignoreScrollUntilRef.current) return;
    const recentUserInput = performance.now() - userInputAtRef.current < RECENT_INPUT_WINDOW_MS;
    if (pinnedMsgIdRef.current !== null && recentUserInput) {
      userScrollFlagRef.current = true;
    }
  };

  return { spacerRef, pinMessageToTop, handleScrollEvent };
}
