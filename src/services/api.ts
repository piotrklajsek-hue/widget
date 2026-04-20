// ============================================================================
//  Locly API Service Layer
//  Centralna warstwa uslug z pelna obsluga autentykacji i CRUD opinii
// ============================================================================
//
//  INSTRUKCJA DLA DEVELOPERA:
//
//  Ten plik zawiera wszystkie funkcje serwisowe uzywane przez widget.
//  Kazda funkcja ma wbudowany fallback na dane mockowe, gdy backend nie jest
//  skonfigurowany. Aby podlaczyc prawdziwy backend:
//
//  1. Ustaw zmienna srodowiskowa VITE_API_BASE_URL w pliku .env:
//     VITE_API_BASE_URL=https://api.locly.pl/v1
//
//  2. Opcjonalnie ustaw VITE_API_KEY dla autoryzacji serwisowej:
//     VITE_API_KEY=your-api-key
//
//  3. Kazda funkcja ponizej ma sekcje "PRODUCTION" i "MOCK".
//     Po ustawieniu VITE_API_BASE_URL, funkcje automatycznie
//     przelacza sie na prawdziwe endpointy.
//
//  4. Format odpowiedzi z backendu powinien odpowiadac typom
//     zdefiniowanym w interfejsach ponizej.
//
//  ENDPOINTS BACKENDU (oczekiwane):
//
//  ── OPINIE ──
//  POST   /opinions              - Dodanie opinii (wymaga auth)
//  GET    /opinions              - Pobranie listy opinii
//  GET    /opinions/:id          - Pobranie jednej opinii
//  PUT    /opinions/:id          - Edycja opinii (wymaga auth, owner only)
//  DELETE /opinions/:id          - Usuniecie opinii (wymaga auth, owner only)
//
//  ── POLECENIA (LIKES) ──
//  POST   /recommendations       - Dodaj polecenie (wymaga auth)
//  DELETE /recommendations       - Cofnij polecenie (wymaga auth)
//  GET    /recommendations/count - Liczba polecen
//  GET    /recommendations/check - Sprawdz czy user polecil (wymaga auth)
//
//  ── AUTH ──
//  POST   /auth/callback         - OAuth callback (wymiana code -> token)
//  POST   /auth/refresh          - Refresh tokenu
//  POST   /auth/logout           - Wylogowanie
//  GET    /auth/me               - Dane zalogowanego usera
//
//  ── AI / SPEECH ──
//  POST   /speech/transcribe     - Transkrypcja audio na tekst
//  POST   /ai/suggestions        - Generowanie sugestii AI dla opinii
//  POST   /ai/improve-text       - Ulepszenie tekstu opinii przez AI
//
//  ── WIDGET ──
//  GET    /widget/init           - Inicjalizacja widgetu (dane wstepne)
//  GET    /health                - Health check
//
// ============================================================================

import { getAccessToken, updateUserState } from './auth';

const API_BASE = import.meta.env?.VITE_API_BASE_URL || '';
const API_KEY = import.meta.env?.VITE_API_KEY || '';

const isProductionMode = (): boolean => !!API_BASE;

/**
 * Zbuduj naglowki z autoryzacja.
 * W trybie production uzywa JWT z auth session.
 * Fallback na API_KEY dla endpointow serwisowych.
 */
const apiHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Preferuj token uzytkownika (JWT z OAuth)
  const userToken = getAccessToken();
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  } else if (API_KEY) {
    // Fallback na klucz serwisowy (dla endpointow nie wymagajacych auth)
    headers['X-API-Key'] = API_KEY;
  }

  return headers;
};

