// ============================================================================
//  INSTRUKCJA KONFIGURACJI DLA PROGRAMISTY
//  Developer Setup & Integration Guide
// ============================================================================
//
//  Ten plik zawiera kompletna instrukcje podpiecia wszystkich integracji
//  w aplikacji. Kazda sekcja opisuje kroki konfiguracji, zmienne
//  srodowiskowe i linki do dokumentacji.
//
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
//  1. ZMIENNE SRODOWISKOWE (.env)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Utworz plik `.env` w katalogu glownym projektu:
//
//  ```env
//  # ── Google Analytics 4 ──
//  VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
//  VITE_GA_DEBUG=false
//
//  # ── OpenAI Whisper (Speech-to-Text) ──
//  VITE_OPENAI_API_KEY=sk-...
//
//  # ── LLM Web Search (backend AI) ──
//  VITE_LLM_API_ENDPOINT=https://your-backend.com/api/search
//  VITE_LLM_API_KEY=your-llm-api-key
//
//  # ── TikTok Login API ──
//  VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
//  VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
//  VITE_TIKTOK_REDIRECT_URI=https://your-domain.com/auth/tiktok/callback
//
//  # ── Google OAuth ──
//  VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
//  VITE_GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
//
//  # ── Facebook Login ──
//  VITE_FACEBOOK_APP_ID=your_facebook_app_id
//  VITE_FACEBOOK_REDIRECT_URI=https://your-domain.com/auth/facebook/callback
//
//  # ── Instagram Basic Display / Graph API ──
//  VITE_INSTAGRAM_APP_ID=your_instagram_app_id
//  VITE_INSTAGRAM_APP_SECRET=your_instagram_app_secret
//  VITE_INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/instagram/callback
//  ```
//
//  UWAGA: Plik .env NIGDY nie powinien byc commitowany do repozytorium.
//  Dodaj go do .gitignore!
//

// ─────────────────────────────────────────────────────────────────────────────
//  2. INSTAGRAM — Konfiguracja logowania i pobierania postow
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz aplikacje na Meta for Developers
//    - Przejdz do: https://developers.facebook.com/
//    - Utworz nowa aplikacje (typ: Consumer lub Business)
//    - UWAGA: Instagram API jest czescia ekosystemu Meta/Facebook
//
//  Krok 2: Dodaj produkt "Instagram Basic Display API" lub "Instagram Graph API"
//    - Instagram Basic Display API — do odczytu postow i profilu uzytkownika
//    - Instagram Graph API — pelna integracja (wymaga Facebook Page)
//    - W panelu aplikacji kliknij "Add Product" > wybierz odpowiednie API
//
//  Krok 3: Skonfiguruj OAuth
//    - Settings > Basic: uzyskaj Instagram App ID i App Secret
//    - Products > Instagram Basic Display > Basic Display:
//      - Dodaj Valid OAuth Redirect URIs
//      - Dodaj Deauthorize Callback URL
//      - Dodaj Data Deletion Request URL
//
//  Krok 4: Dodaj testerow (tryb Development)
//    - Roles > Instagram Testers > dodaj konto Instagram
//    - Zaakceptuj zaproszenie w aplikacji Instagram:
//      Settings > Apps and Websites > Tester Invites
//
//  Krok 5: Implementacja flow OAuth 2.0 (Authorization Code)
//    - Endpoint autoryzacji: https://api.instagram.com/oauth/authorize
//    - Endpoint wymiany kodu na token: https://api.instagram.com/oauth/access_token
//    - Endpoint long-lived token: https://graph.instagram.com/access_token
//      (short-lived token trwa 1h, long-lived 60 dni)
//    - Endpoint danych uzytkownika: https://graph.instagram.com/me
//    - Endpoint mediow: https://graph.instagram.com/me/media
//
//  Krok 6: Podpiecie backendu (WYMAGANE w produkcji!)
//    - NIGDY nie przechowuj App Secret po stronie klienta
//    - Utworz endpoint backendowy np. POST /api/auth/instagram
//    - Backend wymienia authorization code na access_token
//    - Backend odswiedza long-lived token przed wygasnieciem
//    - Backend zwraca dane uzytkownika do frontendu
//
//  Wymagane uprawnienia (Scopes):
//    - user_profile       — podstawowe dane uzytkownika (id, username)
//    - user_media         — lista postow uzytkownika (obrazy, filmy, karuzele)
//
//  Dokumentacja:
//    - Basic Display API: https://developers.facebook.com/docs/instagram-basic-display-api
//    - Graph API: https://developers.facebook.com/docs/instagram-api
//    - Permissions: https://developers.facebook.com/docs/instagram-basic-display-api/overview#permissions
//

