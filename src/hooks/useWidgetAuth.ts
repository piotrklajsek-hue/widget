/**
 * useWidgetAuth — manages authentication state, demo auth, production OAuth,
 * and logout for the widget.
 * v1.0
 */

import { useState, useCallback } from 'react';
import * as analytics from '../utils/analytics';
import * as authService from '../services/auth';
import * as api from '../services/api';
import { GOOGLE_CONFIG, FACEBOOK_CONFIG, TIKTOK_CONFIG } from '../config/DEVELOPER_SETUP';

export function useWidgetAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isRecommended, setIsRecommended] = useState(() => authService.getCurrentUser()?.hasRecommended ?? false);
  const [hasOpinion, setHasOpinion] = useState(() => authService.getCurrentUser()?.hasOpinion ?? false);

  /**
   * Demo auth — instant login with mock session.
   */
  const handleAuth = useCallback((
    provider: 'google' | 'facebook' | 'tiktok' = 'google',
    options?: {
      shouldShowSeeAllSkeleton?: boolean;
      pendingOpinionModal?: boolean;
      onSeeAllOpinions?: () => void;
      onClearPending?: () => void;
    }
  ) => {
    const session = authService.demoAuth(provider);
    analytics.trackAuthCompleted(provider);
    analytics.setAuthenticatedStatus(true);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setIsRecommended(session.user.hasRecommended);
    setHasOpinion(session.user.hasOpinion);

    if (options?.shouldShowSeeAllSkeleton) {
      options.onSeeAllOpinions?.();
    }
    if (options?.pendingOpinionModal) {
      options.onClearPending?.();
    }
  }, []);

  /**
   * Production OAuth — redirect to provider.
   */
  const handleProductionAuth = useCallback((
    provider: 'google' | 'facebook' | 'tiktok',
    options?: {
      pendingOpinionModal?: boolean;
      shouldShowSeeAllSkeleton?: boolean;
      onError: (msg: string) => void;
    }
  ) => {
    const configs = {
      google: GOOGLE_CONFIG,
      facebook: FACEBOOK_CONFIG,
      tiktok: TIKTOK_CONFIG,
    } as const;
    const config = configs[provider];
    if (!config.isConfigured()) {
      options?.onError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} nie skonfigurowany — dodaj klucze API do .env`);
      return;
    }
    if (options?.pendingOpinionModal) {
      authService.setPendingAction({ type: 'add_opinion' });
    } else if (options?.shouldShowSeeAllSkeleton) {
      authService.setPendingAction({ type: 'see_all_opinions' });
    } else {
      authService.setPendingAction({ type: 'recommend' });
    }
    const authUrl = config.getAuthUrl();
    if (authUrl) {
      analytics.trackAuthStarted(provider);
      window.location.href = authUrl;
    }
  }, []);

  /**
   * Logout.
   */
  const handleLogout = useCallback(async (onSuccess?: () => void) => {
    await authService.logout();
    setIsAuthenticated(false);
    setIsRecommended(false);
    setHasOpinion(false);
    onSuccess?.();
  }, []);

  /**
   * Restore session on mount (call from useEffect).
   */
  const restoreSession = useCallback(() => {
    const session = authService.getSession();
    if (session) {
      setIsAuthenticated(true);
      setIsRecommended(session.user.hasRecommended);
      setHasOpinion(session.user.hasOpinion);
    }
    return session;
  }, []);

  return {
    showAuthModal, setShowAuthModal,
    isAuthenticated, setIsAuthenticated,
    isRecommended, setIsRecommended,
    hasOpinion, setHasOpinion,
    handleAuth,
    handleProductionAuth,
    handleLogout,
    restoreSession,
  };
}