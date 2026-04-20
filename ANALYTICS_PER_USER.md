# 📊 Statystyki per użytkownik - Instrukcja implementacji

## 🎯 Koncept

Każdy event wysyłany do Google Analytics zawiera **3 parametry identyfikujące właściciela**:

```typescript
{
  widget_owner_id: "user_123",           // ID użytkownika z Twojej bazy
  widget_owner_domain: "example.com",    // Domena gdzie widget jest osadzony
  widget_owner_email: "user@example.com" // Email właściciela (opcjonalnie)
}
```

Dzięki temu możesz **filtrować** dane w Google Analytics lub w dashboardzie administracyjnym.

---

## 🚀 Jak to działa?

### **1. Widget wysyła dane z identyfikacją właściciela**

Plik: `/src/app/pages/Home.tsx` (linie 104-133)

```typescript
analytics.configureWidget({
  measurementId: 'G-ABC123DEF4',
  ownerId: 'user_123',              // ← ID użytkownika
  ownerDomain: 'example.com',       // ← Domena
  ownerEmail: 'user@example.com'    // ← Email
});
```

### **2. Każdy event zawiera te parametry**

Przykład eventu w GA4:

```json
{
  "event_name": "widget_search_query_submitted",
  "widget_owner_id": "user_123",
  "widget_owner_domain": "example.com",
  "widget_owner_email": "user@example.com",
  "query_length": 42,
  "has_images": true,
  "timestamp": "2026-03-08T12:34:56Z"
}
```

### **3. Dashboard pobiera TYLKO dane dla konkretnego użytkownika**

Plik: `/src/app/components/AnalyticsStats.tsx`

```typescript
<AnalyticsStats 
  ownerId="user_123" 
  ownerDomain="example.com" 
/>
```

Dashboard automatycznie **filtruje** wszystkie eventy gdzie `widget_owner_id === "user_123"`.

---

## 📋 Implementacja krok po kroku

### **KROK 1: Skonfiguruj Owner ID w widgecie**

Otwórz `/src/app/pages/Home.tsx` i znajdź (około linii 111):

```typescript
// TODO: Replace with actual owner ID from authentication/context
const OWNER_ID = 'demo_user_123';
const OWNER_DOMAIN = window.location.hostname;
const OWNER_EMAIL = 'demo@example.com';
```

**Zamień na rzeczywiste dane:**

#### **Opcja A: Dane z context/state (zalecane)**

```typescript
import { useAuth } from '../contexts/AuthContext'; // Twój context

function Home() {
  const { user } = useAuth(); // Zalogowany użytkownik
  
  useEffect(() => {
    analytics.configureWidget({
      measurementId: GA_MEASUREMENT_ID,
      ownerId: user.id,                    // ← Z Twojej bazy danych
      ownerDomain: user.domain,            // ← Z profilu użytkownika
      ownerEmail: user.email,              // ← Z profilu użytkownika
      enableDebug: true,
      enableAutoTracking: true
    });
  }, [user]);
}
```

#### **Opcja B: Dane z URL (dla osadzonego widgetu)**

Jeśli widget jest osadzany na innych stronach przez `<iframe>`:

```html
<!-- Osadzenie na stronie klienta -->
<iframe src="https://widget.example.com/?ownerId=user_123&domain=sklep.pl"></iframe>
```

W kodzie widgetu:

```typescript
const urlParams = new URLSearchParams(window.location.search);
const OWNER_ID = urlParams.get('ownerId') || 'unknown';
const OWNER_DOMAIN = urlParams.get('domain') || window.location.hostname;
```

#### **Opcja C: Dane z API endpoint**

```typescript
useEffect(() => {
  async function fetchOwnerConfig() {
    const response = await fetch('/api/widget/config');
    const config = await response.json();
    
    analytics.configureWidget({
      measurementId: GA_MEASUREMENT_ID,
      ownerId: config.ownerId,
      ownerDomain: config.domain,
      ownerEmail: config.email,
      enableDebug: true,
      enableAutoTracking: true
    });
  }
  
  fetchOwnerConfig();
}, []);
```

---

### **KROK 2: Dodaj komponent Analytics do dashboardu**