export const INSTAGRAM_CONFIG = {
  // ── Endpointy API ──
  AUTH_URL: 'https://api.instagram.com/oauth/authorize',
  TOKEN_URL: 'https://api.instagram.com/oauth/access_token',
  LONG_LIVED_TOKEN_URL: 'https://graph.instagram.com/access_token',
  USER_INFO_URL: 'https://graph.instagram.com/me',
  USER_MEDIA_URL: 'https://graph.instagram.com/me/media',

  // ── Konfiguracja z env ──
  APP_ID: import.meta.env?.VITE_INSTAGRAM_APP_ID || '',
  REDIRECT_URI: import.meta.env?.VITE_INSTAGRAM_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/instagram/callback`,

  // ── Wymagane scope'y ──
  SCOPES: ['user_profile', 'user_media'],

  // ── Pola do pobierania ──
  USER_FIELDS: 'id,username,account_type,media_count',
  MEDIA_FIELDS: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',

  // ── Pomocnicze funkcje ──
  getAuthUrl: () => {
    const appId = INSTAGRAM_CONFIG.APP_ID;
    if (!appId) {
      console.warn(
        '⚠️ Instagram App ID nie skonfigurowany.\n' +
        'Dodaj VITE_INSTAGRAM_APP_ID do zmiennych srodowiskowych.\n' +
        'Szczegoly: https://developers.facebook.com/docs/instagram-basic-display-api'
      );
      return null;
    }
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: INSTAGRAM_CONFIG.REDIRECT_URI,
      scope: INSTAGRAM_CONFIG.SCOPES.join(','),
      response_type: 'code',
    });
    return `${INSTAGRAM_CONFIG.AUTH_URL}?${params.toString()}`;
  },

  // ── Sprawdz czy Instagram jest skonfigurowany ──
  isConfigured: () => !!import.meta.env?.VITE_INSTAGRAM_APP_ID,
};


// ─────────────────────────────────────────────────────────────────────────────
//  3. TIKTOK — Konfiguracja logowania i pobierania postow
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz aplikacje na TikTok for Developers
//    - Przejdz do: https://developers.tiktok.com/
//    - Utworz nowa aplikacje (App type: "Web")
//    - Ustaw Redirect URI na: https://your-domain.com/auth/tiktok/callback
//
//  Krok 2: Wybierz wymagane uprawnienia (Scopes):
//    - user.info.basic     — podstawowe dane uzytkownika (avatar, nazwa)
//    - user.info.profile   — pelne dane profilu
//    - video.list          — lista opublikowanych filmow
//    - video.upload        — (opcjonalnie) mozliwosc uploadowania filmow
//
//  Krok 3: Uzyskaj Client Key i Client Secret
//    - Znajdziesz je w panelu aplikacji na TikTok for Developers
//    - Dodaj do zmiennych srodowiskowych (patrz sekcja 1)
//
//  Krok 4: Implementacja flow OAuth 2.0 (Authorization Code)
//    - Endpoint autoryzacji: https://www.tiktok.com/v2/auth/authorize/
//    - Endpoint wymiany kodu na token: https://open.tiktokapis.com/v2/oauth/token/
//    - Endpoint danych uzytkownika: https://open.tiktokapis.com/v2/user/info/
//    - Endpoint listy filmow: https://open.tiktokapis.com/v2/video/list/
//
//  Krok 5: Podpiecie backendu (WYMAGANE w produkcji!)
//    - NIGDY nie przechowuj Client Secret po stronie klienta
//    - Utworz endpoint backendowy np. POST /api/auth/tiktok
//    - Backend wymienia authorization code na access_token
//    - Backend zwraca dane uzytkownika do frontendu
//
//  Dokumentacja: https://developers.tiktok.com/doc/login-kit-web/
//

export const TIKTOK_CONFIG = {
  // ── Endpointy API ──
  AUTH_URL: 'https://www.tiktok.com/v2/auth/authorize/',
  TOKEN_URL: 'https://open.tiktokapis.com/v2/oauth/token/',
  USER_INFO_URL: 'https://open.tiktokapis.com/v2/user/info/',
  VIDEO_LIST_URL: 'https://open.tiktokapis.com/v2/video/list/',

  // ── Konfiguracja z env ──
  CLIENT_KEY: import.meta.env?.VITE_TIKTOK_CLIENT_KEY || '',
  REDIRECT_URI: import.meta.env?.VITE_TIKTOK_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/tiktok/callback`,

  // ── Wymagane scope'y ──
  SCOPES: ['user.info.basic', 'user.info.profile', 'video.list'],

  // ── Pomocnicze funkcje ──
  getAuthUrl: () => {
    const clientKey = TIKTOK_CONFIG.CLIENT_KEY;
    if (!clientKey) {
      console.warn(
        '⚠️ TikTok Client Key nie skonfigurowany.\n' +
        'Dodaj VITE_TIKTOK_CLIENT_KEY do zmiennych srodowiskowych.\n' +
        'Szczegoly: https://developers.tiktok.com/doc/login-kit-web/'
      );
      return null;
    }
    const params = new URLSearchParams({
      client_key: clientKey,
      response_type: 'code',
      scope: TIKTOK_CONFIG.SCOPES.join(','),
      redirect_uri: TIKTOK_CONFIG.REDIRECT_URI,
      state: crypto.randomUUID(), // CSRF protection
    });
    return `${TIKTOK_CONFIG.AUTH_URL}?${params.toString()}`;
  },

  // ── Sprawdz czy TikTok jest skonfigurowany ──
  isConfigured: () => !!import.meta.env?.VITE_TIKTOK_CLIENT_KEY,
};


