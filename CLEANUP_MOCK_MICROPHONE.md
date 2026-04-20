# 🧹 Instrukcja usuwania funkcjonalności MOCK mikrofonu

> **Dla programisty:** Ten plik zawiera szczegółową instrukcję usuwania tymczasowej funkcjonalności testowej mikrofonu (żółty przycisk z badge "T"), która została dodana do celów testowych w środowisku Figma Make.

---

## ⚠️ UWAGA
**Funkcjonalność mock mikrofonu jest TYLKO do testów.** Po zakończeniu testów lub przed wdrożeniem produkcyjnym, należy usunąć wszystkie elementy wymienione poniżej.

---

## 📍 Lokalizacja: `/src/app/pages/Home.tsx`

### 1️⃣ **STATE: Usuń state dla mock nagrywania**

**Linie: 117-118**

```tsx
// ❌ USUŃ TE LINIE:
const [isMockRecording, setIsMockRecording] = useState(false);
const mockAnimFrameRef = useRef<number | null>(null);
```

---

### 2️⃣ **FUNKCJE: Usuń wszystkie funkcje mock nagrywania**

**Linie: 1392-1450** (cała sekcja oznaczona komentarzem)

```tsx
// ❌ USUŃ CAŁĄ TĘ SEKCJĘ:

// ──────────────────────────────────────────────────────────────
// 🧪 MOCK RECORDING — symulacja nagrywania bez mikrofonu
// ──────────────────────────────────────────────────────────────
const startMockWaveform = () => {
  const animate = () => {
    setSearchRecordingLevels(prev => 
      prev.map(() => {
        // Random levels between 0.1 and 1.0 (10% to 100%)
        return Math.random() * 0.9 + 0.1;
      })
    );
    mockAnimFrameRef.current = requestAnimationFrame(animate);
  };
  animate();
};

const stopMockWaveform = () => {
  if (mockAnimFrameRef.current) {
    cancelAnimationFrame(mockAnimFrameRef.current);
    mockAnimFrameRef.current = null;
  }
  setSearchRecordingLevels(new Array(40).fill(0));
};

const handleMockVoiceInput = () => {
  if (isRecordingSearch) return;
  setIsMockRecording(true);
  setIsRecordingSearch(true);
  setSearchRecordedBlob(null);
  startMockWaveform();
};

const handleMockVoiceCancel = () => {
  stopMockWaveform();
  setIsMockRecording(false);
  setIsRecordingSearch(false);
  setSearchRecordedBlob(null);
};

const handleMockVoiceConfirm = async () => {
  stopMockWaveform();
  setIsRecordingSearch(false);
  setIsMockRecording(false);
  setIsTranscribing(true);

  // Symulacja transkrypcji — 1.5s delay
  await new Promise(r => setTimeout(r, 1500));

  // Przykładowe teksty do losowego wyboru
  const mockTexts = [
    'To jest testowa transkrypcja głosowa.',
    'Przykładowe zapytanie testowe do wyszukiwarki.',
    'Sprawdzam działanie interfejsu głosowego.'
  ];
  const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  
  setIsTranscribing(false);
  setInputValue(randomText);
};
```

---

### 3️⃣ **UI MULTILINE: Usuń żółty przycisk mock mikrofonu (wersja multiline)**

**Linie: 3089-3100** (przed prawdziwym przyciskiem mikrofonu w trybie multiline)

```tsx
// ❌ USUŃ TEN PRZYCISK:
{/* 🧪 Mock mic button (multiline) */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className=\"flex-shrink-0 rounded-lg p-2 transition-all text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/10 relative\"
  onClick={handleMockVoiceInput}
  title=\"🧪 Test nagrywania (mock)\"
>
  <Mic className=\"w-5 h-5\" />
  <span className=\"absolute -top-1 -right-1 text-[8px] bg-yellow-400 text-black rounded-full w-3.5 h-3.5 flex items-center justify-center\" style={{ lineHeight: 1 }}>T</span>
</motion.button>
```

---

### 4️⃣ **UI SINGLE-LINE: Usuń żółty przycisk mock mikrofonu (wersja single-line)**