Otwórz panel administracyjny (np. `/src/app/pages/Admin.tsx`):

```typescript
import { AnalyticsStats } from '../components/AnalyticsStats';

function AdminPanel() {
  const { user } = useAuth(); // Zalogowany admin
  
  return (
    <div>
      <h1>Panel administracyjny</h1>
      
      {/* Sekcja ze statystykami */}
      <AnalyticsStats 
        ownerId={user.id} 
        ownerDomain={user.domain} 
      />
    </div>
  );
}
```

**GOTOWE!** 🎉 Dashboard będzie pokazywać TYLKO statystyki dla tego użytkownika.

---

### **KROK 3: (Opcjonalnie) Implementuj backend API**

Obecnie dane są mockowane. Aby pobierać **prawdziwe dane z GA4**, musisz stworzyć backend endpoint.

#### **Backend setup (Node.js + Express)**

1. **Zainstaluj pakiet:**

```bash
npm install @google-analytics/data
```

2. **Stwórz Service Account w Google Cloud:**

- Wejdź na: https://console.cloud.google.com/iam-admin/serviceaccounts
- Stwórz nowy Service Account
- Pobierz klucz JSON
- Dodaj Service Account email do GA4 z rolą "Viewer"

3. **Utwórz endpoint:**

Plik: `/api/analytics/widget.js`

```javascript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY)
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const startDate = searchParams.get('startDate') || '7daysAgo';
  const endDate = searchParams.get('endDate') || 'today';
  
  const propertyId = process.env.GA4_PROPERTY_ID;
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'eventName' },
        { name: 'customEvent:widget_owner_id' },
        { name: 'customEvent:query_preview' }
      ],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' },
        { name: 'averageSessionDuration' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'customEvent:widget_owner_id',
          stringFilter: {
            value: ownerId,
            matchType: 'EXACT'
          }
        }
      },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 100
    });
    
    // Process response and return analytics summary
    const analytics = processGA4Response(response);
    
    return Response.json(analytics);
  } catch (error) {
    console.error('GA4 API Error:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
```

4. **Zaktualizuj `/src/utils/analyticsAPI.ts`:**

Znajdź funkcję `fetchWidgetAnalytics` i zamień:

```typescript
export async function fetchWidgetAnalytics(
  propertyId: string,
  ownerId: string,
  dateRange: AnalyticsDateRange
): Promise<WidgetAnalyticsSummary> {
  // Call your backend API
  const response = await fetch(
    `/api/analytics/widget?ownerId=${ownerId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  
  return response.json();
}
```

---

## 📊 Jak filtrować dane w Google Analytics?

### **Metoda 1: Custom Reports**

1. Wejdź na GA4 → **Explore → Blank**
2. Dodaj filtr:
   - **Dimension:** `widget_owner_id`
   - **Condition:** `exactly matches`
   - **Value:** `user_123`
3. Dodaj metryki: Event count, Total users, etc.
4. **Zapisz raport**

### **Metoda 2: Segments**

1. GA4 → **Explore → Segment Builder**
2. Utwórz segment:
   - **Name:** "User 123 Events"
   - **Condition:** `widget_owner_id` = `user_123`
3. Zastosuj segment do dowolnego raportu

### **Metoda 3: Data API (programatically)**

Używając backend endpoint opisanego w KROK 3.

---

## 🎯 Przykładowe statystyki dostępne per użytkownik

Komponent `AnalyticsStats` wyświetla:

### **📈 Przegląd**
- Całkowite interakcje
- Liczba użytkowników
- Liczba sesji
- Średni czas trwania sesji

### **🔍 Wyszukiwania**
- Całkowite wyszukiwania
- Średnia długość zapytania
- Wyszukiwania ze zdjęciami
- **TOP 5 najpopularniejszych zapytań**

### **💬 Konwersacje**
- Sesje chatowe
- Całkowite wiadomości
- Średnia wiadomości/sesja
- Zakończone przez użytkownika vs timeout

### **⭐ Rekomendacje**
- Otwarcia modala rekomendacji
- Wyświetlone rekomendacje
- Kliknięcia "Zobacz więcej"
- Kliknięcia "Zobacz kto"

### **🔐 Autentykacja**
- Próby logowania
- Logowania Google vs Facebook
- **Współczynnik konwersji** (% użytkowników którzy się zalogowali)

### **🖼️ Obrazki**
- Całkowite dodane obrazki
- Z uploadu vs z wklejenia (CMD+V)

### **📊 Rozkład typów zapytań**
- Website
- Mobile App
- CRM System
- Dashboard Analytics
- General

---

## 🔥 Przykłady użycia

### **Dashboard dla wielu użytkowników (Super Admin)**

```typescript
function SuperAdminDashboard() {
  const [selectedUser, setSelectedUser] = useState('user_123');
  const users = ['user_123', 'user_456', 'user_789'];
  
  return (
    <div>
      <select onChange={(e) => setSelectedUser(e.target.value)}>
        {users.map(userId => (
          <option key={userId} value={userId}>{userId}</option>
        ))}
      </select>
      
      <AnalyticsStats ownerId={selectedUser} />
    </div>
  );
}
```

### **Dashboard z porównaniem okresów**

```typescript
function ComparativeDashboard() {
  const [period, setPeriod] = useState<'last7Days' | 'last30Days'>('last7Days');
  
  return (
    <div>
      <select onChange={(e) => setPeriod(e.target.value)}>
        <option value="last7Days">Ostatnie 7 dni</option>
        <option value="last30Days">Ostatnie 30 dni</option>
      </select>
      
      <AnalyticsStats 
        ownerId="user_123" 
        // Period is handled inside component
      />
    </div>
  );
}
```

### **Widget dla różnych domen tego samego użytkownika**

Jeśli jeden użytkownik ma widget na kilku domenach:

```typescript
// Widget na sklep.pl
analytics.configureWidget({
  ownerId: 'user_123',
  ownerDomain: 'sklep.pl',
  // ...
});