// ─────────────────────────────────────────────────────────────────────────────
//  4. GOOGLE OAuth — Konfiguracja logowania
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz projekt w Google Cloud Console
//    - Przejdz do: https://console.cloud.google.com/
//    - Utworz nowy projekt lub wybierz istniejacy
//
//  Krok 2: Wlacz Google+ API i People API
//    - APIs & Services > Library > wyszukaj "Google+ API" i "People API"
//
//  Krok 3: Skonfiguruj ekran zgody OAuth
//    - APIs & Services > OAuth consent screen
//    - Ustaw typ: External
//    - Dodaj wymagane scope'y: email, profile, openid
//
//  Krok 4: Utworz dane uwierzytelniajace
//    - APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
//    - Typ: Web Application
//    - Dodaj Authorized redirect URIs
//
//  Dokumentacja: https://developers.google.com/identity/protocols/oauth2/web-server
//

export const GOOGLE_CONFIG = {
  AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
  CLIENT_ID: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
  REDIRECT_URI: import.meta.env?.VITE_GOOGLE_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/google/callback`,
  SCOPES: ['openid', 'email', 'profile'],

  getAuthUrl: () => {
    const clientId = GOOGLE_CONFIG.CLIENT_ID;
    if (!clientId) {
      console.warn(
        '⚠️ Google Client ID nie skonfigurowany.\n' +
        'Dodaj VITE_GOOGLE_CLIENT_ID do zmiennych srodowiskowych.\n' +
        'Szczegoly: https://developers.google.com/identity/protocols/oauth2/web-server'
      );
      return null;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_CONFIG.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: crypto.randomUUID(),
    });
    return `${GOOGLE_CONFIG.AUTH_URL}?${params.toString()}`;
  },

  isConfigured: () => !!import.meta.env?.VITE_GOOGLE_CLIENT_ID,
};


// ─────────────────────────────────────────────────────────────────────────────
//  5. FACEBOOK Login — Konfiguracja logowania
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz aplikacje na Meta for Developers
//    - Przejdz do: https://developers.facebook.com/
//    - Utworz nowa aplikacje (typ: Consumer lub Business)
//
//  Krok 2: Dodaj produkt "Facebook Login"
//    - W panelu aplikacji kliknij "Add Product"
//    - Wybierz "Facebook Login" > Web
//    - Ustaw Valid OAuth Redirect URIs
//
//  Krok 3: Uzyskaj App ID
//    - Znajdziesz go w Settings > Basic
//
//  Dokumentacja: https://developers.facebook.com/docs/facebook-login/web/
//

export const FACEBOOK_CONFIG = {
  AUTH_URL: 'https://www.facebook.com/v18.0/dialog/oauth',
  TOKEN_URL: 'https://graph.facebook.com/v18.0/oauth/access_token',
  USER_INFO_URL: 'https://graph.facebook.com/me',
  APP_ID: import.meta.env?.VITE_FACEBOOK_APP_ID || '',
  REDIRECT_URI: import.meta.env?.VITE_FACEBOOK_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/facebook/callback`,
  SCOPES: ['email', 'public_profile'],

  getAuthUrl: () => {
    const appId = FACEBOOK_CONFIG.APP_ID;
    if (!appId) {
      console.warn(
        '⚠️ Facebook App ID nie skonfigurowany.\n' +
        'Dodaj VITE_FACEBOOK_APP_ID do zmiennych srodowiskowych.\n' +
        'Szczegoly: https://developers.facebook.com/docs/facebook-login/web/'
      );
      return null;
    }
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: FACEBOOK_CONFIG.REDIRECT_URI,
      scope: FACEBOOK_CONFIG.SCOPES.join(','),
      response_type: 'code',
      state: crypto.randomUUID(),
    });
    return `${FACEBOOK_CONFIG.AUTH_URL}?${params.toString()}`;
  },

  isConfigured: () => !!import.meta.env?.VITE_FACEBOOK_APP_ID,
};


