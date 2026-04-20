/**
 * useWidgetUI — manages widget collapse/expand behavior, about modal,
 * website input form, search input, images, placeholder animation,
 * popular searches, and privacy disclaimer.
 * v2.1 - Added fieldErrors state for per-field validation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import * as analytics from '../../utils/analytics';

export interface UseWidgetUIOptions {
  placeholders?: string[];
  initialCollapsed?: boolean;
  enableImages?: boolean;
}

export function useWidgetUI(options: UseWidgetUIOptions = {}) {
  const {
    placeholders: customPlaceholders,
    initialCollapsed = false,
    enableImages = true,
  } = options;

  // ── Widget collapse ──
  const [isWidgetCollapsed, setIsWidgetCollapsed] = useState(initialCollapsed);
  const [showCollapsedIcon, setShowCollapsedIcon] = useState(initialCollapsed);

  // ── About modal ──
  const [showAboutModal, setShowAboutModal] = useState(false);

  // ── Website input ──
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Search input ──
  const placeholders = customPlaceholders || [
    "Zapytaj o cokolwiek...",
    "Zapytaj o cennik...",
    "Znajdź odpowiedź na pytanie..."
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [placeholderAnimationCompleted, setPlaceholderAnimationCompleted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // ── Hover states ──
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringUserAvatar, setIsHoveringUserAvatar] = useState(false);
  const [isHoveringPlusButton, setIsHoveringPlusButton] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  // ── Popular searches ──
  const [showPopularSearches, setShowPopularSearches] = useState(false);

  // ── Privacy ──
  const [showPrivacyDisclaimer, setShowPrivacyDisclaimer] = useState(() => {
    return localStorage.getItem('locly_privacy_dismissed') !== 'true';
  });
  const [showPrivacyTooltip, setShowPrivacyTooltip] = useState(false);
  const [showMobilePrivacyTooltip, setShowMobilePrivacyTooltip] = useState(false);
  const privacyTooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Refs ──
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({
    lastY: typeof window !== 'undefined' ? window.scrollY : 0,
    directionChangeY: typeof window !== 'undefined' ? window.scrollY : 0,
    lastDirection: 'none' as 'up' | 'down' | 'none',
    collapsed: false,
    uncollapsedAt: 0,
  });

  // ── Placeholder animation ──
  useEffect(() => {
    if (inputValue.length > 0 || placeholderAnimationCompleted) return;
    const timeout = setTimeout(() => {
      if (currentPlaceholder < placeholders.length - 1) {
        const nextIndex = currentPlaceholder + 1;
        setCurrentPlaceholder(nextIndex);
        analytics.trackPlaceholderChange(nextIndex);
      } else {
        setCurrentPlaceholder(0);
        setPlaceholderAnimationCompleted(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [inputValue, currentPlaceholder, placeholderAnimationCompleted, placeholders.length]);

  // ── Auto-resize textarea ──
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Don't auto-resize when input is empty - prevents placeholder animation flicker
      if (inputValue.length === 0) {
        textarea.style.height = '';
        if (isMultiline) {
          setIsMultiline(false);
        }
        return;
      }
      textarea.style.height = 'auto';
      const scrollH = textarea.scrollHeight;
      // Max 4 lines: 4 × 22px line-height = 88px
      textarea.style.height = `${Math.min(scrollH, 88)}px`;
      const hasNewlines = inputValue.includes('\n');
      const isLongText = inputValue.length > 60;
      // Hysteresis: enter multiline at >26px, exit at <=22px to prevent flickering
      const shouldEnterMultiline = hasNewlines || isLongText || scrollH > 26;
      const shouldExitMultiline = !hasNewlines && !isLongText && scrollH <= 22;
      if (!isMultiline && shouldEnterMultiline) {
        setTimeout(() => {
          setIsMultiline(true);
          analytics.trackMultilineExpanded();
        }, 0);
      } else if (isMultiline && shouldExitMultiline) {
        // Before exiting multiline, verify text would fit at the constrained
        // single-line width (390px). Without this check the layout flickers:
        // full-width textarea → text fits → exit multiline → 390px → text wraps
        // → enter multiline → repeat.
        const origMaxWidth = textarea.style.maxWidth;
        const origWidth = textarea.style.width;
        textarea.style.maxWidth = '390px';
        textarea.style.width = '390px';
        textarea.style.height = 'auto';
        const constrainedScrollH = textarea.scrollHeight;
        textarea.style.maxWidth = origMaxWidth;
        textarea.style.width = origWidth;
        textarea.style.height = `${Math.min(scrollH, 88)}px`;

        if (constrainedScrollH <= 22) {
          setTimeout(() => {
            setIsMultiline(false);
          }, 0);
        }
      }
    }
  }, [inputValue, isMultiline]);

  // ── Paste handler ──
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setImages(prev => {
                  const newImages = [...prev, reader.result as string];
                  analytics.trackImageAdded('paste', newImages.length);
                  return newImages;
                });
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // ── Scroll collapse ──
  const setupScrollCollapse = useCallback((modalStates: {
    showRecommendations: boolean;
    showChatOverlay: boolean;
    showAuthModal: boolean;
    showAboutModal: boolean;
    showWebsiteInput: boolean;
    showAddOpinionModal: boolean;
    pendingOpinionModal: boolean;
    showMobileSearch: boolean;
    showPopularSearches: boolean;
  }) => {
    const s = scrollRef.current;
    s.lastY = window.scrollY;

    const handleScroll = () => {
      const isAnyModalOpen = modalStates.showRecommendations || modalStates.showChatOverlay ||
        modalStates.showAuthModal || modalStates.showAboutModal || modalStates.showWebsiteInput ||
        modalStates.showAddOpinionModal || modalStates.pendingOpinionModal || modalStates.showMobileSearch ||
        modalStates.showPopularSearches;
      if (isAnyModalOpen || (s.uncollapsedAt && Date.now() - s.uncollapsedAt < 600)) {
        s.lastY = window.scrollY; s.directionChangeY = window.scrollY; s.lastDirection = 'none'; return;
      }
      const currentY = window.scrollY;
      const prevY = s.lastY;
      const direction: 'up' | 'down' | 'none' = currentY > prevY ? 'down' : currentY < prevY ? 'up' : 'none';
      if (direction !== 'none' && direction !== s.lastDirection) {
        s.directionChangeY = prevY; s.lastDirection = direction;
      }
      s.lastY = currentY;
      if (direction === 'none') return;
      const distanceInDirection = Math.abs(currentY - s.directionChangeY);
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = docHeight - (currentY + winHeight) <= 100;
      let newCollapsed = s.collapsed;
      if (nearBottom) newCollapsed = true;
      else if (!s.collapsed && direction === 'down' && distanceInDirection > 300) newCollapsed = true;
      else if (s.collapsed && direction === 'up' && distanceInDirection > 50) newCollapsed = false;
      if (newCollapsed !== s.collapsed) {
        s.collapsed = newCollapsed;
        s.directionChangeY = currentY;
        if (!newCollapsed) setShowCollapsedIcon(false);
        setIsWidgetCollapsed(newCollapsed);
      }
    };

    const resetScrollState = () => {
      s.directionChangeY = window.scrollY; s.lastY = window.scrollY;
      s.lastDirection = 'none'; s.collapsed = false; s.uncollapsedAt = Date.now();
      setShowCollapsedIcon(false); setIsWidgetCollapsed(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const widgetElement = widgetContainerRef.current;
    if (widgetElement) {
      widgetElement.addEventListener('mousedown', resetScrollState);
      widgetElement.addEventListener('click', resetScrollState);
      widgetElement.addEventListener('touchstart', resetScrollState);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (widgetElement) {
        widgetElement.removeEventListener('mousedown', resetScrollState);
        widgetElement.removeEventListener('click', resetScrollState);
        widgetElement.removeEventListener('touchstart', resetScrollState);
      }
    };
  }, []);

  // ── File handling ──
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.indexOf('image') !== -1) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImages(prev => {
              const newImages = [...prev, reader.result as string];
              analytics.trackImageAdded('upload', newImages.length);
              return newImages;
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleAddImageClick = useCallback(() => {
    if (!enableImages) return;
    analytics.trackPlusButtonClicked();
    fileInputRef.current?.click();
  }, [enableImages]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      analytics.trackImageRemoved(newImages.length);
      return newImages;
    });
  }, []);

  const uncollapse = useCallback(() => {
    setShowCollapsedIcon(false);
    setIsWidgetCollapsed(false);
    if (scrollRef.current) {
      const s = scrollRef.current;
      s.directionChangeY = window.scrollY;
      s.lastY = window.scrollY;
      s.lastDirection = 'none';
      s.collapsed = false;
      s.uncollapsedAt = Date.now();
    }
  }, []);

  return {
    // Collapse
    isWidgetCollapsed, setIsWidgetCollapsed,
    showCollapsedIcon, setShowCollapsedIcon,
    uncollapse,

    // About
    showAboutModal, setShowAboutModal,

    // Website
    showWebsiteInput, setShowWebsiteInput,
    websiteUrl, setWebsiteUrl,
    companyEmail, setCompanyEmail,
    validationError, setValidationError,
    invalidFields, setInvalidFields,
    fieldErrors, setFieldErrors,

    // Search input
    placeholders,
    currentPlaceholder,
    inputValue, setInputValue,
    isMultiline,
    images, setImages,

    // Hover
    isHovering, setIsHovering,
    isHoveringUserAvatar, setIsHoveringUserAvatar,
    isHoveringPlusButton, setIsHoveringPlusButton,
    isHoveringLogo, setIsHoveringLogo,

    // Popular searches
    showPopularSearches, setShowPopularSearches,

    // Privacy
    showPrivacyDisclaimer, setShowPrivacyDisclaimer,
    showPrivacyTooltip, setShowPrivacyTooltip,
    showMobilePrivacyTooltip, setShowMobilePrivacyTooltip,
    privacyTooltipTimeout,

    // Refs
    textareaRef, fileInputRef, searchBarRef, widgetContainerRef, scrollRef,

    // Setup
    setupScrollCollapse,

    // File handling
    handleFileChange, handleAddImageClick, removeImage,
  };
}