/**
 * Helper: wykonaj request do API z automatycznym fallbackiem na mock
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit,
  mockFn: () => Promise<T>
): Promise<T> {
  if (!isProductionMode()) {
    return mockFn();
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...apiHeaders(), ...(options.headers || {}) },
    });

    if (!response.ok) {
      throw new Error(`API ${endpoint}: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[Locly API] Blad ${endpoint}, fallback na mock:`, error);
    return mockFn();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TYPY
// ─────────────────────────────────────────────────────────────────────────────

export interface OpinionSubmission {
  text: string;
  categories: string[];
  city: string;
  avatar: string;
  inputMethod: 'text' | 'voice' | null;
}

export interface OpinionResult {
  id: string;
  status: string;
}

export interface OpinionUpdate {
  text?: string;
  categories?: string[];
  city?: string;
}

export interface OpinionDeleteResult {
  success: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface AISuggestionsResult {
  suggestions: string[];
}

export interface ImproveTextResult {
  improvedText: string;
}

export interface RecommendResult {
  success: boolean;
  recommendationId: string;
}

export interface UnrecommendResult {
  success: boolean;
}

export interface RecommendationCount {
  count: number;
}

export interface RecommendationCheck {
  hasRecommended: boolean;
}

export interface WidgetInitData {
  opinions: Array<{
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
  }>;
  recommendationCount: number;
  userHasRecommended: boolean;
  userOpinion: OpinionResult | null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  OPINIE — CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dodaj opinie uzytkownika.
 *
 * BACKEND ENDPOINT: POST /opinions
 * Headers: Authorization: Bearer <jwt>
 * Body: OpinionSubmission
 * Response: OpinionResult
 *
 * Backend powinien:
 * 1. Zweryfikowac JWT
 * 2. Sprawdzic czy user nie ma juz opinii (1 opinia na usera)
 * 3. Zapisac opinie w bazie
 * 4. Zwrocic { id, status: 'czeka na potwierdzenie' }
 */
export async function submitOpinion(data: OpinionSubmission): Promise<OpinionResult> {
  const result = await apiRequest<OpinionResult>(
    '/opinions',
    { method: 'POST', body: JSON.stringify(data) },
    async () => {
      // Mock: symulacja zapisu
      await delay(1500 + Math.random() * 1000);
      return {
        id: 'user-' + Date.now(),
        status: 'czeka na potwierdzenie',
      };
    }
  );

  // Aktualizuj stan usera w sesji
  updateUserState({ hasOpinion: true, opinionId: result.id });

  return result;
}

/**
 * Pobierz liste opinii (publiczny endpoint).
 *
 * BACKEND ENDPOINT: GET /opinions
 * Query params: ?page=1&limit=20&sort=newest
 * Response: { opinions: [...], total: number, page: number }
 *
 * Jesli user jest zalogowany (Authorization header), backend
 * powinien dodac pole `isOwner: true` do opinii nalezacej do usera.
 */
export async function fetchOpinions(): Promise<WidgetInitData> {
  return apiRequest<WidgetInitData>(
    '/opinions',
    { method: 'GET' },
    async () => {
      // Mock: symulacja pobrania danych
      await delay(1200 + Math.random() * 800);
      return {
        opinions: [],
        recommendationCount: 3,
        userHasRecommended: false,
        userOpinion: null,
      };
    }
  );
}

/**
 * Edytuj istniejaca opinie.
 *
 * BACKEND ENDPOINT: PUT /opinions/:id
 * Headers: Authorization: Bearer <jwt>
 * Body: OpinionUpdate
 * Response: OpinionResult
 *
 * Backend powinien:
 * 1. Zweryfikowac JWT
 * 2. Sprawdzic czy user jest wlascicielem opinii
 * 3. Zaktualizowac opinie w bazie
 * 4. Opcjonalnie: zmienic status na 'czeka na potwierdzenie' po edycji
 */