// ─────────────────────────────────────────────────────────────────────────────
//  6. OpenAI Whisper — Transkrypcja mowy
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz konto na OpenAI
//    - Przejdz do: https://platform.openai.com
//    - Zarejestruj sie lub zaloguj
//
//  Krok 2: Wygeneruj klucz API
//    - API Keys > Create new secret key
//    - Skopiuj klucz i dodaj do VITE_OPENAI_API_KEY
//
//  Krok 3 (PRODUKCJA): Utworz backend proxy
//    - NIGDY nie umieszczaj klucza API po stronie klienta w produkcji!
//    - Utworz endpoint np. POST /api/transcribe
//    - Backend wysyla request do OpenAI i zwraca transkrypcje
//
//  Model: whisper-1
//  Obslugiwane formaty: mp3, mp4, mpeg, mpga, m4a, wav, webm
//  Limit rozmiaru pliku: 25 MB
//  Limit nagrywania w aplikacji: 15 sekund (MAX_RECORDING_DURATION)
//
//  Dokumentacja: https://platform.openai.com/docs/guides/speech-to-text
//

export const WHISPER_CONFIG = {
  API_KEY: import.meta.env?.VITE_OPENAI_API_KEY || '',
  API_URL: 'https://api.openai.com/v1/audio/transcriptions',
  MODEL: 'whisper-1',
  LANGUAGE: 'pl',
  MAX_FILE_SIZE_MB: 25,
  isConfigured: () => !!import.meta.env?.VITE_OPENAI_API_KEY,
};


// ─────────────────────────────────────────────────────────────────────────────
//  7. Google Analytics 4 — Sledzenie analityki
// ─────────────────────────────────────────────────────────────────────────────
//
//  Krok 1: Utworz konto Google Analytics
//    - Przejdz do: https://analytics.google.com/
//    - Utworz nowa wlasciwosc (Property) GA4
//
//  Krok 2: Uzyskaj Measurement ID
//    - Admin > Data Streams > Web > Measurement ID (format: G-XXXXXXXXXX)
//
//  Krok 3: Dodaj do zmiennych srodowiskowych
//    - VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
//    - VITE_GA_DEBUG=true (opcjonalnie, wlacza tryb debugowania)
//
//  Dokumentacja: https://developers.google.com/analytics/devguides/collection/ga4
//

export const GA_CONFIG = {
  MEASUREMENT_ID: import.meta.env?.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  DEBUG_MODE: import.meta.env?.VITE_GA_DEBUG === 'true',
  isConfigured: () => {
    const id = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    return !!id && id !== 'G-XXXXXXXXXX';
  },
};


// ─────────────────────────────────────────────────────────────────────────────
//  8. GEOLOKACJA — Reverse Geocoding (OpenStreetMap Nominatim)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Aplikacja uzywa darmowego API Nominatim do reverse geocodingu.
//  Nie wymaga klucza API, ale ma limity:
//    - Max 1 request/sekunde
//    - Wymagany User-Agent header
//
//  Jezeli potrzebujesz wiekszej przepustowosci, rozwazyj:
//    - Google Maps Geocoding API
//    - Mapbox Geocoding API
//    - Hostowanie wlasnej instancji Nominatim
//
//  Dokumentacja: https://nominatim.org/release-docs/latest/api/Reverse/
//


// ─────────────────────────────────────────────────────────────────────────────
//  9. TIKTOK API — Pobieranie filmow uzytkownika
// ─────────────────────────────────────────────────────────────────────────────
//
//  Po uzyskaniu access_token z OAuth flow, mozesz pobierac filmy:
//
//  ```typescript
//  // Przyklad: Pobierz liste filmow uzytkownika
//  const fetchUserVideos = async (accessToken: string) => {
//    const response = await fetch('https://open.tiktokapis.com/v2/video/list/', {
//      method: 'POST',
//      headers: {
//        'Authorization': `Bearer ${accessToken}`,
//        'Content-Type': 'application/json',
//      },
//      body: JSON.stringify({
//        max_count: 20,
//        // cursor: 0, // do paginacji
//      }),
//    });
//    const data = await response.json();
//    return data.data.videos; // Array of video objects
//  };
//
//  // Kazdy film zawiera:
//  // - id: string
//  // - title: string
//  // - cover_image_url: string  — miniatura do wyswietlenia
//  // - share_url: string        — link do TikToka
//  // - duration: number          — dlugosc w sekundach
//  // - create_time: number       — timestamp utworzenia
//  ```
//
//  Dokumentacja: https://developers.tiktok.com/doc/research-api-specs-query-videos/
//


