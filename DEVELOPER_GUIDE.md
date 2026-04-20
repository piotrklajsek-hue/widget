# Locly Widget - Instrukcja dla developera

## Architektura serwisowa

Wszystkie operacje asynchroniczne (spinnery, skeletony, loadery) przechodzą przez warstwę serwisową w `/src/services/api.ts`. Warstwa ta automatycznie przełącza się między trybem **mock** (dane symulowane) a trybem **produkcyjnym** (prawdziwe API) na podstawie zmiennych środowiskowych.

### Tryb mock (domyślny)

Gdy zmienne `VITE_API_BASE_URL` nie są ustawione, wszystkie funkcje serwisowe symulują opóźnienie sieciowe i zwracają dane mockowe. Spinnery i skeletony działają z realistycznymi czasami odpowiedzi (800-2000ms).

### Tryb produkcyjny

Ustaw zmienne w pliku `.env`:

```env
# Backend API
VITE_API_BASE_URL=https://api.locly.pl/v1
VITE_API_KEY=your-api-key-here

# LLM Search (osobna konfiguracja)
VITE_LLM_API_ENDPOINT=https://api.locly.pl/v1/search
VITE_LLM_API_KEY=your-llm-api-key

# Google Analytics
VITE_GA4_PROPERTY_ID=properties/123456789
```

---

## Endpointy backendu

### Opinie

| Metoda | Endpoint | Opis | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/opinions` | Dodaj opinię | `OpinionSubmission` | `OpinionResult` |
| `GET` | `/opinions` | Pobierz listę opinii | - | `WidgetInitData` |
| `POST` | `/opinions/recommend` | Poleć (kciuk w gore) | `{}` | `RecommendResult` |

### Mowa / Transkrypcja

| Metoda | Endpoint | Opis | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/speech/transcribe` | Transkrypcja audio | `FormData` (pole `audio`: Blob, `context`: string, `language`: string) | `TranscriptionResult` |

Sugerowane backendy: **OpenAI Whisper API**, **Google Speech-to-Text**, **Azure Speech Services**

Wspierane formaty audio: `webm`, `ogg`, `mp4`, `wav`

### AI

| Metoda | Endpoint | Opis | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/ai/suggestions` | Sugestie AI dla opinii | `{ text: string, count?: number }` | `AISuggestionsResult` |
| `POST` | `/ai/improve-text` | Ulepszenie tekstu AI | `{ text: string }` | `ImproveTextResult` |

Sugerowane modele: **GPT-4o-mini**, **Claude 3.5 Haiku** (szybkie, tanie)

### LLM Search (strona WWW)

| Metoda | Endpoint | Opis | Body | Response |
|--------|----------|------|------|----------|
| `POST` | `/search` | Przeszukaj strone WWW | `{ query, siteUrl, language, maxResults }` | `LLMSearchResult` |

Konfiguracja w `/src/utils/llmSearchService.ts`. Sugerowana architektura:
1. Scrapuj strone klienta i buduj embeddings (Pinecone / Weaviate / Chroma)
2. Przy zapytaniu: szukaj w embeddingsach, buduj kontekst, odpytuj LLM
3. Zwroc ustrukturyzowana odpowiedz ze zrodlami

### Widget

| Metoda | Endpoint | Opis | Body | Response |
|--------|----------|------|------|----------|
| `GET` | `/widget/init` | Dane inicjalizacyjne widgetu | - | `WidgetInitData` |
| `GET` | `/health` | Health check | - | `{ ok: boolean }` |

### Analytics (Google Analytics 4)

| Metoda | Endpoint | Opis | Query params | Response |
|--------|----------|------|------|----------|
| `GET` | `/analytics/widget` | Statystyki widgetu | `ownerId`, `propertyId`, `startDate`, `endDate` | `WidgetAnalyticsSummary` |

Konfiguracja w `/src/utils/analyticsAPI.ts`. Wymaga:
1. Google Cloud Project z włączonym Analytics Data API
2. Service Account z rolą "Viewer" na GA4 property
3. Backend endpoint wywołujący GA4 Data API (nigdy nie eksponuj credentials w frontend!)

Szczegółowa instrukcja setup w komentarzu na dole pliku `analyticsAPI.ts`.

---

## Typy danych (TypeScript)

Wszystkie typy sa zdefiniowane w `/src/services/api.ts`:

```typescript
// Wysylanie opinii
interface OpinionSubmission {
  text: string;
  categories: string[];
  city: string;
  avatar: string;
  inputMethod: 'text' | 'voice' | null;
}