// Widget na blog.pl
analytics.configureWidget({
  ownerId: 'user_123',
  ownerDomain: 'blog.pl',
  // ...
});

// W dashboardzie - pokaż łącznie lub osobno
<AnalyticsStats 
  ownerId="user_123" 
  ownerDomain="sklep.pl"  // ← Tylko ze sklepu
/>

<AnalyticsStats 
  ownerId="user_123" 
  // Bez ownerDomain = wszystkie domeny tego użytkownika
/>
```

---

## ⚙️ Zmienne środowiskowe

Dodaj do pliku `.env`:

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-ABC123DEF4
VITE_GA_DEBUG=false

# GA4 Data API (dla backend)
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
```

---

## 🎨 Customizacja statystyk

Możesz łatwo dodać nowe statystyki edytując:

### **1. Dodaj nowy event w `/src/utils/analytics.ts`:**

```typescript
export const trackCustomAction = (actionName: string) => {
  trackEvent(
    WidgetEventCategory.INTERACTION,
    'custom_action',
    actionName,
    undefined,
    { action_name: actionName }
  );
};
```

### **2. Użyj w komponencie:**

```typescript
<button onClick={() => analytics.trackCustomAction('button_clicked')}>
  Kliknij mnie
</button>
```

### **3. Dodaj do interfejsu `WidgetAnalyticsSummary`:**

```typescript
export interface WidgetAnalyticsSummary {
  // ... existing fields
  customActionsCount: number;
}
```

### **4. Wyświetl w dashboardzie:**

```typescript
<StatCard
  title="Custom Actions"
  value={analytics.customActionsCount}
  icon={<Star className="w-5 h-5" />}
/>
```

---

## 🎉 Podsumowanie

✅ **Każdy event zawiera Owner ID** - automatyczne tagowanie  
✅ **Filtrowanie w GA4** - custom reports i segments  
✅ **Dashboard per użytkownik** - komponent `AnalyticsStats`  
✅ **Mockowane dane** - działa od razu bez backendu  
✅ **Backend ready** - gotowa struktura pod GA4 Data API  
✅ **Łatwa rozbudowa** - dodaj własne metryki  

**Teraz każdy użytkownik może zobaczyć TYLKO swoje statystyki! 🚀**