// ─────────────────────────────────────────────────────────────────────────────
//  10. INSTAGRAM API — Pobieranie postow uzytkownika
// ─────────────────────────────────────────────────────────────────────────────
//
//  Po uzyskaniu access_token z OAuth flow, mozesz pobierac posty:
//
//  ```typescript
//  // Przyklad: Pobierz liste postow uzytkownika
//  const fetchUserMedia = async (accessToken: string) => {
//    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
//    const response = await fetch(
//      `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}`
//    );
//    const data = await response.json();
//    return data.data; // Array of media objects
//  };
//
//  // Kazdy post zawiera:
//  // - id: string
//  // - caption: string              — opis posta
//  // - media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
//  // - media_url: string            — URL obrazu/wideo
//  // - thumbnail_url: string        — miniatura (tylko dla VIDEO)
//  // - permalink: string            — link do posta na Instagramie
//  // - timestamp: string            — data utworzenia (ISO 8601)
//
//  // Przyklad: Pobierz profil uzytkownika
//  const fetchUserProfile = async (accessToken: string) => {
//    const fields = 'id,username,account_type,media_count';
//    const response = await fetch(
//      `https://graph.instagram.com/me?fields=${fields}&access_token=${accessToken}`
//    );
//    return await response.json();
//  };
//
//  // Przyklad: Odswiez long-lived token (przed wygasnieciem)
//  const refreshToken = async (longLivedToken: string) => {
//    const response = await fetch(
//      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
//    );
//    return await response.json(); // { access_token, token_type, expires_in }
//  };
//  ```
//
//  Dokumentacja: https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-profiles-and-media
//


// ─────────────────────────────────────────────────────────────────────────────
//  11. STRUKTURA DANYCH — Integracja TikTok i Instagram z rekomendacjami
// ─────────────────────────────────────────────────────────────────────────────
//
//  Interfejs Recommendation w Home.tsx obsluguje dwa zrodla postow:
//
//  ```typescript
//  interface Recommendation {
//    id: string;
//    avatar: string;
//    name: string;
//    city: string;
//    opinion: string;
//    categories: string[];
//    date: string;
//    status?: string;
//    instagramPosts?: {          // Posty z Instagrama
//      id: string;
//      imageUrl: string;
//      postUrl: string;
//      type: 'image' | 'video';
//    }[];
//    tiktokPosts?: {             // Posty z TikToka (NOWE)
//      id: string;
//      imageUrl: string;         // cover_image_url z TikTok API
//      postUrl: string;          // share_url z TikTok API
//      type: 'image' | 'video';
//    }[];
//  }
//  ```
//
//  AIAnswerCard wyswietla oba zrodla w sekcji "Portfolio":
//    - Miniaturki Instagram z ikonka IG w lewym dolnym rogu
//    - Miniaturki TikTok z ikonka TT w lewym dolnym rogu + ikona play
//


