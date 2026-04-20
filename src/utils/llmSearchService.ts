// ============================================================================
//  LLM Web Search Service
//  Integracja z LLM do przeszukiwania stron WWW
// ============================================================================
//
//  Ten serwis obsluguje:
//  1. Przeszukiwanie tresci strony WWW (web scraping + embeddings)
//  2. Generowanie odpowiedzi AI na podstawie znalezionych tresci
//  3. Sugestie pytań follow-up
//  4. Źródła odpowiedzi (linki do podstron)
//
//  KONFIGURACJA PRODUKCYJNA:
//  - Ustaw VITE_LLM_API_ENDPOINT na adres backendu
//  - Backend powinien:
//    a) Scrapować stronę klienta i tworzyć embeddings (np. Pinecone/Weaviate)
//    b) Przy zapytaniu: szukać w embeddingsach, budować kontekst, odpytywać LLM
//    c) Zwracać ustrukturyzowaną odpowiedź z źródłami
//
//  Obsługiwane modele (przez backend):
//  - OpenAI GPT-4o / GPT-4o-mini
//  - Anthropic Claude 3.5 Sonnet
//  - Google Gemini Pro
//
// ============================================================================

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  relevance: number; // 0-1
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  category: string;
}

export interface LLMSearchResult {
  answer: string;
  sources: WebSearchSource[];
  followUpQuestions: FollowUpQuestion[];
  confidence: number; // 0-1
  processingTimeMs: number;
  model: string;
}

