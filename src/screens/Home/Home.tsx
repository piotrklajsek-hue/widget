/**
 * LoclyWidget - Main widget component (v2.0)
 */
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Settings, ArrowUp, ArrowDown, X, Star, Plus, MessageSquare, Search, ArrowLeft, Loader2, Check, ExternalLink, MicOff, MoreHorizontal, Mail, Volume2, VolumeX, Frown } from 'lucide-react';
import { FaFacebook, FaGoogle, FaTiktok } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { useOptionalSearchParams } from '../../hooks/useOptionalRouter';
import { toast } from 'sonner';
import { AIAnswerCard, type AIAnswerData } from '../../components/AIAnswerCard';
import type { LoclyWidgetProps } from '../../components/LoclyWidgetProps';
import { DEFAULT_WIDGET_PROPS } from '../../components/LoclyWidgetProps';
import {
  useChat, type ChatMessage,
  useRecording,
  useWidgetAuth,
  useOpinions, type Recommendation,
  useMobileOverlay,
  useWidgetUI,
} from '../../hooks';
import { useChatScroll } from '../../hooks/useChatScroll';
import Dark1920W from '../../imports/1920WDark';
import imgOvalCopy2 from "figma:asset/641ec2f5caccbb1bfbeefca86996422307782b4a.png";
import imgOvalCopy3 from "figma:asset/7a72b08b1356732982cab37c46a78817918fe275.png";
import imgOvalCopy9 from "figma:asset/e5b89196e3a7344093a1a560db566720900d936b.png";
import userAvatar from "figma:asset/adc7e7d85aac71bba5e8ec5ddc0818b05c860f44.png";
import complexQueriesImage from "figma:asset/20d3be9ae3ba9acb1a69a5a8519c22b6131b7386.png";
import * as analytics from '../../utils/analytics';
import { WidgetTooltip } from '../../components/WidgetTooltip';
import { searchWebsite, classifyQuery, type WebSearchSource, type FollowUpQuestion } from '../../utils/llmSearchService';
import * as api from '../../services/api';
import * as authService from '../../services/auth';
import { GOOGLE_CONFIG, FACEBOOK_CONFIG, TIKTOK_CONFIG } from '../../config/DEVELOPER_SETUP';

// Re-export types for consumers
export type { LoclyWidgetProps } from '../../components/LoclyWidgetProps';

// MAX_RECORDING_DURATION is provided by useRecording hook

// Custom toast notifications matching design spec
const toastBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: 'fit-content',
  maxWidth: '400px',
  gap: '24px',
  background: '#27272B',
  border: 'none',
  color: 'white',
  padding: '10px 12px 10px 16px',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  margin: '0 auto',
  fontSize: '14px',
};