// ─────────────────────────────────────────────────────────────────────────────
//  12. BACKEND API — Specyfikacja endpointow (dla dev'a backendowego)
// ─────────────────────────────────────────────────────────────────────────────
//
//  Frontend automatycznie przelacza sie z mock na production gdy ustawisz:
//    VITE_API_BASE_URL=https://api.locly.pl/v1
//
//  Pliki zrodlowe:
//    /src/services/api.ts   — warstwa API (fetch + mock fallback)
//    /src/services/auth.ts  — zarzadzanie sesja OAuth
//
//  ── AUTENTYKACJA ──
//
//  POST /auth/callback
//    Body:    { provider: 'google'|'facebook'|'tiktok'|'instagram', code: string, redirect_uri: string }
//    Response: {
//      user: {
//        id: string,
//        name: string,
//        email: string,
//        avatar: string,     // URL do zdjecia profilowego
//        city?: string,
//        has_recommended: boolean,  // czy user juz polecil
//        has_opinion: boolean,      // czy user juz dodal opinie
//        opinion_id?: string        // ID opinii (jesli istnieje)
//      },
//      access_token: string,   // JWT (czas zycia: 1h)
//      refresh_token?: string, // do odnawiania sesji
//      expires_in: number      // w sekundach
//    }
//    Logika backendu:
//    1. Wyslij code do providera (Google/Facebook/TikTok) w zamian za access_token
//    2. Pobierz dane uzytkownika z providera
//    3. Znajdz lub utworz uzytkownika w bazie
//    4. Sprawdz czy user ma opinie/polecenie w bazie
//    5. Wygeneruj JWT i zwroc do frontendu
//
//  POST /auth/refresh
//    Body:    { refresh_token: string }
//    Response: { access_token: string, expires_in: number, refresh_token?: string }
//
//  POST /auth/logout
//    Headers: Authorization: Bearer <jwt>
//    Response: { success: true }
//
//  GET /auth/me
//    Headers: Authorization: Bearer <jwt>
//    Response: { user: ... } (ten sam format co w /auth/callback)
//
//  ── OPINIE (CRUD) ──
//
//  POST /opinions
//    Headers: Authorization: Bearer <jwt>
//    Body:    { text: string, categories: string[], city: string, avatar: string, inputMethod: 'text'|'voice'|null }
//    Response: { id: string, status: 'czeka na potwierdzenie' }
//    Walidacja:
//    - text: min 10 znakow, max 1000 znakow
//    - categories: min 1, max 5
//    - user moze miec max 1 opinie (sprawdz w bazie)
//
//  GET /opinions
//    Headers: Authorization: Bearer <jwt> (opcjonalnie)
//    Query:   ?page=1&limit=20&sort=newest
//    Response: {
//      opinions: [{
//        id, avatar, name, city, opinion, categories, date, status?,
//        instagramPosts?: [{ id, imageUrl, postUrl, type }],
//        tiktokPosts?: [{ id, imageUrl, postUrl, type }],
//        isOwner?: boolean  // true jesli opinia nalezy do zalogowanego usera
//      }],
//      recommendationCount: number,
//      userHasRecommended: boolean,   // false jesli user niezalogowany
//      userOpinion: { id, status } | null
//    }
//
//  PUT /opinions/:id
//    Headers: Authorization: Bearer <jwt>
//    Body:    { text?: string, categories?: string[], city?: string }
//    Response: { id: string, status: 'czeka na potwierdzenie' }
//    Walidacja: user musi byc wlascicielem opinii
//
//  DELETE /opinions/:id
//    Headers: Authorization: Bearer <jwt>
//    Response: { success: boolean }
//    Walidacja: user musi byc wlascicielem opinii
//
//  ── POLECENIA (LIKES) ──
//
//  POST /recommendations
//    Headers: Authorization: Bearer <jwt>
//    Response: { success: true, recommendationId: string }
//    Logika: idempotent — jesli user juz polecil, zwroc istniejacy ID
//
//  DELETE /recommendations
//    Headers: Authorization: Bearer <jwt>
//    Response: { success: true }
//    Logika: usun polecenie usera (cofniecie kciuka)
//
//  GET /recommendations/count
//    Response: { count: number }
//    Publiczny endpoint — bez auth
//
//  GET /recommendations/check
//    Headers: Authorization: Bearer <jwt>
//    Response: { hasRecommended: boolean }
//
//  ── AI / SPEECH ──
//
//  POST /speech/transcribe
//    Headers: Authorization: Bearer <jwt> (opcjonalnie)
//    Body:    FormData { audio: Blob, context: 'search'|'opinion', language: 'pl' }
//    Response: { text: string, confidence: number, language: string }
//    Backend: proxy do OpenAI Whisper API (model: whisper-1)
//
//  POST /ai/suggestions
//    Body:    { text: string, count: 3 }
//    Response: { suggestions: string[] }
//    Backend: proxy do OpenAI GPT-4o-mini lub Claude
//
//  POST /ai/improve-text
//    Body:    { text: string }
//    Response: { improvedText: string }
//
//  ── WIDGET ──
//
//  GET /widget/init
//    Headers: Authorization: Bearer <jwt> (opcjonalnie)
//    Response: WidgetInitData (patrz wyzej /opinions format)
//
//  GET /health
//    Response: { status: 'ok', version: string }
//
//  ── SCHEMAT BAZY DANYCH (sugerowany) ──
//
//  ```sql
//  -- Uzytkownicy (tworzone automatycznie po pierwszym logowaniu)
//  CREATE TABLE users (
//    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    provider TEXT NOT NULL,           -- 'google', 'facebook', 'tiktok', 'instagram'
//    provider_id TEXT NOT NULL,        -- ID u providera
//    name TEXT NOT NULL,
//    email TEXT,
//    avatar TEXT,                      -- URL do zdjecia profilowego
//    city TEXT,
//    created_at TIMESTAMPTZ DEFAULT now(),
//    UNIQUE(provider, provider_id)
//  );
//
//  -- Opinie (max 1 na usera)
//  CREATE TABLE opinions (
//    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//    text TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 1000),
//    categories TEXT[] NOT NULL CHECK (array_length(categories, 1) >= 1),
//    city TEXT NOT NULL,
//    input_method TEXT,                -- 'text', 'voice'
//    status TEXT DEFAULT 'czeka na potwierdzenie',  -- 'potwierdzona', 'odrzucona'
//    created_at TIMESTAMPTZ DEFAULT now(),
//    updated_at TIMESTAMPTZ DEFAULT now(),
//    UNIQUE(user_id)                   -- 1 opinia na usera
//  );
//
//  -- Polecenia (likes)
//  CREATE TABLE recommendations (
//    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//    created_at TIMESTAMPTZ DEFAULT now(),
//    UNIQUE(user_id)                   -- 1 polecenie na usera
//  );
//
//  -- Posty z social media (linkowane do opinii)
//  CREATE TABLE social_posts (
//    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    opinion_id UUID REFERENCES opinions(id) ON DELETE CASCADE,
//    platform TEXT NOT NULL,           -- 'instagram', 'tiktok'
//    external_id TEXT NOT NULL,        -- ID posta u providera
//    image_url TEXT NOT NULL,
//    post_url TEXT NOT NULL,
//    type TEXT NOT NULL DEFAULT 'image', -- 'image', 'video'
//    created_at TIMESTAMPTZ DEFAULT now()
//  );
//
//  -- Sesje JWT (opcjonalne — mozesz uzyc stateless JWT)
//  CREATE TABLE sessions (
//    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//    refresh_token TEXT UNIQUE NOT NULL,
//    expires_at TIMESTAMPTZ NOT NULL,
//    created_at TIMESTAMPTZ DEFAULT now()
//  );
//  ```
//
//  ── CORS ──
//
//  Backend musi zwracac naglowki CORS:
//  ```
//  Access-Control-Allow-Origin: https://your-frontend-domain.com
//  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
//  Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
//  Access-Control-Allow-Credentials: true
//  ```
//
//  ── RATE LIMITING (sugerowane) ──
//
//  POST /auth/callback    — 10 req/min/IP
//  POST /opinions         — 3 req/min/user
//  POST /recommendations  — 10 req/min/user
//  POST /speech/transcribe — 5 req/min/user
//  POST /ai/*             — 10 req/min/user
//  GET  /opinions         — 30 req/min/IP
//