export async function updateOpinion(id: string, data: OpinionUpdate): Promise<OpinionResult> {
  return apiRequest<OpinionResult>(
    `/opinions/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    async () => {
      await delay(800 + Math.random() * 500);
      return { id, status: 'czeka na potwierdzenie' };
    }
  );
}

/**
 * Usun opinie.
 *
 * BACKEND ENDPOINT: DELETE /opinions/:id
 * Headers: Authorization: Bearer <jwt>
 * Response: { success: boolean }
 *
 * Backend powinien:
 * 1. Zweryfikowac JWT
 * 2. Sprawdzic czy user jest wlascicielem opinii
 * 3. Usunac opinie z bazy (lub soft-delete)
 */
export async function deleteOpinion(id: string): Promise<OpinionDeleteResult> {
  const result = await apiRequest<OpinionDeleteResult>(
    `/opinions/${id}`,
    { method: 'DELETE' },
    async () => {
      await delay(600 + Math.random() * 400);
      return { success: true };
    }
  );

  if (result.success) {
    updateUserState({ hasOpinion: false, opinionId: undefined });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  POLECENIA (LIKES / RECOMMENDATIONS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Poleć (klikniecie kciuka w gore) — dodaj recommendation.
 *
 * BACKEND ENDPOINT: POST /recommendations
 * Headers: Authorization: Bearer <jwt>
 * Response: RecommendResult
 *
 * Backend powinien:
 * 1. Zweryfikowac JWT
 * 2. Sprawdzic czy user nie polecil juz (idempotent)
 * 3. Dodac polecenie do bazy
 * 4. Zwiekszyc licznik polecen
 */
export async function submitRecommendation(): Promise<RecommendResult> {
  const result = await apiRequest<RecommendResult>(
    '/recommendations',
    { method: 'POST', body: JSON.stringify({}) },
    async () => {
      await delay(800 + Math.random() * 700);
      return {
        success: true,
        recommendationId: 'rec-' + Date.now(),
      };
    }
  );

  if (result.success) {
    updateUserState({ hasRecommended: true });
  }

  return result;
}

/**
 * Cofnij polecenie (unlike).
 *
 * BACKEND ENDPOINT: DELETE /recommendations
 * Headers: Authorization: Bearer <jwt>
 * Response: UnrecommendResult
 *
 * Backend powinien:
 * 1. Zweryfikowac JWT
 * 2. Usunac polecenie z bazy
 * 3. Zmniejszyc licznik polecen
 */
export async function removeRecommendation(): Promise<UnrecommendResult> {
  const result = await apiRequest<UnrecommendResult>(
    '/recommendations',
    { method: 'DELETE' },
    async () => {
      await delay(600 + Math.random() * 400);
      return { success: true };
    }
  );

  if (result.success) {
    updateUserState({ hasRecommended: false });
  }

  return result;
}

/**
 * Pobierz liczbe polecen (publiczny endpoint).
 *
 * BACKEND ENDPOINT: GET /recommendations/count
 * Response: { count: number }
 */
export async function getRecommendationCount(): Promise<RecommendationCount> {
  return apiRequest<RecommendationCount>(
    '/recommendations/count',
    { method: 'GET' },
    async () => {
      return { count: 3 }; // Mock
    }
  );
}

/**
 * Sprawdz czy zalogowany user polecil (wymaga auth).
 *
 * BACKEND ENDPOINT: GET /recommendations/check
 * Headers: Authorization: Bearer <jwt>
 * Response: { hasRecommended: boolean }
 */
export async function checkRecommendation(): Promise<RecommendationCheck> {
  return apiRequest<RecommendationCheck>(
    '/recommendations/check',
    { method: 'GET' },
    async () => {
      return { hasRecommended: false };
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOWA / TRANSKRYPCJA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transkrybuj nagranie audio na tekst.
 * Obsluguje zarowno nagranie z opinii jak i z search baru.
 *
 * BACKEND ENDPOINT: POST /speech/transcribe
 * Body: FormData z polem "audio" (Blob)
 * Response: TranscriptionResult
 *
 * Wspierane formaty audio: webm, ogg, mp4, wav
 * Sugerowany backend: OpenAI Whisper API lub Google Speech-to-Text
 */
export async function transcribeAudio(
  audioBlob?: Blob | null,
  context: 'search' | 'opinion' = 'search'
): Promise<TranscriptionResult> {
  if (isProductionMode() && audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('context', context);
      formData.append('language', 'pl');

      const headers: Record<string, string> = {};
      const token = getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (API_KEY) headers['X-API-Key'] = API_KEY;

      const response = await fetch(`${API_BASE}/speech/transcribe`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error(`Transcribe: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('[Locly API] Transcription error, fallback:', error);
    }
  }

  // Mock fallback
  await delay(1500);

  if (context === 'opinion') {
    return {
      text: 'swietna obsluga i szybka realizacja',
      confidence: 0.92,
      language: 'pl',
    };
  }

  const mockTexts = [
    'Ile kosztuje strona internetowa?',
    'Szukam najlepszej agencji SEO w Warszawie',
    'Potrzebuje aplikacji mobilnej dla mojej firmy',
    'Ile trwa stworzenie sklepu internetowego?',
  ];

  return {
    text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
    confidence: 0.89,
    language: 'pl',
  };
}

