# 📊 Instrukcja konfiguracji Google Analytics 4

## 🚀 Szybki start (2 kroki)

### **Krok 1: Uzyskaj Measurement ID**

1. Wejdź na https://analytics.google.com/
2. Stwórz nowe konto lub wybierz istniejące
3. Utwórz nową **Property (GA4)**
4. Skopiuj **Measurement ID** (format: `G-XXXXXXXXXX`)
   - Lokalizacja: **Admin → Property → Data Streams → [Twój stream] → Measurement ID**

### **Krok 2: Skonfiguruj aplikację**

Plik `.env` już istnieje w projekcie! Po prostu edytuj go i zmień na swój prawdziwy Measurement ID:

```bash
# .env
VITE_GA_MEASUREMENT_ID=G-ABC123DEF4  # ← Zmień na swój prawdziwy ID
VITE_GA_DEBUG=true                    # true = pokaż logi w konsoli, false = produkcja
```

**Gotowe! 🎉** Analytics będzie automatycznie śledzić wszystkie akcje.

> **💡 Tip:** Obecnie ustawiony jest demo ID `G-DEMO123456` - aplikacja działa, ale dane nie są wysyłane do prawdziwego GA4. Zamień na swój ID z Google Analytics!

---

## 📋 Alternatywna metoda: hardcode w kodzie

Jeśli nie chcesz używać `.env`, edytuj bezpośrednio plik `/src/app/pages/Home.tsx`:

Znajdź (około linii 104):
```typescript
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
```

Zmień na:
```typescript
const GA_MEASUREMENT_ID = 'G-ABC123DEF4'; // Twój prawdziwy ID
```

---

## 🎯 Co jest śledzone automatycznie?

### **1. Search & Input** (`widget_search`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `input_typed` | Użytkownik wpisuje tekst | `input_length` |
| `query_submitted` | Wysłanie zapytania | `query_length`, `has_images`, `query_preview` |
| `placeholder_changed` | Zmiana animowanego placeholdera | `value` |

### **2. Chat** (`widget_chat`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `overlay_opened` | Otwarcie okna chatu | `message_count` |
| `overlay_closed` | Zamknięcie okna chatu | `message_count`, `session_duration` |
| `message_received` | Otrzymanie odpowiedzi AI | `message_type`, `has_recommendation` |
| `conversation_ended` | Zakończenie konwersacji | `message_count`, `user_initiated` |

### **3. Recommendations** (`widget_recommendations`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `modal_opened` | Otwarcie listy rekomendacji | - |
| `modal_closed` | Zamknięcie listy rekomendacji | `time_spent` |
| `recommendation_viewed` | Wyświetlenie rekomendacji w chacie | `recommendation_id`, `event_label` (imię) |
| `see_more_clicked` | Kliknięcie "Zobacz więcej" | - |
| `see_who_clicked` | Kliknięcie "Zobacz kto" | - |
| `avatar_clicked` | Kliknięcie awatarów (badge) | - |

### **4. Authentication** (`widget_auth`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `modal_opened` | Otwarcie modala logowania | `event_label` (źródło: see_who_link, see_more_button) |
| `modal_closed` | Zamknięcie modala logowania | - |
| `auth_started` | Rozpoczęcie logowania | `event_label` (google/facebook) |
| `auth_completed` | Ukończenie logowania | `event_label` (google/facebook) |

### **5. Images** (`widget_image`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `image_added` | Dodanie zdjęcia | `source` (upload/paste), `total_images` |
| `image_removed` | Usunięcie zdjęcia | `remaining_images` |
| `plus_button_clicked` | Kliknięcie przycisku "+" | - |

### **6. Navigation** (`widget_navigation`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `settings_clicked` | Kliknięcie Settings (admin) | - |
| `locly_link_clicked` | Kliknięcie linku "locly.pl" | - |

### **7. Interactions** (`widget_interaction`)
| Event | Opis | Parametry |
|-------|------|-----------|
| `mic_button_clicked` | Kliknięcie przycisku mikrofonu | - |
| `tooltip_shown` | Pokazanie tooltipa | `event_label` (typ tooltipa) |
| `multiline_expanded` | Rozwinięcie textarea na wiele linii | - |
| `session_started` | Rozpoczęcie sesji użytkownika | - |
| `session_ended` | Zakończenie sesji | `session_duration_ms` |

---

## 📊 Jak przeglądać dane w Google Analytics?

### **Real-time (czas rzeczywisty)**

1. Wejdź na GA4 → **Reports → Realtime**
2. Kliknij coś w aplikacji
3. **Natychmiast** zobaczysz event w sekcji "Event count by Event name"

### **Historical Reports (raporty historyczne)**

1. **Reports → Engagement → Events**
2. Filtruj po nazwie eventu zaczynającej się od `widget_`
3. Zobacz szczegóły: liczba eventów, użytkownicy, wartości

### **Custom Dashboard**

Stwórz własny dashboard:

1. **Explore → Blank**
2. Dodaj wymiary (Dimensions):
   - `Event name`
   - `Event category`
   - `Event label`
3. Dodaj metryki (Metrics):
   - `Event count`
   - `Total users`
   - `Event value`
4. Filtruj: `Event name` → `starts with` → `widget_`

---

## 🔍 Przydatne zapytania Analytics

### **TOP 10 najczęstszych akcji**
```
Reports → Engagement → Events
→ Sort by "Event count" DESC
→ Filter: Event name contains "widget_"
```

### **Lejek konwersji (funnel)**
```
Explore → Funnel exploration
→ Step 1: widget_search_query_submitted
→ Step 2: widget_chat_message_received
→ Step 3: widget_recommendations_see_more_clicked
→ Step 4: widget_auth_auth_completed
```

### **Średni czas sesji**
```
Reports → Engagement → Events
→ Find: widget_interaction_session_ended
→ View parameter: session_duration_ms
→ Average value
```

### **Użytkownicy dodający obrazki**
```
Reports → Engagement → Events
→ Filter: Event name = "widget_image_image_added"
→ Secondary dimension: Event label (upload/paste)
```

---

## 🛠️ Troubleshooting

### **❌ Nie widzę żadnych eventów w GA4**

1. ✅ Sprawdź, czy Measurement ID jest poprawny (format `G-XXXXXXXXXX`)
2. ✅ Sprawdź konsolę przeglądarki - powinny być logi `[GA4] Event tracked: ...`
3. ✅ Upewnij się, że nie masz włączonego AdBlocka
4. ✅ Sprawdź Network tab - powinny być requesty do `google-analytics.com`
5. ✅ Poczekaj 5-10 sekund - eventy mogą się pojawić z opóźnieniem

### **❌ Widzę eventy w Real-time, ale nie w Reports**

- GA4 przetwarza dane historyczne z opóźnieniem **24-48 godzin**
- Real-time działa natychmiast, ale Reports mogą być opóźnione

### **❌ Console warning: "Google Analytics not configured"**

Sprawdź:
```bash
# Czy plik .env istnieje?
ls -la .env

# Czy zawiera poprawną wartość?
cat .env
```

Jeśli nie masz pliku `.env`, stwórz go:
```bash
cp .env.example .env
# Następnie edytuj .env i wstaw swój Measurement ID
```

### **❌ Events mają dziwne nazwy**

Format nazw: `{category}_{action}`

Przykład:
- Category: `widget_search`
- Action: `query_submitted`
- **Event name:** `widget_search_query_submitted`

---

## 🎯 Best Practices

### **1. Używaj zmiennych środowiskowych**

```bash
# Development
VITE_GA_MEASUREMENT_ID=G-DEV123456
VITE_GA_DEBUG=true

# Production
VITE_GA_MEASUREMENT_ID=G-PROD789012
VITE_GA_DEBUG=false
```

### **2. Włącz debug mode w development**

```env
VITE_GA_DEBUG=true
```

Zobaczysz szczegółowe logi w konsoli:
```
[GA4] Event tracked: widget_search_query_submitted
{
  category: 'widget_search',
  action: 'query_submitted',
  query_length: 25,
  has_images: true
}
```

### **3. Wyłącz debug mode w production**

```env
VITE_GA_DEBUG=false
```

Logi będą wyłączone, ale eventy nadal będą wysyłane.

### **4. Testuj w Realtime przed wdrożeniem**

Przed wdrożeniem na produkcję:
1. Ustaw swój testowy Measurement ID
2. Otwórz GA4 → Realtime
3. Kliknij wszystkie możliwe akcje w aplikacji
4. Sprawdź, czy wszystkie eventy się pojawiają

---

## 📦 Struktura plików

```
/
├── .env                          # Twoja konfiguracja (NIE commituj!)
├── .env.example                  # Template dla zespołu
├── GOOGLE_ANALYTICS_SETUP.md     # Ten plik
└── src/
    ├── utils/
    │   └── analytics.ts          # Logika trackingu
    └── app/
        └── pages/
            └── Home.tsx          # Integracja z komponentem
```

---

## 📞 Wsparcie

Jeśli masz problemy:

1. Sprawdź [dokumentację GA4](https://support.google.com/analytics/answer/9304153)
2. Włącz `VITE_GA_DEBUG=true` i sprawdź logi
3. Sprawdź Network tab w DevTools (filtr: `google-analytics.com`)

---

## 🎉 Gotowe!

Po konfiguracji będziesz miał:

✅ **Pełny tracking wszystkich akcji użytkowników**  
✅ **Real-time analytics** (dane na żywo)  
✅ **Szczegółowe raporty** (demografia, urządzenia, zachowania)  
✅ **Custom funnels** (ścieżki konwersji)  
✅ **User properties** (zalogowany/niezalogowany)  
✅ **Event parameters** (długość query, typ wiadomości, etc.)

**Wszystko działa automatycznie - zero dodatkowej konfiguracji! 🚀**