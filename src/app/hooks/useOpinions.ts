/**
 * useOpinions — manages recommendations, opinions, the add-opinion form,
 * AI suggestions, geolocation, and recommendation toggle.
 * v1.0
 */

import { useState, useRef, useCallback } from 'react';
import * as analytics from '../../utils/analytics';
import * as api from '../../services/api';

export interface Recommendation {
  id: string;
  avatar: string;
  name: string;
  city: string;
  opinion: string;
  categories: string[];
  date: string;
  status?: string;
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
}

export function useOpinions() {
  // ── Recommendations panel ──
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const [shouldShowSeeAllSkeleton, setShouldShowSeeAllSkeleton] = useState(false);
  const [userOpinions, setUserOpinions] = useState<Recommendation[]>([]);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // ── Add opinion modal ──
  const [showAddOpinionModal, setShowAddOpinionModal] = useState(false);
  const [opinionText, setOpinionText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmittingOpinion, setIsSubmittingOpinion] = useState(false);
  const [inputMethod, setInputMethod] = useState<'voice' | 'text' | null>(null);
  const [pendingOpinionModal, setPendingOpinionModal] = useState(false);

  // ── AI suggestions ──
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // ── Notifications ──
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // ── Geolocation / City ──
  const [userCity, setUserCity] = useState<string>('Twoja lokalizacja');
  const [showCityInput, setShowCityInput] = useState(false);
  const [manualCity, setManualCity] = useState('');

  // ── Refs ──
  const addOpinionOriginRef = useRef<'search' | 'chat' | 'recommend' | 'addOpinion'>('recommend');
  const opinionModalContentRef = useRef<HTMLDivElement>(null);

  // ── Categories ──
  const allCategories = [
    'Aplikacja mobilna', 'UI/UX', 'React Native',
    'Strona internetowa', 'SEO', 'System CRM',
    'Backend', 'Dashboard', 'Analytics',
    'Wizualizacja danych', 'E-commerce', 'WordPress', 'Konsultacje'
  ];

  // ── Geolocation ──
  const getLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pl`,
            { headers: { 'User-Agent': 'FigmaMakeApp/1.0' } }
          );
          if (!response.ok) { setShowCityInput(true); return; }
          const data = await response.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '';
          if (city) { setUserCity(city); setShowCityInput(false); }
          else setShowCityInput(true);
        } catch { setShowCityInput(true); }
      },
      () => setShowCityInput(true),
      { timeout: 5000, maximumAge: 600000, enableHighAccuracy: false }
    );
  }, []);

  const checkGeolocationPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) { setShowCityInput(true); return; }
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted' || status.state === 'prompt') getLocation();
        else setShowCityInput(true);
      } catch { getLocation(); }
    } else { getLocation(); }
  }, [getLocation]);

  // ── Handlers ──
  const toggleRecommendations = useCallback((closeChatOverlay: () => void) => {
    if (!showRecommendations) {
      closeChatOverlay();
      analytics.trackRecommendationsOpened();
    } else {
      analytics.trackRecommendationsClosed();
    }
    setShowRecommendations(!showRecommendations);
  }, [showRecommendations]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) return prev.filter(c => c !== category);
      if (prev.length < 3) return [...prev, category];
      return prev;
    });
  }, []);

  const generateAISuggestions = useCallback((text: string) => {
    setIsGeneratingAI(true);
    api.generateAISuggestions(text).then((result) => {
      setAiSuggestions(result.suggestions);
      setShowAISuggestions(true);
      setIsGeneratingAI(false);
    }).catch(() => setIsGeneratingAI(false));
  }, []);

  const handleImproveTextWithAI = useCallback(() => {
    if (opinionText.trim() === '') return;
    analytics.trackImproveTextAI();
    api.improveTextWithAI(opinionText).then((result) => {
      setOpinionText(result.improvedText);
    });
  }, [opinionText]);

  const resetOpinionForm = useCallback((stopRecordingCleanup: () => void) => {
    stopRecordingCleanup();
    setOpinionText('');
    setSelectedCategories([]);
    setManualCity('');
    setShowCityInput(false);
    setInputMethod(null);
    setAiSuggestions([]);
    setSelectedSuggestion(null);
    setShowAISuggestions(false);
    setIsGeneratingAI(false);
  }, []);

  const handleRecommendClick = useCallback((
    isAuthenticated: boolean,
    isRecommended: boolean,
    hasOpinion: boolean,
    callbacks: {
      openAuthModal: () => void;
      setIsRecommended: (v: boolean) => void;
      onSuccess: (msg: string) => void;
      onError: (msg: string) => void;
      onInfo: (msg: string) => void;
    }
  ) => {
    if (!isAuthenticated) {
      analytics.trackAuthModalOpened('recommend_button');
      setPendingOpinionModal(false);
      callbacks.openAuthModal();
      return;
    }
    if (hasOpinion) return;
    if (isRecommended) {
      setIsRecommending(true);
      api.removeRecommendation().then((result) => {
        setIsRecommending(false);
        if (result.success) {
          callbacks.setIsRecommended(false);
          callbacks.onInfo('Cofnięto polecenie');
        }
      }).catch(() => { setIsRecommending(false); callbacks.onError('Nie udalo sie cofnac polecenia'); });
      return;
    }
    setIsRecommending(true);
    api.submitRecommendation().then(() => {
      setIsRecommending(false);
      callbacks.setIsRecommended(true);
      callbacks.onSuccess('Poleciles to!');
    }).catch(() => { setIsRecommending(false); callbacks.onError('Nie udalo sie dodac polecenia'); });
  }, []);

  const showError = useCallback((message: string) => {
    setErrorNotification(message);
    setTimeout(() => setErrorNotification(null), 3000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessNotification(message);
    setTimeout(() => setSuccessNotification(null), 3000);
  }, []);

  // ── Utility ──
  const censorLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length < 2) return fullName;
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.charAt(0) + '*'.repeat(lastName.length - 1)}`;
  };

  const getFirstLine = (text: string) => text.split('.')[0] + '.';

  const getSecondLineSkeleton = (text: string) => {
    const sentences = text.split('. ');
    if (sentences.length < 2) return null;
    return sentences[1].split(' ').length;
  };

  return {
    // Recommendations
    showRecommendations, setShowRecommendations,
    isLoadingOpinions, setIsLoadingOpinions,
    shouldShowSeeAllSkeleton, setShouldShowSeeAllSkeleton,
    userOpinions, setUserOpinions,
    hoveredStatus, setHoveredStatus,
    isRecommending, setIsRecommending,

    // Add opinion
    showAddOpinionModal, setShowAddOpinionModal,
    opinionText, setOpinionText,
    selectedCategories, setSelectedCategories,
    isSubmittingOpinion, setIsSubmittingOpinion,
    inputMethod, setInputMethod,
    pendingOpinionModal, setPendingOpinionModal,

    // AI
    aiSuggestions, setAiSuggestions,
    selectedSuggestion, setSelectedSuggestion,
    showAISuggestions, setShowAISuggestions,
    isGeneratingAI, setIsGeneratingAI,

    // Notifications
    showSuccessNotification, setShowSuccessNotification,
    errorNotification, successNotification,
    showError, showSuccess,

    // Geolocation
    userCity, setUserCity,
    showCityInput, setShowCityInput,
    manualCity, setManualCity,
    checkGeolocationPermission,

    // Refs
    addOpinionOriginRef,
    opinionModalContentRef,

    // Data
    allCategories,

    // Handlers
    toggleRecommendations,
    toggleCategory,
    generateAISuggestions,
    handleImproveTextWithAI,
    resetOpinionForm,
    handleRecommendClick,

    // Utilities
    censorLastName, getFirstLine, getSecondLineSkeleton,
  };
}