/**
 * Transkrybuj nagranie opinii glosowej.
 */
export async function recordAndTranscribeOpinion(
  audioBlob?: Blob | null
): Promise<TranscriptionResult> {
  return transcribeAudio(audioBlob, 'opinion');
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI SUGESTIE I ULEPSZANIE TEKSTU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wygeneruj sugestie AI na podstawie tekstu opinii.
 *
 * BACKEND ENDPOINT: POST /ai/suggestions
 * Body: { text: string, count?: number }
 * Response: AISuggestionsResult
 *
 * Sugerowany backend: OpenAI GPT-4o-mini lub Claude 3.5 Haiku
 */
export async function generateAISuggestions(text: string): Promise<AISuggestionsResult> {
  return apiRequest<AISuggestionsResult>(
    '/ai/suggestions',
    { method: 'POST', body: JSON.stringify({ text, count: 3 }) },
    async () => {
      await delay(1200 + Math.random() * 600);
      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      return {
        suggestions: [
          `${capitalized}. Bardzo profesjonalna obsluga i terminowa realizacja projektu.`,
          `${capitalized}. Jestem bardzo zadowolony z jakosci wykonanej pracy. Polecam!`,
          `${capitalized}. Swietny kontakt i super jakosc uslug. Zdecydowanie warto!`,
        ],
      };
    }
  );
}

/**
 * Ulepsz tekst opinii za pomoca AI.
 *
 * BACKEND ENDPOINT: POST /ai/improve-text
 * Body: { text: string }
 * Response: ImproveTextResult
 *
 * Sugerowany backend: OpenAI GPT-4o-mini
 */
export async function improveTextWithAI(text: string): Promise<ImproveTextResult> {
  return apiRequest<ImproveTextResult>(
    '/ai/improve-text',
    { method: 'POST', body: JSON.stringify({ text }) },
    async () => {
      await delay(800 + Math.random() * 400);
      const improved = text.charAt(0).toUpperCase() + text.slice(1);
      const withPunctuation = improved.endsWith('.') ? improved : improved + '.';
      return {
        improvedText: `${withPunctuation} Zdecydowanie polecam!`,
      };
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WIDGET INIT (ladowanie danych startowych)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inicjalizacja widgetu — pobierz dane wstepne.
 * Wywolywan przy otwarciu mobile search overlay.
 *
 * BACKEND ENDPOINT: GET /widget/init
 * Headers: Authorization: Bearer <jwt> (opcjonalnie — jesli user zalogowany)
 * Response: WidgetInitData
 *
 * Jesli user jest zalogowany, backend powinien zwrocic:
 * - userHasRecommended: boolean
 * - userOpinion: OpinionResult | null
 */
export async function initializeWidget(): Promise<WidgetInitData> {
  return apiRequest<WidgetInitData>(
    '/widget/init',
    { method: 'GET' },
    async () => {
      await delay(1000 + Math.random() * 1000);
      return {
        opinions: [],
        recommendationCount: 3,
        userHasRecommended: false,
        userOpinion: null,
      };
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sprawdz czy API jest skonfigurowane i dostepne.
 * Przydatne do diagnostyki.
 */
export async function healthCheck(): Promise<{ ok: boolean; mode: string; baseUrl: string }> {
  const mode = isProductionMode() ? 'production' : 'mock';

  if (!isProductionMode()) {
    return { ok: true, mode, baseUrl: '' };
  }

  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: apiHeaders(),
    });
    return { ok: response.ok, mode, baseUrl: API_BASE };
  } catch {
    return { ok: false, mode, baseUrl: API_BASE };
  }
}