**Linie: 3234-3244** (przed prawdziwym przyciskiem mikrofonu w trybie single-line)

```tsx
// ❌ USUŃ TEN PRZYCISK:
{/* 🧪 Mock mic button (single-line) */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className=\"flex-shrink-0 rounded-lg p-2 transition-all text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-400/10 relative\"
  onClick={handleMockVoiceInput}
  title=\"🧪 Test nagrywania (mock)\"
>
  <Mic className=\"w-5 h-5\" />
  <span className=\"absolute -top-1 -right-1 text-[8px] bg-yellow-400 text-black rounded-full w-3.5 h-3.5 flex items-center justify-center\" style={{ lineHeight: 1 }}>T</span>
</motion.button>
```

---

### 5️⃣ **BADGE "MOCK": Usuń wyświetlanie badge podczas nagrywania**

**Linie: 2846-2855** (w sekcji nagrywania - waveform)

```tsx
// ❌ USUŃ TEN BLOK:
{/* Mock badge */}
{isMockRecording && (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className=\"flex-shrink-0 text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full\"
  >
    MOCK
  </motion.span>
)}
```

---

### 6️⃣ **PRZYCISKI ANULUJ/ZATWIERDŹ: Usuń referencje do mock funkcji**

**Linia 2839** - Przycisk "Anuluj"
```tsx
// ❌ ZMIEŃ Z:
onClick={isMockRecording ? handleMockVoiceCancel : handleSearchVoiceCancel}

// ✅ NA:
onClick={handleSearchVoiceCancel}
```

**Linia 2887** - Przycisk "Zatwierdź"
```tsx
// ❌ ZMIEŃ Z:
onClick={isMockRecording ? handleMockVoiceConfirm : handleSearchVoiceConfirm}

// ✅ NA:
onClick={handleSearchVoiceConfirm}
```

---

## ✅ Checklist weryfikacji

Po usunięciu wszystkich powyższych elementów, sprawdź:

- [ ] Brak żółtego przycisku mikrofonu z badge "T" w trybie multiline
- [ ] Brak żółtego przycisku mikrofonu z badge "T" w trybie single-line  
- [ ] Brak badge "MOCK" podczas nagrywania
- [ ] Brak funkcji `handleMockVoiceInput`, `handleMockVoiceCancel`, `handleMockVoiceConfirm`
- [ ] Brak funkcji `startMockWaveform`, `stopMockWaveform`
- [ ] Brak state `isMockRecording` i `mockAnimFrameRef`
- [ ] Przyciski anuluj/zatwierdź używają tylko prawdziwych funkcji mikrofonu
- [ ] Aplikacja kompiluje się bez błędów
- [ ] Biały przycisk mikrofonu (prawdziwy) nadal działa poprawnie

---

## 🧪 Funkcjonalność, która ZOSTAJE (NIE USUWAĆ)

**Prawdziwy mikrofon** - wszystkie funkcje związane z:
- `isRecordingSearch` (state nagrywania)
- `handleSearchVoiceInput` (rozpoczęcie prawdziwego nagrywania)
- `handleSearchVoiceCancel` (anulowanie nagrywania)
- `handleSearchVoiceConfirm` (potwierdzenie i transkrypcja przez OpenAI Whisper)
- `isTranscribing` (state transkrypcji)
- `searchRecordingLevels` (waveform podczas nagrywania)
- `searchRecordingTimer` (timer nagrywania)
- API OpenAI Whisper (`VITE_OPENAI_API_KEY`)

---

## 📝 Notatki

- Mock funkcjonalność została dodana jako **obejście ograniczeń mikrofonu w Figma Make**
- Po przeniesieniu na normalne środowisko (localhost, staging, production), mock nie jest już potrzebny
- Wszystkie funkcje "prawdziwego" mikrofonu są w pełni funkcjonalne i zintegrowane z API OpenAI Whisper

---

**Data utworzenia:** 2025-03-13  
**Autor:** AI Assistant  
**Status:** ✅ Gotowe do wykonania przez programistę
