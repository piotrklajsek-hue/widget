// ============================================================================
//  Locly Auth Service
//  Zarzadzanie sesja uzytkownika, tokenami OAuth i persistencja w localStorage
// ============================================================================
//
//  INSTRUKCJA DLA DEVELOPERA:
//
//  Ten serwis obsluguje caly cykl zycia autentykacji:
//  1. Rozpoczecie OAuth flow (redirect do providera)
//  2. Obsluga callback (wymiana code -> token na backendzie)
//  3. Zapis sesji w localStorage
//  4. Automatyczny refresh tokenow
//  5. Wylogowanie
//
//  W trybie MOCK (brak VITE_API_BASE_URL):
//  - handleOAuthCallback() zwraca fikcyjnego usera
//  - Sesja jest zachowana w localStorage do zamkniecia przegladarki
//
//  W trybie PRODUCTION:
//  - Frontend wysyla authorization code do backendu
//  - Backend wymienia code na token u providera (Google/Facebook/TikTok)
//  - Backend zwraca JWT + dane usera
//  - Frontend przechowuje JWT w localStorage
//
//  WYMAGANE ENDPOINTY BACKENDU:
//  POST /auth/callback       — wymiana code na sesje
//  POST /auth/refresh        — refresh tokenu
//  POST /auth/logout         — wylogowanie (opcjonalne)
//  GET  /auth/me             — dane zalogowanego usera
//
// ============================================================================

const API_BASE = import.meta.env?.VITE_API_BASE_URL || '';
const isProductionMode = (): boolean => !!API_BASE;

// ─────────────────────────────────────────────────────────────────────────────
//  TYPY
// ─────────────────────────────────────────────────────────────────────────────

export type AuthProvider = 'google' | 'facebook' | 'tiktok' | 'instagram';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: AuthProvider;
  city?: string;
  /** Czy user juz polecil (recommend) ta firme */
  hasRecommended: boolean;
  /** Czy user juz dodal opinie */
  hasOpinion: boolean;
  /** ID opinii usera (jesli istnieje) */
  opinionId?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // unix timestamp in ms
}

export interface OAuthCallbackResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  SESSION: 'locly_auth_session',
  OAUTH_STATE: 'locly_oauth_state',
  PENDING_ACTION: 'locly_pending_action',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pobierz aktywna sesje z localStorage.
 * Zwraca null jesli sesja wygasla lub nie istnieje.
 */
export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;

    const session: AuthSession = JSON.parse(raw);

    // Sprawdz czy token nie wygasl (z 60s buforem)
    if (session.expiresAt < Date.now() - 60_000) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Pobierz aktualnego usera z sesji.
 */
export function getCurrentUser(): AuthUser | null {
  return getSession()?.user ?? null;
}

/**
 * Pobierz access token z sesji.
 */
export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

/**
 * Sprawdz czy user jest zalogowany (sesja istnieje i nie wygasla).
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Zapisz sesje w localStorage.
 */
export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('[Locly Auth] Nie udalo sie zapisac sesji:', e);
  }
}

/**
 * Wyczysc sesje (wylogowanie).
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTION);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PENDING ACTION (co user chcial zrobic przed logowaniem)
// ─────────────────────────────────────────────────────────────────────────────

export type PendingAction = 
  | { type: 'recommend' }
  | { type: 'add_opinion' }
  | { type: 'see_all_opinions' }
  | null;

/**
 * Zapisz akcje ktora user chcial wykonac przed logowaniem.
 * Po zalogowaniu frontend automatycznie ja wykona.
 */
export function setPendingAction(action: PendingAction): void {
  if (action) {
    localStorage.setItem(STORAGE_KEYS.PENDING_ACTION, JSON.stringify(action));
  } else {
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTION);
  }
}

/**
 * Pobierz i wyczysc pending action.
 */
export function consumePendingAction(): PendingAction {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_ACTION);
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTION);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  OAUTH STATE (CSRF protection)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generuj i zapisz OAuth state do CSRF protection.
 */
export function generateOAuthState(): string {
  const state = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
  return state;
}

/**
 * Zweryfikuj OAuth state.
 */
export function verifyOAuthState(state: string): boolean {
  const saved = localStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
  localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
  return saved === state;
}

// ─────────────────────────────────────────────────────────────────────────────
//  OAUTH CALLBACK HANDLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obsluz callback z OAuth providera.
 *
 * PRODUCTION: Wysyla authorization code do backendu,
 *             backend wymienia go na token i zwraca sesje.
 *
 * MOCK: Tworzy fikcyjna sesje natychmiast.
 *
 * @param provider - 'google' | 'facebook' | 'tiktok' | 'instagram'
 * @param code - Authorization code z URL callback
 * @param state - OAuth state do CSRF verification
 */