// ─────────────────────────────────────────────────────────────────────────────
//  13. ARCHITEKTURA FRONTENDOWA — Pliki zrodlowe
// ─────────────────────────────────────────────────────────────────────────────
//
//  /src/services/auth.ts
//    - getSession() / saveSession() / clearSession() — localStorage
//    - demoAuth(provider) — mock sesja bez OAuth (przycisk "demo")
//    - handleOAuthCallback(provider, code, state) — po redirectcie z providera
//    - refreshAccessToken() — odnowienie JWT
//    - logout() — wylogowanie (czyci localStorage + informuje backend)
//    - updateUserState({ hasRecommended, hasOpinion }) — po poleceniu/opinii
//    - setPendingAction() / consumePendingAction() — co user chcial przed logowaniem
//
//  /src/services/api.ts
//    - submitOpinion(data) → POST /opinions
//    - fetchOpinions() → GET /opinions
//    - updateOpinion(id, data) → PUT /opinions/:id
//    - deleteOpinion(id) → DELETE /opinions/:id
//    - submitRecommendation() → POST /recommendations
//    - removeRecommendation() → DELETE /recommendations
//    - getRecommendationCount() → GET /recommendations/count
//    - checkRecommendation() → GET /recommendations/check
//    - transcribeAudio(blob, context) → POST /speech/transcribe
//    - generateAISuggestions(text) → POST /ai/suggestions
//    - improveTextWithAI(text) → POST /ai/improve-text
//    - initializeWidget() → GET /widget/init
//    - healthCheck() → GET /health
//
//  /src/app/pages/AuthCallback.tsx
//    - Obsluguje /auth/:provider/callback?code=...&state=...
//    - Wywoluje auth.handleOAuthCallback()
//    - Po sukcesie redirectuje na / z ?action=... (pending action)
//
//  /src/app/routes.ts
//    - Zawiera route /auth/:provider/callback -> AuthCallback
//
//  Kazda funkcja w api.ts automatycznie:
//    1. Sprawdza czy VITE_API_BASE_URL jest ustawiony
//    2. Jesli tak -> fetch do backendu z JWT w Authorization header
//    3. Jesli nie -> zwraca mock dane (fallback)
//    4. Przy bledzie sieciowym -> fallback na mock z logowaniem do konsoli
//


