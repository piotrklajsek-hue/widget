import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface WidgetTooltipProps {
  visible: boolean;
  text: string;
  /** Ref to the element the tooltip should appear above */
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function WidgetTooltip({ visible, text, anchorRef }: WidgetTooltipProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);

  // Find the shadow root to portal into
  useEffect(() => {
    const el = sentinelRef.current ?? anchorRef.current;
    if (!el) return;
    const root = el.getRootNode();
    if (root instanceof ShadowRoot) {
      let container = root.querySelector('[data-tooltip-portal]') as HTMLElement;
      if (!container) {
        container = document.createElement('div');
        container.setAttribute('data-tooltip-portal', '');
        Object.assign(container.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '0',
          height: '0',
          overflow: 'visible',
          zIndex: '99999',
          pointerEvents: 'none',
        });
        root.appendChild(container);
      }
      setPortalContainer(container);
    } else {
      setPortalContainer(document.body);
    }
  }, [anchorRef]);

  // Calculate position - runs on every render when visible
  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    const rect = anchor.getBoundingClientRect();
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;

    if (tw === 0 || th === 0) return;

    setPos({
      top: rect.top - 8 - th,
      left: rect.left + rect.width / 2 - tw / 2,
    });
  }, [anchorRef]);

  // Synchronous layout measurement
  useLayoutEffect(() => {
    if (visible) {
      updatePosition();
    } else {
      setPos(null);
    }
  }, [visible, text, updatePosition]);

  // Retry measurement after a frame (in case layout hasn't settled)
  useEffect(() => {
    if (!visible) return;
    let id1 = requestAnimationFrame(() => {
      updatePosition();
      id1 = requestAnimationFrame(updatePosition);
    });
    return () => cancelAnimationFrame(id1);
  }, [visible, text, updatePosition]);

  // Sentinel - always mounted, gives us a DOM node inside shadow root
  const sentinel = (
    <span
      ref={sentinelRef}
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
    />
  );

  // Tooltip is ALWAYS mounted (so ref is available for measurement),
  // visibility is controlled via opacity + pointer-events
  const isPositioned = pos !== null;
  const showTooltip = visible && isPositioned;

  const tooltipEl = (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        zIndex: 99999,
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        backgroundColor: '#27272B',
        borderRadius: 8,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 6,
        paddingBottom: 6,
        fontSize: 12,
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        lineHeight: 1.625,
        whiteSpace: 'nowrap' as const,
        color: 'white',
        pointerEvents: 'none' as const,
        opacity: showTooltip ? 1 : 0,
        transform: showTooltip ? 'translateY(0)' : 'translateY(5px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {text}
    </div>
  );

  if (portalContainer) {
    return <>{sentinel}{createPortal(tooltipEl, portalContainer)}</>;
  }

  return <>{sentinel}{tooltipEl}</>;
}