export async function handleOAuthCallback(
  provider: AuthProvider,
  code: string,
  state: string
): Promise<OAuthCallbackResult> {
  // CSRF check
  if (!verifyOAuthState(state)) {
    return { success: false, error: 'Nieprawidlowy state — mozliwy atak CSRF' };
  }

  if (isProductionMode()) {
    return handleProductionCallback(provider, code);
  }

  return handleMockCallback(provider);
}

/**
 * PRODUCTION: Wymiana code na sesje przez backend.
 *
 * BACKEND ENDPOINT: POST /auth/callback
 * Body: { provider, code, redirect_uri }
 * Response: { user: AuthUser, access_token, refresh_token?, expires_in }
 */
async function handleProductionCallback(
  provider: AuthProvider,
  code: string
): Promise<OAuthCallbackResult> {
  try {
    const response = await fetch(`${API_BASE}/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        code,
        redirect_uri: `${window.location.origin}/auth/${provider}/callback`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Blad serwera' }));
      return { success: false, error: error.message || `HTTP ${response.status}` };
    }

    const data = await response.json();

    const session: AuthSession = {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        provider,
        city: data.user.city,
        hasRecommended: data.user.has_recommended ?? false,
        hasOpinion: data.user.has_opinion ?? false,
        opinionId: data.user.opinion_id,
      },
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };

    saveSession(session);
    return { success: true, session };
  } catch (error) {
    console.error('[Locly Auth] Callback error:', error);
    return { success: false, error: 'Blad polaczenia z serwerem' };
  }
}

/**
 * MOCK: Natychmiastowa sesja z fikcyjnym userem.
 */
async function handleMockCallback(provider: AuthProvider): Promise<OAuthCallbackResult> {
  await new Promise(r => setTimeout(r, 400)); // symulacja opóźnienia

  const mockUsers: Record<AuthProvider, Omit<AuthUser, 'hasRecommended' | 'hasOpinion'>> = {
    google: {
      id: 'mock-google-001',
      name: 'Jan Kowalski',
      email: 'jan.kowalski@gmail.com',
      avatar: '',
      provider: 'google',
      city: 'Warszawa',
    },
    facebook: {
      id: 'mock-fb-001',
      name: 'Anna Nowak',
      email: 'anna.nowak@facebook.com',
      avatar: '',
      provider: 'facebook',
      city: 'Krakow',
    },
    tiktok: {
      id: 'mock-tt-001',
      name: 'Piotr Wisniewski',
      email: 'piotr@tiktok.com',
      avatar: '',
      provider: 'tiktok',
      city: 'Gdansk',
    },
    instagram: {
      id: 'mock-ig-001',
      name: 'Maria Zielinska',
      email: 'maria@instagram.com',
      avatar: '',
      provider: 'instagram',
      city: 'Wroclaw',
    },
  };

  const mockUser = mockUsers[provider];

  const session: AuthSession = {
    user: {
      ...mockUser,
      hasRecommended: false,
      hasOpinion: false,
    },
    accessToken: `mock-token-${provider}-${Date.now()}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };

  saveSession(session);
  return { success: true, session };
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEMO AUTH (bez OAuth redirect — natychmiastowy mock)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Demo autentykacja — uzyj gdy klikniesz „Google (demo)" w auth modal.
 * Tworzy sesje bez OAuth flow.
 */
export function demoAuth(provider: AuthProvider): AuthSession {
  const session: AuthSession = {
    user: {
      id: `demo-${provider}-${Date.now()}`,
      name: provider === 'google' ? 'Jan (demo)' : provider === 'facebook' ? 'Anna (demo)' : 'Piotr (demo)',
      email: `demo@${provider}.com`,
      avatar: '',
      provider,
      hasRecommended: false,
      hasOpinion: false,
    },
    accessToken: `demo-token-${Date.now()}`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  saveSession(session);
  return session;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOKEN REFRESH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Odswiedz access token.
 *
 * BACKEND ENDPOINT: POST /auth/refresh
 * Body: { refresh_token }
 * Response: { access_token, expires_in, refresh_token? }
 */
export async function refreshAccessToken(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;

  if (!isProductionMode()) {
    // Mock: po prostu przedluz sesje
    session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    saveSession(session);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      return false;
    }

    const data = await response.json();
    session.accessToken = data.access_token;
    session.expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    if (data.refresh_token) session.refreshToken = data.refresh_token;
    saveSession(session);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wyloguj uzytkownika.
 * W trybie production informuje backend o wylogowaniu.
 */
export async function logout(): Promise<void> {
  const token = getAccessToken();

  if (isProductionMode() && token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch {
      // ignore — sesja i tak bedzie wyczyszczona
    }
  }

  clearSession();
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE USER STATE (po poleceniu / dodaniu opinii)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zaktualizuj stan usera w sesji (np. po dodaniu opinii / poleceniu).
 */
export function updateUserState(updates: Partial<Pick<AuthUser, 'hasRecommended' | 'hasOpinion' | 'opinionId' | 'city'>>): void {
  const session = getSession();
  if (!session) return;

  session.user = { ...session.user, ...updates };
  saveSession(session);
}
