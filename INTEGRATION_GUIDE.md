# Instrukcja podpiecia integracji dla developera

> Ten dokument opisuje krok po kroku jak podpiac wszystkie zewnetrzne serwisy
> w aplikacji. Kazda integracja dziala rowniez w trybie **mock** (bez kluczy API),
> wiec mozesz rozwijac aplikacje offline.

---

## Spis tresci

1. [Szybki start — plik .env](#1-szybki-start--plik-env)
2. [OpenAI Whisper — transkrypcja mowy (mikrofon)](#2-openai-whisper--transkrypcja-mowy-mikrofon)
3. [LLM Web Search — AI odpowiedzi na zapytania](#3-llm-web-search--ai-odpowiedzi-na-zapytania)
4. [Google OAuth — logowanie](#4-google-oauth--logowanie)
5. [Facebook Login — logowanie](#5-facebook-login--logowanie)
6. [TikTok Login — logowanie i posty](#6-tiktok-login--logowanie-i-posty)
7. [Instagram API — posty uzytkownikow](#7-instagram-api--posty-uzytkownikow)
8. [Google Analytics 4 — sledzenie zdarzen](#8-google-analytics-4--sledzenie-zdarzen)
9. [Backend — wymagania produkcyjne](#9-backend--wymagania-produkcyjne)
10. [Tryb mock — jak dzialaja fake'owe dane](#10-tryb-mock--jak-dzialaja-fakeowe-dane)
11. [Testowanie integracji](#11-testowanie-integracji)
12. [Checklist przed wdrozeniem](#12-checklist-przed-wdrozeniem)

---

## 1. Szybki start — plik .env

Utworz plik `.env` w katalogu glownym projektu:

```env
# ╔══════════════════════════════════════════════════════════════╗
# ║  WYMAGANE DO PELNEJ FUNKCJONALNOSCI                        ║
# ╚══════════════════════════════════════════════════════════════╝

# ── OpenAI (Whisper Speech-to-Text) ──
VITE_OPENAI_API_KEY=sk-...

# ── LLM Web Search (backend AI) ──
VITE_LLM_API_ENDPOINT=https://your-backend.com/api/search
VITE_LLM_API_KEY=your-llm-api-key

# ╔══════════════════════════════════════════════════════════════╗
# ║  LOGOWANIE UZYTKOWNIKOW (OAuth)                            ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Google OAuth ──
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# ── Facebook Login ──
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_REDIRECT_URI=https://your-domain.com/auth/facebook/callback

# ── TikTok Login ──
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
VITE_TIKTOK_REDIRECT_URI=https://your-domain.com/auth/tiktok/callback

# ── Instagram API ──
VITE_INSTAGRAM_APP_ID=your_instagram_app_id
VITE_INSTAGRAM_APP_SECRET=your_instagram_app_secret
VITE_INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/instagram/callback

# ╔══════════════════════════════════════════════════════════════╗
# ║  ANALITYKA                                                 ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Google Analytics 4 ──
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GA_DEBUG=false
```

> **UWAGA**: Plik `.env` NIGDY nie moze byc commitowany do repozytorium.
> Dodaj go do `.gitignore`!

---

## 2. OpenAI Whisper — transkrypcja mowy (mikrofon)

### Co robi
Gdy uzytkownik klika ikone mikrofonu w search barze, aplikacja nagrywa glos
przez `MediaRecorder` (do 15 sekund, stala `MAX_RECORDING_DURATION` w
`/src/app/pages/Home.tsx`). Po zatwierdzeniu nagrania blob audio jest
wysylany do OpenAI Whisper API, ktore zwraca tekst — ten tekst trafia do
pola wyszukiwania i automatycznie uruchamia zapytanie.

### Pliki zrodlowe
| Plik | Co zawiera |
|---|---|
| `/src/app/pages/Home.tsx` | `handleSearchVoiceInput()`, `handleSearchVoiceConfirm()` — cala logika nagrywania i transkrypcji |
| `/src/config/DEVELOPER_SETUP.ts` | `WHISPER_CONFIG` — eksportowany obiekt konfiguracji |

### Konfiguracja

1. Utworz konto na https://platform.openai.com
2. Wygeneruj klucz API: **API Keys > Create new secret key**
3. Dodaj do `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-proj-...
   ```

### Jak to dziala w kodzie

```
Klikniecie mikrofonu
  |
  v
navigator.mediaDevices.getUserMedia({ audio: true })
  |
  v
MediaRecorder.start(250ms timeslice)
  + AudioContext > AnalyserNode (wizualizacja waveform)
  + Timer liczy 0 -> 15s
  |
  v  (uzytkownik klika ✓  LUB  timer osiaga 15s)
  |
MediaRecorder.stop() -> Blob (audio/webm)
  |
  v
VITE_OPENAI_API_KEY istnieje?
  |
  +-- TAK --> POST https://api.openai.com/v1/audio/transcriptions
  |           body: FormData { file: blob, model: "whisper-1", language: "pl" }
  |           --> response.text -> setInputValue() -> handleSubmit()
  |
  +-- NIE --> fallback: setInputValue("Ile kosztuje strona internetowa?")
```

### Parametry API

| Parametr | Wartosc | Opis |
|---|---|---|
| `model` | `whisper-1` | Jedyny dostepny model STT |
| `language` | `pl` | Wymusza polski (lepsza dokladnosc) |
| `response_format` | `json` | Zwraca `{ text: "..." }` |
| Format audio | `audio/webm` | Nagrywany przez `MediaRecorder` |
| Max rozmiar | 25 MB | Limit API (15s nagrania << 25MB) |

### Koszty
- ~$0.006 / minuta audio
- 15s nagrania = ~$0.0015 za request

### Roznica mock vs real
| | Real (z kluczem) | Mock (bez klucza) |
|---|---|---|
| Audio | Prawdziwy mikrofon | Brak — fake waveform |
| Wizualizacja | `AnalyserNode` FFT | `Math.random() + Math.sin()` |
| Transkrypcja | Whisper API (1-3s) | Losowy tekst z `mockTexts[]` (1.5s delay) |
| Fallback | Statyczny tekst | — |
| Badge w UI | Brak | Zolty "MOCK" + zolty "T" na ikonie |

> **PRODUKCJA**: Klucz API NIGDY nie powinien byc po stronie klienta!
> Utworz endpoint backendowy `POST /api/transcribe` ktory proxy'uje request.

---

## 3. LLM Web Search — AI odpowiedzi na zapytania

### Co robi
Gdy uzytkownik wpisuje zapytanie w search bar, aplikacja przeszukuje
tresc strony WWW klienta za pomoca LLM i generuje ustrukturyzowana
odpowiedz z cenami, technologiami, rekomendacjami i zrodlami.

### Pliki zrodlowe
| Plik | Co zawiera |
|---|---|
| `/src/utils/llmSearchService.ts` | `searchWebsite()`, `searchFollowUp()`, `classifyQuery()` — caly serwis LLM |
| `/src/app/components/AIAnswerCard.tsx` | Komponent wyswietlajacy odpowiedz AI ze zrodlami i follow-up questions |
| `/src/app/pages/Home.tsx` | `generateResponse()` w `handleSubmit()` — orkiestracja |

### Konfiguracja

1. Postaw backend z endpointem wyszukiwania (patrz sekcja 9)
2. Dodaj do `.env`:
   ```
   VITE_LLM_API_ENDPOINT=https://your-backend.com/api/search
   VITE_LLM_API_KEY=your-api-key
   ```

### Kontrakt API (request/response)

**Request** `POST /api/search`:
```json
{
  "query": "Ile kosztuje strona internetowa?",
  "siteUrl": "https://client-website.com",
  "language": "pl",
  "maxResults": 5
}
```

**Response**:
```json
{
  "answer": "Tworzymy strony internetowe od 5000 zl...",
  "sources": [
    {
      "title": "Oferta - Strony internetowe",
      "url": "/oferta/strony-www",
      "snippet": "Responsywne strony w React i Next.js.",
      "relevance": 0.95
    }
  ],
  "followUpQuestions": [
    {
      "id": "fu-1",
      "text": "Ile trwa realizacja?",
      "category": "timeline"
    }
  ],
  "confidence": 0.92,
  "model": "gpt-4o"
}
```

### Sugerowana architektura backendu

```
Zapytanie uzytkownika
  |
  v
Backend API (/api/search)
  |
  +-- 1. Wyszukaj w embeddingsach (Pinecone / Weaviate / pgvector)
  |       tresc strony klienta (zescrapowana wczesniej)
  |
  +-- 2. Zbuduj prompt z kontekstem znalezionych fragmentow
  |
  +-- 3. Odpytaj LLM (OpenAI GPT-4o / Claude / Gemini)
  |
  +-- 4. Zwroc ustrukturyzowana odpowiedz
  v
Frontend wyswietla w AIAnswerCard
```

### Klasyfikacja zapytan (mock)
Serwis automatycznie klasyfikuje zapytania po slowach kluczowych:

| Kategoria | Slowa kluczowe |
|---|---|
| `website` | stron, website, www, witryn |
| `mobile_app` | aplikacj, mobil, app, ios, android |
| `crm_system` | crm, system, zarzadzan |
| `dashboard_analytics` | dashboard, analytics, analityk, wykres |
| `kontakt` | kontakt, email, telefon, adres |
| `godziny` | godzin, otwart, czynne, kiedy |
| `general` | (wszystko inne) |

---

## 4. Google OAuth — logowanie

### Konfiguracja

1. Przejdz do https://console.cloud.google.com/
2. Utworz projekt > APIs & Services > Credentials > OAuth 2.0 Client ID
3. Typ: **Web Application**
4. Authorized redirect URIs: `https://your-domain.com/auth/google/callback`
5. Dodaj do `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
   VITE_GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
   ```

### Wymagane scope'y
- `openid` — identyfikacja uzytkownika
- `email` — adres email
- `profile` — imie, nazwisko, avatar

### Plik konfiguracji
`/src/config/DEVELOPER_SETUP.ts` > `GOOGLE_CONFIG`

### Dokumentacja
https://developers.google.com/identity/protocols/oauth2/web-server

---

## 5. Facebook Login — logowanie

### Konfiguracja

1. Przejdz do https://developers.facebook.com/
2. Utworz aplikacje (typ: Consumer)
3. Add Product > **Facebook Login** > Web
4. Ustaw Valid OAuth Redirect URIs
5. Settings > Basic > skopiuj **App ID**
6. Dodaj do `.env`:
   ```
   VITE_FACEBOOK_APP_ID=your_facebook_app_id
   VITE_FACEBOOK_REDIRECT_URI=https://your-domain.com/auth/facebook/callback
   ```

### Wymagane scope'y
- `email`
- `public_profile`

### Plik konfiguracji
`/src/config/DEVELOPER_SETUP.ts` > `FACEBOOK_CONFIG`

### Dokumentacja
https://developers.facebook.com/docs/facebook-login/web/

---

## 6. TikTok Login — logowanie i posty

### Konfiguracja

1. Przejdz do https://developers.tiktok.com/
2. Utworz aplikacje (App type: **Web**)
3. Ustaw Redirect URI
4. Wybierz scope'y: `user.info.basic`, `user.info.profile`, `video.list`
5. Skopiuj **Client Key** i **Client Secret**
6. Dodaj do `.env`:
   ```
   VITE_TIKTOK_CLIENT_KEY=your_client_key
   VITE_TIKTOK_CLIENT_SECRET=your_client_secret
   VITE_TIKTOK_REDIRECT_URI=https://your-domain.com/auth/tiktok/callback
   ```

### Endpointy API
| Endpoint | URL |
|---|---|
| Autoryzacja | `https://www.tiktok.com/v2/auth/authorize/` |
| Token | `https://open.tiktokapis.com/v2/oauth/token/` |
| User info | `https://open.tiktokapis.com/v2/user/info/` |
| Video list | `https://open.tiktokapis.com/v2/video/list/` |

### Pobieranie filmow
```typescript
const fetchUserVideos = async (accessToken: string) => {
  const response = await fetch('https://open.tiktokapis.com/v2/video/list/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ max_count: 20 }),
  });
  const data = await response.json();
  return data.data.videos;
  // Kazdy film: { id, title, cover_image_url, share_url, duration, create_time }
};
```

### Plik konfiguracji
`/src/config/DEVELOPER_SETUP.ts` > `TIKTOK_CONFIG`

### Dokumentacja
https://developers.tiktok.com/doc/login-kit-web/

---

## 7. Instagram API — posty uzytkownikow

### Konfiguracja

1. Przejdz do https://developers.facebook.com/ (Instagram API = ekosystem Meta)
2. Utworz aplikacje > Add Product > **Instagram Basic Display API**
3. Skonfiguruj OAuth Redirect URIs, Deauthorize Callback URL, Data Deletion URL
4. Roles > Instagram Testers > dodaj konto Instagram (tryb development)
5. Zaakceptuj zaproszenie w Instagram: Settings > Apps and Websites > Tester Invites
6. Dodaj do `.env`:
   ```
   VITE_INSTAGRAM_APP_ID=your_app_id
   VITE_INSTAGRAM_APP_SECRET=your_app_secret
   VITE_INSTAGRAM_REDIRECT_URI=https://your-domain.com/auth/instagram/callback
   ```

### Endpointy API
| Endpoint | URL |
|---|---|
| Autoryzacja | `https://api.instagram.com/oauth/authorize` |
| Short-lived token (1h) | `https://api.instagram.com/oauth/access_token` |
| Long-lived token (60 dni) | `https://graph.instagram.com/access_token` |
| User info | `https://graph.instagram.com/me` |
| User media | `https://graph.instagram.com/me/media` |

### Pobieranie postow
```typescript
const fetchUserMedia = async (accessToken: string) => {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=${fields}&access_token=${accessToken}`
  );
  const data = await response.json();
  return data.data;
  // Kazdy post: { id, caption, media_type, media_url, thumbnail_url, permalink, timestamp }
  // media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
};
```

### Odswiezanie tokena
Short-lived token trwa 1h — wymien na long-lived (60 dni), potem odswiezaj:
```typescript
const refreshToken = async (longLivedToken: string) => {
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
  );
  return await response.json(); // { access_token, token_type, expires_in }
};
```

### Plik konfiguracji
`/src/config/DEVELOPER_SETUP.ts` > `INSTAGRAM_CONFIG`

### Dokumentacja
https://developers.facebook.com/docs/instagram-basic-display-api

---

## 8. Google Analytics 4 — sledzenie zdarzen

### Co jest sledzone
Aplikacja trackuje nastepujace zdarzenia (pelna lista w `/src/utils/analytics.ts`):

| Zdarzenie | Kiedy |
|---|---|
| `search_submit` | Wyslanie zapytania |
| `mic_button_clicked` | Klikniecie mikrofonu |
| `auth_started` / `auth_completed` | Logowanie (Google/Facebook/TikTok) |
| `recommendation_opened` | Otwarcie rekomendacji |
| `chat_message_sent` | Wiadomosc w czacie |
| `image_added` | Dodanie zdjecia |
| `notification_clicked` | Klikniecie notyfikacji |

### Konfiguracja

1. Przejdz do https://analytics.google.com/
2. Utworz wlasciwosc GA4 > Data Streams > Web
3. Skopiuj **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Dodaj do `.env`:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_GA_DEBUG=true
   ```

### Tryb debug
Ustaw `VITE_GA_DEBUG=true` aby:
- Widziec wszystkie trackowane eventy w konsoli przegladarki
- Widziec status konfiguracji integracji przy starcie aplikacji

### Pliki zrodlowe
| Plik | Co zawiera |
|---|---|
| `/src/utils/analytics.ts` | `initGA()`, `trackEvent()`, wszystkie funkcje trackingu |
| `/src/utils/analyticsAPI.ts` | GA4 Data API — pobieranie statystyk do dashboardu admina |

### Dokumentacja
https://developers.google.com/analytics/devguides/collection/ga4

---

## 9. Backend — wymagania produkcyjne

W produkcji **MUSISZ** miec backend ktory proxy'uje requesty do API.
Klucze API **NIGDY** nie moga byc po stronie klienta!

### Wymagane endpointy backendowe

| Endpoint | Metoda | Cel |
|---|---|---|
| `/api/transcribe` | POST | Proxy do OpenAI Whisper — przyjmuje audio blob, zwraca tekst |
| `/api/search` | POST | LLM web search — przyjmuje zapytanie, zwraca AI odpowiedz |
| `/api/auth/google/callback` | GET | Wymiana authorization code na token Google |
| `/api/auth/facebook/callback` | GET | Wymiana authorization code na token Facebook |
| `/api/auth/tiktok/callback` | GET | Wymiana authorization code na token TikTok |
| `/api/auth/instagram/callback` | GET | Wymiana authorization code na token Instagram |

### Schemat proxy Whisper

```
Frontend                          Backend                         OpenAI
   |                                |                               |
   |-- POST /api/transcribe ------->|                               |
   |   body: FormData(audio blob)   |                               |
   |                                |-- POST /v1/audio/transcriptions ->
   |                                |   + Authorization: Bearer sk-..  |
   |                                |                               |
   |                                |<---- { text: "..." } ---------|
   |<---- { text: "..." } ---------|                               |
```

### Schemat proxy LLM Search

```
Frontend                          Backend                         OpenAI/Claude
   |                                |                               |
   |-- POST /api/search ----------->|                               |
   |   { query, siteUrl }          |                               |
   |                                |-- 1. Szukaj w embeddingsach   |
   |                                |-- 2. Buduj prompt z kontekstem|
   |                                |-- 3. Odpytaj LLM ------------>|
   |                                |<---- odpowiedz AI ------------|
   |                                |-- 4. Formatuj response        |
   |<---- { answer, sources, ... } |                               |
```

### Minimalna konfiguracja CORS

```typescript
// Express.js
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
```

---

## 10. Tryb mock — jak dzialaja fake'owe dane

Kazda integracja ma wbudowany tryb mock, ktory wlacza sie automatycznie
gdy brak odpowiedniego klucza API:

| Integracja | Warunek mock | Co sie dzieje |
|---|---|---|
| **Whisper** | Brak `VITE_OPENAI_API_KEY` | Losowy tekst z `mockTexts[]` po 1.5s |
| **LLM Search** | Brak `VITE_LLM_API_ENDPOINT` | Statyczne odpowiedzi z `MOCK_SOURCES` po ~1.2s |
| **OAuth** | Brak kluczy | Natychmiastowa "autentykacja" bez prawdziwego loginu |
| **Analytics** | Brak `VITE_GA_MEASUREMENT_ID` | Eventy logowane do `console.log` |
| **Instagram/TikTok posty** | Brak tokenow | Statyczne miniaturki z Unsplash |

### Przycisk mock mikrofonu (zolty z "T")
W search barze obok prawdziwego mikrofonu jest **zolty przycisk testowy**
z literka "T" i badge "MOCK" podczas nagrywania. Uzywa:
- `handleMockVoiceInput()` — fake start
- `handleMockVoiceCancel()` — fake anulowanie
- `handleMockVoiceConfirm()` — fake transkrypcja (losowy tekst, 1.5s delay)

Wizualnie jest **identyczny** z prawdziwym nagrywaniem (ten sam JSX),
rozni sie tylko:
- Brak prawdziwego audio (fake waveform z `Math.random`)
- Zolty badge "MOCK" w UI
- Zolty "T" na ikonie mikrofonu

### Status konfiguracji w konsoli
Przy starcie aplikacji (lub gdy `VITE_GA_DEBUG=true`) w konsoli pojawia sie:
```
Konfiguracja integracji
  Instagram: BRAK — dodaj VITE_INSTAGRAM_APP_ID
  TikTok:    BRAK — dodaj VITE_TIKTOK_CLIENT_KEY
  Google:    BRAK — dodaj VITE_GOOGLE_CLIENT_ID
  Facebook:  BRAK — dodaj VITE_FACEBOOK_APP_ID
  Whisper:   BRAK — dodaj VITE_OPENAI_API_KEY
  Analytics: BRAK — dodaj VITE_GA_MEASUREMENT_ID
```

Wywolaj `checkConfigStatus()` z `/src/config/DEVELOPER_SETUP.ts`
aby sprawdzic programatycznie.

---

## 11. Testowanie integracji

### Whisper (mikrofon)

1. Dodaj `VITE_OPENAI_API_KEY=sk-...` do `.env`
2. Uruchom aplikacje
3. Kliknij biala ikone mikrofonu (nie zolta z "T")
4. Chrome zapyta o dostep do mikrofonu — zezwol
5. Powiedz cos po polsku
6. Kliknij ✓ lub czekaj 15 sekund
7. Sprawdz czy tekst pojawil sie w polu wyszukiwania
8. Sprawdz konsole — nie powinno byc bledow API

### LLM Search

1. Dodaj `VITE_LLM_API_ENDPOINT` i `VITE_LLM_API_KEY` do `.env`
2. Wpisz zapytanie np. "Ile kosztuje strona internetowa?"
3. Sprawdz czy odpowiedz AI zawiera dane z Twojego backendu (nie mock)
4. Sprawdz czy zrodla (Sources) linkuja do prawdziwych podstron

### OAuth (Google/Facebook/TikTok)

1. Dodaj odpowiednie klucze do `.env`
2. Kliknij ikone uzytkownika > "Kontynuuj z Google/Facebook/TikTok"
3. Sprawdz czy nastepuje redirect do providera
4. Po powrocie sprawdz czy uzytkownik jest zalogowany

### Analytics

1. Dodaj `VITE_GA_MEASUREMENT_ID` i `VITE_GA_DEBUG=true`
2. Otworz konsole przegladarki
3. Wykonaj rozne akcje (wyszukiwanie, klikanie, nagrywanie)
4. Sprawdz czy eventy pojawiaja sie w konsoli
5. Sprawdz Real-Time w panelu Google Analytics

---

## 12. Checklist przed wdrozeniem

```
[ ] Utworzyc plik .env z wymaganymi zmiennymi srodowiskowymi
[ ] .env dodany do .gitignore
[ ] ───────────── BACKEND ─────────────
[ ] Endpoint POST /api/transcribe (proxy Whisper)
[ ] Endpoint POST /api/search (LLM web search)
[ ] Endpointy /api/auth/*/callback (OAuth dla kazdego providera)
[ ] CORS skonfigurowany na backendzie
[ ] Klucze API TYLKO po stronie backendu (nie w VITE_*)
[ ] ───────────── OAUTH ─────────────
[ ] Google Cloud Console — OAuth 2.0 Client ID
[ ] Meta for Developers — Facebook App + Instagram Basic Display
[ ] TikTok for Developers — aplikacja Web
[ ] Redirect URIs ustawione u kazdego providera
[ ] ───────────── API ─────────────
[ ] OpenAI — konto + klucz API
[ ] Embeddings strony klienta (Pinecone/Weaviate/pgvector)
[ ] ───────────── ANALYTICS ─────────────
[ ] Google Analytics 4 — Measurement ID
[ ] Przetestowac tracking eventow w Real-Time
[ ] ───────────── TESTY ─────────────
[ ] Mikrofon dziala na Chrome (real, nie mock)
[ ] LLM search zwraca prawdziwe dane (nie mock)
[ ] OAuth flow dziala dla kazdego providera
[ ] Posty Instagram/TikTok laduja sie poprawnie
[ ] Timer mikrofonu auto-stopuje po 15s
[ ] VITE_GA_DEBUG=false w produkcji
```

---

## Pliki referencyjne

| Plik | Zawartosc |
|---|---|
| `/src/config/DEVELOPER_SETUP.ts` | Konfiguracja exportowa + komentarze (ten sam co ponizej ale w kodzie) |
| `/src/app/pages/Home.tsx` | Glowna logika: mikrofon, search, chat, rekomendacje |
| `/src/utils/llmSearchService.ts` | Serwis LLM web search (mock + produkcja) |
| `/src/utils/analytics.ts` | Google Analytics 4 tracking |
| `/src/utils/analyticsAPI.ts` | GA4 Data API (admin dashboard) |
| `/src/app/components/AIAnswerCard.tsx` | Komponent odpowiedzi AI (zrodla, follow-up, portfolio) |
| `/src/app/pages/AdminPanel.tsx` | Panel admina (ustawienia, widoczny przez ikone Settings) |
