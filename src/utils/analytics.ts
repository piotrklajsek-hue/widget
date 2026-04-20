// Google Analytics 4 tracking utility

// Global widget configuration (set once during initialization)
let widgetConfig: {
  ownerId?: string;
  ownerDomain?: string;
  ownerEmail?: string;
} = {};

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  // Create gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'
  });
};

// Event categories
export enum WidgetEventCategory {
  SEARCH = 'widget_search',
  CHAT = 'widget_chat',
  RECOMMENDATIONS = 'widget_recommendations',
  AUTH = 'widget_auth',
  IMAGE = 'widget_image',
  NAVIGATION = 'widget_navigation',
  INTERACTION = 'widget_interaction'
}

// Track custom event
export const trackEvent = (
  category: WidgetEventCategory,
  action: string,
  label?: string,
  value?: number,
  customParams?: Record<string, any>
) => {
  if (typeof window.gtag !== 'function') {
    // Silently return if GA is not loaded yet (normal during initialization)
    return;
  }

  const eventName = `${category}_${action}`;
  
  window.gtag('event', eventName, {
    event_category: category,
    event_label: label,
    value: value,
    widget_location: window.location.href,
    widget_referrer: document.referrer,
    timestamp: new Date().toISOString(),
    // Add owner/domain identification for filtering in dashboard
    widget_owner_id: widgetConfig.ownerId || 'unknown',
    widget_owner_domain: widgetConfig.ownerDomain || window.location.hostname,
    widget_owner_email: widgetConfig.ownerEmail,
    ...customParams
  });

  console.log(`[GA4] Event tracked: ${eventName}`, {
    category,
    action,
    label,
    value,
    owner: widgetConfig.ownerId,
    domain: widgetConfig.ownerDomain,
    customParams
  });
};

// Widget-specific tracking functions

// Search & Input
export const trackSearchInput = (inputLength: number) => {
  trackEvent(
    WidgetEventCategory.SEARCH,
    'input_typed',
    undefined,
    inputLength,
    { input_length: inputLength }
  );
};

export const trackSearchSubmit = (query: string, hasImages: boolean) => {
  trackEvent(
    WidgetEventCategory.SEARCH,
    'query_submitted',
    undefined,
    query.length,
    {
      query_length: query.length,
      has_images: hasImages,
      query_preview: query.substring(0, 50) // First 50 chars for analysis
    }
  );
};

export const trackPlaceholderChange = (placeholderIndex: number) => {
  trackEvent(
    WidgetEventCategory.SEARCH,
    'placeholder_changed',
    undefined,
    placeholderIndex
  );
};

// Chat interactions
export const trackChatOpened = (messageCount: number) => {
  trackEvent(
    WidgetEventCategory.CHAT,
    'overlay_opened',
    undefined,
    messageCount,
    { message_count: messageCount }
  );
};

export const trackChatClosed = (messageCount: number, duration?: number) => {
  trackEvent(
    WidgetEventCategory.CHAT,
    'overlay_closed',
    undefined,
    messageCount,
    {
      message_count: messageCount,
      session_duration: duration
    }
  );
};

export const trackMessageReceived = (messageType: string, hasRecommendation: boolean) => {
  trackEvent(
    WidgetEventCategory.CHAT,
    'message_received',
    messageType,
    undefined,
    {
      message_type: messageType,
      has_recommendation: hasRecommendation
    }
  );
};

export const trackChatEnded = (messageCount: number, userInitiated: boolean) => {
  trackEvent(
    WidgetEventCategory.CHAT,
    'conversation_ended',
    userInitiated ? 'user_initiated' : 'timeout',
    messageCount,
    {
      message_count: messageCount,
      user_initiated: userInitiated
    }
  );
};

// Recommendations
export const trackRecommendationsOpened = () => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'modal_opened'
  );
};

export const trackRecommendationsClosed = (timeSpent?: number) => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'modal_closed',
    undefined,
    timeSpent,
    { time_spent: timeSpent }
  );
};

export const trackRecommendationViewed = (recommendationId: string, userName: string) => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'recommendation_viewed',
    userName,
    undefined,
    { recommendation_id: recommendationId }
  );
};

export const trackSeeMoreClicked = () => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'see_more_clicked'
  );
};

export const trackSeeWhoClicked = () => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'see_who_clicked'
  );
};

export const trackAvatarClicked = () => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'avatar_clicked'
  );
};

// Authentication
export const trackAuthModalOpened = (source: string) => {
  trackEvent(
    WidgetEventCategory.AUTH,
    'modal_opened',
    source
  );
};

export const trackAuthModalClosed = () => {
  trackEvent(
    WidgetEventCategory.AUTH,
    'modal_closed'
  );
};

export const trackAuthStarted = (provider: 'google' | 'facebook' | 'tiktok') => {
  trackEvent(
    WidgetEventCategory.AUTH,
    'auth_started',
    provider
  );
};

export const trackAuthCompleted = (provider: 'google' | 'facebook' | 'tiktok') => {
  trackEvent(
    WidgetEventCategory.AUTH,
    'auth_completed',
    provider
  );
};

// Image handling
export const trackImageAdded = (source: 'upload' | 'paste', imageCount: number) => {
  trackEvent(
    WidgetEventCategory.IMAGE,
    'image_added',
    source,
    imageCount,
    {
      source,
      total_images: imageCount
    }
  );
};

