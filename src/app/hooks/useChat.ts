/**
 * useChat — manages chat state, messages, overlays, scroll behavior,
 * swipe gestures, unread badges, inactivity timer, transcript & sounds.
 * v1.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import * as analytics from '../../utils/analytics';
import { playMessageReceivedSound, playMessageSentSound } from '../../utils/messageSound';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  avatar?: string;
  userName?: string;
  userCity?: string;
  instagramPosts?: {
    id: string;
    imageUrl: string;
    postUrl: string;
    type: 'image' | 'video';
  }[];
  tiktokPosts?: {
    id: string;
    imageUrl: string;
    postUrl: string;
    type: 'image' | 'video';
  }[];
  answerData?: any;
  sources?: any[];
  followUpQuestions?: any[];
}

export function useChat() {
  // ── State ──
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [hasClosedChat, setHasClosedChat] = useState(false);
  const [isAwaitingEndConfirmation, setIsAwaitingEndConfirmation] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showMobileScrollToBottom, setShowMobileScrollToBottom] = useState(false);
  const [unreadScrollMessages, setUnreadScrollMessages] = useState(0);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [transcriptEmail, setTranscriptEmail] = useState('');
  const [transcriptSending, setTranscriptSending] = useState(false);
  const [transcriptSent, setTranscriptSent] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    return localStorage.getItem('locly_sounds_disabled') !== 'true';
  });
  const [mobileInputValue, setMobileInputValue] = useState('');
  const [chatDragY, setChatDragY] = useState(0);
  const [isDraggingChat, setIsDraggingChat] = useState(false);

  // ── Refs ──
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatTouchStartRef = useRef<{ y: number; time: number } | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const mobileChatMenuRef = useRef<HTMLDivElement>(null);
  const lastUserMessageIdRef = useRef<string | null>(null);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const wasAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const lastBottomMessageIdRef = useRef<string | null>(null);
  const autoScrollInProgressRef = useRef(false);
  const mobileChatContainerRef = useRef<HTMLDivElement>(null);
  const mobileChatInputRef = useRef<HTMLTextAreaElement>(null);
  const prevMobileLastMsgIdRef = useRef<string | null>(null);
  const mobileWasAtBottomRef = useRef(true);
  const mobileAutoScrollRef = useRef(false);

  // ── Haptic ──
  const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // ── Sound helpers ──
  const playSentSound = useCallback(() => {
    if (soundsEnabled) playMessageSentSound();
  }, [soundsEnabled]);

  const playReceivedSound = useCallback(() => {
    if (soundsEnabled) playMessageReceivedSound();
  }, [soundsEnabled]);

  // ── Helpers ──
  const isAtBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < 80;

  const updateScrollButton = useCallback((el: HTMLDivElement) => {
    const hasOverflow = el.scrollHeight > el.clientHeight + 40;
    setShowScrollToBottom(hasOverflow && !isAtBottom(el));
  }, []);

  const countUnreadAiMessages = useCallback(() => {
    const container = chatMessagesRef.current;
    if (!container) return 0;
    const containerRect = container.getBoundingClientRect();
    const visibleBottom = containerRect.bottom;
    let startIndex = 0;
    if (lastBottomMessageIdRef.current) {
      const idx = chatMessages.findIndex(m => m.id === lastBottomMessageIdRef.current);
      if (idx !== -1) startIndex = idx + 1;
    }
    let count = 0;
    for (let i = startIndex; i < chatMessages.length; i++) {
      const msg = chatMessages[i];
      if (msg.role !== 'assistant') continue;
      const el = container.querySelector(`[data-message-id="${msg.id}"]`);
      if (!el) continue;
      const elRect = el.getBoundingClientRect();
      if (elRect.top >= visibleBottom) count++;
    }
    return count;
  }, [chatMessages]);

  const countUnreadAiMessagesMobile = useCallback(() => {
    const container = mobileChatContainerRef.current;
    if (!container) return 0;
    const containerRect = container.getBoundingClientRect();
    const visibleBottom = containerRect.bottom;
    let startIndex = 0;
    if (lastBottomMessageIdRef.current) {
      const idx = chatMessages.findIndex(m => m.id === lastBottomMessageIdRef.current);
      if (idx !== -1) startIndex = idx + 1;
    }
    let count = 0;
    for (let i = startIndex; i < chatMessages.length; i++) {
      const msg = chatMessages[i];
      if (msg.role !== 'assistant') continue;
      const el = container.querySelector(`[data-message-id="${msg.id}"]`);
      if (!el) continue;
      const elRect = el.getBoundingClientRect();
      if (elRect.top >= visibleBottom) count++;
    }
    return count;
  }, [chatMessages]);

  // Scroll user message to top with 30px offset (ChatGPT-style)
  const scrollUserMessageToTop = useCallback((messageId: string) => {
    // Wait for DOM update and layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (chatMessagesRef.current) {
          const container = chatMessagesRef.current;
          const messageEl = container.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement;
          if (messageEl) {
            // Calculate scroll position to put message 30px from container top
            // Account for container's paddingTop
            const containerPaddingTop = parseInt(getComputedStyle(container).paddingTop) || 0;
            const targetScrollTop = messageEl.offsetTop - 30 - containerPaddingTop;
            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
          }
        }
        if (mobileChatContainerRef.current) {
          const container = mobileChatContainerRef.current;
          const messageEl = container.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement;
          if (messageEl) {
            const containerPaddingTop = parseInt(getComputedStyle(container).paddingTop) || 0;
            const targetScrollTop = messageEl.offsetTop - 30 - containerPaddingTop;
            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
          }
        }
      });
    });
  }, []);

  const scrollChatToBottom = useCallback((_messageId?: string) => {
    setTimeout(() => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: 'smooth' });
        setUnreadScrollMessages(0);
        wasAtBottomRef.current = true;
        if (chatMessages.length > 0) {
          lastBottomMessageIdRef.current = chatMessages[chatMessages.length - 1].id;
        }
        updateScrollButton(chatMessagesRef.current);
      }
      if (mobileChatContainerRef.current) {
        mobileChatContainerRef.current.scrollTo({ top: mobileChatContainerRef.current.scrollHeight, behavior: 'smooth' });
        mobileWasAtBottomRef.current = true;
        setShowMobileScrollToBottom(false);
      }
    }, 80);
  }, [chatMessages, updateScrollButton]);

  // ── Swipe-down gesture ──
  const handleChatTouchStart = useCallback((e: React.TouchEvent, isMobile: boolean) => {
    if (!isMobile) return;
    chatTouchStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
    setChatDragY(0);
    setIsDraggingChat(false);
  }, []);

  const handleChatTouchMove = useCallback((e: React.TouchEvent, isMobile: boolean) => {
    if (!isMobile || !chatTouchStartRef.current) return;
    const deltaY = e.touches[0].clientY - chatTouchStartRef.current.y;
    if (deltaY > 0) {
      setIsDraggingChat(true);
      setChatDragY(deltaY);
    }
  }, []);

  const handleChatTouchEnd = useCallback((isMobile: boolean) => {
    if (!isMobile || !chatTouchStartRef.current) return;
    const elapsed = Date.now() - chatTouchStartRef.current.time;
    const velocity = chatDragY / Math.max(elapsed, 1);
    if (chatDragY > 120 || (chatDragY > 40 && velocity > 0.5)) {
      triggerHaptic(5);
      setShowChatOverlay(false);
      setHasClosedChat(true);
    }
    setChatDragY(0);
    setIsDraggingChat(false);
    chatTouchStartRef.current = null;
  }, [chatDragY, triggerHaptic]);

  // ── Close chat menu on click outside ──
  useEffect(() => {
    if (!showChatMenu) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const inDesktop = chatMenuRef.current?.contains(target);
      const inMobile = mobileChatMenuRef.current?.contains(target);
      if (!inDesktop && !inMobile) setShowChatMenu(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showChatMenu]);

  // ── ChatGPT-style: no auto-scroll during streaming ──
  useEffect(() => {
    if (!chatMessagesRef.current || !showChatOverlay) return;
    const el = chatMessagesRef.current;
    const lastMsg = chatMessages[chatMessages.length - 1];
    const isNewMessage = lastMsg && lastMsg.id !== prevLastMessageIdRef.current;

    if (isNewMessage) {
      // No auto-scroll - user message scroll is handled by scrollUserMessageToTop
      // AI message does not auto-scroll (ChatGPT-style)
      setTimeout(() => {
        setUnreadScrollMessages(countUnreadAiMessages());
        updateScrollButton(el);
      }, 50);
    } else {
      updateScrollButton(el);
    }

    if (lastMsg) prevLastMessageIdRef.current = lastMsg.id;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [chatMessages, isTyping, showChatOverlay, countUnreadAiMessages, updateScrollButton]);

  // ── Update scroll-to-bottom button on scroll ──
  useEffect(() => {
    if (!chatMessagesRef.current || !showChatOverlay) return;
    const el = chatMessagesRef.current;
    const handleScroll = () => updateScrollButton(el);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [showChatOverlay, updateScrollButton]);

  // ── Unread count ──
  useEffect(() => {
    if (!lastReadMessageId || chatMessages.length === 0) {
      setUnreadCount(chatMessages.filter(m => m.role === 'assistant').length);
      return;
    }
    const lastReadIndex = chatMessages.findIndex(m => m.id === lastReadMessageId);
    if (lastReadIndex === -1) {
      setUnreadCount(chatMessages.filter(m => m.role === 'assistant').length);
      return;
    }
    setUnreadCount(chatMessages.slice(lastReadIndex + 1).filter(m => m.role === 'assistant').length);
  }, [chatMessages, lastReadMessageId]);

  // ── Mark as read when overlay opens ──
  const prevShowChatOverlayRef = useRef(false);
  useEffect(() => {
    if (showChatOverlay && chatMessages.length > 0) {
      const justOpened = !prevShowChatOverlayRef.current;
      if (justOpened) {
        const lastMessage = chatMessages[chatMessages.length - 1];
        setLastReadMessageId(lastMessage.id);
        setUnreadCount(0);
        analytics.trackChatOpened(chatMessages.length);
      } else if (chatMessagesRef.current && isAtBottom(chatMessagesRef.current)) {
        const lastMessage = chatMessages[chatMessages.length - 1];
        setLastReadMessageId(lastMessage.id);
        setUnreadCount(0);
      }
    }
    prevShowChatOverlayRef.current = showChatOverlay;
  }, [showChatOverlay, chatMessages]);

  // ── Transfer unread on close ──
  const prevOverlayOpenRef = useRef(false);
  useEffect(() => {
    if (prevOverlayOpenRef.current && !showChatOverlay) {
      if (unreadScrollMessages > 0) {
        setUnreadCount(unreadScrollMessages);
        const assistantMessages = chatMessages.filter(m => m.role === 'assistant');
        const visibleCount = assistantMessages.length - unreadScrollMessages;
        if (visibleCount > 0 && assistantMessages[visibleCount - 1]) {
          setLastReadMessageId(assistantMessages[visibleCount - 1].id);
        }
      }
    }
    prevOverlayOpenRef.current = showChatOverlay;
  }, [showChatOverlay, unreadScrollMessages, chatMessages]);

  // ── Body scroll lock (desktop chat overlay) ──
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (showChatOverlay && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.dataset.scrollY = String(scrollY);
    }
    return () => {
      if (document.body.style.position === 'fixed' && document.body.dataset.scrollY !== undefined) {
        const savedScrollY = parseInt(document.body.dataset.scrollY || '0');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        delete document.body.dataset.scrollY;
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [showChatOverlay]);

  // ── End-chat confirmation handler ──
  const handleEndChatConfirmation = useCallback((confirm: boolean) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: confirm ? 'Tak' : 'Nie',
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    playSentSound();
    lastUserMessageIdRef.current = userMessage.id;
    setUnreadScrollMessages(0);
    scrollChatToBottom(userMessage.id);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: confirm
          ? 'Dziękuję za rozmowę! Do zobaczenia! 👋\n\n**Rozmowa zakończona**'
          : 'Świetnie! W czym jeszcze mogę Ci pomóc?',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, reply]);
      playReceivedSound();
      if (confirm) setIsChatEnded(true);
      setIsAwaitingEndConfirmation(false);
    }, 500);
  }, [playSentSound, playReceivedSound, scrollChatToBottom]);

  return {
    // State
    showChatOverlay, setShowChatOverlay,
    chatMessages, setChatMessages,
    isTyping, setIsTyping,
    unreadCount, setUnreadCount,
    lastReadMessageId, setLastReadMessageId,
    hasClosedChat, setHasClosedChat,
    isAwaitingEndConfirmation, setIsAwaitingEndConfirmation,
    isChatEnded, setIsChatEnded,
    showScrollToBottom, setShowScrollToBottom,
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

    // Refs
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

    // Handlers
    triggerHaptic,
    playSentSound, playReceivedSound,
    scrollChatToBottom,
    scrollUserMessageToTop,
    handleChatTouchStart, handleChatTouchMove, handleChatTouchEnd,
    handleEndChatConfirmation,
    isAtBottom, updateScrollButton,
    countUnreadAiMessages, countUnreadAiMessagesMobile,
  };
}