// ─────────────────────────────────────────────────────────────────────────────
//  14. CHECKLIST — Co musisz zrobic przed wdrozeniem
// ─────────────────────────────────────────────────────────────────────────────
//
//  ── BACKEND ──
//  [ ] Utworzyc baze danych PostgreSQL (schemat powyzej)
//  [ ] Zaimplementowac endpointy API (specyfikacja powyzej)
//  [ ] Skonfigurowac CORS
//  [ ] Dodac rate limiting
//  [ ] Ustawic VITE_API_BASE_URL w .env
//
//  ── OAUTH PROVIDERS ──
//  [ ] Zarejestrowac aplikacje na Google Cloud Console
//  [ ] Zarejestrowac aplikacje na Meta for Developers (Facebook + Instagram)
//  [ ] Zarejestrowac aplikacje na TikTok for Developers
//  [ ] Dodac callback URIs: https://your-domain.com/auth/*/callback
//  [ ] Przetestowac OAuth flow dla kazdego providera
//
//  ── KLUCZE I SEKRETY ──
//  [ ] Utworzyc plik .env z wymaganymi zmiennymi (patrz sekcja 1)
//  [ ] Utworzyc backend proxy dla kluczy API (NIGDY na frontendzie!)
//  [ ] Dodac .env do .gitignore
//
//  ── AI / SPEECH ──
//  [ ] Utworzyc konto i klucz API na OpenAI
//  [ ] Utworzyc backend proxy POST /speech/transcribe -> Whisper API
//  [ ] Utworzyc backend proxy POST /ai/* -> GPT-4o-mini
//
//  ── MONITORING ──
//  [ ] Skonfigurowac Google Analytics 4
//  [ ] Dodac logowanie bledow (Sentry / podobne)
//
//  ── BEZPIECZENSTWO ──
//  [ ] Wdrozyc Row Level Security (RLS) w bazie danych
//  [ ] Walidowac JWT na kazdym chronionym endpoincie
//  [ ] Sanityzowac input (XSS, SQL injection)
//  [ ] Ustawic HTTPS
//  [ ] Skonfigurowac CSP headers
//


// ─────────────────────────────────────────────────────────────────────────────
//  15. MOCK DANE — Tryb rozwojowy
// ─────────────────────────────────────────────────────────────────────────────
//
//  Aplikacja dziala w trybie mock gdy brak VITE_API_BASE_URL:
//    - Auth: demoAuth() tworzy fikcyjna sesje w localStorage
//    - Opinie: submitOpinion() zwraca mock ID po 1.5s
//    - Polecenia: submitRecommendation() zwraca sukces po 0.8s
//    - Whisper: zwraca losowy tekst z mockTexts[]
//    - Analytics: loguje zdarzenia do konsoli (gdy GA_DEBUG=true)
//    - Sesja: przechowywana w localStorage (przezywa reload)
//
//  Wszystkie mock dane sa zachowane i nie sa usuwane po podlaczeniu
//  prawdziwych API — sluza jako fallback przy bledach sieciowych.
//


// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: Sprawdz status konfiguracji
// ─────────────────────────────────────────────────────────────────────────────

export const checkConfigStatus = () => {
  const status = {
    instagram: INSTAGRAM_CONFIG.isConfigured(),
    tiktok: TIKTOK_CONFIG.isConfigured(),
    google: GOOGLE_CONFIG.isConfigured(),
    facebook: FACEBOOK_CONFIG.isConfigured(),
    whisper: WHISPER_CONFIG.isConfigured(),
    analytics: GA_CONFIG.isConfigured(),
  };

  const allConfigured = Object.values(status).every(Boolean);

  if (import.meta.env?.VITE_GA_DEBUG === 'true' || import.meta.env?.DEV) {
    console.group('Konfiguracja integracji');
    console.log(`Instagram: ${status.instagram ? 'OK' : 'BRAK — dodaj VITE_INSTAGRAM_APP_ID'}`);
    console.log(`TikTok:    ${status.tiktok ? 'OK' : 'BRAK — dodaj VITE_TIKTOK_CLIENT_KEY'}`);
    console.log(`Google:    ${status.google ? 'OK' : 'BRAK — dodaj VITE_GOOGLE_CLIENT_ID'}`);
    console.log(`Facebook:  ${status.facebook ? 'OK' : 'BRAK — dodaj VITE_FACEBOOK_APP_ID'}`);
    console.log(`Whisper:   ${status.whisper ? 'OK' : 'BRAK — dodaj VITE_OPENAI_API_KEY'}`);
    console.log(`Analytics: ${status.analytics ? 'OK' : 'BRAK — dodaj VITE_GA_MEASUREMENT_ID'}`);
    console.groupEnd();
  }

  return { status, allConfigured };
};