export const trackImageRemoved = (imageCount: number) => {
  trackEvent(
    WidgetEventCategory.IMAGE,
    'image_removed',
    undefined,
    imageCount,
    { remaining_images: imageCount }
  );
};

export const trackPlusButtonClicked = () => {
  trackEvent(
    WidgetEventCategory.IMAGE,
    'plus_button_clicked'
  );
};

// Navigation
export const trackSettingsClicked = () => {
  trackEvent(
    WidgetEventCategory.NAVIGATION,
    'settings_clicked'
  );
};

export const trackLoclyLinkClicked = () => {
  trackEvent(
    WidgetEventCategory.NAVIGATION,
    'locly_link_clicked'
  );
};

// Interactions
export const trackMicButtonClicked = () => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'mic_button_clicked'
  );
};

export const trackTooltipShown = (tooltipType: string) => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'tooltip_shown',
    tooltipType
  );
};

export const trackMultilineExpanded = () => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'multiline_expanded'
  );
};

// Page views
export const trackPageView = (pageName: string) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// User properties
export const setUserProperty = (propertyName: string, value: any) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('set', 'user_properties', {
    [propertyName]: value
  });
};

// Set authenticated status
export const setAuthenticatedStatus = (isAuthenticated: boolean) => {
  setUserProperty('is_authenticated', isAuthenticated);
};

// Query type detection (for AI responses)
export const detectQueryType = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('stron') || lowerQuery.includes('website') || lowerQuery.includes('www')) {
    return 'website';
  } else if (lowerQuery.includes('aplikacj') || lowerQuery.includes('mobil') || lowerQuery.includes('app')) {
    return 'mobile_app';
  } else if (lowerQuery.includes('crm') || lowerQuery.includes('system')) {
    return 'crm_system';
  } else if (lowerQuery.includes('dashboard') || lowerQuery.includes('analytics') || lowerQuery.includes('analityk')) {
    return 'dashboard_analytics';
  }
  
  return 'general';
};

// Session tracking
let sessionStartTime: number | null = null;

export const startSession = () => {
  sessionStartTime = Date.now();
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'session_started'
  );
};

export const endSession = () => {
  if (sessionStartTime) {
    const duration = Date.now() - sessionStartTime;
    trackEvent(
      WidgetEventCategory.INTERACTION,
      'session_ended',
      undefined,
      duration,
      { session_duration_ms: duration }
    );
    sessionStartTime = null;
  }
};

// Widget configuration
export interface WidgetConfig {
  measurementId: string;
  enableDebug?: boolean;
  enableAutoTracking?: boolean;
  // Owner identification for per-user analytics
  ownerId?: string;
  ownerDomain?: string;
  ownerEmail?: string;
}

export const configureWidget = (config: WidgetConfig) => {
  // Store owner configuration globally
  widgetConfig = {
    ownerId: config.ownerId,
    ownerDomain: config.ownerDomain,
    ownerEmail: config.ownerEmail
  };
  
  if (config.measurementId) {
    initGA(config.measurementId);
  }
  
  // Set user properties for GA4 user-level filtering
  if (config.ownerId) {
    setUserProperty('widget_owner_id', config.ownerId);
  }
  if (config.ownerDomain) {
    setUserProperty('widget_owner_domain', config.ownerDomain);
  }
  
  if (config.enableDebug) {
    console.log('[GA4] Widget analytics configured', config);
  }
  
  if (config.enableAutoTracking) {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        endSession();
      } else {
        startSession();
      }
    });
    
    // Track page unload
    window.addEventListener('beforeunload', () => {
      endSession();
    });
  }
};

// Opinion tracking
export const trackOpinionSubmitted = (categoryCount: number, inputMethod: string) => {
  trackEvent(
    WidgetEventCategory.RECOMMENDATIONS,
    'opinion_submitted',
    inputMethod,
    categoryCount,
    { category_count: categoryCount, input_method: inputMethod }
  );
};

export const trackImproveTextAI = () => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'improve_text_ai_clicked'
  );
};

export const trackAISuggestionsGenerated = (suggestionCount: number) => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'ai_suggestions_generated',
    undefined,
    suggestionCount
  );
};

export const trackAISuggestionSelected = (index: number) => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'ai_suggestion_selected',
    undefined,
    index
  );
};

export const trackVoiceRecordingStarted = (context: 'search' | 'opinion') => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'voice_recording_started',
    context
  );
};

export const trackVoiceRecordingCompleted = (context: 'search' | 'opinion', durationSeconds: number) => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'voice_recording_completed',
    context,
    durationSeconds,
    { duration_seconds: durationSeconds }
  );
};

export const trackWebSearchQuery = (query: string, resultCount: number) => {
  trackEvent(
    WidgetEventCategory.SEARCH,
    'web_search_executed',
    undefined,
    resultCount,
    { query_length: query.length, result_count: resultCount }
  );
};

export const trackCTAClicked = (action: 'quote' | 'portfolio' | 'contact') => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'cta_clicked',
    action
  );
};

export const trackFollowUpQuestion = (questionIndex: number) => {
  trackEvent(
    WidgetEventCategory.CHAT,
    'follow_up_clicked',
    undefined,
    questionIndex
  );
};