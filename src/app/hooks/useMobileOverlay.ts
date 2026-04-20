/**
 * useMobileOverlay — manages mobile device detection, mobile search overlay,
 * mobile view state, and body scroll locking for mobile overlays.
 * v1.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../../services/api';

export type MobileView = 'search' | 'chat' | 'recommend' | 'addOpinion';

export function useMobileOverlay() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('search');

  const prevMobileViewRef = useRef<MobileView>('search');
  const mobileSearchTextareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Detect mobile on mount ──
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobileDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Load widget data when overlay opens ──
  useEffect(() => {
    if (showMobileSearch && mobileSearchLoading) {
      let cancelled = false;
      api.initializeWidget().then(() => {
        if (!cancelled) setMobileSearchLoading(false);
      }).catch(() => {
        if (!cancelled) setMobileSearchLoading(false);
      });
      return () => { cancelled = true; };
    }
  }, [showMobileSearch, mobileSearchLoading]);

  // ── Body scroll lock + auto-focus ──
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    if (showMobileSearch && isMobile) {
      if (document.body.style.position !== 'fixed') {
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${scrollY}px`;
        document.body.dataset.mobileSearchScrollY = String(scrollY);
      }
      document.documentElement.style.background = '#18181B';
      document.body.style.background = '#18181B';
      focusTimer = setTimeout(() => mobileSearchTextareaRef.current?.focus(), 2500);
    }
    return () => {
      if (focusTimer) clearTimeout(focusTimer);
      document.documentElement.style.background = '';
      document.body.style.background = '';
      if (document.body.dataset.mobileSearchScrollY !== undefined) {
        const savedScrollY = parseInt(document.body.dataset.mobileSearchScrollY || '0');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        delete document.body.dataset.mobileSearchScrollY;
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [showMobileSearch]);

  // ── Refocus textarea when switching views ──
  useEffect(() => {
    if (showMobileSearch && mobileView === 'search') {
      setTimeout(() => mobileSearchTextareaRef.current?.focus(), 350);
    }
  }, [mobileView, showMobileSearch]);

  // Track previous view
  useEffect(() => {
    prevMobileViewRef.current = mobileView;
  }, [mobileView]);

  const openMobileSearch = useCallback(() => {
    setMobileSearchLoading(true);
    setShowMobileSearch(true);
    setMobileView('search');
  }, []);

  return {
    isMobileDevice,
    showMobileSearch, setShowMobileSearch,
    mobileSearchLoading, setMobileSearchLoading,
    mobileView, setMobileView,
    prevMobileViewRef,
    mobileSearchTextareaRef,
    openMobileSearch,
  };
}