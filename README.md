# 🚀 Landing Page Widget z Google Analytics

Nowoczesna strona landing page z glassmorphic search barem, systemem rekomendacji, autentykacją i pełnym trackingiem Google Analytics 4.

## ⚡ Szybki start

### 1. Instalacja

```bash
npm install
```

### 2. Konfiguracja Google Analytics

Edytuj plik `.env` i wstaw swój prawdziwy **Measurement ID** z Google Analytics:

```bash
# .env
VITE_GA_MEASUREMENT_ID=G-ABC123DEF4  # ← Twój ID z https://analytics.google.com
VITE_GA_DEBUG=true                    # Pokaż logi w konsoli
```

> **Gdzie znaleźć Measurement ID?**  
> Google Analytics → Admin → Property → Data Streams → Web → **Measurement ID**

### 3. Uruchom aplikację

```bash
npm run dev
```

## ✨ Funkcjonalności

- 🔍 **Glassmorphic Search Bar** - nowoczesny design z efektem szkła
- 💬 **Chat Widget** - inteligentna konwersacja AI z użytkownikiem
- ⭐ **System rekomendacji** - opinie klientów z animacjami
- 🔐 **Autentykacja** - Google & Facebook login
- 🖼️ **Upload obrazków** - dodawanie zdjęć przez drag&drop lub CMD+V
- 📊 **Google Analytics 4** - pełny tracking wszystkich interakcji
- 👨‍💼 **Panel administracyjny** - zarządzanie treścią i domenami
- 📱 **Responsive design** - działa na wszystkich urządzeniach

## 📊 Google Analytics - Co jest śledzone?

Aplikacja automatycznie śledzi **30+ różnych eventów**:

- ✅ Wyszukiwania (długość query, zdjęcia)
- ✅ Konwersacje chat (liczba wiadomości, czas trwania)
- ✅ Rekomendacje (otwarcia, kliknięcia)
- ✅ Autentykacja (Google/Facebook, współczynnik konwersji)
- ✅ Upload obrazków (upload vs paste)
- ✅ Nawigacja (ustawienia, linki)
- ✅ Interakcje (mikrofon, tooltips, sesje)

**Wszystkie dane są automatycznie filtrowane per użytkownik/domena!**

📖 **Szczegóły:** Zobacz [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)

## 📈 Statystyki w Dashboardzie

Dashboard administratora pokazuje statystyki **tylko dla konkretnego użytkownika**:

```typescript
import { AnalyticsStats } from './components/AnalyticsStats';

<AnalyticsStats 
  ownerId="user_123"        // ID zalogowanego użytkownika
  ownerDomain="example.com" // Filtruj po domenie
/>
```

Dostępne metryki:
- Użytkownicy, sesje, interakcje
- TOP 5 zapytań
- Rozkład typów zapytań (website, mobile, CRM, etc.)
- Współczynnik konwersji
- Średni czas sesji
- ...i wiele więcej!

📖 **Szczegóły:** Zobacz [ANALYTICS_PER_USER.md](./ANALYTICS_PER_USER.md)

## 🗂️ Struktura projektu

```
/
├── .env                    # Twoja konfiguracja GA4
├── .env.example            # Template
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Landing page
│   │   │   ├── AdminPanel.tsx     # Panel admin
│   │   │   └── Login.tsx          # Strona logowania
│   │   └── components/
│   │       ├── ChatWidget.tsx     # Widget chatu
│   │       └── AnalyticsStats.tsx # Dashboard statystyk
│   └── utils/
│       ├── analytics.ts           # Tracking eventów
│       └── analyticsAPI.ts        # Pobieranie danych z GA4
└── docs/
    ├── GOOGLE_ANALYTICS_SETUP.md  # Instrukcja GA4
    └── ANALYTICS_PER_USER.md      # Statystyki per użytkownik
```

## 🛣️ Routing

- `/` - Landing page (główna strona)
- `/login` - Ekran logowania
- `/admin` - Panel administracyjny (wymaga logowania)
  - `/admin` → Zakładka "Inbox"
  - `/admin` → Zakładka "Omnichannel"

## 🔧 Konfiguracja środowiskowa

### Development

```bash
VITE_GA_MEASUREMENT_ID=G-DEV123456
VITE_GA_DEBUG=true  # Pokaż szczegółowe logi
```

### Production

```bash
VITE_GA_MEASUREMENT_ID=G-PROD789012
VITE_GA_DEBUG=false  # Wyłącz logi
```

## 🎯 Tracking - Przykłady użycia

```typescript
import * as analytics from '../utils/analytics';

// Wyszukiwanie
analytics.trackSearchSubmit(query, hasImages);

// Chat
analytics.trackChatOpened(messageCount);
analytics.trackMessageReceived('pricing', true);

// Rekomendacje
analytics.trackRecommendationsOpened();
analytics.trackAvatarClicked();

// Autentykacja
analytics.trackAuthStarted('google');
analytics.trackAuthCompleted('google');

// Obrazki
analytics.trackImageAdded('paste', 3);
```

## 📦 Technologie

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router** - Routing
- **Google Analytics 4** - Analytics
- **Lucide React** - Ikony
- **Motion (Framer Motion)** - Animacje

## 🔐 Zmienne środowiskowe

Plik `.env` już istnieje - wystarczy go edytować!

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Zmień na swój ID
VITE_GA_DEBUG=true                    # true = dev, false = prod

# GA4 Data API (opcjonalne - dla dashboard)
VITE_GA4_PROPERTY_ID=properties/123456789
```

## 📖 Dokumentacja

- 📊 [Google Analytics Setup](./GOOGLE_ANALYTICS_SETUP.md) - Jak skonfigurować GA4
- 📈 [Analytics Per User](./ANALYTICS_PER_USER.md) - Statystyki per użytkownik
- 📝 [Attributions](./ATTRIBUTIONS.md) - Kredyty i licencje

## 🚨 Ważne uwagi

### ⚠️ Plik `.env`

**NIE COMMITUJ** pliku `.env` do repozytorium!

Plik `.env` zawiera wrażliwe dane (API keys). Jest już dodany do `.gitignore`.

### 🔑 Owner ID

Domyślnie używany jest demo Owner ID. W produkcji zamień na prawdziwy:

```typescript
// src/app/pages/Home.tsx (linia ~111)
const OWNER_ID = user.id;           // ← Z Twojego systemu auth
const OWNER_DOMAIN = user.domain;   // ← Z profilu użytkownika
const OWNER_EMAIL = user.email;     // ← Z profilu użytkownika
```

## 🎉 Gotowe do użycia!

Aplikacja działa od razu po instalacji. Google Analytics śledzi wszystkie akcje automatycznie - wystarczy wstawić swój Measurement ID do pliku `.env`!

---

**Made with ❤️ using Figma Make**