export interface WebSearchConfig {
  apiEndpoint: string;
  apiKey?: string;
  siteUrl?: string; // URL strony do przeszukiwania
  language?: string;
  maxResults?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK DATA — symulacja odpowiedzi LLM
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SOURCES: Record<string, WebSearchSource[]> = {
  website: [
    { title: 'Oferta - Strony internetowe', url: '/oferta/strony-www', snippet: 'Tworzymy responsywne strony internetowe w technologiach React, Next.js i WordPress.', relevance: 0.95 },
    { title: 'Cennik usług', url: '/cennik', snippet: 'Strona wizytówka od 5 000 zł, strona firmowa od 8 000 zł, sklep internetowy od 15 000 zł.', relevance: 0.88 },
    { title: 'Portfolio - Realizacje WWW', url: '/portfolio/www', snippet: 'Zobacz nasze najnowsze realizacje stron internetowych dla klientów z całej Polski.', relevance: 0.82 },
  ],
  mobile_app: [
    { title: 'Oferta - Aplikacje mobilne', url: '/oferta/aplikacje-mobilne', snippet: 'Projektujemy i budujemy aplikacje na iOS i Android w React Native.', relevance: 0.94 },
    { title: 'Proces realizacji', url: '/proces', snippet: 'Od MVP po pełną aplikację — poznaj nasz sprawdzony proces tworzenia aplikacji mobilnych.', relevance: 0.85 },
    { title: 'Case Study - Aplikacja fitness', url: '/portfolio/fitness-app', snippet: 'Aplikacja mobilna dla sieci klubów fitness z 50 000+ pobrań.', relevance: 0.78 },
  ],
  crm_system: [
    { title: 'Systemy CRM na zamówienie', url: '/oferta/crm', snippet: 'Budujemy dedykowane systemy CRM z automatyzacją sprzedaży i integracjami.', relevance: 0.93 },
    { title: 'Integracje', url: '/oferta/integracje', snippet: 'Integrujemy z email, kalendarzem, fakturami, marketing automation i więcej.', relevance: 0.86 },
    { title: 'FAQ - Systemy CRM', url: '/faq#crm', snippet: 'Odpowiedzi na najczęściej zadawane pytania o systemy CRM.', relevance: 0.75 },
  ],
  dashboard_analytics: [
    { title: 'Dashboard Analytics', url: '/oferta/dashboard', snippet: 'Interaktywne dashboardy z wizualizacją danych w czasie rzeczywistym.', relevance: 0.92 },
    { title: 'Technologie', url: '/technologie', snippet: 'React, Recharts, D3.js — nowoczesne narzędzia do wizualizacji danych.', relevance: 0.84 },
    { title: 'Case Study - Dashboard logistyczny', url: '/portfolio/logistics-dashboard', snippet: 'Dashboard analityczny dla firmy logistycznej śledzący 10 000+ przesyłek dziennie.', relevance: 0.79 },
  ],
  general: [
    { title: 'O nas', url: '/o-nas', snippet: 'Jesteśmy zespołem doświadczonych programistów specjalizujących się w rozwiązaniach webowych i mobilnych.', relevance: 0.90 },
    { title: 'Oferta', url: '/oferta', snippet: 'Strony internetowe, aplikacje mobilne, systemy CRM, dashboardy analityczne.', relevance: 0.87 },
    { title: 'Kontakt', url: '/kontakt', snippet: 'Skontaktuj się z nami: biuro@example.pl, tel. +48 123 456 789.', relevance: 0.80 },
  ],
  kontakt: [
    { title: 'Kontakt', url: '/kontakt', snippet: 'Email: biuro@example.pl | Tel: +48 123 456 789 | Adres: ul. Przykładowa 15, 43-400 Cieszyn', relevance: 0.98 },
    { title: 'Formularz kontaktowy', url: '/kontakt#formularz', snippet: 'Wypełnij formularz, a odezwiemy się w ciągu 24 godzin.', relevance: 0.90 },
  ],
  godziny: [
    { title: 'Godziny otwarcia', url: '/kontakt#godziny', snippet: 'Poniedziałek-Piątek: 9:00-18:00 | Sobota: 10:00-14:00 | Niedziela: zamknięte', relevance: 0.97 },
    { title: 'Kontakt', url: '/kontakt', snippet: 'Biuro czynne w godzinach 9:00-18:00 w dni robocze.', relevance: 0.85 },
  ],
};

const MOCK_FOLLOW_UPS: Record<string, FollowUpQuestion[]> = {
  website: [
    { id: 'fu-1', text: 'Ile trwa realizacja strony internetowej?', category: 'timeline' },
    { id: 'fu-2', text: 'Czy mogę zobaczyć portfolio stron?', category: 'portfolio' },
    { id: 'fu-3', text: 'Jak wygląda proces wyceny?', category: 'pricing' },
  ],
  mobile_app: [
    { id: 'fu-4', text: 'Czy tworzycie aplikacje na obie platformy jednocześnie?', category: 'tech' },
    { id: 'fu-5', text: 'Ile kosztuje utrzymanie aplikacji po wdrożeniu?', category: 'pricing' },
    { id: 'fu-6', text: 'Czy pomagacie z publikacją w App Store i Google Play?', category: 'process' },
  ],
  crm_system: [
    { id: 'fu-7', text: 'Jakie integracje są dostępne?', category: 'integrations' },
    { id: 'fu-8', text: 'Czy system można rozbudować w przyszłości?', category: 'scalability' },
    { id: 'fu-9', text: 'Jak wygląda migracja danych ze starego systemu?', category: 'migration' },
  ],
  dashboard_analytics: [
    { id: 'fu-10', text: 'Z jakich źródeł danych mogę korzystać?', category: 'data' },
    { id: 'fu-11', text: 'Czy dashboard aktualizuje się w czasie rzeczywistym?', category: 'realtime' },
    { id: 'fu-12', text: 'Czy mogę eksportować raporty do PDF?', category: 'export' },
  ],
  general: [
    { id: 'fu-13', text: 'Jakie technologie wykorzystujecie?', category: 'tech' },
    { id: 'fu-14', text: 'Czy mogę zobaczyć wasze portfolio?', category: 'portfolio' },
    { id: 'fu-15', text: 'Jak mogę się skontaktować?', category: 'contact' },
  ],
  kontakt: [
    { id: 'fu-16', text: 'Jakie są godziny otwarcia?', category: 'hours' },
    { id: 'fu-17', text: 'Gdzie znajduje się wasze biuro?', category: 'location' },
    { id: 'fu-18', text: 'Czy mogę umówić się na spotkanie online?', category: 'meeting' },
  ],
  godziny: [
    { id: 'fu-19', text: 'Czy mogę umówić się poza godzinami pracy?', category: 'flexible' },
    { id: 'fu-20', text: 'Jak mogę się skontaktować?', category: 'contact' },
    { id: 'fu-21', text: 'Gdzie znajduje się biuro?', category: 'location' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  QUERY CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export const classifyQuery = (query: string): string => {
  const lower = query.toLowerCase();
  
  if (lower.includes('kontakt') || lower.includes('email') || lower.includes('telefon') || lower.includes('numer') || lower.includes('adres')) {
    return 'kontakt';
  }
  if (lower.includes('godzin') || lower.includes('otwart') || lower.includes('czynne') || lower.includes('kiedy')) {
    return 'godziny';
  }
  if (lower.includes('stron') || lower.includes('website') || lower.includes('www') || lower.includes('witryn')) {
    return 'website';
  }
  if (lower.includes('aplikacj') || lower.includes('mobil') || lower.includes('app') || lower.includes('ios') || lower.includes('android')) {
    return 'mobile_app';
  }
  if (lower.includes('crm') || lower.includes('system') || lower.includes('zarządzan')) {
    return 'crm_system';
  }
  if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('analityk') || lower.includes('wykres') || lower.includes('raport')) {
    return 'dashboard_analytics';
  }
  
  return 'general';
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SEARCH FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

let searchConfig: WebSearchConfig = {
  apiEndpoint: '',
};

export const configureSearch = (config: WebSearchConfig) => {
  searchConfig = { ...searchConfig, ...config };
};

/**
 * Przeszukaj stronę WWW za pomocą LLM
 * W trybie produkcyjnym — odpytuje backend API
 * W trybie mock — zwraca symulowane dane
 */
export const searchWebsite = async (query: string): Promise<LLMSearchResult> => {
  const startTime = Date.now();
  const apiEndpoint = searchConfig.apiEndpoint || import.meta.env?.VITE_LLM_API_ENDPOINT || '';
  const apiKey = searchConfig.apiKey || import.meta.env?.VITE_LLM_API_KEY || '';

  // ── PRODUCTION MODE ──
  if (apiEndpoint && apiKey) {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          siteUrl: searchConfig.siteUrl,
          language: searchConfig.language || 'pl',
          maxResults: searchConfig.maxResults || 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.answer || '',
        sources: data.sources || [],
        followUpQuestions: data.followUpQuestions || [],
        confidence: data.confidence || 0.8,
        processingTimeMs: Date.now() - startTime,
        model: data.model || 'unknown',
      };
    } catch (error) {
      console.error('[LLM Search] API error, falling back to mock:', error);
      // Fall through to mock
    }
  }

  // ── MOCK MODE ──
  if (!apiEndpoint) {
    console.info(
      '🔍 LLM Search API nie skonfigurowane. Używam mock danych.\n' +
      'Aby podłączyć prawdziwe API, ustaw:\n' +
      '  VITE_LLM_API_ENDPOINT=https://your-backend.com/api/search\n' +
      '  VITE_LLM_API_KEY=your-api-key\n'
    );
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const queryType = classifyQuery(query);
  const sources = MOCK_SOURCES[queryType] || MOCK_SOURCES.general;
  const followUpQuestions = MOCK_FOLLOW_UPS[queryType] || MOCK_FOLLOW_UPS.general;

  return {
    answer: '', // Answer is generated by the existing AI card system
    sources,
    followUpQuestions,
    confidence: 0.85 + Math.random() * 0.1,
    processingTimeMs: Date.now() - startTime,
    model: 'mock-gpt-4o',
  };
};

/**
 * Przetwórz follow-up question — ponowne wyszukiwanie z kontekstem
 */
export const searchFollowUp = async (
  originalQuery: string,
  followUpQuestion: string
): Promise<LLMSearchResult> => {
  // Combine context for better results
  const combinedQuery = `${followUpQuestion} (w kontekście: ${originalQuery})`;
  return searchWebsite(combinedQuery);
};