const renderToast = (
  id: string | number,
  message: string,
  iconBg: string,
  IconComponent: React.ElementType,
  iconColor: string = 'white'
) => (
  <div style={toastBaseStyle} onMouseDown={(e) => e.stopPropagation()}>
    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <IconComponent style={{ width: '10px', height: '10px', color: iconColor }} />
    </div>
    <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
    <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); toast.dismiss(id); }} style={{ padding: '4px', borderRadius: '4px', color: '#a1a1aa', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <X style={{ width: '14px', height: '14px' }} />
    </button>
  </div>
);

const showSuccessToast = (message: string) => {
  toast.custom((id) => renderToast(id, message, '#0b5cff', Check, 'black'), { duration: 2000 });
};

const showErrorToast = (message: string) => {
  toast.custom((id) => renderToast(id, message, '#ef4444', X), { duration: 2000 });
};

const showInfoToast = (message: string) => {
  toast.custom((id) => renderToast(id, message, '#3b82f6', MessageSquare), { duration: 2000 });
};

const showSadToast = (message: string) => {
  toast.custom((id) => renderToast(id, message, '#f59e0b', X), { duration: 2000 });
};

// Recommendation and ChatMessage types are imported from '../hooks'

export function LoclyWidget(props: LoclyWidgetProps = {}) {
  const {
    position = DEFAULT_WIDGET_PROPS.position,
    ownerName: _ownerName = DEFAULT_WIDGET_PROPS.ownerName,
    ownerId = DEFAULT_WIDGET_PROPS.ownerId,
    showSocialProof = DEFAULT_WIDGET_PROPS.showSocialProof,
    enableVoice = DEFAULT_WIDGET_PROPS.enableVoice,
    enableImages = DEFAULT_WIDGET_PROPS.enableImages,
    initialCollapsed = DEFAULT_WIDGET_PROPS.initialCollapsed,
    websiteUrl: configuredWebsiteUrl,
    theme,
    gaMeasurementId,
    placeholders: customPlaceholders,
    onMessage,
    onToggle,
  } = props;

  const [searchParams, setSearchParams] = useOptionalSearchParams();

  // ═══════════════════════════════════════════════════════════════
  // Custom hooks — all state, effects, refs, and handlers live here
  // ═══════════════════════════════════════════════════════════════

  const ui = useWidgetUI({
    placeholders: customPlaceholders,
    initialCollapsed,
    enableImages,
  });
  const {
    isWidgetCollapsed, setIsWidgetCollapsed,
    showCollapsedIcon, setShowCollapsedIcon,
    uncollapse,
    showAboutModal, setShowAboutModal,
    showWebsiteInput, setShowWebsiteInput,
    websiteUrl, setWebsiteUrl,
    companyEmail, setCompanyEmail,
    validationError, setValidationError,
    invalidFields, setInvalidFields,
    fieldErrors, setFieldErrors,
    placeholders,
    currentPlaceholder,
    inputValue, setInputValue,
    isMultiline,
    images, setImages,
    isHovering, setIsHovering,
    isHoveringUserAvatar, setIsHoveringUserAvatar,
    isHoveringPlusButton, setIsHoveringPlusButton,
    isHoveringLogo, setIsHoveringLogo,
    showPopularSearches, setShowPopularSearches,
    showPrivacyDisclaimer, setShowPrivacyDisclaimer,
    showPrivacyTooltip, setShowPrivacyTooltip,
    showMobilePrivacyTooltip, setShowMobilePrivacyTooltip,
    privacyTooltipTimeout,
    textareaRef, fileInputRef, searchBarRef, widgetContainerRef, scrollRef,
    setupScrollCollapse,
    handleFileChange, handleAddImageClick, removeImage,
  } = ui;

  const chat = useChat();
  const {
    showChatOverlay, setShowChatOverlay,
    chatMessages, setChatMessages,
    isTyping, setIsTyping,
    unreadCount, setUnreadCount,
    lastReadMessageId, setLastReadMessageId,
    hasClosedChat, setHasClosedChat,
    isAwaitingEndConfirmation, setIsAwaitingEndConfirmation,
    isChatEnded, setIsChatEnded,
    showScrollToBottom,
    showMobileScrollToBottom, setShowMobileScrollToBottom,
    unreadScrollMessages, setUnreadScrollMessages,
    showChatMenu, setShowChatMenu,
    showTranscriptModal, setShowTranscriptModal,
    transcriptEmail, setTranscriptEmail,
    transcriptSending, setTranscriptSending,
    transcriptSent, setTranscriptSent,
    soundsEnabled, setSoundsEnabled,
    mobileInputValue, setMobileInputValue,
    chatDragY, isDraggingChat,
    chatMessagesRef,
    chatMenuRef, mobileChatMenuRef,
    lastUserMessageIdRef,
    mobileChatContainerRef,
    mobileChatInputRef,
    wasAtBottomRef,
    lastBottomMessageIdRef,
    autoScrollInProgressRef,
    mobileWasAtBottomRef,
    mobileAutoScrollRef,
    prevMobileLastMsgIdRef,
    triggerHaptic,
    playSentSound, playReceivedSound,
    scrollChatToBottom,
    scrollUserMessageToTop,
    streamMessageContent,
    handleChatTouchStart, handleChatTouchMove, handleChatTouchEnd,
    isAtBottom, updateScrollButton,
    countUnreadAiMessages, countUnreadAiMessagesMobile,
  } = chat;

  const recording = useRecording();
  const {
    isRecordingSearch, setIsRecordingSearch,
    searchRecordingLevels, setSearchRecordingLevels,
    searchRecordedBlob, setSearchRecordedBlob,
    searchRecordingTimer,
    isTranscribing, setIsTranscribing,
    isMockRecording, setIsMockRecording,
    isMockRecordingRef,
    isRecordingOpinion, setIsRecordingOpinion,
    opinionRecordingLevels, setOpinionRecordingLevels,
    opinionRecordingTimer,
    isMockRecordingOpinion, setIsMockRecordingOpinion,
    micPermission, setMicPermission,
    mediaRecorderRef,
    mediaStreamRef,
    audioContextRef,
    analyserRef,
    animationFrameRef,
    mockAnimFrameRef,
    opinionMediaRecorderRef,
    opinionMediaStreamRef,
    opinionAudioContextRef,
    opinionAnalyserRef,
    opinionAnimFrameRef,
    opinionMockAnimFrameRef,
    handleSearchVoiceInput: _hookSearchVoiceInput,
    handleSearchVoiceCancel: _hookSearchVoiceCancel,
    handleSearchVoiceConfirm: _hookSearchVoiceConfirm,
    handleMockVoiceInput: _hookMockVoiceInput,
    handleMockVoiceCancel: _hookMockVoiceCancel,
    handleMockVoiceConfirm: _hookMockVoiceConfirm,
    handleVoiceInput: _hookVoiceInput,
    handleOpinionVoiceCancel: _hookOpinionVoiceCancel,
    handleOpinionVoiceConfirm: _hookOpinionVoiceConfirm,
    stopRecordingCleanup,
    stopOpinionRecordingCleanup,
    setAutoConfirmSearch,
    setAutoConfirmOpinion,
    MAX_RECORDING_DURATION,
  } = recording;

  const auth = useWidgetAuth();
  const {
    showAuthModal, setShowAuthModal,
    isAuthenticated, setIsAuthenticated,
    isRecommended, setIsRecommended,
    hasOpinion, setHasOpinion,
    handleAuth: _hookAuth,
    handleProductionAuth: _hookProductionAuth,
    handleLogout: _hookLogout,
    restoreSession,
  } = auth;

  const opinions = useOpinions();
  const {
    showRecommendations, setShowRecommendations,
    isLoadingOpinions, setIsLoadingOpinions,
    shouldShowSeeAllSkeleton, setShouldShowSeeAllSkeleton,
    userOpinions, setUserOpinions,
    hoveredStatus, setHoveredStatus,
    isRecommending, setIsRecommending,
    showAddOpinionModal, setShowAddOpinionModal,
    opinionText, setOpinionText,
    selectedCategories, setSelectedCategories,
    isSubmittingOpinion, setIsSubmittingOpinion,
    inputMethod, setInputMethod,
    pendingOpinionModal, setPendingOpinionModal,
    aiSuggestions, setAiSuggestions,
    selectedSuggestion, setSelectedSuggestion,
    showAISuggestions, setShowAISuggestions,
    isGeneratingAI, setIsGeneratingAI,
    showSuccessNotification, setShowSuccessNotification,
    errorNotification, successNotification,
    showError, showSuccess,
    userCity, setUserCity,
    showCityInput, setShowCityInput,
    manualCity, setManualCity,
    checkGeolocationPermission,
    addOpinionOriginRef,
    opinionModalContentRef,
    allCategories,
    toggleCategory,
    generateAISuggestions,
    handleImproveTextWithAI,
    resetOpinionForm,
    censorLastName, getFirstLine, getSecondLineSkeleton,
  } = opinions;

  const mobile = useMobileOverlay();
  const {
    isMobileDevice,
    showMobileSearch, setShowMobileSearch,
    mobileSearchLoading, setMobileSearchLoading,
    mobileView, setMobileView,
    prevMobileViewRef,
    mobileSearchTextareaRef,
    openMobileSearch,
  } = mobile;

  const desktopScroll = useChatScroll(chatMessagesRef, showChatOverlay);
  const mobileScroll = useChatScroll(mobileChatContainerRef, showMobileSearch && mobileView === 'chat');

  // Desktop search bar expand/collapse state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const expandedByClickRef = useRef(false);
  const [expandedWidth, setExpandedWidth] = useState(540);
  // Track whether we just expanded to skip placeholder y-animation on first frame
  const wasCollapsedRef = useRef(true);
  
  // "How It Works" overlay state
  const [showHowItWorksOverlay, setShowHowItWorksOverlay] = useState(false);
  const [howItWorksUrl, setHowItWorksUrl] = useState('');
  const [howItWorksEmail, setHowItWorksEmail] = useState('');
  const [howItWorksEmailSending, setHowItWorksEmailSending] = useState(false);
  const [howItWorksEmailSent, setHowItWorksEmailSent] = useState(false);

  // Tooltip anchor refs (for fixed-positioned tooltips that escape overflow:hidden)
  const logoAnchorRef = useRef<HTMLDivElement>(null);
  const plusAnchorRef = useRef<HTMLDivElement>(null);
  const avatarsAnchorRef = useRef<HTMLDivElement>(null);
  const expandedAvatarsAnchorRef = useRef<HTMLDivElement>(null);
  const userAvatarAnchorRef = useRef<HTMLDivElement>(null);

  // Auto-show tooltip on collapsed widget avatars (3s delay, 1s duration)
  const [showAvatarsTooltip, setShowAvatarsTooltip] = useState(false);
  const [isHoveringAvatars, setIsHoveringAvatars] = useState(false);

  // Menu states for Recommendations and Add Opinion
  const [showRecommendationsMenu, setShowRecommendationsMenu] = useState(false);
  const [showAddOpinionMenu, setShowAddOpinionMenu] = useState(false);
  const recommendationsMenuRef = useRef<HTMLDivElement>(null);
  const addOpinionMenuRef = useRef<HTMLDivElement>(null);

  // Auto-collapse widget timer after closing chat
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if mouse is over widget (for auto-collapse timer)
  const [isHoveringWidget, setIsHoveringWidget] = useState(false);

  // When switching between modals (chat ↔ recommendations), skip enter/exit animations
  const instantModalRef = useRef(false);

  // Reset instantModalRef after both modals have read it (next frame after paint)
  useEffect(() => {
    if (instantModalRef.current) {
      requestAnimationFrame(() => {
        instantModalRef.current = false;
      });
    }
  });

  // Measure parent container width for smooth px-to-px animation (avoids % → px jumps)
  useEffect(() => {
    const el = widgetContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setExpandedWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-expand when there's content or active overlays
  useEffect(() => {
    if (inputValue.length > 0 || showChatOverlay || showRecommendations || isRecordingSearch || isTranscribing || images.length > 0) {
      setIsSearchExpanded(true);
      // Clear auto-collapse timer when user interacts
      clearAutoCollapseTimer();
    }
  }, [inputValue, showChatOverlay, showRecommendations, isRecordingSearch, isTranscribing, images]);

  // Cleanup auto-collapse timer on unmount
  useEffect(() => {
    return () => {
      clearAutoCollapseTimer();
    };
  }, []);

  const floatingContainersRef = useRef<HTMLDivElement>(null);

  // Click outside to collapse (desktop only)
  useEffect(() => {
    if (!isSearchExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Use composedPath() to correctly detect clicks inside the Shadow DOM —
      // e.target is retargeted to the shadow host at the document level,
      // so Node.contains() fails for elements inside the shadow root.
      const path = e.composedPath();
      const isInsideWidget =
        (searchBarRef.current && path.includes(searchBarRef.current)) ||
        (widgetContainerRef.current && path.includes(widgetContainerRef.current)) ||
        (floatingContainersRef.current && path.includes(floatingContainersRef.current));
      if (!isInsideWidget) {
        if (inputValue.length === 0 && !showChatOverlay && !showRecommendations && !isRecordingSearch && !isTranscribing && images.length === 0 && !showPopularSearches) {
          setIsSearchExpanded(false);
          expandedByClickRef.current = false;
        }
      }
    };
    // Delay adding listener to prevent immediate collapse after manual expand
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded, inputValue, showChatOverlay, showRecommendations, isRecordingSearch, isTranscribing, images, showPopularSearches]);

  // Refs that remain local (not in any hook)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScrollHeightRef = useRef(0);

  // ── Wrap hook handlers that need isMobileDevice context ──
  const handleChatTouchStartWrapped = (e: React.TouchEvent) => handleChatTouchStart(e, isMobileDevice);
  const handleChatTouchMoveWrapped = (e: React.TouchEvent) => handleChatTouchMove(e, isMobileDevice);
  const handleChatTouchEndWrapped = () => {
    // Check if swipe will close (same threshold as hook)
    const willClose = chatDragY > 120 || (chatDragY > 40);
    handleChatTouchEnd(isMobileDevice);
    if (willClose) onToggle?.(false);
  };
  
  // Mock recommendations data
  const recommendations: Recommendation[] = [
    {
      id: '1',
      avatar: imgOvalCopy2,
      name: 'Anna Kowalska',
      city: 'Cieszyn',
      opinion: 'Świetna obsługa i profesjonalne podejście. Projekt aplikacji mobilnej został wykonany w terminie i przekroczył nasze oczekiwania.',
      categories: ['Aplikacja mobilna', 'UI/UX', 'React Native'],
      date: '2025-02-28',
      instagramPosts: [
        {
          id: 'ig-app-1',
          imageUrl: 'https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NzMxMTQ0NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example1',
          type: 'image'
        },
        {
          id: 'ig-app-2',
          imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwYXBwfGVufDF8fHx8MTc3MzE1OTg3MHww&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example2',
          type: 'image'
        }
      ],
      tiktokPosts: [
        {
          id: 'tt-app-1',
          imageUrl: 'https://images.unsplash.com/photo-1764664281859-36f1b637b6a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydCUyMHZpZGVvJTIwY29udGVudCUyMG1vYmlsZXxlbnwxfHx8fDE3NzM0ODQ0MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/1',
          type: 'video'
        }
      ]
    },
    {
      id: '2',
      avatar: imgOvalCopy3,
      name: 'Jan Nowak',
      city: 'Skoczów',
      opinion: 'Polecam! Bardzo dobry kontakt, szybka realizacja. System CRM działa bez zarzutu.',
      categories: ['System CRM', 'Backend'],
      date: '2025-02-15',
      instagramPosts: [
        {
          id: 'ig-crm-1',
          imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNvZnR3YXJlfGVufDF8fHx8MTc3MzE1OTg3MHww&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example3',
          type: 'image'
        },
        {
          id: 'ig-crm-2',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-bf19f8fd1085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzczMDcyNzgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example4',
          type: 'image'
        }
      ],
      tiktokPosts: [
        {
          id: 'tt-crm-1',
          imageUrl: 'https://images.unsplash.com/photo-1537731121640-bc1c4aba9b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwY29udGVudHxlbnwxfHx8fDE3NzM0MDY2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/2',
          type: 'video'
        },
        {
          id: 'tt-crm-2',
          imageUrl: 'https://images.unsplash.com/photo-1583215794430-78a2c664751e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHZpZGVvJTIwZWRpdGluZyUyMHN0dWRpb3xlbnwxfHx8fDE3NzM0NDY1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/3',
          type: 'video'
        }
      ]
    },
    {
      id: '3',
      avatar: imgOvalCopy9,
      name: 'Maria Wiśniewska',
      city: 'Ustroń',
      opinion: 'Rewelacyjna strona internetowa! Design nowoczesny, wszystko działa płynnie. Jestem bardzo zadowolona z efektu końcowego.',
      categories: ['Strona internetowa', 'SEO'],
      date: '2025-02-10',
      instagramPosts: [
        {
          id: 'ig-web-1',
          imageUrl: 'https://images.unsplash.com/photo-1772272935464-2e90d8218987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBwb3J0Zm9saW98ZW58MXx8fHwxNzczMTIxNTkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example5',
          type: 'image'
        },
        {
          id: 'ig-web-2',
          imageUrl: 'https://images.unsplash.com/photo-1707836885254-79b6e3d7b18d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwbW9ja3VwfGVufDF8fHx8MTc3MzE1OTg3MHww&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example6',
          type: 'image'
        },
        {
          id: 'ig-web-3',
          imageUrl: 'https://images.unsplash.com/photo-1690192699379-fb68bb749eaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNwb25zaXZlJTIwd2Vic2l0ZXxlbnwxfHx8fDE3NzMxMzA0NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example7',
          type: 'image'
        }
      ],
      tiktokPosts: [
        {
          id: 'tt-web-1',
          imageUrl: 'https://images.unsplash.com/photo-1726066012749-f81bf4422d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnQlMjBjcmVhdGlvbnxlbnwxfHx8fDE3NzM0NDYyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/4',
          type: 'video'
        },
        {
          id: 'tt-web-2',
          imageUrl: 'https://images.unsplash.com/photo-1590126725227-b04ebaa2c32f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJ0aWNhbCUyMHZpZGVvJTIwc21hcnRwaG9uZSUyMGZpbG1pbmd8ZW58MXx8fHwxNzczNDg0NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/5',
          type: 'video'
        }
      ]
    },
    {
      id: '4',
      avatar: imgOvalCopy2,
      name: 'Piotr Zieliński',
      city: 'Wisła',
      opinion: 'Profesjonalna współpraca od początku do końca. Dashboard analytics spełnia wszystkie nasze wymagania.',
      categories: ['Dashboard', 'Analytics', 'Wizualizacja danych'],
      date: '2025-01-25',
      instagramPosts: [
        {
          id: 'ig-dashboard-1',
          imageUrl: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzczMTE4NTk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.instagram.com/p/example8',
          type: 'image'
        }
      ],
      tiktokPosts: [
        {
          id: 'tt-dashboard-1',
          imageUrl: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzczNDA3MjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
          postUrl: 'https://www.tiktok.com/@example/video/6',
          type: 'video'
        }
      ]
    }
  ];

  // Additional people who recommend but didn't leave opinions
  const additionalRecommenders = [
    {
      id: '5',
      avatar: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3Mjk0MDk5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      name: 'Katarzyna Nowak',
      city: 'Bielsko-Biała'
    },
    {
      id: '6',
      avatar: 'https://images.unsplash.com/photo-1746791006255-6337e86080f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzc3xlbnwxfHx8fDE3NzI5NTMxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      name: 'Tomasz Kowalczyk',
      city: 'Żywiec'
    },
    {
      id: '7',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDF8fHx8MTc3MjkyODYxOXww&ixlib=rb-4.1.0&q=80&w=1080',
      name: 'Aleksandra Lewandowska',
      city: 'Cieszyn'
    },
    {
      id: '8',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzA0MzE0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      name: 'Marcin Wójcik',
      city: 'Skoczów'
    }
  ];
  
  // Available categories come from useOpinions hook as allCategories
  const availableCategories = allCategories;
  
  // checkGeolocationPermission and getLocation are now in useOpinions hook

  // ── Restore session & handle pending action after OAuth redirect ──
  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setIsAuthenticated(true);
      setIsRecommended(session.user.hasRecommended);
      setHasOpinion(session.user.hasOpinion);
    }

    // Obsluz pending action z URL (po OAuth callback redirect)
    const action = searchParams.get('action');
    if (action && session) {
      // Wyczysc parametr z URL
      setSearchParams({}, { replace: true });
      
      if (action === 'recommend') {
        // Automatycznie polec po zalogowaniu
        setIsRecommending(true);
        api.submitRecommendation().then(() => {
          setIsRecommending(false);
          setIsRecommended(true);
          showSuccessToast('Poleciles to!');
        }).catch(() => {
          setIsRecommending(false);
          showErrorToast('Nie udalo sie dodac polecenia');
        });
      } else if (action === 'add_opinion') {
        // Otworz modal dodawania opinii
        checkGeolocationPermission();
        setShowAddOpinionModal(true);
      } else if (action === 'see_all_opinions') {
        // Pobierz wszystkie opinie
        setIsLoadingOpinions(true);
        api.fetchOpinions().then((data) => {
          setIsLoadingOpinions(false);
          if (data.userHasRecommended) setIsRecommended(true);
          if (data.userOpinion) setHasOpinion(true);
        }).catch(() => {
          setIsLoadingOpinions(false);
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // triggerHaptic, playSentSound, playReceivedSound, chat menu close,
  // and swipe gesture handlers are now in useChat hook

  // Mic permission check and recording cleanup are now in useRecording hook

  // Recording timer effects are now in useRecording hook

  // Initialize Google Analytics on mount
  useEffect(() => {
    // GA config — uses props when provided, falls back to env vars
    const GA_MEASUREMENT_ID = gaMeasurementId || import.meta.env?.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
    const GA_DEBUG_MODE = import.meta.env?.VITE_GA_DEBUG === 'true';
    
    const OWNER_ID = ownerId;
    const OWNER_DOMAIN = configuredWebsiteUrl ? new URL(configuredWebsiteUrl).hostname : window.location.hostname;
    const OWNER_EMAIL = 'demo@example.com';
    
    if (GA_MEASUREMENT_ID) {
      analytics.configureWidget({
        measurementId: GA_MEASUREMENT_ID,
        enableDebug: GA_DEBUG_MODE,
        enableAutoTracking: true,
        ownerId: OWNER_ID,
        ownerDomain: OWNER_DOMAIN,
        ownerEmail: OWNER_EMAIL
      });
      
      analytics.startSession();
      analytics.trackPageView('Home');
      
      if (GA_DEBUG_MODE) {
        console.log('✅ Google Analytics configured:', {
          measurementId: GA_MEASUREMENT_ID,
          ownerId: OWNER_ID,
          ownerDomain: OWNER_DOMAIN
        });
      }
    }
    
    return () => {
      analytics.endSession();
    };
  }, []);
  
  // Placeholder animation, auto-resize textarea, and tooltip effects are in useWidgetUI hook

  // Messenger-style auto-scroll, unread count, mark-as-read, transfer-unread,
  // isAtBottom/updateScrollButton/countUnread helpers, and scrollChatToBottom
  // are all now in useChat hook.
  //
  // The following effects remain local because they access props/local state
  // not available in the hook.

  // Inactivity timer - ask if user wants to end conversation after 2 minutes of no response
  useEffect(() => {
    // Only start timer if chat has messages and overlay is open (desktop or mobile) and not ended and not already awaiting confirmation
    const isChatOpen = showChatOverlay || mobileView === 'chat';
    if (chatMessages.length === 0 || !isChatOpen || isChatEnded || isAwaitingEndConfirmation) {
      return;
    }

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Get last message
    const lastMessage = chatMessages[chatMessages.length - 1];
    
    // Only set timer if last message was from assistant (waiting for user response)
    if (lastMessage.role === 'assistant') {
      inactivityTimerRef.current = setTimeout(() => {
        // Ask if user wants to end conversation
        const confirmMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Czy chcesz zakończyć rozmowę?',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, confirmMessage]);
        playReceivedSound();
        setIsAwaitingEndConfirmation(true);
      }, 10000); // 10 seconds = 10000ms (for testing)
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [chatMessages, showChatOverlay, mobileView, isChatEnded, isAwaitingEndConfirmation]);

  // Scroll collapse (useWidgetUI.setupScrollCollapse), body scroll lock (useChat),
  // mobile search loading + scroll lock (useMobileOverlay) are now in hooks.

  // ── Scroll collapse setup ──
  useEffect(() => {
    return setupScrollCollapse({
      showRecommendations, showChatOverlay, showAuthModal,
      showAboutModal, showWebsiteInput, showAddOpinionModal,
      pendingOpinionModal, showMobileSearch, showPopularSearches,
    });
  }, [setupScrollCollapse, showRecommendations, showChatOverlay, showAuthModal, showAboutModal, showWebsiteInput, showAddOpinionModal, pendingOpinionModal, showMobileSearch, showPopularSearches]);

  // Auto-hide popular searches when any modal opens
  useEffect(() => {
    if (showRecommendations || showChatOverlay || showAuthModal || showAboutModal || showWebsiteInput || showAddOpinionModal || pendingOpinionModal) {
      setShowPopularSearches(false);
    }
  }, [showRecommendations, showChatOverlay, showAuthModal, showAboutModal, showWebsiteInput, showAddOpinionModal, pendingOpinionModal]);

  // Mobile-only: instant scroll to bottom when transitioning search → chat
  useEffect(() => {
    if (showMobileSearch && mobileView === 'chat' && prevMobileViewRef.current === 'search') {
      // Just entered chat from search screen — scroll instantly, no animation
      mobileWasAtBottomRef.current = true;
      setShowMobileScrollToBottom(false);
      // Mark all messages as read when entering chat
      if (chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        setLastReadMessageId(lastMsg.id);
        setUnreadCount(0);
      }
      requestAnimationFrame(() => {
        if (mobileChatContainerRef.current) {
          mobileChatContainerRef.current.scrollTop = mobileChatContainerRef.current.scrollHeight;
        }
      });
    }
    // Leaving mobile chat view — mark messages as read if user was at bottom
    if (prevMobileViewRef.current === 'chat' && mobileView !== 'chat') {
      if (mobileWasAtBottomRef.current && chatMessages.length > 0) {
        const lastMsg = chatMessages[chatMessages.length - 1];
        setLastReadMessageId(lastMsg.id);
        setUnreadCount(0);
      }
    }
    prevMobileViewRef.current = mobileView;
  }, [mobileView, showMobileSearch]);

  // Desktop chat overlay: scroll to bottom whenever it opens
  useEffect(() => {
    if (!showChatOverlay) return;
    requestAnimationFrame(() => {
      const el = chatMessagesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [showChatOverlay]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      if (showRecommendationsMenu && recommendationsMenuRef.current && !path.includes(recommendationsMenuRef.current)) {
        setShowRecommendationsMenu(false);
      }
      if (showAddOpinionMenu && addOpinionMenuRef.current && !path.includes(addOpinionMenuRef.current)) {
        setShowAddOpinionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRecommendationsMenu, showAddOpinionMenu]);

  // Mobile-only: Messenger-style scroll when new messages arrive
  // mobileWasAtBottomRef, prevMobileLastMsgIdRef, mobileAutoScrollRef come from useChat
  useEffect(() => {
    if (!showMobileSearch || mobileView !== 'chat' || !mobileChatContainerRef.current) return;
    const el = mobileChatContainerRef.current;
    const lastMsg = chatMessages[chatMessages.length - 1];
    const isNewMessage = lastMsg && lastMsg.id !== prevMobileLastMsgIdRef.current;

    if (isNewMessage) {
      if (lastMsg.role === 'user') {
        // User sent a message → always scroll to bottom
        setTimeout(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }, 80);
      } else if (lastMsg.role === 'assistant') {
        if (mobileWasAtBottomRef.current) {
          // User was at bottom → scroll to START of new AI message, then stop
          mobileWasAtBottomRef.current = false;
          mobileAutoScrollRef.current = true;
          setTimeout(() => {
            const msgEl = el.querySelector(`[data-message-id="${lastMsg.id}"]`);
            if (msgEl) {
              msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(() => {
              mobileAutoScrollRef.current = false;
              const hasOverflow = el.scrollHeight > el.clientHeight + 40;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              setShowMobileScrollToBottom(hasOverflow && !atBottom);
              setUnreadScrollMessages(countUnreadAiMessagesMobile());
            }, 500);
          }, 80);
        } else {
          // User scrolled up → don't scroll, just update badge
          setTimeout(() => {
            setUnreadScrollMessages(countUnreadAiMessagesMobile());
            const hasOverflow = el.scrollHeight > el.clientHeight + 40;
            setShowMobileScrollToBottom(hasOverflow);
          }, 50);
        }
      }
    }

    // Update mobile scroll button
    const hasOverflow = el.scrollHeight > el.clientHeight + 40;
    const isMobileAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowMobileScrollToBottom(hasOverflow && !isMobileAtBottom);

    if (lastMsg) {
      prevMobileLastMsgIdRef.current = lastMsg.id;
    }
  }, [chatMessages, isTyping, showMobileSearch, mobileView]);

  // Track mobile scroll position for wasAtBottom
  useEffect(() => {
    const el = mobileChatContainerRef.current;
    if (!el || !showMobileSearch || mobileView !== 'chat') return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      // During auto-scroll animation, don't update wasAtBottom to prevent flickering
      if (!mobileAutoScrollRef.current) {
        mobileWasAtBottomRef.current = atBottom;
      }
      const hasOverflow = el.scrollHeight > el.clientHeight + 40;
      setShowMobileScrollToBottom(hasOverflow && !atBottom);
      // Update unread badge
      if (atBottom) {
        setUnreadScrollMessages(0);
        if (chatMessages.length > 0) {
          lastBottomMessageIdRef.current = chatMessages[chatMessages.length - 1].id;
        }
      } else {
        setUnreadScrollMessages(countUnreadAiMessagesMobile());
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [showMobileSearch, mobileView, chatMessages]);

  // Refocus textarea (useMobileOverlay), paste handler (useWidgetUI),
  // handleFileChange, handleAddImageClick, removeImage (useWidgetUI) are now in hooks.

  const handleSubmit = (overrideValue?: string) => {
    const valueToUse = overrideValue !== undefined ? overrideValue : inputValue;
    if (valueToUse.trim().length === 0 && images.length === 0) return;
    
    // Notify parent via callback
    onMessage?.(valueToUse, images.length > 0 ? images : undefined);
    
    // Haptic feedback on mobile
    triggerHaptic(10);
    
    // Hide popular searches modal immediately
    setShowPopularSearches(false);
    
    // Close add opinion modal if open
    setShowAddOpinionModal(false);
    
    // If awaiting end confirmation, check user response
    if (isAwaitingEndConfirmation) {
      const userResponse = valueToUse.trim().toLowerCase();
      
      if (userResponse === 'tak' || userResponse === 'yes') {
        // User wants to end conversation
        const farewellMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Dziękuję za rozmowę! Do zobaczenia! 👋\n\n**Rozmowa zakończona**',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, farewellMessage]);
        playReceivedSound();
        setIsChatEnded(true);
        setIsAwaitingEndConfirmation(false);
        
        // Clear input
        setInputValue('');
        setImages([]);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        
        return;
      } else if (userResponse === 'nie' || userResponse === 'no') {
        // User wants to continue
        const continueMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Świetnie! W czym jeszcze mogę Ci pomóc?',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, continueMessage]);
        playReceivedSound();
        setIsAwaitingEndConfirmation(false);
        
        // Clear input
        setInputValue('');
        setImages([]);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        
        return;
      }
    }
    
    // If chat is ended, reset and start new conversation
    if (isChatEnded) {
      setChatMessages([]);
      setIsChatEnded(false);
      setIsAwaitingEndConfirmation(false);
    }
    
    // Reset end confirmation state when user sends a new message
    setIsAwaitingEndConfirmation(false);
    
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: valueToUse,
      timestamp: new Date().toISOString()
    };
    
    // Track search submit
    analytics.trackSearchSubmit(valueToUse, images.length > 0);
    
    // Add user message to chat
    setChatMessages(prev => [...prev, userMessage]);
    playSentSound();
    lastUserMessageIdRef.current = userMessage.id;
    setUnreadScrollMessages(0);
    desktopScroll.pinMessageToTop(userMessage.id);
    mobileScroll.pinMessageToTop(userMessage.id);
    
    // Show chat overlay (desktop only) or switch to chat view (mobile)
    if (showMobileSearch) {
      setMobileView('chat');
      // Clear timer when opening chat
      clearAutoCollapseTimer();
    } else {
      setShowChatOverlay(true);
      onToggle?.(true);
      // Clear timer when opening chat
      clearAutoCollapseTimer();
    }
    
    // Hide recommendations overlay if open
    if (showRecommendations) instantModalRef.current = true;
    setShowRecommendations(false);
    
    // Clear input and images
    setInputValue('');
    setImages([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (mobileSearchTextareaRef.current) {
      mobileSearchTextareaRef.current.style.height = 'auto';
      // Refocus for follow-up messages
      setTimeout(() => mobileSearchTextareaRef.current?.focus(), 100);
    }
    
    // ChatGPT/Claude-style: show "Myślę..." dots immediately, then after a
    // minimum 1200ms "thinking" window stream the AI reply char-by-char.
    setIsTyping(true);
    const thinkingStart = Date.now();

    const generateResponse = async () => {
      const searchResult = await searchWebsite(valueToUse);
      
      // Check if user is asking about website/strona WWW
      const lowerContent = userMessage.content.toLowerCase();
      const queryType = analytics.detectQueryType(userMessage.content);
      let answerData: AIAnswerData;
      let recommendationData: Recommendation | null = null;
      
      if (lowerContent.includes('stron') || lowerContent.includes('website') || lowerContent.includes('www')) {
        recommendationData = recommendations[2];
        answerData = {
          headline: 'Tworzymy nowoczesne strony internetowe dopasowane do Twojego biznesu — od prostych wizytówek po rozbudowane platformy e-commerce.',
          category: 'Strony internetowe',
          services: [
            { name: 'Strona wizyt��wka', price: 'od 5 000 zł' },
            { name: 'Strona firmowa', price: 'od 8 000 zł' },
            { name: 'Sklep internetowy', price: 'od 15 000 zł' },
            { name: 'Portal / platforma', price: 'od 25 000 zł' },
          ],
          technologies: 'React, Next.js, Tailwind CSS, WordPress',
          support: '12 miesięcy wsparcia technicznego w cenie',
          timeline: '2���4 tygodnie',
          recommendation: {
            avatar: recommendationData.avatar,
            name: recommendationData.name,
            city: recommendationData.city,
            opinion: recommendationData.opinion,
            instagramPosts: recommendationData.instagramPosts,
            tiktokPosts: recommendationData.tiktokPosts,
          },
        };
      } else if (lowerContent.includes('aplikacj') || lowerContent.includes('mobil') || lowerContent.includes('app')) {
        recommendationData = recommendations[0];
        answerData = {
          headline: 'Projektujemy i budujemy aplikacje mobilne na iOS i Android — od MVP po zaawansowane produkty z integracjami.',
          category: 'Aplikacje mobilne',
          services: [
            { name: 'Aplikacja MVP', price: 'od 15 000 zł' },
            { name: 'Aplikacja średniej złożoności', price: 'od 30 000 zł' },
            { name: 'Aplikacja zaawansowana', price: 'od 50 000 zł' },
          ],
          technologies: 'iOS, Android, React Native',
          support: '12 miesięcy wsparcia technicznego w cenie',
          timeline: '6–12 tygodni',
          recommendation: {
            avatar: recommendationData.avatar,
            name: recommendationData.name,
            city: recommendationData.city,
            opinion: recommendationData.opinion,
            instagramPosts: recommendationData.instagramPosts,
            tiktokPosts: recommendationData.tiktokPosts,
          },
        };
      } else if (lowerContent.includes('crm') || lowerContent.includes('system')) {
        recommendationData = recommendations[1];
        answerData = {
          headline: 'Budujemy dedykowane systemy CRM, które automatyzują sprzedaż i porządkują relacje z klientami.',
          category: 'Systemy CRM',
          services: [
            { name: 'System bazowy', price: 'od 20 000 zł' },
            { name: 'System rozszerzony', price: 'od 35 000 zł' },
            { name: 'Rozwiązanie enterprise', price: 'od 60 000 zł' },
          ],
          technologies: 'Zarządzanie klientami, automatyzacja sprzedaży, raporty',
          support: 'Integracje: email, kalendarz, faktury, marketing',
          timeline: '8–16 tygodni',
          recommendation: {
            avatar: recommendationData.avatar,
            name: recommendationData.name,
            city: recommendationData.city,
            opinion: recommendationData.opinion,
            instagramPosts: recommendationData.instagramPosts,
            tiktokPosts: recommendationData.tiktokPosts,
          },
        };
      } else if (lowerContent.includes('dashboard') || lowerContent.includes('analytics') || lowerContent.includes('analityk')) {
        recommendationData = recommendations[3];
        answerData = {
          headline: 'Tworzymy interaktywne dashboardy analityczne z wizualizacją danych w czasie rzeczywistym.',
          category: 'Dashboard Analytics',
          services: [
            { name: 'Dashboard podstawowy', price: 'od 12 000 zł' },
            { name: 'Dashboard zaawansowany', price: 'od 25 000 zł' },
            { name: 'Rozwi��zanie enterprise', price: 'od 45 000 zł' },
          ],
          technologies: 'React, Recharts, D3.js',
          support: 'Wizualizacja danych, wykresy, raporty real-time',
          timeline: '4–8 tygodni',
          recommendation: {
            avatar: recommendationData.avatar,
            name: recommendationData.name,
            city: recommendationData.city,
            opinion: recommendationData.opinion,
            instagramPosts: recommendationData.instagramPosts,
            tiktokPosts: recommendationData.tiktokPosts,
          },
        };
      } else if (lowerContent.includes('kontakt') || lowerContent.includes('email') || lowerContent.includes('telefon') || lowerContent.includes('numer')) {
        answerData = {
          headline: 'Skontaktuj się z nami — chętnie odpowiemy na Twoje pytania i pomożemy dobrać najlepsze rozwiązanie.',
          category: 'Kontakt',
          services: [
            { name: 'Konsultacja wstępna', price: 'bezpłatnie' },
            { name: 'Audyt strony WWW', price: 'od 1 500 zł' },
            { name: 'Doradztwo technologiczne', price: 'od 200 zł/h' },
          ],
          technologies: 'Email: biuro@example.pl | Tel: +48 123 456 789',
          support: 'Odpowiadamy w ciągu 24 godzin w dni robocze',
          timeline: 'Pon-Pt: 9:00-18:00, Sob: 10:00-14:00',
        };
      } else if (lowerContent.includes('godzin') || lowerContent.includes('otwart') || lowerContent.includes('czynne')) {
        answerData = {
          headline: 'Nasze biuro jest czynne od poniedziałku do piątku w godzinach 9:00-18:00 oraz w soboty 10:00-14:00.',
          category: 'Godziny otwarcia',
          services: [
            { name: 'Poniedziałek - Piątek', price: '9:00 - 18:00' },
            { name: 'Sobota', price: '10:00 - 14:00' },
            { name: 'Niedziela', price: 'zamknięte' },
          ],
          technologies: 'ul. Przykładowa 15, 43-400 Cieszyn',
          support: 'Spotkania online możliwe również poza godzinami pracy',
        };
      } else {
        recommendationData = recommendations[0];
        answerData = {
          headline: 'Oferujemy kompleksowe usługi programistyczne — od stron internetowych po zaawansowane systemy i aplikacje mobilne.',
          category: 'Wszystkie usługi',
          services: [
            { name: 'Strony internetowe', price: 'od 5 000 zł' },
            { name: 'Aplikacje mobilne', price: 'od 15 000 zł' },
            { name: 'Systemy CRM', price: 'od 20 000 zł' },
            { name: 'Dashboard Analytics', price: 'od 12 000 zł' },
          ],
          technologies: 'React, Next.js, React Native, Node.js, Tailwind CSS',
          support: '12 miesięcy gwarancji technicznej',
          timeline: 'Ponad 50 zrealizowanych projektów',
          recommendation: {
            avatar: recommendationData.avatar,
            name: recommendationData.name,
            city: recommendationData.city,
            opinion: recommendationData.opinion,
            instagramPosts: recommendationData.instagramPosts,
            tiktokPosts: recommendationData.tiktokPosts,
          },
        };
      }
      
      // Keep the "Myślę..." bubble visible for at least 1200ms before streaming.
      const elapsed = Date.now() - thinkingStart;
      if (elapsed < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
      }

      // Phase 1: replace thinking bubble with an empty text bubble and
      // stream the headline char-by-char (ChatGPT/Claude style).
      const assistantId = (Date.now() + 1).toString();
      const timestamp = new Date().toISOString();
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp,
      }]);
      playReceivedSound();
      streamMessageContent(assistantId, answerData.headline);

      // Phase 2: once the stream settles, attach answerData so the bubble
      // expands into the full AIAnswerCard with sources + follow-ups.
      const streamDurationMs = Math.ceil(answerData.headline.length / 3) * 20 + 150;
      setTimeout(() => {
        setChatMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, answerData, sources: searchResult.sources, followUpQuestions: searchResult.followUpQuestions }
            : m,
        ));
      }, streamDurationMs);

      // Track AI response
      analytics.trackMessageReceived(queryType, !!recommendationData);
      analytics.trackWebSearchQuery(valueToUse, searchResult.sources.length);
      if (recommendationData) {
        analytics.trackRecommendationViewed(recommendationData.id, recommendationData.name);
      }
    };
    
    generateResponse();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle mobile chat input submission
  const handleMobileChatSubmit = () => {
    if (mobileInputValue.trim().length === 0) return;
    handleSubmit(mobileInputValue);
    setMobileInputValue('');
    if (mobileChatInputRef.current) {
      mobileChatInputRef.current.style.height = 'auto';
    }
  };

  const handleMobileChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMobileChatSubmit();
    }
  };

  // Helper to clear auto-collapse timer
  const clearAutoCollapseTimer = () => {
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = null;
    }
  };

  // Helper to start auto-collapse timer (1 second)
  const startAutoCollapseTimer = () => {
    clearAutoCollapseTimer();
    autoCollapseTimerRef.current = setTimeout(() => {
      setIsSearchExpanded(false);
      expandedByClickRef.current = false;
    }, 1000);
  };

  // Start timer only if cursor is outside widget
  const startAutoCollapseTimerIfNotHovering = () => {
    if (!isHoveringWidget) {
      startAutoCollapseTimer();
    }
  };

  // Handle mouse enter on widget - clear timer
  const handleWidgetMouseEnter = () => {
    setIsHoveringWidget(true);
    clearAutoCollapseTimer();
  };

  // Handle mouse leave from widget - auto-collapse disabled
  const handleWidgetMouseLeave = () => {
    setIsHoveringWidget(false);
    // Auto-collapse disabled - widget stays expanded when cursor leaves
  };

  const toggleRecommendations = () => {
    // Only open, don't close
    if (!showRecommendations) {
      if (showChatOverlay) instantModalRef.current = true;
      setShowChatOverlay(false);
      onToggle?.(false);
      if (chatMessages.length > 0) {
        setHasClosedChat(true);
      }
      analytics.trackRecommendationsOpened();
      setShowRecommendations(true);
    }
  };
  
  /**
   * Demo auth — natychmiastowe logowanie z mock sesja.
   * Uzywa authService.demoAuth() do stworzenia sesji w localStorage.
   */
  const handleAuth = (provider: 'google' | 'facebook' | 'tiktok' = 'google') => {
    // Zapisz sesje demo w localStorage
    const session = authService.demoAuth(provider);
    
    analytics.trackAuthCompleted(provider);
    analytics.setAuthenticatedStatus(true);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    
    // Przywroc stan usera z sesji (na wypadek gdyby wczesniej polecil/dodal opinie)
    setIsRecommended(session.user.hasRecommended);
    setHasOpinion(session.user.hasOpinion);
    
    // If user clicked "Zobacz wszystkie", fetch opinions from API
    if (shouldShowSeeAllSkeleton) {
      setIsLoadingOpinions(true);
      api.fetchOpinions().then((data) => {
        setIsLoadingOpinions(false);
        setShouldShowSeeAllSkeleton(false);
        // W production: uzyj data.userHasRecommended i data.userOpinion
        if (data.userHasRecommended) setIsRecommended(true);
        if (data.userOpinion) setHasOpinion(true);
      }).catch(() => {
        setIsLoadingOpinions(false);
        setShouldShowSeeAllSkeleton(false);
      });
    }
    
    // Clear pending state - user will need to click "Poleć" again
    if (pendingOpinionModal) {
      setPendingOpinionModal(false);
    }
  };

  /**
   * Production OAuth — redirect do providera.
   * Zapisuje pending action i OAuth state, potem redirectuje.
   * Po powrocie AuthCallback.tsx obsluguje wymiane code -> sesja.
   */
  const handleProductionAuth = (provider: 'google' | 'facebook' | 'tiktok') => {
    const configs = {
      google: GOOGLE_CONFIG,
      facebook: FACEBOOK_CONFIG,
      tiktok: TIKTOK_CONFIG,
    } as const;

    const config = configs[provider];

    if (!config.isConfigured()) {
      showErrorToast(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} nie skonfigurowany — dodaj klucze API do .env`
      );
      return;
    }

    // Zapisz pending action (co user chcial zrobic przed logowaniem)
    if (pendingOpinionModal) {
      authService.setPendingAction({ type: 'add_opinion' });
    } else if (shouldShowSeeAllSkeleton) {
      authService.setPendingAction({ type: 'see_all_opinions' });
    } else {
      authService.setPendingAction({ type: 'recommend' });
    }

    const authUrl = config.getAuthUrl();
    if (authUrl) {
      analytics.trackAuthStarted(provider);
      window.location.href = authUrl;
    }
  };
  
  /**
   * Wyloguj uzytkownika.
   */
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setIsRecommended(false);
    setHasOpinion(false);
    setUserOpinions([]);
    showInfoToast('Wylogowano');
  };
  
  const handleAddOpinionClick = () => {
    if (!isAuthenticated) {
      analytics.trackAuthModalOpened('add_opinion_button');
      setPendingOpinionModal(true);
      setShowAuthModal(true);
    } else {
      if (hasOpinion) {
        // Opinion already added - do nothing, button is just a status indicator
        return;
      }
      // Open opinion modal directly without recommending
      checkGeolocationPermission();
      if (showMobileSearch) {
        addOpinionOriginRef.current = mobileView;
        setMobileView('addOpinion');
      } else {
        setShowAddOpinionModal(true);
      }
    }
  };
  
  const handleRecommendClick = () => {
    if (!isAuthenticated) {
      analytics.trackAuthModalOpened('recommend_button');
      setPendingOpinionModal(false); // This is for recommend only, not opinion modal
      setShowAuthModal(true);
    } else {
      if (hasOpinion) return; // has opinion => already implicitly recommends

      if (isRecommended) {
        // ── Cofnij polecenie (unlike) ──
        setIsRecommending(true);
        api.removeRecommendation().then((result) => {
          setIsRecommending(false);
          if (result.success) {
            setIsRecommended(false);
            showSadToast('Cofnięto polecenie');
          }
        }).catch(() => {
          setIsRecommending(false);
          showErrorToast('Nie udalo sie cofnac polecenia');
        });
        return;
      }

      // ── Dodaj polecenie ──
      setIsRecommending(true);
      api.submitRecommendation().then(() => {
        setIsRecommending(false);
        setIsRecommended(true);
        showSuccessToast('Poleciles to!');
      }).catch(() => {
        setIsRecommending(false);
        showErrorToast('Nie udalo sie dodac polecenia');
      });
    }
  };
  
  const handleRecordVoice = () => {
    if (!isRecordingOpinion) {
      // Start recording
      setIsRecordingOpinion(true);
      
      // Transcribe via API (in production, pass real audio blob)
      api.recordAndTranscribeOpinion(null).then((result) => {
        setIsRecordingOpinion(false);
        setOpinionText(result.text);
      }).catch(() => {
        setIsRecordingOpinion(false);
      });
    } else {
      // Stop recording early
      setIsRecordingOpinion(false);
    }
  };
  
  // handleImproveTextWithAI is now provided by useOpinions hook
  
  const handleBackToRecommendations = () => {
    if (showMobileSearch) {
      setMobileView(addOpinionOriginRef.current);
    } else {
      setShowAddOpinionModal(false);
      setShowRecommendations(true);
    }
    // Reset opinion form
    stopOpinionRecordingCleanup();
    setOpinionText('');
    setSelectedCategories([]);
    setIsRecordingOpinion(false);
    setManualCity('');
    setShowCityInput(false);
    setInputMethod(null);
    setAiSuggestions([]);
    setSelectedSuggestion(null);
    setShowAISuggestions(false);
    setIsGeneratingAI(false);
  };
  
  const handleCloseAddOpinionModal = () => {
    if (showMobileSearch) {
      setMobileView('search');
    } else {
      setShowAddOpinionModal(false);
      setShowRecommendations(false);
      setIsSearchExpanded(false);
      expandedByClickRef.current = false;
    }
    // Reset opinion form
    stopOpinionRecordingCleanup();
    setOpinionText('');
    setSelectedCategories([]);
    setIsRecordingOpinion(false);
    setManualCity('');
    setShowCityInput(false);
    setInputMethod(null);
    setAiSuggestions([]);
    setSelectedSuggestion(null);
    setShowAISuggestions(false);
    setIsGeneratingAI(false);
  };
  
  // generateAISuggestions is now provided by useOpinions hook
  
  // ──────────────────────────────�����──────────────��────────────────
  // 🧪 MOCK OPINION RECORDING — symulacja nagrywania opinii bez mikrofonu
  // ────────────────────────────────────────���─────────────────────
  const startMockOpinionWaveform = () => {
    const animate = () => {
      setOpinionRecordingLevels(prev =>
        prev.map(() => {
          const base = 0.15 + Math.random() * 0.55;
          const pulse = Math.sin(Date.now() / 300) * 0.2;
          return Math.min(1, Math.max(0, base + pulse));
        })
      );
      opinionMockAnimFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopMockOpinionWaveform = () => {
    if (opinionMockAnimFrameRef.current) {
      cancelAnimationFrame(opinionMockAnimFrameRef.current);
      opinionMockAnimFrameRef.current = null;
    }
    setOpinionRecordingLevels(new Array(40).fill(0));
  };

  const handleVoiceInput = async () => {
    setInputMethod('voice');

    // Try real mic first, fall back to mock
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      opinionMediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      opinionAudioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      opinionAnalyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      opinionMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = () => {};
      mediaRecorder.onstop = () => {};

      mediaRecorder.start(250);
      setIsMockRecordingOpinion(false);
      setIsRecordingOpinion(true);

      // Real audio visualization
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = 40;
        const step = Math.floor(dataArray.length / bars);
        const levels: number[] = [];
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += dataArray[i * step + j];
          }
          levels.push(sum / step / 255);
        }
        setOpinionRecordingLevels(levels);
        opinionAnimFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      // Mic unavailable → use mock
      console.info('🎤 Mikrofon niedostępny — uruchamiam mock nagrywania opinii.');
      setIsMockRecordingOpinion(true);
      setIsRecordingOpinion(true);
      startMockOpinionWaveform();
    }
  };

  // stopOpinionRecordingCleanup is now provided by useRecording hook

  const handleOpinionVoiceCancel = () => {
    stopOpinionRecordingCleanup();
    setIsRecordingOpinion(false);
    setInputMethod(null);
  };

  const handleOpinionVoiceConfirm = async () => {
    const wasMock = isMockRecordingOpinion;
    const currentMediaRecorder = opinionMediaRecorderRef.current;
    const wasRecording = !wasMock && currentMediaRecorder && currentMediaRecorder.state !== 'inactive';

    // Cleanup visualization
    stopMockOpinionWaveform();
    if (opinionAnimFrameRef.current) {
      cancelAnimationFrame(opinionAnimFrameRef.current);
      opinionAnimFrameRef.current = null;
    }

    setIsRecordingOpinion(false);
    setIsMockRecordingOpinion(false);
    setIsGeneratingAI(true);

    let capturedBlob: Blob | null = null;

    if (wasRecording) {
      capturedBlob = await new Promise<Blob | null>((resolve) => {
        const chunks: Blob[] = [];
        const origHandler = currentMediaRecorder!.ondataavailable;
        currentMediaRecorder!.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
          if (origHandler) (origHandler as any).call(currentMediaRecorder, e);
        };
        currentMediaRecorder!.onstop = () => {
          const blob = chunks.length > 0 ? new Blob(chunks, { type: 'audio/webm' }) : null;
          resolve(blob);
        };
        currentMediaRecorder!.stop();
      });
    }

    // Cleanup remaining resources
    if (opinionAudioContextRef.current) {
      opinionAudioContextRef.current.close();
      opinionAudioContextRef.current = null;
    }
    if (opinionMediaStreamRef.current) {
      opinionMediaStreamRef.current.getTracks().forEach(t => t.stop());
      opinionMediaStreamRef.current = null;
    }
    opinionAnalyserRef.current = null;
    setOpinionRecordingLevels(new Array(40).fill(0));

    // Transcribe via Whisper API or mock
    const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';

    if (OPENAI_API_KEY && capturedBlob) {
      try {
        const formData = new FormData();
        formData.append('file', capturedBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pl');
        formData.append('response_format', 'json');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const transcribedText = data.text || '';

        if (transcribedText.trim()) {
          setOpinionText(transcribedText);
          generateAISuggestions(transcribedText);
        } else {
          showErrorToast('Nie udało się rozpoznać mowy. Spróbuj ponownie.');
          setIsGeneratingAI(false);
          setInputMethod(null);
        }
      } catch (err) {
        console.error('Opinion transcription error:', err);
        const mockText = 'Świetna obsługa klienta, polecam wszystkim!';
        setOpinionText(mockText);
        generateAISuggestions(mockText);
      }
    } else {
      // Mock transcription — simulate delay then set text
      await new Promise(r => setTimeout(r, 1200));
      const mockText = 'Świetna obsługa klienta, polecam wszystkim!';
      setOpinionText(mockText);
      generateAISuggestions(mockText);
    }
  };
  // ──────────────────────────────────────────────────────────────
  
  // stopRecordingCleanup is now provided by useRecording hook

  const startAudioVisualization = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      // Sample 40 bars from the frequency data
      const bars = 40;
      const step = Math.floor(dataArray.length / bars);
      const levels: number[] = [];
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        levels.push(sum / step / 255); // Normalize 0-1
      }
      setSearchRecordingLevels(levels);
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();
  };

  const handleSearchVoiceInput = async () => {
    if (!enableVoice) return;
    if (isRecordingSearch) return; // Already recording, use cancel/confirm
    
    analytics.trackMicButtonClicked();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      mediaStreamRef.current = stream;
      
      // Setup AudioContext for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setSearchRecordedBlob(blob);
      };
      
      mediaRecorder.start(250); // timeslice 250ms for periodic data chunks
      setIsRecordingSearch(true);
      setSearchRecordedBlob(null);
      startAudioVisualization();
      
    } catch (err: any) {
      // Permission denied or error
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        showErrorToast('Dostep do mikrofonu zostal zablokowany.\nZmien ustawienia w przegladarce.');
      } else {
        showErrorToast('Nie udalo sie uruchomic mikrofonu.');
      }
    }
  };

  const handleSearchVoiceCancel = () => {
    stopRecordingCleanup();
    setIsRecordingSearch(false);
    setSearchRecordedBlob(null);
  };

  const handleSearchVoiceConfirm = async () => {
    const currentMediaRecorder = mediaRecorderRef.current;
    const wasRecording = currentMediaRecorder && currentMediaRecorder.state !== 'inactive';
    
    // Cleanup visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsRecordingSearch(false);
    setIsTranscribing(true);
    
    // Capture blob directly from onstop (React state is async, so we use a local variable)
    let capturedBlob: Blob | null = null;
    
    if (wasRecording) {
      capturedBlob = await new Promise<Blob | null>((resolve) => {
        // Override onstop to capture chunks directly
        currentMediaRecorder!.addEventListener('stop', () => {
          // dataavailable events already fired, but we need to collect from existing handler
          // Instead, re-collect: request final data
        }, { once: true });
        
        // Collect all chunks via dataavailable
        const chunks: Blob[] = [];
        const origHandler = currentMediaRecorder!.ondataavailable;
        currentMediaRecorder!.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
          if (origHandler) (origHandler as any).call(currentMediaRecorder, e);
        };
        currentMediaRecorder!.onstop = () => {
          const blob = chunks.length > 0 ? new Blob(chunks, { type: 'audio/webm' }) : null;
          setSearchRecordedBlob(blob);
          resolve(blob);
        };
        currentMediaRecorder!.stop();
      });
    }
    
    // Cleanup remaining resources
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setSearchRecordingLevels(new Array(40).fill(0));
    
    // ─────────��──────────────────────────────────────��─��───────────
    // 🔧 KONFIGURACJA API WHISPER (OpenAI Speech-to-Text)
    // 
    // Aby podłączyć prawdziwe rozpoznawanie mowy:
    // 1. Utwórz konto na https://platform.openai.com
    // 2. Wygeneruj klucz API w sekcji API Keys
    // 3. Dodaj zmienną środowiskową: VITE_OPENAI_API_KEY=sk-...
    //    (w pliku .env lub w ustawieniach środowiska)
    //
    // ⚠️ UWAGA BEZPIECZEŃSTWA: W produkcji NIGDY nie umieszczaj
    // klucza API po stronie klienta! Stwórz endpoint backendowy
    // (np. /api/transcribe) który proxy'uje request do OpenAI.
    //
    // Obsługiwane modele: whisper-1
    // Obsługiwane formaty: mp3, mp4, mpeg, mpga, m4a, wav, webm
    // Limit rozmiaru pliku: 25 MB
    // ──────────────────���───────────────────────────���───────────────
    
    const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';
    
    if (OPENAI_API_KEY && capturedBlob) {
      try {
        const formData = new FormData();
        formData.append('file', capturedBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pl'); // Polski
        formData.append('response_format', 'json');
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Whisper API error:', errorData);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const transcribedText = data.text || '';
        
        if (transcribedText.trim()) {
          setInputValue(transcribedText);
        } else {
          showErrorToast('Nie udało się rozpoznać mowy. Spróbuj ponownie.');
        }
      } catch (err) {
        console.error('Transcription error:', err);
        showErrorToast('Błąd transkrypcji. Sprawdź klucz API i połączenie.');
        // Fallback to mock
        setInputValue('Ile kosztuje strona internetowa?');
      }
    } else {
      // Fallback: brak klucza API — użyj mock danych
      // W konsoli wyświetl instrukcję konfiguracji
      if (!OPENAI_API_KEY) {
        console.info(
          '🎤 Whisper API nie skonfigurowane. Używam mock transkrypcji.\n' +
          'Aby podłączyć prawdziwe API, dodaj VITE_OPENAI_API_KEY do zmiennych środowiskowych.\n' +
          'Szczegóły: https://platform.openai.com/docs/guides/speech-to-text'
        );
      }
      setInputValue('Ile kosztuje strona internetowa?');
    }
    
    setSearchRecordedBlob(null);
    setIsTranscribing(false);
    
    // Auto-focus textarea after transcription
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };
  
  // ──��───────────────────────────────────────────────────────────
  // 🧪 MOCK RECORDING — symulacja nagrywania bez mikrofonu
  // ─────────────────────────────────────────────��───────────────���
  const startMockWaveform = () => {
    const animate = () => {
      setSearchRecordingLevels(prev => 
        prev.map(() => {
          const base = 0.15 + Math.random() * 0.55;
          const pulse = Math.sin(Date.now() / 300) * 0.2;
          return Math.min(1, Math.max(0, base + pulse));
        })
      );
      mockAnimFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopMockWaveform = () => {
    if (mockAnimFrameRef.current) {
      cancelAnimationFrame(mockAnimFrameRef.current);
      mockAnimFrameRef.current = null;
    }
    setSearchRecordingLevels(new Array(40).fill(0));
  };

  const handleMockVoiceInput = () => {
    if (isRecordingSearch) return;
    setIsMockRecording(true);
    isMockRecordingRef.current = true;
    setIsRecordingSearch(true);
    setSearchRecordedBlob(null);
    startMockWaveform();
  };

  const handleMockVoiceCancel = () => {
    stopMockWaveform();
    setIsMockRecording(false);
    isMockRecordingRef.current = false;
    setIsRecordingSearch(false);
    setSearchRecordedBlob(null);
  };

  const handleMockVoiceConfirm = async () => {
    stopMockWaveform();
    setIsRecordingSearch(false);
    setIsMockRecording(false);
    isMockRecordingRef.current = false;
    setIsTranscribing(true);

    // Transkrypcja przez API (w produkcji przekazać prawdziwy blob audio)
    try {
      const result = await api.transcribeAudio(null, 'search');
      setInputValue(result.text);
    } catch {
      // Fallback na pusty input
    }
    setIsTranscribing(false);
  };
  // ──────────────────────────────────────────────────────────────

  // Auto-confirm callback for max recording duration
  useEffect(() => {
    const handleAutoConfirm = () => {
      if (isMockRecording) {
        handleMockVoiceConfirm();
      } else {
        handleSearchVoiceConfirm();
      }
    };
    setAutoConfirmSearch(handleAutoConfirm);
  }, [isMockRecording, setAutoConfirmSearch]);

  const handleTextInput = () => {
    setInputMethod('text');
  };
  
  // toggleCategory, showError, showSuccess, censorLastName, getFirstLine, getSecondLineSkeleton
  // are now provided by useOpinions hook
  
  const handleEndChatConfirmation = (confirm: boolean) => {
    if (confirm) {
      // User wants to end conversation
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Tak',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, userMessage]);
      playSentSound();
      lastUserMessageIdRef.current = userMessage.id;
      setUnreadScrollMessages(0);
      desktopScroll.pinMessageToTop(userMessage.id);
    mobileScroll.pinMessageToTop(userMessage.id);
      
      setIsTyping(true);
      setTimeout(() => {
        const farewellId = (Date.now() + 1).toString();
        const farewellFull = 'Dziękuję za rozmowę! Do zobaczenia! 👋\n\n**Rozmowa zakończona**';
        setChatMessages(prev => [...prev, {
          id: farewellId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }]);
        setIsTyping(false);
        streamMessageContent(farewellId, farewellFull);
        playReceivedSound();
        setIsChatEnded(true);
        setIsAwaitingEndConfirmation(false);
      }, 1200);
    } else {
      // User wants to continue
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Nie',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, userMessage]);
      playSentSound();
      lastUserMessageIdRef.current = userMessage.id;
      setUnreadScrollMessages(0);
      desktopScroll.pinMessageToTop(userMessage.id);
    mobileScroll.pinMessageToTop(userMessage.id);
      
      setIsTyping(true);
      setTimeout(() => {
        const continueId = (Date.now() + 1).toString();
        const continueFull = 'Świetnie! W czym jeszcze mogę Ci pomóc?';
        setChatMessages(prev => [...prev, {
          id: continueId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        }]);
        setIsTyping(false);
        streamMessageContent(continueId, continueFull);
        playReceivedSound();
        setIsAwaitingEndConfirmation(false);
      }, 1200);
    }
  };
  
  // Compute whether this is the first render after expanding (to skip placeholder y-animation)
  const isFirstExpandRender = wasCollapsedRef.current && isSearchExpanded;
  if (isSearchExpanded) wasCollapsedRef.current = false;
  if (!isSearchExpanded) wasCollapsedRef.current = true;

  return (
    <>
      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)' }}
              onClick={() => {
                setShowAuthModal(false);
                setShowRecommendations(true);
              }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ padding: '16px', backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', border: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white text-sm font-medium">Dołącz do społeczności</h3>
                  <button
                    onClick={() => {
                      analytics.trackAuthModalClosed();
                      setShowAuthModal(false);
                      setShowRecommendations(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="text-center space-y-4" style={{ fontSize: '14px', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' as const }}>
                  {/* Description */}
                  <p className="text-white/70 text-sm">
                    Zaloguj się, aby zobaczyć pełne opinie i dołączyć do naszej społeczności.
                  </p>
                  
                  {/* ── Produkcja — prawdziwy OAuth ── */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20"></div>
                      <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">Produkcja</span>
                      <div className="flex-1 h-px bg-white/20"></div>
                    </div>

                    {/* Google — Production */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-white/90 text-gray-800 rounded-xl transition-all font-medium text-sm relative"
                      onClick={() => handleProductionAuth('google')}
                    >
                      <FaGoogle className="w-5 h-5" />
                      <span>Kontynuuj z Google</span>
                      {!GOOGLE_CONFIG.isConfigured() && (
                        <span className="absolute right-3 text-[10px] text-red-500 font-semibold">.env</span>
                      )}
                    </button>

                    {/* Facebook — Production */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-xl transition-all font-medium text-sm relative"
                      onClick={() => handleProductionAuth('facebook')}
                    >
                      <FaFacebook className="w-5 h-5" />
                      <span>Kontynuuj z Facebook</span>
                      {!FACEBOOK_CONFIG.isConfigured() && (
                        <span className="absolute right-3 text-[10px] text-red-300 font-semibold">.env</span>
                      )}
                    </button>

                    {/* TikTok — Production */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-black/80 text-white rounded-xl transition-all font-medium text-sm relative"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      onClick={() => handleProductionAuth('tiktok')}
                    >
                      <FaTiktok className="w-5 h-5" />
                      <span>Kontynuuj z TikTok</span>
                      {!TIKTOK_CONFIG.isConfigured() && (
                        <span className="absolute right-3 text-[10px] text-red-300 font-semibold">.env</span>
                      )}
                    </button>
                  </div>

                  {/* ── Demo — mock auth (natychmiastowy) ── */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-xs text-white/40 font-medium tracking-wide uppercase">Demo</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Google — Demo */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all font-medium text-sm"
                      onClick={() => {
                        analytics.trackAuthStarted('google');
                        handleAuth('google');
                      }}
                    >
                      <FaGoogle className="w-4 h-4" />
                      <span>Google (demo)</span>
                    </button>
                    
                    {/* Facebook — Demo */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all font-medium text-sm"
                      onClick={() => {
                        analytics.trackAuthStarted('facebook');
                        handleAuth('facebook');
                      }}
                    >
                      <FaFacebook className="w-4 h-4" />
                      <span>Facebook (demo)</span>
                    </button>
                    
                    {/* TikTok — Demo */}
                    <button 
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all font-medium text-sm"
                      onClick={() => {
                        analytics.trackAuthStarted('tiktok');
                        handleAuth('tiktok');
                      }}
                    >
                      <FaTiktok className="w-4 h-4" />
                      <span>TikTok (demo)</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Transcript Email Modal */}
      <AnimatePresence>
        {showTranscriptModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)' }}
              onClick={() => setShowTranscriptModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ padding: '16px', fontSize: '14px', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' as const, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', border: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium" style={{ fontSize: '14px', lineHeight: 1.4 }}>Wyślij transkrypcję</h3>
                  <button
                    onClick={() => setShowTranscriptModal(false)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <p className="text-white/50" style={{ fontSize: '14px', lineHeight: 1.4, margin: '0 0 10px', overflowWrap: 'break-word', wordBreak: 'break-word' as const }}>Podaj adres e-mail, na który wyślemy pełną transkrypcję tej rozmowy.</p>
                
                {transcriptSent ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-white text-center" style={{ fontSize: '14px', lineHeight: 1.4 }}>Transkrypcja została wysłana!</p>
                    <p className="text-white/40 text-center" style={{ fontSize: '14px', lineHeight: 1.4 }}>Sprawdź swoją skrzynkę: {transcriptEmail}</p>
                    <button
                      onClick={() => setShowTranscriptModal(false)}
                      className="mt-2 px-6 py-2.5 text-white/70 hover:text-white rounded-full transition-all"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '14px', lineHeight: 1.4 }}
                    >
                      Zamknij
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!transcriptEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transcriptEmail)) return;
                    setTranscriptSending(true);
                    // Simulate sending
                    setTimeout(() => {
                      setTranscriptSending(false);
                      setTranscriptSent(true);
                    }, 1500);
                  }}>
                    <div className="relative mb-4">
                      <input
                        type="email"
                        value={transcriptEmail}
                        maxLength={100}
                        onChange={(e) => setTranscriptEmail(e.target.value)}
                        placeholder="twoj@email.com"
                        autoFocus
                        className="w-full bg-white/10 rounded-full px-4 py-3 text-white placeholder-white/30 outline-none transition-colors"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '14px', lineHeight: 1.4 }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={transcriptSending || !transcriptEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transcriptEmail)}
                      className={`w-full py-3 rounded-full transition-all font-medium ${
                        transcriptSending || !transcriptEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(transcriptEmail)
                          ? 'bg-white/10 text-white/30 cursor-not-allowed'
                          : 'bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_16px_rgba(11,155,255,0.4)] text-white active:scale-[0.97]'
                      }`}
                      style={{ fontSize: '14px', lineHeight: 1.4 }}
                    >
                      {transcriptSending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Wysyłanie...
                        </span>
                      ) : (
                        'Wyślij transkrypcję'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* About Widget Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              onClick={() => {
                setShowAboutModal(false);
                setIsWidgetCollapsed(true);
                setShowCollapsedIcon(true);
              }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-6"
            >
              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ padding: '16px', fontSize: '14px', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' as const, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', border: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0B9BFF' }}>
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-white text-sm font-medium">Szybkie wyszukiwanie informacji</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAboutModal(false);
                      setIsWidgetCollapsed(true);
                      setShowCollapsedIcon(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-3 text-white/70">
                    <div className="space-y-2">
                      <h3 className="text-white text-sm font-medium flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#0b5cff]" />
                        Co potrafi widget
                      </h3>
                      <ul className="space-y-2 pl-6 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b5cff] mt-0.5">•</span>
                          <span>pomaga szybko znaleźć informacje na stronie</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b5cff] mt-0.5">•</span>
                          <span>informuje właściciela czego użytkownicy nie mogą znaleźć</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b5cff] mt-0.5">•</span>
                          <span>odpowiada na pytania użytkowników</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b5cff] mt-0.5">•</span>
                          <span>wyświetla opinie osób, które możesz znać</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Call to Action */}
                    <div className="pt-4">
                      <p className="text-white text-sm mb-3">
                        Chcesz przetestować za darmo na własnej stronie?
                      </p>
                      
                      <AnimatePresence>
                        {showWebsiteInput && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3"
                          >
                            <p className="text-white/70 text-sm mb-3">
                              Dowiedz się czego użytkownicy nie mogą znaleźć na Twojej stronie.
                            </p>
                            <div className="space-y-3">
                              <div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={websiteUrl}
                                    maxLength={100}
                                    onChange={(e) => {
                                      setWebsiteUrl(e.target.value);
                                      setValidationError('');
                                      setInvalidFields(prev => { const n = new Set(prev); n.delete('url'); return n; });
                                      if (fieldErrors.url) setFieldErrors(prev => { const n = {...prev}; delete n.url; return n; });
                                    }}
                                    onBlur={() => {
                                      const v = websiteUrl.trim();
                                      if (v.length > 0 && v.length < 4) {
                                        setFieldErrors(prev => ({...prev, url: 'Podaj poprawną domenę (np. twojastrona.pl)'}));
                                        setInvalidFields(prev => new Set(prev).add('url'));
                                      } else if (v.length >= 4 && !v.includes('.')) {
                                        setFieldErrors(prev => ({...prev, url: 'Podaj poprawną domenę (np. twojastrona.pl)'}));
                                        setInvalidFields(prev => new Set(prev).add('url'));
                                      }
                                    }}
                                    placeholder="twojastrona.pl"
                                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl transition-all duration-200 text-sm border-0"
                                    style={{ outline: 'none', boxShadow: 'none' }}
                                  />
                                  {websiteUrl.length > 80 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{websiteUrl.length}/100</span>
                                  )}
                                </div>
                                {fieldErrors.url ? (
                                  <p className="text-[#0b5cff]/80 text-xs mt-1 ml-1">{fieldErrors.url}</p>
                                ) : (
                                  <p className="text-white/40 text-xs mt-1 ml-1">Domena strony — wklej pełny URL, wyciągniemy domenę</p>
                                )}
                              </div>
                              <div>
                                <div className="relative">
                                  <input
                                    type="email"
                                    value={companyEmail}
                                    maxLength={100}
                                    onChange={(e) => {
                                      setCompanyEmail(e.target.value);
                                      setValidationError('');
                                      setInvalidFields(prev => { const n = new Set(prev); n.delete('email'); return n; });
                                      if (fieldErrors.email) setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; });
                                    }}
                                    onBlur={() => {
                                      const v = companyEmail.trim();
                                      if (v.length > 0 && (v.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
                                        setFieldErrors(prev => ({...prev, email: 'Podaj poprawny adres email'}));
                                        setInvalidFields(prev => new Set(prev).add('email'));
                                      }
                                    }}
                                    placeholder="twoj@email.com"
                                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl transition-all duration-200 text-sm border-0"
                                    style={{ outline: 'none', boxShadow: 'none' }}
                                  />
                                  {companyEmail.length > 80 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{companyEmail.length}/100</span>
                                  )}
                                </div>
                                {fieldErrors.email ? (
                                  <p className="text-[#0b5cff]/80 text-xs mt-1 ml-1">{fieldErrors.email}</p>
                                ) : null}
                              </div>
                              {validationError && (
                                <p className="text-pink-400 text-xs font-medium">{validationError}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <button
                        onClick={() => {
                          if (!showWebsiteInput) {
                            setShowWebsiteInput(true);
                            setValidationError('');
                            setInvalidFields(new Set());
                            setFieldErrors({});
                          } else {
                            const errors = new Set<string>();
                            const newFieldErrors: Record<string, string> = {};
                            
                            // Validate URL
                            const rawUrl = websiteUrl.trim();
                            if (!rawUrl) {
                              newFieldErrors.url = 'Podaj poprawną domenę (np. twojastrona.pl)';
                              errors.add('url');
                            } else if (rawUrl.length < 4 || !rawUrl.includes('.')) {
                              newFieldErrors.url = 'Podaj poprawną domenę (np. twojastrona.pl)';
                              errors.add('url');
                            } else {
                              // Check TLD exists
                              const tldMatch = rawUrl.match(/\.([a-zA-Z]{2,})(?:[\/\?#]|$)/);
                              if (!tldMatch) {
                                newFieldErrors.url = 'Podaj poprawną domenę (np. twojastrona.pl)';
                                errors.add('url');
                              }
                            }
                            
                            // Validate email
                            const rawEmail = companyEmail.trim();
                            if (!rawEmail) {
                              newFieldErrors.email = 'Podaj poprawny adres email';
                              errors.add('email');
                            } else if (rawEmail.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
                              newFieldErrors.email = 'Podaj poprawny adres email';
                              errors.add('email');
                            }
                            
                            if (errors.size > 0) {
                              setFieldErrors(newFieldErrors);
                              setInvalidFields(errors);
                              return;
                            }
                            
                            // Normalize URL → domain
                            let normalizedDomain = rawUrl;
                            try {
                              const urlWithProto = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
                              normalizedDomain = new URL(urlWithProto).hostname;
                            } catch {
                              normalizedDomain = rawUrl.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
                            }
                            
                            // Track CTA button click - function to be implemented
                            console.log('Domain (normalized):', normalizedDomain, 'Email:', rawEmail);
                            setValidationError('');
                            setInvalidFields(new Set());
                            setFieldErrors({});
                          }
                        }}
                        className="w-full bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97] text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 text-sm"
                      >
                        {showWebsiteInput ? 'Zobacz demo' : 'Wypróbuj na swojej stronie'}
                      </button>
                      
                      <a 
                        href="https://locly.pl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 text-white/50 hover:text-white/70 text-xs transition-colors mt-3"
                      >
                        <span>przejdź do locly.pl</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Privacy Policy Modal */}
      <AnimatePresence>
        {showMobilePrivacyTooltip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              onClick={() => setShowMobilePrivacyTooltip(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[61] flex items-center justify-center px-6 pointer-events-none"
            >
              <div className="relative max-w-sm w-full pointer-events-auto overflow-y-auto" style={{ padding: '16px', fontSize: '14px', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' as const, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', border: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}>
                <p className="text-white" style={{ fontSize: '14px', lineHeight: 1.4, margin: '0 0 10px' }}>
                  Korzystając z widgetu AI, wyrażasz zgodę na monitorowanie i zapisywanie tej rozmowy w celu świadczenia naszych usług oraz przetwarzanie Twoich danych osobowych zgodnie z naszą Polityką Prywatności. Zobacz naszą{' '}
                  <a href="https://locly.pl/privacy" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-white/70 transition-all">Politykę Prywatności</a>.
                </p>
                <button
                  onClick={() => setShowMobilePrivacyTooltip(false)}
                  className="mt-4 w-full py-2.5 rounded-xl text-white hover:text-white/80 transition-all active:scale-[0.97]"
                  style={{ fontSize: '14px', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  Zamknij informację
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Search Bar with Glass Effect - Fixed */}
      <div
        className="fixed bottom-0 left-0 right-0 p-6 md:p-8 z-40"
        style={theme ? {
          '--locly-primary': theme.primary || '#0b5cff',
          '--locly-primary-fg': theme.primaryForeground || '#000',
          '--locly-widget-bg': theme.widgetBg || 'rgba(0,0,0,0.5)',
          '--locly-widget-border': theme.widgetBorder || 'rgba(255,255,255,0.2)',
          '--locly-text': theme.textColor || '#fff',
          '--locly-muted': theme.mutedTextColor || 'rgba(255,255,255,0.7)',
        } as React.CSSProperties : undefined}
      >
        <motion.div 
          ref={widgetContainerRef}
          data-widget-container
          className={`max-w-[540px] relative overflow-visible ${position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'}`}
          animate={{
            opacity: isWidgetCollapsed ? 0 : 1,
            y: isWidgetCollapsed ? 20 : 0
          }}
          transition={{ 
            duration: 0.22, 
            ease: 'easeOut',
            delay: 0
          }}
          onAnimationComplete={() => {
            if (isWidgetCollapsed) {
              setShowCollapsedIcon(true);
            }
          }}
          style={{ pointerEvents: isWidgetCollapsed ? 'none' : 'auto' }}
        >
          {/* Add Opinion Panel */}
          <AnimatePresence>
            {showAddOpinionModal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-[576px] max-w-[calc(100vw-32px)] h-[504px] rounded-2xl flex flex-col"
                style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {inputMethod !== null && !showAISuggestions && (
                      <button
                        onClick={() => {
                          setInputMethod(null);
                          setOpinionText('');
                          setIsRecordingOpinion(false);
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        title="Wróć"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {showAISuggestions && (
                      <button
                        onClick={() => {
                          setShowAISuggestions(false);
                          setAiSuggestions([]);
                          setSelectedSuggestion(null);
                          setInputMethod(null);
                          setOpinionText('');
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        title="Wróć"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {inputMethod === null && !showAISuggestions && (
                      <button
                        onClick={handleBackToRecommendations}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                        title="Wróć do rekomendacji"
                      >
                        <ArrowLeft className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <h3 className="text-white text-sm font-medium">Dodaj opinię w <span className="text-[#0b5cff] font-bold">10 sekund</span></h3>
                  </div>
                  <div className="flex items-center gap-1.5 relative" ref={addOpinionMenuRef}>
                    <button 
                      onClick={() => setShowAddOpinionMenu(prev => !prev)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        handleCloseAddOpinionModal();
                        setShowAddOpinionMenu(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                      title="Zamknij"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showAddOpinionMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2 w-64 rounded-xl z-50"
                          style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                        >
                          {/* Add chat to website */}
                          <a
                            href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowAddOpinionMenu(false)}
                            className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left"
                          >
                            <MessageSquare className="w-5 h-5 text-white/50" />
                            <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Content */}
                <div 
                  ref={opinionModalContentRef}
                  className="p-4 pb-0 space-y-4 flex-1"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 0%',
                    overflow: 'hidden auto',
                    outlineOffset: '-5px',
                    overscrollBehavior: 'contain',
                    scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                    scrollbarWidth: 'thin' as const,
                    marginBottom: '0',
                    marginRight: '16px',
                    borderRadius: '0px 0px 24px 24px',
                    paddingTop: '8px',
                    maskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                  }}
                  onWheel={(e) => {
                    const element = e.currentTarget;
                    const isScrollable = element.scrollHeight > element.clientHeight;
                    const isAtTop = element.scrollTop === 0;
                    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
                    
                    // Prevent page scroll if we can still scroll within the widget
                    if (isScrollable && ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom))) {
                      e.stopPropagation();
                    }
                  }}
                >
                  {/* Step 1: Choose input method */}
                  {inputMethod === null && !showAISuggestions && (
                    <div className="space-y-3 pt-2">
                      <div className="mb-3">
                        <p className="text-white text-sm leading-relaxed">
                          Powiedz, co myślisz - AI ułoży gotową opinię, którą możesz edytować lub od razu wysłać.
                        </p>
                      </div>
                      <p className="text-white text-sm text-center font-medium">Jak chcesz dodać opinię?</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Voice Button */}
                        <button
                          onClick={handleVoiceInput}
                          className="bg-white/10 hover:bg-white/15 text-white rounded-xl p-6 transition-all group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
                              <Mic className="w-8 h-8 text-white/70" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">Nagraj głosem</p>
                              <p className="text-white/60 text-xs mt-1">Powiedz swoją opinię - resztę zrobi AI</p>
                            </div>
                          </div>
                        </button>
                        
                        {/* Text Button */}
                        <button
                          onClick={handleTextInput}
                          className="bg-white/10 hover:bg-white/15 text-white rounded-xl p-6 transition-all group"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
                              <MessageSquare className="w-8 h-8 text-white/70" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">Napisz tekst</p>
                              <p className="text-white/60 text-xs mt-1">Wpisz kilka słów - AI przygotuje gotową wersję</p>
                            </div>
                          </div>
                        </button>
                      </div>
                      <p className="text-white/50 text-xs text-center mt-2">Nie musisz pisać idealnie - AI zrobi to za Ciebie</p>
                    </div>
                  )}
                  
                  {/* Step 2: Voice recording */}
                  {inputMethod === 'voice' && !showAISuggestions && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center py-6 gap-4">
                        {isRecordingOpinion ? (
                          <>
                            <div className="w-full bg-white/5 rounded-2xl p-4">
                              <div className="flex items-center gap-2" style={{ minHeight: '40px', height: '40px' }}>
                                {/* Cancel button */}
                                <motion.button
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: 0.1 }}
                                  onClick={handleOpinionVoiceCancel}
                                  className="flex-shrink-0 w-8 h-8 rounded-full text-white hover:bg-white/10 transition-all flex items-center justify-center"
                                  title="Anuluj nagrywanie"
                                >
                                  <X className="w-5 h-5" />
                                </motion.button>
                                
                                {/* Mock badge */}
                                {isMockRecordingOpinion && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-shrink-0 text-[9px] bg-gray-400 text-black px-1.5 py-0.5 rounded-full"
                                  >
                                    MOCK
                                  </motion.span>
                                )}
                                
                                {/* Audio Waveform Visualization */}
                                <div className="flex-grow flex items-center justify-center gap-[2px] h-8 overflow-hidden">
                                  {opinionRecordingLevels.map((level, i) => (
                                    <motion.div
                                      key={i}
                                      className="w-[3px] rounded-full bg-white/40"
                                      animate={{ 
                                        height: Math.max(6, level * 28) + 'px'
                                      }}
                                      style={{ opacity: 1 }}
                                      transition={{ duration: 0.08, ease: 'easeOut' }}
                                    />
                                  ))}
                                </div>
                                
                                {/* Timer */}
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: 0.15 }}
                                  className="text-white/40 text-sm font-mono tabular-nums flex-shrink-0 min-w-[42px] text-center"
                                >
                                  {opinionRecordingTimer}s
                                </motion.span>
                                
                                {/* Confirm button */}
                                <motion.button
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: 0.1 }}
                                  onClick={handleOpinionVoiceConfirm}
                                  className="flex-shrink-0 w-8 h-8 rounded-full bg-black hover:brightness-90 text-white transition-all flex items-center justify-center"
                                  title="Zatwierdź nagranie"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                            <p className="text-white/40 text-xs">Maks. {MAX_RECORDING_DURATION} sekund</p>
                          </>
                        ) : isGeneratingAI ? (
                          <>
                            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" style={{ strokeWidth: 1 }} />
                            <div className="text-center">
                              <p className="text-white text-sm font-medium">Tworzymy Twoją opinię…</p>
                              <p className="text-white/50 text-xs mt-1">Zaraz zobaczysz gotowe wersje do wyboru</p>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Text input */}
                  {inputMethod === 'text' && !showAISuggestions && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <p className="text-white text-sm leading-relaxed">
                          Napisz kilka słów - zobaczysz 3 gotowe propozycje do wyboru
                        </p>
                      </div>
                      
                      <div className="relative">
                        <label className="text-white text-sm flex items-center gap-1 mb-2">
                          Co Ci się podobało?
                        </label>
                        <textarea
                          value={opinionText}
                          onChange={(e) => setOpinionText(e.target.value)}
                          placeholder="Np. Świetna obsługa, szybka pomoc i wszystko dobrze wytłumaczone"
                          className="no-glow w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm px-4 py-3 rounded-xl transition-all resize-none border-0"
                          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                          rows={4}
                          autoFocus
                        />
                      </div>
                      
                      {isGeneratingAI ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 text-[#0b5cff] animate-spin" />
                            <p className="text-white text-sm font-medium">Tworzymy Twoją opinię…</p>
                          </div>
                          <p className="text-white/50 text-xs">Zaraz zobaczysz gotowe wersje do wyboru</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => {
                              if (!opinionText.trim()) {
                                showErrorToast('Proszę wpisać opinię');
                                return;
                              }
                              generateAISuggestions(opinionText);
                            }}
                            className="px-6 py-0.5 bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97] text-white font-medium text-sm rounded-xl transition-all h-9"
                          >
                            Zobacz 3 propozycje
                          </button>
                          <p className="text-white/50 text-xs">
                            Możesz wybrać i edytować przed wysłaniem
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Step 3: AI Suggestions */}
                  {showAISuggestions && (
                    <div className="space-y-3">
                      <p className="text-white/70 text-sm">
                        {selectedSuggestion !== null
                          ? 'Możesz edytować wybraną opinię przed dodaniem:'
                          : 'Poprawione 3 wersje - wybierz najlepszą'}
                      </p>
                      
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (selectedSuggestion !== index) {
                              setSelectedSuggestion(index);
                              setOpinionText(suggestion);
                              // Scroll to bottom to show "Dodaj opinię" button
                              setTimeout(() => {
                                if (opinionModalContentRef.current) {
                                  opinionModalContentRef.current.scrollTo({
                                    top: opinionModalContentRef.current.scrollHeight,
                                    behavior: 'smooth'
                                  });
                                }
                              }, 100);
                            }
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all ${
                            selectedSuggestion === index
                              ? 'bg-white/10 cursor-default'
                              : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${selectedSuggestion === index ? 'mt-1' : ''} ${
                              selectedSuggestion === index
                                ? 'bg-[#0B9BFF] text-white'
                                : 'bg-white/10 text-white/50'
                            }`}>
                              {index + 1}
                            </div>
                            {selectedSuggestion === index ? (
                              <div className="flex-1 flex flex-col gap-1">
                                <textarea
                                  value={opinionText}
                                  onChange={(e) => setOpinionText(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  rows={4}
                                  className="no-glow w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-lg p-3 resize-none transition-all border-0 focus:ring-0 focus:outline-none"
                                  style={{ outline: 'none', boxShadow: 'none' }}
                                  placeholder="Edytuj swoją opinię..."
                                />
                                <p className="text-white/40 text-xs text-right">{opinionText.length} znaków</p>
                              </div>
                            ) : (
                              <p className="text-white/90 text-sm flex-1">{suggestion}</p>
                            )}
                            {selectedSuggestion === index && (
                              <Check className="w-5 h-5 text-[#0b5cff] flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Manual City Input (if geolocation not available) */}
                  {showAISuggestions && selectedSuggestion !== null && showCityInput && (
                    <div className="space-y-2">
                      <label className="text-white/70 text-sm flex items-center gap-1">
                        Twoje miasto
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={manualCity}
                          maxLength={40}
                          onChange={(e) => setManualCity(e.target.value)}
                          placeholder="np. Warszawa"
                          className="no-glow w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-all border border-transparent focus:ring-0 focus:outline-none"
                          style={{ outline: 'none', boxShadow: 'none' }}
                        />
                        {manualCity.length > 32 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{manualCity.length}/40</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Categories/Tags - only show when AI suggestion is selected */}
                  {showAISuggestions && selectedSuggestion !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-white/70 text-sm flex items-center gap-1">
                          Czego dotyczy opinia
                          <span className="text-red-400">*</span>
                        </p>
                        <p className="text-white/40 text-xs">
                          Pomaga innym szybciej znaleźć właściwą opinię
                        </p>
                      </div>
                      <p className="text-white/40 text-xs">Wybierz do 3</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          disabled={!selectedCategories.includes(category) && selectedCategories.length >= 3}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                            selectedCategories.includes(category)
                              ? 'text-black'
                              : selectedCategories.length >= 3
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                          style={selectedCategories.includes(category) ? { backgroundColor: '#0B9BFF' } : undefined}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                  
                  {/* Submit Button - only show when AI suggestion is selected */}
                  {showAISuggestions && selectedSuggestion !== null && (
                  <div className="flex flex-col items-center gap-2 pb-4">
                    <p className="text-white/40 text-xs">
                      Gotowe w 10 sekund
                    </p>
                    <button
                      onClick={() => {
                        // Validate all required fields
                        if (opinionText.trim() === '') {
                          showErrorToast('Proszę wpisać opinię');
                          return;
                        }
                        
                        if (selectedCategories.length === 0) {
                          showErrorToast('Proszę wybrać przynajmniej jedną kategorię');
                          return;
                        }
                        
                        if (showCityInput && manualCity.trim() === '') {
                          showErrorToast('Proszę wpisać nazwę miasta');
                          return;
                        }
                        
                        setIsSubmittingOpinion(true);
                        analytics.trackOpinionSubmitted(selectedCategories.length, inputMethod || 'text');
                        
                        const finalCity = showCityInput ? manualCity : userCity;
                        api.submitOpinion({
                          text: opinionText,
                          categories: selectedCategories,
                          city: finalCity,
                          avatar: userAvatar,
                          inputMethod: inputMethod as 'text' | 'voice' | null,
                        }).then((result) => {
                          setIsSubmittingOpinion(false);
                          if (showMobileSearch) {
                            setMobileView('search');
                          } else {
                            setShowAddOpinionModal(false);
                            setShowRecommendations(false);
                          }
                          
                          const newOpinion: Recommendation = {
                            id: result.id,
                            avatar: userAvatar,
                            name: 'Ty',
                            city: finalCity,
                            opinion: opinionText,
                            categories: selectedCategories,
                            date: new Date().toISOString().split('T')[0],
                            status: result.status
                          };
                          
                          setUserOpinions([newOpinion]);
                          setHasOpinion(true);
                          setOpinionText('');
                          setSelectedCategories([]);
                          setManualCity('');
                          setInputMethod(null);
                          setAiSuggestions([]);
                          setSelectedSuggestion(null);
                          setShowAISuggestions(false);
                          setIsGeneratingAI(false);
                          
                          showSuccessToast('Dodałeś opinię');
                        }).catch(() => {
                          setIsSubmittingOpinion(false);
                          showErrorToast('Nie udało się dodać opinii');
                        });
                      }}
                      disabled={isSubmittingOpinion}
                      className="px-6 py-0.5 bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97] disabled:bg-[#0B9BFF]/50 disabled:cursor-not-allowed disabled:shadow-none text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 h-9"
                    >
                      {isSubmittingOpinion ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Dodaj opinię'
                      )}
                    </button>
                    <p className="text-white/40 text-xs text-center max-w-sm">
                      Sprawdzamy opinie przed publikacją, żeby były wiarygodne
                    </p>
                  </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Recommendations Overlay */}
          <AnimatePresence>
            {showRecommendations && !showAddOpinionModal && (
              <motion.div
                initial={instantModalRef.current ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={handleWidgetMouseEnter}
                onMouseLeave={handleWidgetMouseLeave}
                className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-[576px] max-w-[calc(100vw-32px)] h-[504px] rounded-2xl flex flex-col"
                style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden', zIndex: instantModalRef.current ? 3 : 2 }}
              >
                {/* Header */}
                <div className="flex flex-col gap-3 p-4 pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-sm font-medium">Rekomendacje</h3>
                    </div>
                    <div className="flex items-center gap-1.5 relative" ref={recommendationsMenuRef}>
                      <button 
                        onClick={() => setShowRecommendationsMenu(prev => !prev)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={() => {
                          setShowRecommendations(false);
                          setShowRecommendationsMenu(false);
                          setIsSearchExpanded(false);
                          expandedByClickRef.current = false;
                        }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {showRecommendationsMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-64 rounded-xl z-50"
                            style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                          >
                            {/* Add chat to website */}
                            <a
                              href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowRecommendationsMenu(false)}
                              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left"
                            >
                              <MessageSquare className="w-5 h-5 text-white/50" />
                              <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-2">
                        <img src={imgOvalCopy2} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <img src={imgOvalCopy3} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <img src={imgOvalCopy9} alt="" className="w-7 h-7 rounded-full object-cover" />
                      </div>
                      <p className="text-white/50 text-sm">
                        {recommendations.length} z Twojej okolicy poleca
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleRecommendClick}
                        disabled={isRecommending || hasOpinion}
                        className={`flex items-center justify-center gap-2 h-9 px-4 rounded-full transition-all duration-700 text-[14px] relative ${
                          hasOpinion
                            ? 'bg-white/5 text-white/40 cursor-default'
                            : isRecommended
                            ? 'bg-white/5 text-white/40 hover:bg-white/10 cursor-pointer'
                            : isRecommending
                            ? 'bg-[#0B9BFF]/70 text-white cursor-default'
                            : 'bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97] text-white'
                        }`}
                        title={isRecommended && !hasOpinion ? 'Kliknij aby cofnac polecenie' : undefined}
                      >
                        {isRecommending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </>
                        ) : hasOpinion ? (
                          <>
                            <span>Polecasz to</span>
                          </>
                        ) : isRecommended ? (
                          <>
                            <X className="w-4 h-4" />
                            <span>Polecono</span>
                          </>
                        ) : (
                          <>
                            <span>Poleć</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleAddOpinionClick();
                        }}
                        disabled={hasOpinion}
                        className={`flex items-center justify-center gap-2 h-9 px-4 rounded-full transition-all duration-700 text-[14px] group ${
                          hasOpinion
                            ? 'bg-white/5 text-white/40 cursor-default'
                            : isRecommended
                              ? 'bg-[#0B9BFF] text-white font-medium hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97]'
                              : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white/90'
                        }`}
                      >
                        <span>{hasOpinion ? 'Opinia dodana' : 'Dodaj opinię'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div 
                  className="p-4 pb-0 flex-1"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 0%',
                    overflow: 'hidden auto',
                    outlineOffset: '-5px',
                    overscrollBehavior: 'contain',
                    scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                    scrollbarWidth: 'thin' as const,
                    marginBottom: '0',
                    borderRadius: '0px 0px 24px 24px',
                    paddingTop: '8px',
                    paddingBottom: '0',
                    maskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                  }}
                  onWheel={(e) => {
                    const element = e.currentTarget;
                    const isScrollable = element.scrollHeight > element.clientHeight;
                    const isAtTop = element.scrollTop === 0;
                    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;
                    
                    // Prevent page scroll if we can still scroll within the widget
                    if (isScrollable && ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom))) {
                      e.stopPropagation();
                    }
                  }}
                >
                  {/* Recommendation Box - shown when user recommended but has no opinion */}
                  {isRecommended && !hasOpinion && (
                    <div className="mb-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-white text-sm font-medium">
                        Poleciłeś to miejsce
                      </p>
                      <p className="text-white/60 text-xs mt-0.5">
                        Podziel się opinią, która pomoże Twoim znajomym
                      </p>
                    </div>
                  )}
                  
                  {/* Opinions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Skeleton Loader - Show during loading */}
                    <AnimatePresence>
                      {isLoadingOpinions && (
                        <>
                          {/* Show 3 skeleton items */}
                          {[1, 2, 3].map((skeletonIdx) => (
                            <motion.div 
                              key={`skeleton-${skeletonIdx}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: skeletonIdx * 0.05 }}
                              className="flex gap-3 mb-0 pb-0"
                            >
                              {/* Avatar Skeleton */}
                              <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 animate-pulse" />
                              
                              {/* Content Skeleton */}
                              <div className="flex-1 space-y-2">
                                {/* Name and Date Skeleton */}
                                <div className="flex items-center justify-between">
                                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                                </div>
                                
                                {/* City Skeleton */}
                                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                
                                {/* Tags Skeleton */}
                                <div className="flex items-center gap-1.5">
                                  <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
                                  <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
                                </div>
                                
                                {/* Opinion Text Skeleton */}
                                <div className="space-y-2">
                                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                                  <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
                                  <div className="h-3 w-4/6 bg-white/10 rounded animate-pulse" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                    
                    {/* Actual Opinions - Show when not loading */}
                    {!isLoadingOpinions && [...userOpinions, ...(isAuthenticated ? recommendations : [recommendations[0]])].map((rec, idx) => {
                      const isOnlyPreview = !isAuthenticated && !userOpinions.some(u => u.id === rec.id);
                      const isLast = idx === (userOpinions.length + (isAuthenticated ? recommendations.length : 1) - 1);
                      return (
                      <div key={rec.id} className="flex flex-col gap-1.5 mb-0 pb-0">
                        {/* Header: Avatar + Name + Date */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={rec.avatar} 
                              alt={rec.name}
                              className={`w-full h-full object-cover ${!isAuthenticated ? 'blur-[4px]' : ''}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-white font-medium text-sm flex items-center gap-2">
                                  {isAuthenticated ? (
                                    rec.name
                                  ) : (
                                    <>
                                      {rec.name.split(' ')[0]}
                                      <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                    </>
                                  )}
                                  {rec.status && (
                                    <span className="relative">
                                      <span 
                                        className="text-white font-normal cursor-help rounded-full"
                                        style={{ 
                                          backgroundColor: 'rgba(10, 12, 20, 0.25)', 
                                          padding: '6px 12px',
                                          fontSize: '11px',
                                          lineHeight: '1.4'
                                        }}
                                        onMouseEnter={() => setHoveredStatus(rec.id)}
                                        onMouseLeave={() => setHoveredStatus(null)}
                                      >
                                        {rec.status}
                                      </span>
                                      {hoveredStatus === rec.id && (
                                        <span className="absolute top-full left-0 mt-1 px-2 py-1 bg-[#27272B] text-white text-xs rounded whitespace-nowrap z-50 block">
                                          widoczna tylko dla Ciebie
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="text-white/40 text-xs flex-shrink-0 ml-2">
                                {new Date(rec.date).toLocaleDateString('pl-PL', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                            
                            {/* City below name */}
                            <p className="text-white/50 text-xs mt-0.5">{rec.city}</p>
                            
                            {/* Tags */}
                            {rec.categories && rec.categories.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                {rec.categories.map((category, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-0.5 bg-white/5 text-white text-xs rounded-full"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Opinion Text */}
                        <p className="text-white/80" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                          {(isAuthenticated || isOnlyPreview) ? (
                            rec.opinion
                          ) : (
                            <>
                              {getFirstLine(rec.opinion)}{' '}
                              {getSecondLineSkeleton(rec.opinion) && (
                                <>
                                  <span className="inline-block w-12 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-20 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-24 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-20 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-28 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-32 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  <br />
                                  <span className="inline-block w-24 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-20 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                  {' '}
                                  <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                </>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    );
                    })}
                    
                    {/* Additional Recommenders - Show when authenticated */}
                    {isAuthenticated && !isLoadingOpinions && (
                      <div className="pt-4 pb-4">
                        <p className="text-white/60 text-xs mb-3">Polecają również:</p>
                        <div className="space-y-2">
                          {additionalRecommenders.map((person) => (
                            <div key={person.id} className="flex items-center gap-2">
                              <img
                                src={person.avatar}
                                alt={person.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex items-center gap-1.5">
                                <span className="text-white/80 text-sm">{person.name}</span>
                                <span className="text-white/40 text-xs">•</span>
                                <span className="text-white/50 text-xs">{person.city}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-white/40 text-xs pl-8 pt-2">i 10 więcej</p>
                      </div>
                    )}
                    
                    {/* Additional Recommenders Skeleton - Show when loading */}
                    {isLoadingOpinions && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="pt-4"
                      >
                        <div className="h-3 w-24 bg-white/10 rounded animate-pulse mb-3" />
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                              <div className="flex items-center gap-1.5">
                                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* See More Button - Centered - Only show when not authenticated */}
                  {!isAuthenticated && (
                    <div className="flex flex-col items-center justify-center gap-2 flex-1">
                      <button 
                        className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        onClick={() => {
                          analytics.trackSeeMoreClicked();
                          analytics.trackAuthModalOpened('see_more_button');
                          setShouldShowSeeAllSkeleton(true);
                          setShowAuthModal(true);
                        }}
                      >
                        Zobacz wszystkie
                      </button>
                      <p className="text-white/40 text-xs">Dowiedz się kto z Twoich znajomych dodał opinię</p>
                    </div>
                  )}
                  

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Overlay */}
          <AnimatePresence>
            {showChatOverlay && (
              <motion.div
                initial={instantModalRef.current && !isMobileDevice ? false : isMobileDevice ? { y: '100%', opacity: 1 } : { opacity: 0, y: 10 }}
                animate={isMobileDevice 
                  ? { y: isDraggingChat ? chatDragY : 0, opacity: isDraggingChat ? Math.max(0.6, 1 - chatDragY / 400) : 1 } 
                  : { opacity: 1, y: 0 }
                }
                exit={isMobileDevice ? { y: '100%', opacity: 0.5 } : { opacity: 0, y: 10 }}
                transition={isDraggingChat 
                  ? { type: 'tween', duration: 0 } 
                  : isMobileDevice 
                    ? { type: 'spring', damping: 28, stiffness: 300 } 
                    : { duration: 0.2 }
                }
                className="fixed inset-0 z-50 bg-[#18181B] flex flex-col md:absolute md:inset-auto md:bottom-full md:mb-2.5 md:left-1/2 md:-translate-x-1/2 md:w-[576px] md:max-w-[calc(100vw-32px)] md:h-[504px] md:rounded-2xl overflow-hidden md:z-auto"
                style={!isMobileDevice ? { backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', zIndex: instantModalRef.current ? 3 : 2 } : undefined}
                // On mobile: full screen via fixed inset-0; maxHeight only on md+ via Tailwind
              >
                {/* Swipe handle (mobile only) */}
                <div 
                  className="md:hidden flex justify-center pt-2 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
                  onTouchStart={handleChatTouchStartWrapped}
                  onTouchMove={handleChatTouchMoveWrapped}
                  onTouchEnd={handleChatTouchEndWrapped}
                  style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 8px))' }}
                >
                  <div className="w-10 h-1 rounded-full bg-white/30" />
                </div>
                
                {/* Header */}
                <div 
                  className="flex items-center justify-between px-4 pb-2 shrink-0 md:pt-4"
                  style={{ ...(!isMobileDevice ? { paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' } : {}) }}
                  onTouchStart={handleChatTouchStartWrapped}
                  onTouchMove={handleChatTouchMoveWrapped}
                  onTouchEnd={handleChatTouchEndWrapped}
                >
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        triggerHaptic(5);
                        setShowChatOverlay(false);
                        onToggle?.(false);
                        setHasClosedChat(true);
                        setIsSearchExpanded(false);
                        expandedByClickRef.current = false;
                      }}
                      className="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white transition-all md:hidden"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-white text-sm font-medium">Wyniki wyszukiwania</h3>
                      <p className="text-white/40 text-xs md:hidden">AI asystent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 relative" ref={chatMenuRef}>
                    <button 
                      onClick={() => setShowChatMenu(prev => !prev)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-white" />
                    </button>
                    <button 
                      onClick={() => {
                        setShowChatOverlay(false);
                        onToggle?.(false);
                        setHasClosedChat(true);
                        setShowChatMenu(false);
                        setIsSearchExpanded(false);
                        expandedByClickRef.current = false;
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showChatMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2 w-64 rounded-xl z-50"
                          style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                        >
                          {/* Send transcript */}
                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setTranscriptEmail('');
                              setTranscriptSent(false);
                              setShowTranscriptModal(true);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left"
                          >
                            <Mail className="w-5 h-5 text-white/50" />
                            <span className="text-white/80 text-sm">Wyślij transkrypcję</span>
                          </button>
                          
                          {/* Add chat to website */}
                          <a
                            href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowChatMenu(false)}
                            className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left"
                          >
                            <MessageSquare className="w-5 h-5 text-white/50" />
                            <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                          </a>
                          
                          {/* Sounds toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const newVal = !soundsEnabled;
                              setSoundsEnabled(newVal);
                              localStorage.setItem('locly_sounds_disabled', newVal ? 'false' : 'true');
                              if (newVal) playSentSound();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {soundsEnabled ? (
                                <Volume2 className="w-5 h-5 text-white/50" />
                              ) : (
                                <VolumeX className="w-5 h-5 text-white/50" />
                              )}
                              <span className="text-white/80 text-sm">Dźwięki</span>
                            </div>
                            {/* Toggle switch */}
                            <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${soundsEnabled ? 'bg-[#0b5cff]' : 'bg-white/20'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${soundsEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Scrollable Chat Messages */}
                <div className="relative flex-1 flex flex-col min-h-0">
                  <div 
                    ref={chatMessagesRef}
                    className="flex-1 min-h-0 px-4"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '1 1 0%',
                      overflowX: 'hidden',
                      overflowY: 'auto',
                      outlineOffset: '-5px',
                      overscrollBehavior: 'contain',
                      scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                      scrollbarWidth: 'thin' as const,
                      marginBottom: '0',
                      marginRight: '16px',
                      borderRadius: '0px 0px 24px 24px',
                      paddingTop: '8px',
                      maskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)',
                    }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      desktopScroll.handleScrollEvent(el);
                      const atBottom = isAtBottom(el);
                      // During auto-scroll animation, don't update wasAtBottomRef
                      // to prevent it from flickering back to true mid-animation
                      if (!autoScrollInProgressRef.current) {
                        wasAtBottomRef.current = atBottom;
                      }
                      prevScrollHeightRef.current = el.scrollHeight;
                      // When user reaches bottom, mark all current messages as "seen"
                      if (atBottom && chatMessages.length > 0) {
                        lastBottomMessageIdRef.current = chatMessages[chatMessages.length - 1].id;
                        // Also update read state so badge stays correct when closing
                        setLastReadMessageId(chatMessages[chatMessages.length - 1].id);
                        setUnreadCount(0);
                      }
                      // Update floating button
                      updateScrollButton(el);
                      // Update badge — only count new unread messages
                      if (atBottom) {
                        setUnreadScrollMessages(0);
                      } else {
                        setUnreadScrollMessages(countUnreadAiMessages());
                      }
                    }}
                  >
                  {chatMessages.map((message) => {
                    return (
                    <div key={message.id} data-message-id={message.id} className="mb-5 scroll-mt-4">
                      <div
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && message.answerData ? (
                          // AI Answer Card
                          <AIAnswerCard
                            data={message.answerData}
                            timestamp={message.timestamp}
                            sources={message.sources}
                            followUpQuestions={message.followUpQuestions}
                            onCtaClick={(action) => {
                              if (action === 'quote') {
                                handleSubmit('Chciałbym zapytać o wycenę');
                              } else if (action === 'portfolio') {
                                showInfoToast('Przekierowanie do portfolio...');
                              } else if (action === 'contact') {
                                showInfoToast('Otwieranie formularza kontaktowego...');
                              }
                            }}
                            onFollowUpClick={(question) => {
                              handleSubmit(question);
                            }}
                          />
                        ) : message.role === 'user' ? (
                          // User bubble
                          <div
                            className="max-w-[80%] rounded-2xl outline-none text-white"
                            style={{ backgroundColor: 'rgba(10, 12, 20, 0.25)', padding: '12px 16px' }}
                          >
                            <p
                              className="whitespace-pre-wrap break-words"
                              style={{ fontSize: '14px', lineHeight: '1.4' }}
                            >
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          // Plain-text assistant bubble — mirrors AIAnswerCard's
                          // headline block so the Phase 1 → Phase 2 (stream → card)
                          // transition doesn't visibly reflow the text.
                          <div className="w-full">
                            <div className="pr-5 pt-1 pb-3">
                              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            {message.content !== 'Czy chcesz zakończyć rozmowę?' && (
                              <div className="pr-5 pb-2.5">
                                <p className="text-white/20 text-[10px]">
                                  {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            )}
                            
                            {/* End Conversation Buttons */}
                            {message.content === 'Czy chcesz zakończyć rozmowę?' && isAwaitingEndConfirmation && !isChatEnded && (
                              <div className="flex justify-center gap-2 mt-3">
                                <button
                                  onClick={() => handleEndChatConfirmation(true)}
                                  className="px-4 py-2 bg-white hover:brightness-90 text-black rounded-full transition-all"
                                  style={{ fontSize: '14px' }}
                                >
                                  Tak, chcę
                                </button>
                                <button
                                  onClick={() => handleEndChatConfirmation(false)}
                                  className="px-4 py-2 bg-white hover:brightness-90 text-black rounded-full transition-all"
                                  style={{ fontSize: '14px' }}
                                >
                                  Nie, nie chcę
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="mb-3">
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/10">
                          <div className="flex gap-1.5">
                            <motion.div
                              className="w-1.5 h-1.5 bg-white/60 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0
                              }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 bg-white/60 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.4
                              }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 bg-white/60 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.8
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  <div ref={desktopScroll.spacerRef} style={{ flexShrink: 0 }} />
                  </div>

                  {/* Scroll to bottom button */}
                  <AnimatePresence>
                    {showScrollToBottom && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                          duration: 0.3
                        }}
                        onClick={() => {
                          if (chatMessagesRef.current) {
                            chatMessagesRef.current.scrollTo({
                              top: chatMessagesRef.current.scrollHeight,
                              behavior: 'smooth'
                            });
                            setUnreadScrollMessages(0);
                            wasAtBottomRef.current = true;
                            if (chatMessages.length > 0) {
                              lastBottomMessageIdRef.current = chatMessages[chatMessages.length - 1].id;
                            }
                          }
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors z-10"
                      >
                        <ArrowDown className="w-4 h-4 text-black" />
                        {unreadScrollMessages > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-[#0b5cff] text-black rounded-full flex items-center justify-center px-1" style={{ fontSize: '11px', lineHeight: '1', fontWeight: 600 }}>
                            {unreadScrollMessages}
                          </span>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Input Area - Intercom style */}
                <div className="shrink-0 bg-[#18181B] px-3 pt-3 md:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
                  {isChatEnded ? (
                    <div className="text-center py-2">
                      <button
                        onClick={() => {
                          setChatMessages([]);
                          setIsChatEnded(false);
                          setIsAwaitingEndConfirmation(false);
                        }}
                        className="text-[#0b5cff] text-sm hover:text-[#3a82ff] transition-all"
                      >
                        Rozpocznij nową rozmowę
                      </button>
                    </div>
                  ) : (
                    <div className="backdrop-blur-md bg-white/5 rounded-2xl p-2" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      {/* Mobile image previews */}
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 px-1 mb-2">
                          {images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Upload ${index + 1}`}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-1 -right-1 bg-black/80 text-white rounded-full p-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <textarea
                        ref={mobileChatInputRef}
                        className="w-full bg-transparent text-white outline-none resize-none px-2 placeholder-white/40"
                        style={{ 
                          fontSize: '14px', 
                          lineHeight: '22px',
                          minHeight: '22px',
                          maxHeight: '100px',
                          overflow: 'auto',
                          paddingTop: '0',
                          paddingBottom: '0'
                        }}
                        rows={1}
                        placeholder="Zapytaj o cokolwiek..."
                        value={mobileInputValue}
                        onChange={(e) => {
                          setMobileInputValue(e.target.value);
                          if (mobileChatInputRef.current) {
                            mobileChatInputRef.current.style.height = 'auto';
                            mobileChatInputRef.current.style.height = `${mobileChatInputRef.current.scrollHeight}px`;
                          }
                        }}
                        onKeyDown={handleMobileChatKeyDown}
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1">
                          <button 
                            className="text-white/50 hover:text-white p-1.5 rounded-lg transition-all"
                            onClick={handleAddImageClick}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-gray-400/70 hover:text-gray-500 p-1.5 rounded-lg transition-all"
                            onClick={handleMockVoiceInput}
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={handleMobileChatSubmit}
                          disabled={mobileInputValue.trim().length === 0}
                          className={`rounded-full p-2 transition-all ${
                            mobileInputValue.trim().length > 0
                              ? 'bg-[#0b5cff] text-black hover:brightness-90 hover:shadow-[0_0_16px_rgba(11,92,255,0.4)]'
                              : 'bg-white/10 text-white/30'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Floating containers above search bar — stacked in flex column */}
          <div 
            ref={floatingContainersRef} 
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[568px] max-w-[calc(100vw-32px)] z-40 pointer-events-none hidden md:flex flex-col items-stretch gap-2"
            onMouseEnter={handleWidgetMouseEnter}
            onMouseLeave={handleWidgetMouseLeave}
          >
            {/* Popular Searches Modal */}
            <AnimatePresence>
              {showPopularSearches && !inputValue && !showRecommendations && !showChatOverlay && !showAuthModal && !showAboutModal && !showWebsiteInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl pointer-events-auto"
                  style={{ padding: '16px', backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}
                  onMouseDown={(e) => { if (!(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement || (e.target as HTMLElement).closest?.('button, a'))) e.preventDefault(); }}
                >
                  <div className="flex items-center justify-end mb-3">
                    <button
                      onClick={() => {
                        setShowPopularSearches(false);
                        setIsSearchExpanded(false);
                        expandedByClickRef.current = false;
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      "Jak skontaktować się z obsługą klienta?",
                      "Jakie są godziny otwarcia?",
                      "Czy oferujecie darmową dostawę?"
                    ].map((query, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShowPopularSearches(false);
                          // Automatically trigger search with the query text
                          handleSubmit(query);
                        }}
                        className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-200 text-sm"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                  {/* Logo and tagline at bottom - centered */}
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0B9BFF' }}>
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        </svg>
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">
                        <a href="https://locly.pl" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-all">locly</a> znajdzie informację lub zgłosi jej brak właścicielowi.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPopularSearches(false);
                        setShowHowItWorksOverlay(true);
                      }}
                      className="text-white hover:opacity-80 text-xs transition-opacity"
                    >
                      Jak to działa?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Privacy Disclaimer — separate container between popular searches and widget */}
            <AnimatePresence>
              {showPrivacyDisclaimer && isSearchExpanded && showPopularSearches && !inputValue && !showChatOverlay && !showRecommendations && !showAuthModal && !showAboutModal && !showWebsiteInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-auto"
                  style={{ padding: '16px', backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}
                  onMouseDown={(e) => { if (!(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement || (e.target as HTMLElement).closest?.('button, a'))) e.preventDefault(); }}
              >
                <div className="flex items-start gap-2">
                  <p className="text-white/40 leading-relaxed flex-1" style={{ fontSize: '12px' }}>
                    Korzystając z widgetu AI, wyrażasz zgodę na naszą{' '}
                    <span 
                      className="relative inline-block"
                      onMouseEnter={() => {
                        if (privacyTooltipTimeout.current) {
                          clearTimeout(privacyTooltipTimeout.current);
                          privacyTooltipTimeout.current = null;
                        }
                        setShowPrivacyTooltip(true);
                      }}
                      onMouseLeave={() => {
                        if (privacyTooltipTimeout.current) {
                          clearTimeout(privacyTooltipTimeout.current);
                        }
                        privacyTooltipTimeout.current = setTimeout(() => setShowPrivacyTooltip(false), 150);
                      }}
                    >
                      <a
                        href="https://locly.pl/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-white/70 transition-all"
                      >Politykę Prywatności</a>
                      <AnimatePresence>
                        {showPrivacyTooltip && (
                          <motion.span
                            initial={{ opacity: 0, y: 5, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 5, x: '-50%' }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full left-1/2 mb-1 w-72 text-white text-[11px] leading-relaxed rounded-lg px-4 py-3 z-[9999]"
                            style={{ backgroundColor: '#27272B' }}
                            onMouseEnter={() => {
                              if (privacyTooltipTimeout.current) {
                                clearTimeout(privacyTooltipTimeout.current);
                                privacyTooltipTimeout.current = null;
                              }
                            }}
                            onMouseLeave={() => {
                              if (privacyTooltipTimeout.current) {
                                clearTimeout(privacyTooltipTimeout.current);
                              }
                              privacyTooltipTimeout.current = setTimeout(() => setShowPrivacyTooltip(false), 150);
                            }}
                          >
                            Korzystając z widgetu AI, wyrażasz zgodę na monitorowanie i zapisywanie tej rozmowy w celu świadczenia naszych usług oraz przetwarzanie Twoich danych osobowych zgodnie z naszą Polityką Prywatności. Zobacz naszą{' '}
                            <a href="https://locly.pl/privacy" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-white/70 transition-all">Politykę Prywatności</a>.
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>.
                  </p>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPrivacyDisclaimer(false);
                      localStorage.setItem('locly_privacy_dismissed', 'true');
                    }}
                    className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0 mt-0.5 active:scale-90"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          
          <motion.div
            ref={searchBarRef}
            className={`p-2 md:py-0 md:px-2 rounded-2xl ${showChatOverlay || showMobileSearch ? 'hidden md:block' : ''}`}
            onMouseEnter={handleWidgetMouseEnter}
            onMouseLeave={handleWidgetMouseLeave}
            animate={{
              width: isMobileDevice ? '100%' : (isSearchExpanded ? expandedWidth : 324),
            }}
            transition={{
              type: 'spring',
              damping: 40,
              stiffness: 300,
              mass: 1,
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.87)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
              margin: '0 auto',
              maxWidth: '100%',
              borderRadius: isMobileDevice ? '16px' : '24px',
              ...(isMobileDevice ? {} : { height: isMultiline && isSearchExpanded ? undefined : 48, minHeight: 48, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' as const }),
            }}
          >
            {/* Desktop collapsed compact view */}
            <AnimatePresence>
            {!isSearchExpanded && (
            <motion.div
              key="collapsed-desktop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="hidden md:flex items-center gap-3 w-full"
              style={{ position: 'absolute', inset: 0, zIndex: 10, alignItems: 'center', paddingLeft: '24px', paddingRight: '8px' }}
            >
              <div
                className="flex-1 min-w-0 overflow-hidden cursor-text"
                onClick={() => {
                  setShowAddOpinionModal(false);
                  if (chatMessages.length > 0) {
                    if (showRecommendations) instantModalRef.current = true;
                    clearAutoCollapseTimer();
                    setShowChatOverlay(true);
                    setShowRecommendations(false);
                    setUnreadCount(0);
                    onToggle?.(true);
                  }
                  setIsSearchExpanded(true);
                  expandedByClickRef.current = true;
                  setTimeout(() => textareaRef.current?.focus(), 350);
                }}
              >
                {inputValue ? (
                  <span className="text-black truncate block" style={{ fontSize: '14px' }}>
                    {inputValue}
                  </span>
                ) : (
                  <div className="relative" style={{ height: '22px' }}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={chatMessages.length > 0 && hasClosedChat && !showChatOverlay ? 'continue' : currentPlaceholder}
                        initial={{ x: 16, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -16, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="text-gray-700 block truncate absolute inset-0"
                        style={{ fontSize: '14px', lineHeight: '150%' }}
                      >
                        {chatMessages.length > 0 && hasClosedChat && !showChatOverlay ? 'Kontynuuj rozmowę' : placeholders[currentPlaceholder]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {/* Chat icon with unread badge */}
              {chatMessages.length > 0 && hasClosedChat && !inputValue && !showChatOverlay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${showChatOverlay ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showChatOverlay) {
                      // Closing chat - start auto-collapse timer
                      setShowChatOverlay(false);
                      setShowRecommendations(false);
                      startAutoCollapseTimerIfNotHovering();
                    } else {
                      // Opening chat - clear any pending timer
                      if (showRecommendations) instantModalRef.current = true;
                      clearAutoCollapseTimer();
                      setShowChatOverlay(true);
                      setShowRecommendations(false);
                      setUnreadCount(0);
                    }
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#0B9BFF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {unreadCount}
                    </div>
                  )}
                </motion.div>
              )}
              {showSocialProof && (
                <div
                  ref={avatarsAnchorRef}
                  className={`group flex items-center gap-1.5 flex-shrink-0 rounded-full cursor-pointer transition-colors ${
                    hasOpinion
                      ? 'bg-green-500/20 hover:bg-green-500/30'
                      : isRecommended
                      ? 'bg-[#0b5cff]/20 hover:bg-[#0b5cff]/40'
                      : 'hover:bg-[#F2F2F2]'
                  }`}
                  style={{
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    paddingLeft: '8px',
                    paddingRight: '6px'
                  }}
                  onMouseEnter={() => setIsHoveringAvatars(true)}
                  onMouseLeave={() => setIsHoveringAvatars(false)}
                  onClick={() => {
                    setShowAddOpinionModal(false);
                    setIsSearchExpanded(true);
                    expandedByClickRef.current = true;
                    if (!showRecommendations) {
                      if (showChatOverlay) instantModalRef.current = true;
                      setShowChatOverlay(false);
                      onToggle?.(false);
                      if (chatMessages.length > 0) {
                        setHasClosedChat(true);
                      }
                      analytics.trackRecommendationsOpened();
                      setShowRecommendations(true);
                      clearAutoCollapseTimer();
                    }
                  }}
                >
                  {hasOpinion ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : isRecommended ? (
                    <Star className="w-3.5 h-3.5" fill="#0b5cff" stroke="#0b5cff" />
                  ) : (
                    <Star className="w-3.5 h-3.5 transition-colors text-gray-400 group-hover:text-black" fill="currentColor" stroke="currentColor" />
                  )}
                  <div className="flex items-center -space-x-1.5" style={{ marginRight: '2px' }}>
                    <img src={imgOvalCopy2} alt="User 1" className="w-6 h-6 rounded-full object-cover" />
                    <img src={imgOvalCopy3} alt="User 2" className="w-6 h-6 rounded-full object-cover" />
                    <img src={imgOvalCopy9} alt="User 3" className="w-6 h-6 rounded-full object-cover" />
                  </div>
                  <WidgetTooltip
                    visible={showAvatarsTooltip || isHoveringAvatars}
                    text="Zobacz kto ze znajomych poleca"
                    anchorRef={avatarsAnchorRef}
                  />
                </div>
              )}
            </motion.div>
            )}
            </AnimatePresence>

            {/* Mobile tap target - opens full-screen search */}
            <div
              className="flex items-center gap-3 py-1.5 px-2 md:hidden cursor-pointer"
              onClick={() => {
                setShowAddOpinionModal(false);
                setMobileSearchLoading(true);
                setShowMobileSearch(true);
                if (chatMessages.length > 0) {
                  setMobileView('chat');
                  clearAutoCollapseTimer();
                  setTimeout(() => mobileSearchTextareaRef.current?.focus(), 350);
                } else {
                  setMobileView('search');
                }
              }}
            >
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {inputValue ? (
                <span className="text-gray-700 flex-1 truncate" style={{ fontSize: '14px' }}>
                  {inputValue}
                </span>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={chatMessages.length > 0 && hasClosedChat && !(showMobileSearch && mobileView === 'chat') ? 'continue' : currentPlaceholder}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="text-gray-400 flex-1"
                    style={{ fontSize: '14px' }}
                  >
                    {chatMessages.length > 0 && hasClosedChat && !(showMobileSearch && mobileView === 'chat') ? 'Kontynuuj rozmowę' : placeholders[currentPlaceholder]}
                  </motion.span>
                </AnimatePresence>
              )}
              {images.length > 0 && (
                <span className="bg-[#0b5cff] text-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ fontWeight: 600 }}>
                  {images.length}
                </span>
              )}
              <div
                className="flex items-center gap-1 bg-[#27272B] rounded-full py-0.5 px-1.5 cursor-pointer hover:bg-[#333336] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRecommendations();
                }}
              >
                {hasOpinion ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                )}
                <img src={imgOvalCopy2} alt="User" className="w-5 h-5 rounded-full object-cover" />
              </div>
            </div>
            {/* Hidden file input - outside desktop wrapper for mobile access */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Desktop search bar content - smooth fade on collapse */}
            <AnimatePresence>
            {isSearchExpanded && (
            <motion.div
              key="expanded-desktop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="hidden md:block w-full"
              style={{ minWidth: expandedWidth - 16 }}
            >
            {/* Inline Notification (Error / Success) */}
            <AnimatePresence>
              {(errorNotification || successNotification) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 translate-y-1/2 left-0 right-0 flex justify-center z-50 px-16"
                >
                  <div className="bg-[#27272B] rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-2xl">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${errorNotification ? 'bg-red-500' : 'bg-green-500'}`}>
                      {errorNotification 
                        ? <X className="w-3 h-3 text-white" /> 
                        : <Check className="w-3 h-3 text-white" />
                      }
                    </div>
                    <span className="text-white/90 text-sm leading-none whitespace-nowrap">{errorNotification || successNotification}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Recording / Transcribing / Normal Mode - with animated transitions */}
            <AnimatePresence mode="wait">
            {isRecordingSearch ? (
              <motion.div
                key="recording-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex items-center gap-2 pl-1 pr-0 bg-gray-200 rounded-full" style={{ minHeight: '48px', height: '48px' }}
              >
                {/* Cancel button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={isMockRecording ? handleMockVoiceCancel : handleSearchVoiceCancel}
                  className="flex-shrink-0 w-8 h-8 rounded-full text-black hover:bg-gray-300 transition-all flex items-center justify-center"
                  title="Anuluj nagrywanie"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                
                {/* Mock badge */}
                {isMockRecording && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 text-[9px] bg-gray-400 text-black px-1.5 py-0.5 rounded-full"
                  >
                    MOCK
                  </motion.span>
                )}

                {/* Audio Waveform Visualization */}
                <div className="flex-grow flex items-center justify-center gap-[2px] h-8 overflow-hidden">
                  {searchRecordingLevels.map((level, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-gray-700"
                      animate={{ 
                        height: Math.max(6, level * 28) + 'px'
                      }}
                      style={{ opacity: 1 }}
                      transition={{ duration: 0.08, ease: 'easeOut' }}
                    />
                  ))}
                </div>
                
                {/* Timer - countdown in seconds */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="text-black text-sm font-mono tabular-nums flex-shrink-0 min-w-[42px] text-center"
                >
                  {searchRecordingTimer}s
                </motion.span>
                
                {/* Confirm button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={isMockRecording ? handleMockVoiceConfirm : handleSearchVoiceConfirm}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-black hover:brightness-90 text-white transition-all flex items-center justify-center"
                  title="Zatwierdź nagranie"
                >
                  <Check className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : isTranscribing ? (
              <motion.div
                key="transcribing-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex items-center justify-center gap-3 px-2" style={{ minHeight: '48px', height: '48px' }}
              >
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                <span className="text-gray-500 text-sm">Transkrybuję...</span>
              </motion.div>
            ) : (
              <motion.div
                key="normal-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
            <>
            {/* Images Preview - mobile only (desktop shows inline) */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 mb-2 md:hidden">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-gray-700/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Flex layout with dynamic ordering - textarea jumps above when multiline */}
            <div className="flex flex-wrap items-center gap-0.5 pl-1 pr-0" style={{ minHeight: '48px' }}>
              {/* Textarea Container - jumps to top (order: 1) when multiline, takes full width */}
              <div 
                className="min-w-0 relative transition-all flex items-center w-full md:w-auto" 
                style={{ 
                  minHeight: isMobileDevice ? '40px' : isMultiline ? undefined : '48px',
                  order: isMultiline ? 1 : 2,
                  flexGrow: isMultiline ? 0 : 1,
                  width: isMultiline ? '100%' : undefined,
                  marginBottom: isMultiline ? '2px' : '0',
                  paddingTop: isMultiline ? '12px' : '0',
                  paddingBottom: isMultiline ? '4px' : '0',
                }}
              >
                {inputValue.length === 0 && (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={chatMessages.length > 0 && hasClosedChat && !showChatOverlay ? 'continue' : currentPlaceholder}
                      initial={isFirstExpandRender ? false : { y: -14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 14, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute left-2 text-gray-700 pointer-events-none flex items-center"
                      style={{ fontSize: '14px', lineHeight: '22px', height: '100%' }}
                    >
                      {chatMessages.length > 0 && hasClosedChat && !showChatOverlay ? 'Kontynuuj rozmowę' : placeholders[currentPlaceholder]}
                    </motion.div>
                  </AnimatePresence>
                )}
                <textarea
                  ref={textareaRef}
                  className="w-full bg-transparent text-black outline-none resize-none pl-2 pr-0 search-textarea"
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '22px',
                    minHeight: '22px',
                    maxHeight: '88px',
                    maxWidth: isMultiline ? undefined : '390px',
                    overflow: isMultiline ? 'auto' : 'hidden',
                    paddingTop: '0',
                    paddingBottom: '0',
                    scrollbarWidth: 'thin' as const,
                    scrollbarColor: 'rgba(9, 14, 21, 0.4) transparent',
                  }}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (!showRecommendations && !showChatOverlay && !showAuthModal && !showAboutModal && !showWebsiteInput && !showAddOpinionModal && !pendingOpinionModal) {
                      setShowPopularSearches(true);
                    }
                  }}
                />
              </div>
              
              {/* Conditional rendering based on multiline state */}
              {isMultiline ? (
                /* Multiline: Buttons wrapper - all buttons in one line, not spread out */
                <div
                  className="flex items-center gap-1"
                  style={{
                    order: 2,
                    width: '100%',
                    paddingBottom: '8px'
                  }}
                >
                  {/* Plus Button - hidden on mobile (multiline) */}
                  <div 
                    ref={plusAnchorRef}
                    className="relative hidden md:block"
                    onMouseEnter={() => setIsHoveringPlusButton(true)}
                    onMouseLeave={() => setIsHoveringPlusButton(false)}
                  >
                    <button 
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all p-2" 
                      onClick={handleAddImageClick}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    
                  </div>
                  
                  {/* Spacer to push controls to the right */}
                  <div className="flex-grow hidden md:block"></div>
                  
                  {/* Mobile-only Plus button (multiline) */}
                  <button 
                    className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all p-2 md:hidden" 
                    onClick={handleAddImageClick}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  
                  {/* Right side controls */}
                  <div className="flex items-center gap-2">
                {/* Active Chat Badge - separate - only show after overlay has been closed */}
                <AnimatePresence>
                {chatMessages.length > 0 && hasClosedChat && !inputValue && !showChatOverlay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${showChatOverlay ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => {
                      if (showChatOverlay) {
                        // Closing chat - start auto-collapse timer
                        setShowChatOverlay(false);
                        setShowRecommendations(false);
                        startAutoCollapseTimerIfNotHovering();
                      } else {
                        // Opening chat - clear any pending timer
                        if (showRecommendations) instantModalRef.current = true;
                        clearAutoCollapseTimer();
                        setShowChatOverlay(true);
                        setShowRecommendations(false);
                        setUnreadCount(0);
                      }
                    }}
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-[#0B9BFF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount}
                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
                
                {/* 🧪 Mock mic button - hidden when typing */}
                {inputValue.length === 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
                  onClick={handleMockVoiceInput}
                >
                  <Mic className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400/70 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ lineHeight: 1 }}>T</span>
                </motion.button>
                )}

                  {/* 🔧 BLOKADA MIKROFONU (wyłączona na czas testów)
                      Aby ponownie włączyć: przywróć warunek micPermission === 'denied'
                      w className, onClick, title i warunkowe renderowanie MicOff */}
                  {/* Mic / Send — single DOM element, no mount/unmount flash */}
                  <button
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${
                      inputValue.length === 0
                        ? 'rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        : 'rounded-full'
                    }`}
                    style={inputValue.length > 0 ? { backgroundColor: '#000' } : undefined}
                    onMouseEnter={inputValue.length > 0 ? (e) => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'; } : undefined}
                    onMouseLeave={inputValue.length > 0 ? (e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; } : undefined}
                    onClick={inputValue.length === 0 ? handleSearchVoiceInput : () => handleSubmit()}
                  >
                    {inputValue.length === 0 ? <Mic className="w-5 h-5" /> : <ArrowUp className="w-4 h-4 text-white" />}
                  </button>
                  </div>
                  
                  {/* Mobile spacer + send at end (multiline) */}
                  <div className="flex-grow md:hidden" />
                  {inputValue.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center md:hidden"
                      style={{ backgroundColor: '#000' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
                      onClick={() => handleSubmit()}
                    >
                      <ArrowUp className="w-4 h-4 text-white" />
                    </motion.button>
                  )}
                </div>
              ) : (
                /* Single-line: Separate buttons */
                <>
                  {/* Plus Button - hidden on mobile */}
                  <div 
                    ref={plusAnchorRef}
                    className="relative hidden md:block"
                    style={{ order: 1 }}
                    onMouseEnter={() => setIsHoveringPlusButton(true)}
                    onMouseLeave={() => setIsHoveringPlusButton(false)}
                  >
                    <button 
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all p-2" 
                      onClick={handleAddImageClick}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Desktop inline image thumbnails */}
                  {images.length > 0 && (
                    <div className="hidden md:flex items-center gap-1 flex-shrink-0" style={{ order: 1.2 }}>
                      {images.slice(0, 3).map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-6 h-6 object-cover rounded"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-gray-700/90 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                      {images.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{images.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Right side controls */}
                  <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0" style={{ order: 3 }}>
                    {/* Mobile-only Plus button */}
                    <button 
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all p-2 md:hidden" 
                      onClick={handleAddImageClick}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    
                    {/* Active Chat Badge - separate - only show after overlay has been closed */}
                    <AnimatePresence>
                    {chatMessages.length > 0 && hasClosedChat && !inputValue && !showChatOverlay && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${showChatOverlay ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => {
                          if (showChatOverlay) {
                            // Closing chat - start auto-collapse timer
                            setShowChatOverlay(false);
                            setShowRecommendations(false);
                            startAutoCollapseTimerIfNotHovering();
                          } else {
                            // Opening chat - clear any pending timer
                            if (showRecommendations) instantModalRef.current = true;
                            clearAutoCollapseTimer();
                            setShowChatOverlay(true);
                            setShowRecommendations(false);
                            setUnreadCount(0);
                          }
                        }}
                      >
                        <MessageSquare className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-[#0B9BFF] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {unreadCount}
                          </div>
                        )}
                      </motion.div>
                    )}
                    </AnimatePresence>
                    
                    {/* 🧪 Mock mic button (single-line) - hidden when typing */}
                    {inputValue.length === 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative"
                      onClick={handleMockVoiceInput}
                    >
                      <Mic className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400/70 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ lineHeight: 1 }}>T</span>
                    </motion.button>
                    )}

                    {/* Mic / Send — single DOM element, no mount/unmount flash */}
                    <button
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${
                        inputValue.length === 0
                          ? 'rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          : 'rounded-full'
                      }`}
                      style={inputValue.length > 0 ? { backgroundColor: '#000' } : undefined}
                      onMouseEnter={inputValue.length > 0 ? (e) => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'; } : undefined}
                      onMouseLeave={inputValue.length > 0 ? (e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; } : undefined}
                      onClick={inputValue.length === 0 ? handleSearchVoiceInput : () => handleSubmit()}
                    >
                      {inputValue.length === 0 ? <Mic className="w-5 h-5" /> : <ArrowUp className="w-4 h-4 text-white" />}
                    </button>
                    
                    {/* Mobile spacer to center avatars */}
                    {showSocialProof && <div className="flex-grow md:hidden" />}
                    
                    {/* Rating Icon and Avatars Container - hidden when typing */}
                    {showSocialProof && inputValue.length === 0 && <div 
                      ref={expandedAvatarsAnchorRef}
                      className="relative flex-shrink-0"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <div 
                        className={`flex items-center gap-2 rounded-full transition-all cursor-pointer ${
                          hasOpinion
                            ? (isHovering ? 'bg-green-500/30' : 'bg-green-500/20')
                            : isRecommended 
                            ? (isHovering ? 'bg-[#0b5cff]/40' : 'bg-[#0b5cff]/20')
                            : ''
                        }`}
                        style={{
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          paddingLeft: '8px',
                          paddingRight: '6px',
                          ...(!hasOpinion && !isRecommended && isHovering ? { backgroundColor: '#F2F2F2' } : {})
                        }}
                        onClick={() => {
                          analytics.trackAvatarClicked();
                          if (!showRecommendations) {
                            if (showChatOverlay) instantModalRef.current = true;
                            setShowChatOverlay(false);
                            onToggle?.(false);
                            if (chatMessages.length > 0) {
                              setHasClosedChat(true);
                            }
                            analytics.trackRecommendationsOpened();
                            setShowRecommendations(true);
                            // Clear any pending timer when opening
                            clearAutoCollapseTimer();
                          }
                        }}
                      >
                        {/* Rating Icon */}
                        {hasOpinion ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : isRecommended ? (
                          <Star className="w-4 h-4" fill="#0b5cff" stroke="#0b5cff" />
                        ) : (
                          <Star className="w-4 h-4 transition-colors" fill={isHovering ? 'black' : '#9ca3af'} stroke={isHovering ? 'black' : '#9ca3af'} />
                        )}
                        
                        {/* Avatars */}
                        <div className="flex items-center -space-x-1.5" style={{ marginRight: '2px' }}>
                          <img 
                            src={imgOvalCopy2} 
                            alt="User 1" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <img 
                            src={imgOvalCopy3} 
                            alt="User 2" 
                            className="w-6 h-6 rounded-full object-cover hidden md:block"
                          />
                          <img 
                            src={imgOvalCopy9} 
                            alt="User 3" 
                            className="w-6 h-6 rounded-full object-cover hidden md:block"
                          />
                        </div>
                      </div>
                      
                    </div>}
                    

                    
                    {/* Mobile spacer + send button at end */}
                    <div className="flex-grow md:hidden" />
                    {inputValue.length > 0 && (
                      <motion.button
                        key="send-mobile"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center md:hidden"
                        style={{ backgroundColor: '#000' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
                        onClick={() => handleSubmit()}
                      >
                        <ArrowUp className="w-4 h-4 text-white" />
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </div>
            </>
            </motion.div>
            )}
            </AnimatePresence>
            </motion.div>
            )}
            </AnimatePresence>{/* end desktop content wrapper */}
          </motion.div>

          {/* Tooltips rendered OUTSIDE motion.div to escape overflow:hidden + transform containing block */}
          <WidgetTooltip visible={isHoveringLogo} text="O aplikacji" anchorRef={logoAnchorRef} />
          <WidgetTooltip visible={isHoveringPlusButton} text="Dodaj zdjęcie" anchorRef={plusAnchorRef} />
          <WidgetTooltip visible={isHovering} text="Zobacz kto ze znajomych poleca" anchorRef={expandedAvatarsAnchorRef} />

          
          {/* Mobile Full-Screen Search Overlay */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                key="mobile-search-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-[#18181B] flex flex-col md:hidden"
                style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))', paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
              >
                {/* Header */}
                <div className={`flex items-center gap-3 px-4 pt-3 pb-2 flex-shrink-0 transition-opacity duration-300 relative ${mobileSearchLoading ? 'opacity-0' : 'opacity-100'}`}>
                  {/* Left side: back arrow in non-search views */}
                  {mobileView !== 'search' && (
                    <button
                      onClick={() => {
                        triggerHaptic(5);
                        if (mobileView === 'addOpinion') {
                          if (showAISuggestions) {
                            setShowAISuggestions(false);
                            setAiSuggestions([]);
                            setSelectedSuggestion(null);
                            setInputMethod(null);
                            setOpinionText('');
                          } else if (inputMethod !== null) {
                            setInputMethod(null);
                            setOpinionText('');
                            setIsRecordingOpinion(false);
                          } else {
                            handleBackToRecommendations();
                          }
                        } else if (mobileView === 'recommend') {
                          setMobileView('search');
                          // Start auto-collapse timer when leaving recommendations
                          startAutoCollapseTimerIfNotHovering();
                        } else {
                          setMobileView('search');
                        }
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                  )}
                  
                  <div className="flex-1">
                    {mobileView === 'chat' ? (
                      <div className="flex items-center gap-2 h-[36px]">
                        <span className="text-white text-sm">Wyniki wyszukiwania</span>
                      </div>
                    ) : mobileView === 'recommend' ? (
                      <div className="flex items-center gap-2 h-[36px]">
                        <span className="text-white text-sm">Rekomendacje</span>
                      </div>
                    ) : mobileView === 'addOpinion' ? (
                      <div className="flex items-center gap-2 h-[36px]">
                        <span className="text-white text-sm">Dodaj opinię w <span className="text-[#0b5cff] font-bold">10 sekund</span></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 h-[36px]">
                        <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          </svg>
                        </div>
                        <span className="text-white text-sm">Locly</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {mobileView === 'chat' && (
                      <button 
                        onClick={() => setShowChatMenu(prev => !prev)}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-90"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                    {mobileView === 'recommend' && (
                      <button 
                        onClick={() => setShowRecommendationsMenu(prev => !prev)}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-90"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                    {mobileView === 'addOpinion' && (
                      <button 
                        onClick={() => setShowAddOpinionMenu(prev => !prev)}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-90"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                    {mobileView === 'search' && (
                      <button 
                        onClick={() => {
                          triggerHaptic(5);
                          setShowMobileSearch(false);
                          setShowChatOverlay(false);
                          onToggle?.(false);
                          setHasClosedChat(true);
                          setIsWidgetCollapsed(true);
                          setShowCollapsedIcon(true);
                        }}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Chat Menu Dropdown */}
                  <AnimatePresence>
                    {showChatMenu && mobileView === 'chat' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-4 mt-1 w-64 rounded-xl z-50"
                        style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                        ref={mobileChatMenuRef}
                      >
                        <button
                          onClick={() => {
                            setShowChatMenu(false);
                            setTranscriptEmail('');
                            setTranscriptSent(false);
                            setShowTranscriptModal(true);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left active:bg-white/15"
                        >
                          <Mail className="w-5 h-5 text-white/50" />
                          <span className="text-white/80 text-sm">Wyślij transkrypcję</span>
                        </button>
                        <a
                          href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowChatMenu(false)}
                          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left active:bg-white/15"
                        >
                          <MessageSquare className="w-5 h-5 text-white/50" />
                          <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const newVal = !soundsEnabled;
                            setSoundsEnabled(newVal);
                            localStorage.setItem('locly_sounds_disabled', newVal ? 'false' : 'true');
                            if (newVal) playSentSound();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-white/10 transition-colors active:bg-white/15"
                        >
                          <div className="flex items-center gap-3">
                            {soundsEnabled ? <Volume2 className="w-5 h-5 text-white/50" /> : <VolumeX className="w-5 h-5 text-white/50" />}
                            <span className="text-white/80 text-sm">D��więki</span>
                          </div>
                          <div className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${soundsEnabled ? 'bg-[#0b5cff]' : 'bg-white/20'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${soundsEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Mobile Recommendations Menu Dropdown */}
                  <AnimatePresence>
                    {showRecommendationsMenu && mobileView === 'recommend' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-4 mt-1 w-64 rounded-xl z-50"
                        style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                      >
                        <a
                          href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowRecommendationsMenu(false)}
                          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left active:bg-white/15"
                        >
                          <MessageSquare className="w-5 h-5 text-white/50" />
                          <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Mobile Add Opinion Menu Dropdown */}
                  <AnimatePresence>
                    {showAddOpinionMenu && mobileView === 'addOpinion' && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-4 mt-1 w-64 rounded-xl z-50"
                        style={{ backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', border: 'none', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)', overflow: 'hidden' }}
                      >
                        <a
                          href={`https://locly.pl/dodaj-czat?ref=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowAddOpinionMenu(false)}
                          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-white/10 transition-colors text-left active:bg-white/15"
                        >
                          <MessageSquare className="w-5 h-5 text-white/50" />
                          <span className="text-white/80 text-sm">Dodaj czat do swojej strony</span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Center Content Area - horizontal slide between views */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  {mobileSearchLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#0b5cff] animate-spin" />
                    </div>
                  ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {mobileView === 'chat' && (
                      <motion.div
                        key="mobile-chat-view"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {/* Chat Messages View */}
                        <div className="flex-1 flex flex-col min-h-0 relative">
                          <div 
                            ref={mobileChatContainerRef}
                            className="flex-1 min-h-0 px-4 py-2 pb-0"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              flex: '1 1 0%',
                              overflow: 'hidden auto',
                              outlineOffset: '-5px',
                              overscrollBehavior: 'contain',
                              scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                              scrollbarWidth: 'thin' as const,
                              marginBottom: '0',
                              marginRight: '16px',
                              borderRadius: '0px 0px 24px 24px',
                              paddingTop: '56px',
                              maskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                              WebkitMaskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                            }}
                            onScroll={(e) => { mobileScroll.handleScrollEvent(e.currentTarget); }}
                          >
                            {chatMessages.map((message) => {
                              return (
                              <div key={message.id} data-message-id={message.id} className="mb-5 scroll-mt-4">
                                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  {message.role === 'assistant' && message.answerData ? (
                                    <AIAnswerCard
                                      data={message.answerData}
                                      timestamp={message.timestamp}
                                      sources={message.sources}
                                      followUpQuestions={message.followUpQuestions}
                                      onCtaClick={(action) => {
                                        if (action === 'quote') {
                                          handleSubmit('Chciałbym zapytać o wycenę');
                                        } else if (action === 'portfolio') {
                                          showInfoToast('Przekierowanie do portfolio...');
                                        } else if (action === 'contact') {
                                          showInfoToast('Otwieranie formularza kontaktowego...');
                                        }
                                      }}
                                      onFollowUpClick={(question) => {
                                        handleSubmit(question);
                                      }}
                                    />
                                  ) : message.role === 'user' ? (
                                    <div
                                      className="max-w-[80%] rounded-2xl outline-none text-white"
                                      style={{ backgroundColor: 'rgba(10, 12, 20, 0.25)', padding: '12px 16px' }}
                                    >
                                      <p
                                        className="whitespace-pre-wrap break-words"
                                        style={{ fontSize: '14px', lineHeight: '1.4' }}
                                      >
                                        {message.content}
                                      </p>
                                    </div>
                                  ) : (
                                    // Plain-text assistant bubble — mirrors AIAnswerCard's
                                    // headline block so the stream → card transition
                                    // doesn't visibly reflow the text.
                                    <div className="w-full">
                                      <div className="pr-5 pt-1 pb-3">
                                        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                          {message.content}
                                        </p>
                                      </div>
                                      {message.content !== 'Czy chcesz zakończyć rozmowę?' && (
                                        <div className="pr-5 pb-2.5">
                                          <p className="text-white/20 text-[10px]">
                                            {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* End Conversation Buttons */}
                                      {message.content === 'Czy chcesz zakończyć rozmowę?' && isAwaitingEndConfirmation && !isChatEnded && (
                                        <div className="flex justify-center gap-2 mt-3">
                                          <button
                                            onClick={() => handleEndChatConfirmation(true)}
                                            className="px-4 py-2 bg-white hover:brightness-90 text-black rounded-full transition-all"
                                            style={{ fontSize: '14px' }}
                                          >
                                            Tak, chcę
                                          </button>
                                          <button
                                            onClick={() => handleEndChatConfirmation(false)}
                                            className="px-4 py-2 bg-white hover:brightness-90 text-black rounded-full transition-all"
                                            style={{ fontSize: '14px' }}
                                          >
                                            Nie, nie chcę
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              );
                            })}

                            {/* Typing Indicator */}
                            {isTyping && (
                              <div className="mb-3">
                                <div className="flex justify-start">
                                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/10">
                                    <div className="flex gap-1.5">
                                      <motion.div
                                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                                      />
                                      <motion.div
                                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                      />
                                      <motion.div
                                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          <div ref={mobileScroll.spacerRef} style={{ flexShrink: 0 }} />
                          </div>

                          {/* Mobile Scroll to bottom button */}
                          <AnimatePresence>
                            {showMobileScrollToBottom && (
                              <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ 
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                  duration: 0.3
                                }}
                                onClick={() => {
                                  if (mobileChatContainerRef.current) {
                                    mobileChatContainerRef.current.scrollTo({
                                      top: mobileChatContainerRef.current.scrollHeight,
                                      behavior: 'smooth'
                                    });
                                    mobileWasAtBottomRef.current = true;
                                    setUnreadScrollMessages(0);
                                    if (chatMessages.length > 0) {
                                      lastBottomMessageIdRef.current = chatMessages[chatMessages.length - 1].id;
                                    }
                                  }
                                }}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors z-10"
                              >
                                <ArrowDown className="w-4 h-4 text-black" />
                                {unreadScrollMessages > 0 && (
                                  <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-[#0b5cff] text-black rounded-full flex items-center justify-center px-1" style={{ fontSize: '11px', lineHeight: '1', fontWeight: 600 }}>
                                    {unreadScrollMessages}
                                  </span>
                                )}
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                    
                    {mobileView === 'search' && (
                      <motion.div
                        key="mobile-search-view"
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        {/* Search / Recommendation View */}
                        <div 
                          className="flex-1 items-center justify-start pt-8 px-6"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1 1 0%',
                            overflow: 'hidden auto',
                            outlineOffset: '-5px',
                            overscrollBehavior: 'contain',
                            scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                            scrollbarWidth: 'thin' as const,
                            marginBottom: '0',
                            marginRight: '16px',
                            borderRadius: '0px 0px 24px 24px',
                            paddingTop: '56px',
                            maskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                          }}
                        >
                          {/* Centered Avatar Row + Text + Recommend Button */}
                          <div className="flex flex-col items-center w-full gap-3 mb-6">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center -space-x-2">
                                <img src={imgOvalCopy2} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <img src={imgOvalCopy3} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <img src={imgOvalCopy9} alt="" className="w-8 h-8 rounded-full object-cover" />
                              </div>
                              <span className="text-white text-sm">{recommendations.length} z Twojej okolicy poleca</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  analytics.trackAvatarClicked();
                                  handleRecommendClick();
                                }}
                                disabled={isRecommending || hasOpinion}
                                className={`flex items-center gap-2 h-9 px-4 rounded-full transition-all text-[14px] relative ${
                                  hasOpinion
                                    ? 'bg-white/5 text-white/40'
                                    : isRecommended
                                    ? 'bg-white/5 text-white/40 hover:bg-white/10 active:scale-[0.97]'
                                    : isRecommending
                                    ? 'bg-[#0b5cff]/70 text-black cursor-default'
                                    : 'bg-[#0b5cff] text-black active:scale-[0.97]'
                                }`}
                              >
                                {isRecommending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </>
                                ) : hasOpinion ? (
                                  <>
                                    <span>Polecasz to</span>
                                  </>
                                ) : isRecommended ? (
                                  <>
                                    <X className="w-4 h-4" />
                                    <span>Polecono</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Poleć</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleAddOpinionClick();
                                }}
                                disabled={hasOpinion}
                                className={`flex items-center gap-2 h-9 px-4 rounded-full transition-all text-[14px] group ${
                                  hasOpinion
                                    ? 'bg-white/5 text-white/40 cursor-default'
                                    : isRecommended
                                      ? 'bg-[#0B9BFF] text-white font-medium hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97]'
                                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white/90'
                                }`}
                              >
                                <span>{hasOpinion ? 'Opinia dodana' : 'Dodaj opinię'}</span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Latest Recommendation Preview */}
                          {recommendations.length > 0 && (
                            <div className="w-full mt-4">
                              <div className="flex items-center mb-3 px-1">
                                <h3 className="text-white/40 text-xs uppercase tracking-wider">Rekomendacje</h3>
                              </div>
                              {/* CTA box when recommended but no opinion yet */}
                              {isRecommended && !hasOpinion && (
                                <div className="mb-3 p-3 bg-white/5 rounded-xl">
                                  <p className="text-white text-sm font-medium">
                                    Poleciłeś to miejsce
                                  </p>
                                  <p className="text-white/60 text-xs mt-0.5">
                                    Podziel się opinią, która pomoże innym
                                  </p>
                                </div>
                              )}
                              {(() => {
                                const lastRec = recommendations[recommendations.length - 1];
                                return (
                                  <div 
                                    className="p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-all"
                                    onClick={() => {
                                      if (!isAuthenticated) {
                                        setShowAuthModal(true);
                                        return;
                                      }
                                      setMobileView('recommend');
                                      // Clear timer when opening recommendations
                                      clearAutoCollapseTimer();
                                    }}
                                  >
                                    <div className="flex gap-3">
                                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        <img 
                                          src={lastRec.avatar} 
                                          alt={lastRec.name}
                                          className={`w-full h-full object-cover ${!isAuthenticated ? 'blur-[4px]' : ''}`}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-white text-sm font-medium flex items-center gap-2">
                                            {isAuthenticated ? lastRec.name : (
                                              <>
                                                {lastRec.name.split(' ')[0]}
                                                <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                              </>
                                            )}
                                          </p>
                                          <p className="text-white/40 text-xs">{lastRec.city}</p>
                                        </div>
                                        {lastRec.categories && lastRec.categories.length > 0 && (
                                          <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                            {lastRec.categories.slice(0, 2).map((category, index) => (
                                              <span key={index} className="px-2 py-0.5 bg-white/5 text-white text-xs rounded-full whitespace-nowrap">{category}</span>
                                            ))}
                                            {lastRec.categories.length > 2 && (
                                              <span className="px-2 py-0.5 bg-white/5 text-white/70 text-xs rounded-full whitespace-nowrap">+{lastRec.categories.length - 2}</span>
                                            )}
                                          </div>
                                        )}
                                        <p className="text-white/60 text-sm mt-1 line-clamp-2">
                                          {getFirstLine(lastRec.opinion)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                              {/* Zobacz więcej link below the opinion */}
                              <div className="flex flex-col items-center mt-4 gap-2">
                                <span className="text-white/40 text-xs text-center">Dowiedz się kto z Twoich znajomych dodał opinię</span>
                                <button
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      setShowAuthModal(true);
                                      return;
                                    }
                                    setMobileView('recommend');
                                    // Clear timer when opening recommendations
                                    clearAutoCollapseTimer();
                                  }}
                                  className="px-5 py-2 rounded-full text-white/80 text-xs hover:bg-white/10 transition-all"
                                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                >
                                  Zobacz więcej
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Popular Searches - always visible */}
                            <div className="w-full mt-6">
                              <div className="space-y-1">
                                {[
                                  "Jak skontaktować się z obsługą klienta?",
                                  "Jakie są godziny otwarcia?",
                                  "Czy oferujecie darmową dostawę?"
                                ].map((query, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      handleSubmit(query);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-white rounded-xl transition-all text-sm"
                                  >
                                    {query}
                                  </button>
                                ))}
                              </div>
                            </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Recommendations View */}
                    {mobileView === 'recommend' && (
                      <motion.div
                        key="mobile-recommend-view"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <div 
                          className="flex-1 px-4 py-4 pb-0"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1 1 0%',
                            overflow: 'hidden auto',
                            outlineOffset: '-5px',
                            overscrollBehavior: 'contain',
                            scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                            scrollbarWidth: 'thin' as const,
                            marginBottom: '0',
                            marginRight: '16px',
                            borderRadius: '0px 0px 24px 24px',
                            paddingTop: '56px',
                            maskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                          }}
                        >
                          {/* Social proof + buttons */}
                          <div className="flex flex-col items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center -space-x-2">
                                <img src={imgOvalCopy2} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <img src={imgOvalCopy3} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <img src={imgOvalCopy9} alt="" className="w-8 h-8 rounded-full object-cover" />
                              </div>
                              <p className="text-white text-sm">
                                {recommendations.length} z Twojej okolicy poleca
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  analytics.trackAvatarClicked();
                                  handleRecommendClick();
                                }}
                                disabled={isRecommending}
                                className={`flex items-center gap-2 h-9 px-4 rounded-full transition-all text-[14px] relative ${
                                  hasOpinion
                                    ? 'bg-white/5 text-white/40'
                                    : isRecommended
                                    ? 'bg-white/5 text-white/40 cursor-pointer'
                                    : isRecommending
                                    ? 'bg-[#0b5cff]/70 text-black cursor-default'
                                    : 'bg-[#0b5cff] text-black'
                                }`}
                              >
                                {isRecommending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </>
                                ) : hasOpinion ? (
                                  <>
                                    <span>Polecasz to</span>
                                  </>
                                ) : isRecommended ? (
                                  <>
                                    <X className="w-4 h-4" />
                                    <span>Polecono</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Poleć</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleAddOpinionClick();
                                }}
                                disabled={hasOpinion}
                                className={`flex items-center gap-2 h-9 px-4 rounded-full transition-all text-[14px] group ${
                                  hasOpinion
                                    ? 'bg-white/5 text-white/40 cursor-default'
                                    : isRecommended
                                      ? 'bg-[#0B9BFF] text-white font-medium hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97]'
                                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white/90'
                                }`}
                              >
                                <span>{hasOpinion ? 'Opinia dodana' : 'Dodaj opinię'}</span>
                              </button>
                            </div>
                          </div>
                          

                          
                          {/* Recommendation Box */}
                          {isRecommended && !hasOpinion && (
                            <div className="mb-4 p-3 bg-white/5 rounded-xl">
                              <p className="text-white text-sm font-medium">
                                Poleciłeś to miejsce
                              </p>
                              <p className="text-white/60 text-xs mt-0.5">
                                Podziel się opinią, która pomoże Twoim znajomym
                              </p>
                            </div>
                          )}

                          {/* Opinions List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {!isLoadingOpinions && [...userOpinions, ...(isAuthenticated ? recommendations : [recommendations[0]])].map((rec, idx) => {
                              const isOnlyPreviewMobile = !isAuthenticated && !userOpinions.some(u => u.id === rec.id);
                              return (
                              <div key={rec.id} className="flex flex-col gap-1.5 mb-0 pb-0">
                                {/* Header: Avatar + Name + Date */}
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <img 
                                      src={rec.avatar} 
                                      alt={rec.name}
                                      className={`w-full h-full object-cover ${!isAuthenticated && !isOnlyPreviewMobile ? 'blur-[4px]' : ''}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <p className="text-white font-medium text-sm flex items-center gap-2">
                                          {(isAuthenticated || isOnlyPreviewMobile) ? rec.name : (
                                            <>
                                              {rec.name.split(' ')[0]}
                                              <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                            </>
                                          )}
                                          {rec.status && (
                                            <span 
                                              className="text-white font-normal rounded"
                                              style={{ 
                                                backgroundColor: 'rgba(10, 12, 20, 0.25)', 
                                                padding: '12px 16px',
                                                fontSize: '14px',
                                                lineHeight: '1.4'
                                              }}
                                            >
                                              {rec.status}
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <p className="text-white/40 text-xs flex-shrink-0 ml-2">
                                        {new Date(rec.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                      </p>
                                    </div>
                                    
                                    {/* City below name */}
                                    <p className="text-white/50 text-xs mt-0.5">{rec.city}</p>
                                    
                                    {/* Tags */}
                                    {rec.categories && rec.categories.length > 0 && (
                                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                        {rec.categories.map((category, index) => (
                                          <span key={index} className="px-2 py-0.5 bg-white/5 text-white text-xs rounded-full">{category}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Opinion Text */}
                                <p className="text-white/80 text-sm leading-relaxed">
                                  {(isAuthenticated || isOnlyPreviewMobile) ? rec.opinion : (
                                    <>
                                      {rec.opinion.split('.')[0]}.{' '}
                                      <span className="inline-block w-12 bg-white/10 rounded" style={{ height: '8px' }}></span>{' '}
                                      <span className="inline-block w-20 bg-white/10 rounded" style={{ height: '8px' }}></span>{' '}
                                      <span className="inline-block w-16 bg-white/10 rounded" style={{ height: '8px' }}></span>
                                    </>
                                  )}
                                </p>
                              </div>
                            );
                            })}
                            
                            {/* Additional Recommenders */}
                            {isAuthenticated && !isLoadingOpinions && (
                              <div className="pt-4 pb-4">
                                <p className="text-white/60 text-xs mb-3">Polecają również:</p>
                                <div className="space-y-2">
                                  {additionalRecommenders.map((person) => (
                                    <div key={person.id} className="flex items-center gap-2">
                                      <img src={person.avatar} alt={person.name} className="w-6 h-6 rounded-full object-cover" />
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-white/80 text-sm">{person.name}</span>
                                        <span className="text-white/40 text-xs">•</span>
                                        <span className="text-white/50 text-xs">{person.city}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-white/40 text-xs pl-8 pt-2">i 10 więcej</p>
                              </div>
                            )}
                            
                            {/* See More Button */}
                            {!isAuthenticated && (
                              <div className="flex flex-col items-center justify-center gap-2 flex-1">
                                <button 
                                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                                  onClick={() => {
                                    analytics.trackSeeMoreClicked();
                                    analytics.trackAuthModalOpened('see_more_button');
                                    setShouldShowSeeAllSkeleton(true);
                                    setShowAuthModal(true);
                                  }}
                                >
                                  Zobacz wszystkie
                                </button>
                                <p className="text-white/40 text-xs">Dowiedz się kto z Twoich znajomych dodał opinię</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Add Opinion View */}
                    {mobileView === 'addOpinion' && (
                      <motion.div
                        key="mobile-addOpinion-view"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="absolute inset-0 flex flex-col"
                      >
                        <div 
                          className="flex-1 px-4 py-4 pb-0 space-y-4"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1 1 0%',
                            overflow: 'hidden auto',
                            outlineOffset: '-5px',
                            overscrollBehavior: 'contain',
                            scrollbarColor: 'rgba(9, 14, 21, 0.2) transparent',
                            scrollbarWidth: 'thin' as const,
                            marginBottom: '0',
                            marginRight: '16px',
                            borderRadius: '0px 0px 24px 24px',
                            paddingTop: '56px',
                            maskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(transparent 0px, transparent 40px, black 64px, black calc(100% - 16px), transparent 100%)',
                          }}
                        >
                          {/* Step 1: Choose input method */}
                          {inputMethod === null && !showAISuggestions && (
                            <div className="space-y-3">
                              <div className="mb-2">
                                <p className="text-white/80 text-xs">
                                  Powiedz, co myślisz - AI ułoży gotową opinię, którą możesz edytować lub od razu wysłać.
                                </p>
                              </div>
                              <p className="text-white/70 text-sm text-center">Jak chcesz dodać opinię?</p>
                              <div className="flex flex-col gap-3">
                                <button
                                  onClick={handleVoiceInput}
                                  className="bg-white/10 hover:bg-white/15 text-white rounded-xl p-4 transition-all group"
                                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all flex-shrink-0">
                                      <Mic className="w-7 h-7 text-white/70" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-white font-medium text-base">Nagraj głosem</p>
                                      <p className="text-white/60 text-xs mt-0.5">Powiedz swoją opinię - resztę zrobi AI</p>
                                    </div>
                                  </div>
                                </button>
                                <button
                                  onClick={handleTextInput}
                                  className="bg-white/10 hover:bg-white/15 text-white rounded-xl p-4 transition-all group"
                                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all flex-shrink-0">
                                      <MessageSquare className="w-7 h-7 text-white/70" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-white font-medium text-base">Napisz tekst</p>
                                      <p className="text-white/60 text-xs mt-0.5">Wpisz kilka słów - AI przygotuje gotową wersję</p>
                                    </div>
                                  </div>
                                </button>
                              </div>
                              <p className="text-white/50 text-xs text-center mt-2">Nie musisz pisać idealnie - AI zrobi to za Ciebie</p>
                            </div>
                          )}
                          
                          {/* Step 2: Voice recording */}
                          {inputMethod === 'voice' && !showAISuggestions && (
                            <div className="space-y-4">
                              <div className="flex flex-col items-center justify-center py-6 gap-4">
                                {isRecordingOpinion ? (
                                  <>
                                    <div className="w-full bg-white/5 rounded-2xl p-4">
                                      <div className="flex items-center gap-2" style={{ minHeight: '40px', height: '40px' }}>
                                        {/* Cancel button */}
                                        <motion.button
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.2, delay: 0.1 }}
                                          onClick={handleOpinionVoiceCancel}
                                          className="flex-shrink-0 w-8 h-8 rounded-full text-white hover:bg-white/10 transition-all flex items-center justify-center"
                                          title="Anuluj nagrywanie"
                                        >
                                          <X className="w-5 h-5" />
                                        </motion.button>
                                        
                                        {/* Mock badge */}
                                        {isMockRecordingOpinion && (
                                          <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex-shrink-0 text-[9px] bg-gray-400 text-black px-1.5 py-0.5 rounded-full"
                                          >
                                            MOCK
                                          </motion.span>
                                        )}
                                        
                                        {/* Audio Waveform Visualization */}
                                        <div className="flex-grow flex items-center justify-center gap-[2px] h-8 overflow-hidden">
                                          {opinionRecordingLevels.map((level, i) => (
                                            <motion.div
                                              key={i}
                                              className="w-[3px] rounded-full bg-white/40"
                                              animate={{ 
                                                height: Math.max(6, level * 28) + 'px'
                                              }}
                                              style={{ opacity: 1 }}
                                              transition={{ duration: 0.08, ease: 'easeOut' }}
                                            />
                                          ))}
                                        </div>
                                        
                                        {/* Timer */}
                                        <motion.span
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.3, delay: 0.15 }}
                                          className="text-white/40 text-sm font-mono tabular-nums flex-shrink-0 min-w-[42px] text-center"
                                        >
                                          {opinionRecordingTimer}s
                                        </motion.span>
                                        
                                        {/* Confirm button */}
                                        <motion.button
                                          initial={{ opacity: 0, x: 10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.2, delay: 0.1 }}
                                          onClick={handleOpinionVoiceConfirm}
                                          className="flex-shrink-0 w-8 h-8 rounded-full bg-black hover:brightness-90 text-white transition-all flex items-center justify-center"
                                          title="Zatwierdź nagranie"
                                        >
                                          <Check className="w-4 h-4" />
                                        </motion.button>
                                      </div>
                                    </div>
                                    <p className="text-white/40 text-xs">Maks. {MAX_RECORDING_DURATION} sekund</p>
                                  </>
                                ) : isGeneratingAI ? (
                                  <>
                                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" style={{ strokeWidth: 1 }} />
                                    <div className="text-center">
                                      <p className="text-white text-sm font-medium">Tworzymy Twoją opinię…</p>
                                      <p className="text-white/50 text-xs mt-1">Zaraz zobaczysz gotowe wersje do wyboru</p>
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}
                          
                          {/* Step 2: Text input */}
                          {inputMethod === 'text' && !showAISuggestions && (
                            <div className="space-y-6">
                              <div className="mb-4">
                                <p className="text-white text-sm leading-relaxed">
                                  Napisz kilka słów - zobaczysz 3 gotowe propozycje do wyboru
                                </p>
                              </div>
                              
                              <div className="relative">
                                <label className="text-white text-sm flex items-center gap-1 mb-2">Co Ci się podobało?</label>
                                <textarea
                                  value={opinionText}
                                  onChange={(e) => setOpinionText(e.target.value)}
                                  placeholder="Np. Świetna obsługa, szybka pomoc i wszystko dobrze wytłumaczone"
                                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-sm px-4 py-3 rounded-xl transition-all resize-none border-0"
                                  style={{ outline: 'none', boxShadow: 'none' }}
                                  rows={4}
                                  autoFocus
                                />
                              </div>
                              {isGeneratingAI ? (
                                <div className="flex flex-col items-center justify-center py-4 gap-2">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 text-[#0b5cff] animate-spin" />
                                    <p className="text-white text-sm font-medium">Tworzymy Twoją opinię…</p>
                                  </div>
                                  <p className="text-white/50 text-xs">Zaraz zobaczysz gotowe wersje do wyboru</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <button
                                    onClick={() => {
                                      if (!opinionText.trim()) {
                                        showErrorToast('Proszę wpisać opinię');
                                        return;
                                      }
                                      generateAISuggestions(opinionText);
                                    }}
                                    className="px-6 py-0.5 bg-[#0B9BFF] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,155,255,0.4)] active:scale-[0.97] text-white font-medium text-sm rounded-xl transition-all h-9"
                                  >
                                    Zobacz 3 propozycje
                                  </button>
                                  <p className="text-white/50 text-xs">
                                    Możesz wybrać i edytować przed wysłaniem
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Step 3: AI Suggestions */}
                          {showAISuggestions && (
                            <div className="space-y-3">
                              <p className="text-white/70 text-sm">
                                {selectedSuggestion !== null ? 'Możesz edytować wybraną opinię przed dodaniem:' : 'Poprawione 3 wersje - wybierz najlepszą'}
                              </p>
                              {aiSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (selectedSuggestion !== index) {
                                      setSelectedSuggestion(index);
                                      setOpinionText(suggestion);
                                    }
                                  }}
                                  className={`w-full text-left p-4 rounded-xl transition-all ${
                                    selectedSuggestion === index
                                      ? 'bg-white/10 cursor-default'
                                      : 'bg-white/5 hover:bg-white/10 cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${selectedSuggestion === index ? 'mt-1 bg-[#0b5cff] text-black' : 'bg-white/10 text-white/50'}`}>
                                      {index + 1}
                                    </div>
                                    {selectedSuggestion === index ? (
                                      <div className="flex-1 flex flex-col gap-1">
                                        <textarea
                                          value={opinionText}
                                          onChange={(e) => setOpinionText(e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          rows={4}
                                          className="no-glow w-full bg-white/5 hover:bg-white/10 active:bg-white/10 focus:bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-lg p-3 resize-none transition-all border-0 focus:ring-0 focus:outline-none"
                                          style={{ outline: 'none', boxShadow: 'none' }}
                                          placeholder="Edytuj swoją opinię..."
                                        />
                                        <p className="text-white/40 text-xs text-right">{opinionText.length} znaków</p>
                                      </div>
                                    ) : (
                                      <p className="text-white/90 text-sm flex-1">{suggestion}</p>
                                    )}
                                    {selectedSuggestion === index && (
                                      <Check className="w-5 h-5 text-[#0b5cff] flex-shrink-0 mt-1" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Manual City Input */}
                          {showAISuggestions && selectedSuggestion !== null && showCityInput && (
                            <div className="space-y-2">
                              <label className="text-white/70 text-sm flex items-center gap-1">
                                Twoje miasto <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={manualCity}
                                  maxLength={40}
                                  onChange={(e) => setManualCity(e.target.value)}
                                  placeholder="np. Warszawa"
                                  className="no-glow w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-all border border-transparent focus:ring-0 focus:outline-none"
                                  style={{ outline: 'none', boxShadow: 'none' }}
                                />
                                {manualCity.length > 32 && (
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{manualCity.length}/40</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Categories */}
                          {showAISuggestions && selectedSuggestion !== null && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-white/70 text-sm flex items-center gap-1">
                                    Czego dotyczy opinia
                                    <span className="text-red-400">*</span>
                                  </p>
                                  <p className="text-white/40 text-xs">
                                    Pomaga innym szybciej znaleźć właściwą opinię
                                  </p>
                                </div>
                                <p className="text-white/40 text-xs">Wybierz do 3</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {availableCategories.map((category) => (
                                  <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    disabled={!selectedCategories.includes(category) && selectedCategories.length >= 3}
                                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                                      selectedCategories.includes(category)
                                        ? 'text-black'
                                        : selectedCategories.length >= 3
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                    }`}
                                    style={selectedCategories.includes(category) ? { backgroundColor: '#0B9BFF' } : undefined}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Submit Button */}
                          {showAISuggestions && selectedSuggestion !== null && (
                            <div className="flex flex-col items-center gap-2 pb-4">
                              <p className="text-white/40 text-xs">
                                Gotowe w 10 sekund
                              </p>
                              <button
                                onClick={() => {
                                  if (opinionText.trim() === '') { showErrorToast('Proszę wpisać opinię'); return; }
                                  if (selectedCategories.length === 0) { showErrorToast('Proszę wybrać przynajmniej jedną kategorię'); return; }
                                  if (showCityInput && manualCity.trim() === '') { showErrorToast('Proszę wpisać nazwę miasta'); return; }
                                  
                                  setIsSubmittingOpinion(true);
                                  analytics.trackOpinionSubmitted(selectedCategories.length, inputMethod || 'text');
                                  
                                  const finalCity = showCityInput ? manualCity : userCity;
                                  api.submitOpinion({
                                    text: opinionText,
                                    categories: selectedCategories,
                                    city: finalCity,
                                    avatar: userAvatar,
                                    inputMethod: inputMethod as 'text' | 'voice' | null,
                                  }).then((result) => {
                                    setIsSubmittingOpinion(false);
                                    setMobileView('search');
                                    
                                    const newOpinion: Recommendation = {
                                      id: result.id,
                                      avatar: userAvatar,
                                      name: 'Ty',
                                      city: finalCity,
                                      opinion: opinionText,
                                      categories: selectedCategories,
                                      date: new Date().toISOString().split('T')[0],
                                      status: result.status
                                    };
                                    
                                    setUserOpinions([newOpinion]);
                                    setHasOpinion(true);
                                    setOpinionText('');
                                    setSelectedCategories([]);
                                    setManualCity('');
                                    setInputMethod(null);
                                    setAiSuggestions([]);
                                    setSelectedSuggestion(null);
                                    setShowAISuggestions(false);
                                    setIsGeneratingAI(false);
                                    
                                    showSuccessToast('Dodałeś opinię');
                                  }).catch(() => {
                                    setIsSubmittingOpinion(false);
                                    showErrorToast('Nie udało się dodać opinii');
                                  });
                                }}
                                disabled={isSubmittingOpinion}
                                className="px-8 py-0.5 bg-[#0b5cff] hover:brightness-90 hover:shadow-[0_0_20px_rgba(11,92,255,0.4)] active:scale-[0.97] disabled:bg-[#0b5cff]/50 disabled:cursor-not-allowed disabled:shadow-none text-black font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 h-9 min-w-[120px]"
                              >
                                {isSubmittingOpinion ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  'Dodaj opinię'
                                )}
                              </button>
                              <p className="text-white/40 text-xs text-center max-w-sm px-4">
                                Sprawdzamy opinie przed publikacją, żeby były wiarygodne
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  )}
                </div>
                
                {/* Bottom Search Input Area - hidden in recommend/addOpinion views */}
                {(mobileView === 'search' || mobileView === 'chat') && (
                <div className="flex-shrink-0 px-4 pt-2 pb-2">
                  {/* Privacy Disclaimer - Mobile (above search bar) */}
                  <AnimatePresence>
                    {showPrivacyDisclaimer && mobileView === 'search' && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0, y: 6, overflow: 'hidden' }}
                        transition={{ duration: 0.18 }}
                        className="mb-2"
                      >
                        <div className="flex items-start gap-2.5 bg-[#27272B] rounded-lg px-3.5 py-2.5">
                          <p className="text-white/50 leading-relaxed flex-1" style={{ fontSize: '12px' }}>
                            Korzystając z widgetu AI, wyrażasz zgodę na naszą{' '}
                            <span 
                              className="text-white transition-all"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMobilePrivacyTooltip(prev => !prev);
                              }}
                            >Politykę Prywatności</span>.
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPrivacyDisclaimer(false);
                              setShowMobilePrivacyTooltip(false);
                              localStorage.setItem('locly_privacy_dismissed', 'true');
                            }}
                            className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0 active:scale-90"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isChatEnded && mobileView === 'chat' ? (
                    <div className="text-center py-3">
                      <button
                        onClick={() => {
                          setChatMessages([]);
                          setIsChatEnded(false);
                          setIsAwaitingEndConfirmation(false);
                          setMobileView('search');
                        }}
                        className="text-[#0b5cff] text-sm hover:text-[#3a82ff] transition-all"
                      >
                        Rozpocznij nową rozmowę
                      </button>
                    </div>
                  ) : (
                  <div className="bg-[#18181B] rounded-2xl p-3" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {/* Images Preview */}
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-black/80 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Recording Mode */}
                    {isRecordingSearch ? (
                      <div className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-0" style={{ minHeight: '40px' }}>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={isMockRecording ? handleMockVoiceCancel : handleSearchVoiceCancel}
                          className="flex-shrink-0 w-8 h-8 rounded-full text-white hover:bg-white/10 transition-all flex items-center justify-center"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                        {isMockRecording && (
                          <span className="flex-shrink-0 text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">MOCK</span>
                        )}
                        <div className="flex-grow flex items-center justify-center gap-[2px] h-8 overflow-hidden">
                          {searchRecordingLevels.map((level, i) => (
                            <motion.div
                              key={i}
                              className="w-[3px] rounded-full bg-white"
                              animate={{ height: Math.max(6, level * 28) + 'px' }}
                              style={{ opacity: 0.85 }}
                              transition={{ duration: 0.08, ease: 'easeOut' }}
                            />
                          ))}
                        </div>
                        <span className="text-black text-sm font-mono tabular-nums flex-shrink-0 min-w-[42px] text-center">
                          {searchRecordingTimer}s
                        </span>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={isMockRecording ? handleMockVoiceConfirm : handleSearchVoiceConfirm}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-black hover:brightness-90 text-white transition-all flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : isTranscribing ? (
                      <div className="flex items-center justify-center gap-3" style={{ minHeight: '40px' }}>
                        <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
                        <span className="text-white/70 text-sm">Transkrybuję...</span>
                      </div>
                    ) : (
                      <>
                        {/* Textarea */}
                        <div className="relative" style={{ minHeight: '40px' }}>
                          {inputValue.length === 0 && (
                            mobileView === 'chat' ? (
                              <div
                                className="absolute left-0 top-0 text-white/40 pointer-events-none flex items-center"
                                style={{ fontSize: '14px', lineHeight: '22px', height: '40px' }}
                              >
                                Zapytaj o cokolwiek...
                              </div>
                            ) : (
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={currentPlaceholder}
                                  initial={{ y: -20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 20, opacity: 0 }}
                                  transition={{ duration: 0.5, ease: "easeInOut" }}
                                  className="absolute left-0 top-0 text-white/40 pointer-events-none flex items-center"
                                  style={{ fontSize: '14px', lineHeight: '22px', height: '40px' }}
                                >
                                  {placeholders[currentPlaceholder]}
                                </motion.div>
                              </AnimatePresence>
                            )
                          )}
                          <textarea
                            ref={mobileSearchTextareaRef}
                            className="w-full bg-transparent text-white outline-none resize-none search-textarea"
                            style={{ 
                              fontSize: '14px', 
                              lineHeight: '22px',
                              minHeight: '40px',
                              maxWidth: '390px',
                              overflow: 'auto',
                              paddingTop: '9px',
                              paddingBottom: '9px',
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(9, 14, 21, 0.4) transparent',
                            }}
                            rows={1}
                            value={inputValue}
                            onChange={(e) => {
                              setInputValue(e.target.value);
                              const ta = e.target;
                              ta.style.height = 'auto';
                              ta.style.height = `${Math.min(ta.scrollHeight, 136)}px`;
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                              }
                            }}
                          />
                        </div>
                        
                        {/* Controls Row */}
                        <div className="flex items-center gap-2 mt-1 pt-1 flex-shrink-0">
                          {/* Add Image */}
                          <button 
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            onClick={handleAddImageClick}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          
                          {/* Mock Mic */}
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all relative"
                            onClick={handleMockVoiceInput}
                          >
                            <Mic className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 text-[8px] bg-gray-400/70 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ lineHeight: 1 }}>T</span>
                          </button>
                          
                          {/* Mic */}
                          {inputValue.length === 0 && (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                              onClick={handleSearchVoiceInput}
                            >
                              <Mic className="w-5 h-5" />
                            </button>
                          )}
                          
                          {/* Chat resume icon - right after mic */}
                          {mobileView === 'search' && chatMessages.length > 0 && !isChatEnded && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => {
                                setMobileView('chat');
                                // Clear timer when opening chat
                                clearAutoCollapseTimer();
                              }}
                              className="relative p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <MessageSquare className="w-5 h-5" />
                              {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-[#0B9BFF] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" style={{ fontSize: '10px' }}>
                                  {unreadCount}
                                </div>
                              )}
                            </motion.button>
                          )}
                          
                          <div className="flex-grow" />
                          
                          {/* Send */}
                          <AnimatePresence>
                            {inputValue.trim().length > 0 && (
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#000' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.9)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
                                onClick={() => {
                                  handleSubmit();
                                }}
                              >
                                <ArrowUp className="w-4 h-4 text-white" />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </div>
                  )}
                </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
          

        </motion.div>
        
        {/* Collapsed Logo Icon - shown when widget is collapsed */}
        <AnimatePresence>
          {showCollapsedIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none mb-[25px]"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg pointer-events-auto"
                style={{ backgroundColor: '#0B9BFF' }}
                onClick={() => {
                  setShowCollapsedIcon(false);
                  setIsWidgetCollapsed(false);
                  // Also reset scroll tracking state so widget doesn't re-hide immediately
                  if (scrollRef.current) {
                    const s = scrollRef.current;
                    s.directionChangeY = window.scrollY;
                    s.lastY = window.scrollY;
                    s.lastDirection = 'none';
                    s.collapsed = false;
                    s.uncollapsedAt = Date.now();
                  }
                }}
              >
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* How It Works Overlay */}
      <AnimatePresence>
        {showHowItWorksOverlay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)' }}
              onClick={() => {
                setShowHowItWorksOverlay(false);
                setHowItWorksUrl('');
                setHowItWorksEmail('');
                setHowItWorksEmailSent(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ padding: '16px', fontSize: '14px', lineHeight: 1.4, overflowWrap: 'break-word', wordBreak: 'break-word' as const, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)', borderRadius: '24px', border: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0B9BFF' }}>
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-medium" style={{ fontSize: '16px', lineHeight: 1.4 }}>locly odpowiedzi zamiast szukania</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowHowItWorksOverlay(false);
                      setHowItWorksUrl('');
                      setHowItWorksEmail('');
                      setHowItWorksEmailSent(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L13 13M13 3L3 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-white/80 text-sm">
                    locly odpowiada od razu. A jeśli nie zna odpowiedzi - uczy się jej raz i obsługuje wszystkie kolejne pytania.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-white font-medium text-sm">Co zyskujesz?</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#0B9BFF' }}>
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-white/70" style={{ fontSize: '12px' }}>Więcej klientów (mniej porzuceń)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#0B9BFF' }}>
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-white/70" style={{ fontSize: '12px' }}>Mniej pytań na telefon / Messenger</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#0B9BFF' }}>
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-white/70" style={{ fontSize: '12px' }}>Lepsze opinie od klientów</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#0B9BFF' }}>
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-white/70" style={{ fontSize: '12px' }}>Widzisz, o co pytają klienci i gdzie tracisz sprzedaż</p>
                      </div>
                    </div>
                  </div>
                  
                  {!howItWorksEmailSent ? (
                    <div className="space-y-4">
                      <p className="text-white font-medium text-sm">
                        Sprawdź na swojej stronie
                      </p>
                      
                      <div className="space-y-4">
                        <input
                          type="url"
                          value={howItWorksUrl}
                          onChange={(e) => setHowItWorksUrl(e.target.value)}
                          placeholder="URL Twojej strony"
                          className="no-glow w-full px-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 text-white placeholder-white/30 rounded-full border border-transparent focus:ring-0 focus:outline-none"
                          style={{ fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                        />
                        
                        <input
                          type="email"
                          value={howItWorksEmail}
                          onChange={(e) => setHowItWorksEmail(e.target.value)}
                          placeholder="Twój firmowy adres e-mail"
                          className="no-glow w-full px-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 text-white placeholder-white/30 rounded-full border border-transparent focus:ring-0 focus:outline-none"
                          style={{ fontSize: '14px', outline: 'none', boxShadow: 'none' }}
                        />
                      </div>
                      
                      <div>
                        <button
                          onClick={async () => {
                            if (!howItWorksUrl) {
                              showErrorToast('Wprowadź URL Twojej strony');
                              return;
                            }
                            
                            if (!howItWorksEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(howItWorksEmail)) {
                              showErrorToast('Wprowadź poprawny adres email');
                              return;
                            }
                            
                            setHowItWorksEmailSending(true);
                            try {
                              // Mock API call - replace with actual endpoint
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              console.log('URL submitted:', howItWorksUrl);
                              console.log('Email submitted:', howItWorksEmail);
                              
                              setHowItWorksEmailSent(true);
                              showSuccessToast('Dziękujemy! Wkrótce się odezwiemy');
                            } catch (error) {
                              showErrorToast('Wystąpił błąd. Spróbuj ponownie');
                            } finally {
                              setHowItWorksEmailSending(false);
                            }
                          }}
                          disabled={howItWorksEmailSending}
                          className="w-full py-3 rounded-full font-medium text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          style={{ 
                            backgroundColor: '#0B9BFF',
                            boxShadow: '0 0 20px rgba(11, 155, 255, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            if (!howItWorksEmailSending) {
                              e.currentTarget.style.filter = 'brightness(0.9)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'brightness(1)';
                          }}
                        >
                          <span>{howItWorksEmailSending ? 'Wysyłanie...' : 'Zobacz demo'}</span>
                          {!howItWorksEmailSending && (
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 px-4 bg-white/5 rounded-xl text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0B9BFF' }}>
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium mb-1">Dziękujemy!</p>
                      <p className="text-white/60 text-xs">Wkrótce się z Tobą skontaktujemy.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Home — landing page that wraps the LoclyWidget with a background.
 * The widget itself is fully self-contained (all fixed-positioned elements)
 * and can be embedded on any page without the landing page background.
 */
export function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image Container - Retina Ready */}
      <div className="w-full">
        <Dark1920W />
      </div>
      {/* White footer for testing widget on white background */}
      <div className="w-full bg-white flex items-center justify-center" style={{ minHeight: '800px', paddingTop: '80px', paddingBottom: '80px' }}>
        <img 
          src={complexQueriesImage} 
          alt="Complex queries" 
          className="max-w-full h-auto"
          style={{ maxWidth: '1200px' }}
        />
      </div>
      {/* Self-contained widget (search bar, chat, overlays, modals) */}
      <LoclyWidget />
    </div>
  );
}