// Odpowiedz po dodaniu opinii
interface OpinionResult {
  id: string;
  status: string; // np. 'czeka na potwierdzenie'
}

// Wynik transkrypcji
interface TranscriptionResult {
  text: string;
  confidence: number; // 0-1
  language: string;   // np. 'pl'
}

// Sugestie AI
interface AISuggestionsResult {
  suggestions: string[]; // tablica 3 sugestii
}

// Ulepszony tekst
interface ImproveTextResult {
  improvedText: string;
}

// Polecenie
interface RecommendResult {
  success: boolean;
  recommendationId: string;
}

// Dane inicjalizacyjne
interface WidgetInitData {
  opinions: Array<{
    id: string;
    avatar: string;
    name: string;
    city: string;
    opinion: string;
    categories: string[];
    date: string;
    status?: string;
  }>;
}
```

---

## Mapowanie serwisow na UI

| Funkcja serwisowa | UI element | Plik |
|---|---|---|
| `initializeWidget()` | Spinner przy otwarciu mobile search overlay | `Home.tsx` |
| `fetchOpinions()` | Skeleton loader opinii po "Zobacz wszystkie" | `Home.tsx` |
| `submitRecommendation()` | Spinner przy kliknieciu "Polec" (kciuk) | `Home.tsx` |
| `submitOpinion()` | Spinner przy "Dodaj opinie" (desktop + mobile) | `Home.tsx` |
| `transcribeAudio()` | Spinner transkrypcji w search barze i opinii | `Home.tsx` |
| `generateAISuggestions()` | Loader sugestii AI w formularzu opinii | `Home.tsx` |
| `improveTextWithAI()` | Ulepszanie tekstu opinii | `Home.tsx` |
| `searchWebsite()` | Typing indicator + AI answer card w chacie | `llmSearchService.ts` |

---

## Fallback i obsluga bledow

Kazda funkcja w `/src/services/api.ts` ma wbudowany fallback:

1. Jesli `VITE_API_BASE_URL` nie jest ustawione -> **tryb mock** (symulowane dane)
2. Jesli request do API sie nie powiedzie -> **fallback na mock** z logem w konsoli
3. W UI: kazdy `.catch()` resetuje stan ladowania i (opcjonalnie) wyswietla toast z bledem

---

## Diagnostyka

Uzyj `api.healthCheck()` w konsoli przegladarki:

```javascript
import { healthCheck } from '/src/services/api';
healthCheck().then(console.log);
// { ok: true, mode: 'mock', baseUrl: '' }
// lub
// { ok: true, mode: 'production', baseUrl: 'https://api.locly.pl/v1' }
```

---

## Struktura plikow

```
src/
  services/
    api.ts                  # Glowna warstwa serwisowa (opinie, AI, mowa, widget)
  utils/
    llmSearchService.ts     # LLM search (przeszukiwanie stron WWW)
    analytics.ts            # Google Analytics tracking
    analyticsAPI.ts         # Analytics API (GA4 Data API)
  app/
    pages/
      Home.tsx              # Glowny komponent widgetu
    components/
      AIAnswerCard.tsx       # Karta odpowiedzi AI w chacie
      AnalyticsStats.tsx     # Panel analityki (admin)
      ChatWidget.tsx         # Chat widget
```