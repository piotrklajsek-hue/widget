import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Edit2, AlertTriangle, X, Check, File, Loader2, Globe, Download, Search, Shield, Copy, CheckCircle, RefreshCw } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'file';
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConflictWarning {
  item: KnowledgeItem;
  conflicts: string[];
}

interface ParsedSection {
  id: string;
  title: string;
  content: string;
  selected: boolean;
}

export default function DataView() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      title: 'Godziny otwarcia',
      content: 'Nasz sklep jest otwarty od poniedziałku do piątku w godzinach 9:00-18:00, sobota 10:00-14:00.',
      type: 'text',
      createdAt: '2025-03-01',
      updatedAt: '2025-03-01'
    },
    {
      id: '2',
      title: 'Polityka zwrotów',
      content: 'Akceptujemy zwroty w ciągu 30 dni od daty zakupu. Produkt musi być w oryginalnym opakowaniu.',
      type: 'text',
      createdAt: '2025-03-02',
      updatedAt: '2025-03-02'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showParsedSectionsModal, setShowParsedSectionsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [conflictWarning, setConflictWarning] = useState<ConflictWarning | null>(null);
  const [pendingItem, setPendingItem] = useState<Partial<KnowledgeItem> | null>(null);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'text' | 'file'>('text');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isFetchingWebsite, setIsFetchingWebsite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'meta' | 'file'>('meta');
  const [copiedCode, setCopiedCode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate unique verification code on component mount
  const generateVerificationCode = () => {
    return 'figma-ai-verify-' + Math.random().toString(36).substring(2, 15);
  };

  // Initialize verification code
  if (!verificationCode) {
    setVerificationCode(generateVerificationCode());
  }

  const handleVerifyDomain = async () => {
    if (!websiteUrl.trim()) return;
    
    setIsVerifying(true);
    
    // Symulacja weryfikacji - w rzeczywistości byłoby to API call
    // sprawdzające czy meta tag lub plik weryfikacyjny istnieje na stronie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Symulacja sukcesu weryfikacji (w rzeczywistości sprawdzałoby rzeczywistą domenę)
    const verified = Math.random() > 0.3; // 70% szans na sukces dla demo
    
    setIsVerifying(false);
    setIsVerified(verified);
    
    if (verified) {
      setShowVerificationModal(false);
      // Po weryfikacji można zaczytać stronę
      handleFetchWebsite();
    } else {
      alert('Nie udało się zweryfikować własności domeny. Upewnij się, że kod weryfikacyjny został poprawnie umieszczony na stronie.');
    }
  };

  const copyVerificationCode = () => {
    const text = verificationMethod === 'meta' 
      ? `<meta name="figma-ai-verification" content="${verificationCode}" />`
      : verificationCode;
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Fallback for Safari / insecure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setNewTitle(file.name.split('.')[0]);
      setContentType('file');
      setShowAddModal(true);
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    
    // Symulacja odczytu pliku i parsowania
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      // Symulacja parsowania AI - dzielimy na sekcje
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sections = parseTextIntoSections(text, file.name);
      setParsedSections(sections);
      setIsProcessingFile(false);
      setShowAddModal(false);
      setShowParsedSectionsModal(true);
    };
    
    reader.readAsText(file);
  };

  const parseTextIntoSections = (text: string, fileName: string): ParsedSection[] => {
    // Symulacja AI parsowania - w rzeczywistości to byłoby API call do AI
    const sections: ParsedSection[] = [];
    
    // Dzielimy tekst na akapity
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
    
    paragraphs.forEach((paragraph, index) => {
      // Próbujemy wykryć tytuł (pierwsza linia jeśli krótsza niż 80 znaków)
      const lines = paragraph.trim().split('\n');
      let title = '';
      let content = '';
      
      if (lines[0].length < 80 && lines.length > 1) {
        title = lines[0].trim();
        content = lines.slice(1).join('\n').trim();
      } else {
        // Generujemy tytuł z pierwszych słów
        const words = paragraph.trim().split(' ').slice(0, 5);
        title = words.join(' ') + '...';
        content = paragraph.trim();
      }
      
      // Jeśli wykryjemy słowa kluczowe, dostosujmy tytuł
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('godzin') && lowerContent.includes('otwar')) {
        title = 'Godziny otwarcia';
      } else if (lowerContent.includes('zwrot') || lowerContent.includes('reklamacj')) {
        title = 'Polityka zwrotów';
      } else if (lowerContent.includes('dostaw') || lowerContent.includes('wysyłk')) {
        title = 'Informacje o dostawie';
      } else if (lowerContent.includes('płatnoś') || lowerContent.includes('zapłat')) {
        title = 'Metody płatności';
      } else if (lowerContent.includes('kontakt') || lowerContent.includes('adres')) {
        title = 'Dane kontaktowe';
      }
      
      sections.push({
        id: `section-${index}`,
        title,
        content,
        selected: true
      });
    });
    
    return sections;
  };

  const toggleSectionSelection = (id: string) => {
    setParsedSections(sections =>
      sections.map(section =>
        section.id === id ? { ...section, selected: !section.selected } : section
      )
    );
  };

  const handleAddSelectedSections = () => {
    const selectedSections = parsedSections.filter(s => s.selected);
    const newItems: KnowledgeItem[] = selectedSections.map(section => ({
      id: Date.now().toString() + Math.random().toString(36),
      title: section.title,
      content: section.content,
      type: 'text' as const,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }));
    
    setKnowledgeItems([...knowledgeItems, ...newItems]);
    setShowParsedSectionsModal(false);
    setParsedSections([]);
    setUploadedFile(null);
  };

  const detectConflicts = (newContent: string, newTitle: string, excludeId?: string): string[] => {
    const conflicts: string[] = [];
    const newWords = new Set(newContent.toLowerCase().split(/\s+/));
    
    knowledgeItems
      .filter(item => item.id !== excludeId)
      .forEach(item => {
        const itemWords = new Set(item.content.toLowerCase().split(/\s+/));
        const commonWords = Array.from(newWords).filter(word => 
          itemWords.has(word) && word.length > 4
        );
        
        if (commonWords.length > 3) {
          if (newContent.toLowerCase().includes('nie') && item.content.toLowerCase().includes('tak')) {
            conflicts.push(`Możliwy konflikt z "${item.title}": sprzeczne informacje`);
          } else if (item.title.toLowerCase().includes(newTitle.toLowerCase().slice(0, 5))) {
            conflicts.push(`Podobny temat do "${item.title}": może powodować duplikację`);
          }
        }
      });
    
    return conflicts;
  };

  const handleAdd = () => {
    if (!newTitle.trim() || (!newContent.trim() && !uploadedFile)) return;
    
    const content = contentType === 'file' && uploadedFile 
      ? `[Plik: ${uploadedFile.name}]` 
      : newContent;
    
    const conflicts = detectConflicts(content, newTitle);
    
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title: newTitle,
      content: content,
      type: contentType,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    if (conflicts.length > 0) {
      setConflictWarning({ item: newItem, conflicts });
      setPendingItem(newItem);
      setShowConflictModal(true);
    } else {
      setKnowledgeItems([...knowledgeItems, newItem]);
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleEdit = () => {
    if (!editingItem || !newTitle.trim() || !newContent.trim()) return;
    
    const conflicts = detectConflicts(newContent, newTitle, editingItem.id);
    
    const updatedItem: KnowledgeItem = {
      ...editingItem,
      title: newTitle,
      content: newContent,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    if (conflicts.length > 0) {
      setConflictWarning({ item: updatedItem, conflicts });
      setPendingItem(updatedItem);
      setShowConflictModal(true);
    } else {
      setKnowledgeItems(knowledgeItems.map(item => 
        item.id === editingItem.id ? updatedItem : item
      ));
      resetForm();
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const handleConflictResolve = (overwrite: boolean) => {
    if (!pendingItem) return;
    
    if (overwrite) {
      if (editingItem) {
        setKnowledgeItems(knowledgeItems.map(item => 
          item.id === editingItem.id ? pendingItem as KnowledgeItem : item
        ));
        setShowEditModal(false);
        setEditingItem(null);
      } else {
        setKnowledgeItems([...knowledgeItems, pendingItem as KnowledgeItem]);
        setShowAddModal(false);
      }
    }
    
    resetForm();
    setShowConflictModal(false);
    setConflictWarning(null);
    setPendingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten element?')) {
      setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item: KnowledgeItem) => {
    setEditingItem(item);
    setNewTitle(item.title);
    setNewContent(item.content);
    setContentType(item.type);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setUploadedFile(null);
    setContentType('text');
    setWebsiteUrl('');
    setIsFetchingWebsite(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setNewTitle(file.name.split('.')[0]);
    }
  };

  const handleFetchWebsite = async () => {
    if (!websiteUrl.trim()) return;
    
    // Check if domain is verified first
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    
    setIsFetchingWebsite(true);
    
    // Symulacja pobierania i parsowania strony www
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Przykładowa treść ze strony (w rzeczywistości byłoby to API call)
    const mockWebsiteContent = `
O firmie
Jesteśmy liderem w branży od ponad 15 lat. Nasza firma specjalizuje się w dostarczaniu najwyższej jakości produktów i usług.

Godziny otwarcia
Biuro jest czynne od poniedziałku do piątku w godzinach 8:00-17:00. W soboty pracujemy w godzinach 9:00-14:00. Niedziele i święta - nieczynne.

Polityka zwrotów
Wszystkie produkty można zwrócić w ciągu 14 dni od daty zakupu. Towar musi być nieużywany i w oryginalnym opakowaniu. Zwrot pieniędzy następuje w ciągu 7 dni roboczych.

Metody płatności
Akceptujemy płatności kartą, przelewem bankowym oraz BLIK. Dla firm oferujemy również płatność z odroczonym terminem płatności do 30 dni.

Dostawa
Oferujemy bezpłatną dostawę na terenie całej Polski dla zamówień powyżej 200 zł. Standardowa dostawa trwa 2-3 dni robocze. Dostępna jest również dostawa ekspresowa w 24h.

Kontakt
Email: kontakt@firma.pl
Telefon: +48 123 456 789
Adres: ul. Przykładowa 123, 00-001 Warszawa
    `;
    
    const sections = parseTextIntoSections(mockWebsiteContent, websiteUrl);
    setParsedSections(sections);
    setIsFetchingWebsite(false);
    setShowParsedSectionsModal(true);
  };

  // AI-powered semantic search
  const semanticKeywords: { [key: string]: string[] } = {
    'godziny': ['otwarcia', 'czynne', 'pracujemy', 'dostępni', 'od', 'do', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela', 'weekend', 'święta'],
    'zwrot': ['reklamacja', 'oddanie', 'zwrócić', 'refund', 'oddać', 'wymiana', 'anulowanie', 'rezygnacja', 'dni'],
    'dostawa': ['wysyłka', 'transport', 'kurier', 'przesyłka', 'dostarczenie', 'dni robocze', 'ekspresowa', 'bezpłatna'],
    'płatność': ['zapłata', 'karta', 'przelew', 'blik', 'gotówka', 'online', 'raty', 'faktura'],
    'kontakt': ['telefon', 'email', 'adres', 'lokalizacja', 'napisz', 'zadzwoń', 'biuro', 'siedziba'],
    'cena': ['koszt', 'wartość', 'kwota', 'opłata', 'zł', 'złoty', 'tani', 'drogi', 'promocja', 'rabat'],
    'produkt': ['towar', 'artykuł', 'przedmiot', 'item', 'asortyment', 'oferta'],
  };

  const findSemanticMatches = (query: string, text: string): number => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    let score = 0;

    // Exact phrase match - highest score
    if (textLower.includes(query.toLowerCase())) {
      score += 100;
    }

    // Check each word
    queryWords.forEach(word => {
      // Direct word match
      if (textLower.includes(word)) {
        score += 50;
      }

      // Semantic keyword matching
      Object.keys(semanticKeywords).forEach(key => {
        if (word.includes(key) || key.includes(word)) {
          // Check if any related keywords are in the text
          semanticKeywords[key].forEach(keyword => {
            if (textLower.includes(keyword)) {
              score += 30;
            }
          });
        }
      });
    });

    return score;
  };

  const filteredItems = knowledgeItems
    .map(item => {
      if (!searchQuery.trim()) return { item, score: 0 };
      
      const titleScore = findSemanticMatches(searchQuery, item.title);
      const contentScore = findSemanticMatches(searchQuery, item.content);
      const totalScore = titleScore * 2 + contentScore; // Title matches are worth more
      
      return { item, score: totalScore };
    })
    .filter(({ score }) => !searchQuery.trim() || score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  // Highlight matching text
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const words = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div 
      className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-[#0b5cff]/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-[16px] p-[40px] shadow-2xl border-2 border-dashed border-[#0b5cff]">
            <Upload className="w-[64px] h-[64px] text-[#0b5cff] mx-auto mb-[16px]" />
            <p className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a] text-center">
              Upuść plik tutaj
            </p>
            <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777] text-center mt-[8px]">
              Automatycznie dodamy go do bazy wiedzy
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sticky top-0 bg-white z-20 w-full border-b border-gray-100">
        <div className="flex flex-col justify-center size-full">
          <div className="content-stretch flex flex-col gap-[24px] items-start justify-center pl-[16px] sm:pl-[24px] lg:pl-[40px] pt-[40px] pb-[16px] relative w-full">
            <div className="flex items-center justify-between w-full pr-[16px] sm:pr-[24px] lg:pr-[40px]">
              <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[#1e232a] text-[28px]">
                Zarządzanie wiedzą AI
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#0b5cff] hover:bg-[#094ac9] text-white px-[20px] py-[10px] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] transition-all duration-200 flex items-center gap-[8px]"
              >
                <Upload className="w-[16px] h-[16px]" />
                Dodaj wiedzę
              </button>
            </div>
            <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic text-[#777] text-[14px] pr-[16px] sm:pr-[24px] lg:pr-[40px]">
              Dodaj, edytuj i zarządzaj treściami, które wzbogacą odpowiedzi AI. Przeciągnij plik - system automatycznie podzieli go na sekcje i wykryje potencjalne sprzeczności.
            </p>
            
            {/* Website URL Section */}
            <div className="w-full pr-[16px] sm:pr-[24px] lg:pr-[40px]">
              <div className="flex items-center gap-[12px]">
                <div className="flex-1 flex items-center gap-[8px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] px-[16px] py-[12px] border border-[#e0e0e0] focus-within:border-[#0b5cff] transition-all duration-200">
                  <Globe className="w-[20px] h-[20px] text-[#777]" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFetchWebsite()}
                    placeholder="Podaj URL strony firmowej (np. https://firma.pl)"
                    className="flex-1 bg-transparent font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] outline-none placeholder:text-[#999]"
                    disabled={isFetchingWebsite}
                  />
                </div>
                <button
                  onClick={handleFetchWebsite}
                  disabled={!websiteUrl.trim() || isFetchingWebsite}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-[24px] py-[12px] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] transition-all duration-200 flex items-center gap-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingWebsite ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      Pobieranie...
                    </>
                  ) : (
                    <>
                      <Download className="w-[18px] h-[18px]" />
                      Zaczytaj stronę
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="w-full pr-[16px] sm:pr-[24px] lg:pr-[40px]">
              <div className="flex items-center gap-[8px] bg-white rounded-[10px] px-[16px] py-[12px] border border-[#e0e0e0] focus-within:border-[#0b5cff] transition-all duration-200">
                <Search className="w-[20px] h-[20px] text-[#777]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj w bazie wiedzy... (np. 'znajdź godziny otwarcia', 'jak zwrócić produkt')"
                  className="flex-1 bg-transparent font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] outline-none placeholder:text-[#999]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-[4px] hover:bg-[#f5f5f7] rounded-[6px] transition-all duration-200"
                  >
                    <X className="w-[16px] h-[16px] text-[#777]" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-[12px] text-[#777] font-['Poppins:Medium',sans-serif] mt-[8px]">
                  Znaleziono: {filteredItems.length} {filteredItems.length === 1 ? 'element' : filteredItems.length < 5 ? 'elementy' : 'elementów'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto h-full px-[16px] sm:px-[24px] lg:px-[40px] py-[24px]">
        <div className="grid grid-cols-1 gap-[16px] max-w-[1400px]">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white border border-[#e0e0e0] rounded-[10px] p-[20px] hover:border-[#0b5cff] transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-[16px]">
                <div className="flex-1">
                  <div className="flex items-center gap-[12px] mb-[8px]">
                    {item.type === 'file' ? (
                      <File className="w-[20px] h-[20px] text-[#0b5cff]" />
                    ) : (
                      <FileText className="w-[20px] h-[20px] text-[#0b5cff]" />
                    )}
                    <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#1e232a]">
                      {item.title}
                    </h3>
                    {item.type === 'file' && item.fileSize && (
                      <span className="text-[12px] text-[#777] font-['Poppins:Medium',sans-serif]">
                        ({item.fileSize})
                      </span>
                    )}
                  </div>
                  <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777] line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex gap-[16px] mt-[12px]">
                    <span className="text-[12px] text-[#999] font-['Poppins:Medium',sans-serif]">
                      Utworzono: {item.createdAt}
                    </span>
                    <span className="text-[12px] text-[#999] font-['Poppins:Medium',sans-serif]">
                      Zaktualizowano: {item.updatedAt}
                    </span>
                  </div>
                </div>
                <div className="flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-[8px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[8px] transition-all duration-200"
                  >
                    <Edit2 className="w-[16px] h-[16px] text-[#1e232a]" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-[8px] bg-[#f5f5f7] hover:bg-[#fee] rounded-[8px] transition-all duration-200"
                  >
                    <Trash2 className="w-[16px] h-[16px] text-[#ff4444]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {knowledgeItems.length === 0 && (
            <div className="text-center py-[60px]">
              <FileText className="w-[48px] h-[48px] text-[#ddd] mx-auto mb-[16px]" />
              <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#777] mb-[8px]">
                Brak dodanych treści. Kliknij "Dodaj wiedzę" aby rozpocząć.
              </p>
              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#999]">
                Możesz również przeciągnąć i upuścić plik tutaj
              </p>
            </div>
          )}
          
          {knowledgeItems.length > 0 && filteredItems.length === 0 && (
            <div className="text-center py-[60px]">
              <Search className="w-[48px] h-[48px] text-[#ddd] mx-auto mb-[16px]" />
              <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#777] mb-[8px]">
                Brak wyników dla "{searchQuery}"
              </p>
              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#999]">
                Spróbuj użyć innych słów kluczowych
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            <div className="p-[24px] border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a]">
                  Dodaj nową wiedzę
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="p-[8px] hover:bg-[#f5f5f7] rounded-[8px] transition-all duration-200"
                >
                  <X className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
            
            <div className="p-[24px] space-y-[20px]">
              <div>
                <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                  Typ treści
                </label>
                <div className="flex gap-[12px]">
                  <button
                    onClick={() => setContentType('text')}
                    className={`flex-1 px-[16px] py-[10px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] transition-all duration-200 ${
                      contentType === 'text' 
                        ? 'bg-[#0b5cff] text-white' 
                        : 'bg-[#f5f5f7] text-[#1e232a] hover:bg-[#e9e9e9]'
                    }`}
                  >
                    Tekst
                  </button>
                  <button
                    onClick={() => setContentType('file')}
                    className={`flex-1 px-[16px] py-[10px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] transition-all duration-200 ${
                      contentType === 'file' 
                        ? 'bg-[#0b5cff] text-white' 
                        : 'bg-[#f5f5f7] text-[#1e232a] hover:bg-[#e9e9e9]'
                    }`}
                  >
                    Plik
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                  Tytuł
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Np. Godziny otwarcia, Polityka zwrotów"
                  className="w-full px-[16px] py-[12px] border border-[#e0e0e0] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] focus:outline-none focus:border-[#0b5cff] transition-all duration-200"
                />
              </div>

              {contentType === 'text' ? (
                <div>
                  <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                    Treść
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Wpisz treść, która wzbogaci wiedzę AI..."
                    rows={6}
                    className="w-full px-[16px] py-[12px] border border-[#e0e0e0] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] focus:outline-none focus:border-[#0b5cff] transition-all duration-200 resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                    Plik
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-[16px] py-[32px] border-2 border-dashed border-[#e0e0e0] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] text-[#777] hover:border-[#0b5cff] hover:text-[#0b5cff] transition-all duration-200 flex flex-col items-center gap-[8px]"
                  >
                    <Upload className="w-[24px] h-[24px]" />
                    {uploadedFile ? uploadedFile.name : 'Kliknij aby wybrać plik'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-[24px] border-t border-gray-100 flex gap-[12px] justify-end">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-[20px] py-[10px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] transition-all duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim() || (!newContent.trim() && !uploadedFile)}
                className="px-[20px] py-[10px] bg-[#0b5cff] hover:bg-[#094ac9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            <div className="p-[24px] border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a]">
                  Edytuj wiedzę
                </h2>
                <button
                  onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
                  className="p-[8px] hover:bg-[#f5f5f7] rounded-[8px] transition-all duration-200"
                >
                  <X className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
            
            <div className="p-[24px] space-y-[20px]">
              <div>
                <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                  Tytuł
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-[16px] py-[12px] border border-[#e0e0e0] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] focus:outline-none focus:border-[#0b5cff] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[8px]">
                  Treść
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full px-[16px] py-[12px] border border-[#e0e0e0] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] focus:outline-none focus:border-[#0b5cff] transition-all duration-200 resize-none"
                />
              </div>
            </div>

            <div className="p-[24px] border-t border-gray-100 flex gap-[12px] justify-end">
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null); resetForm(); }}
                className="px-[20px] py-[10px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] transition-all duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleEdit}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-[20px] py-[10px] bg-[#0b5cff] hover:bg-[#094ac9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal && conflictWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] max-w-[600px] w-full">
            <div className="p-[24px] border-b border-gray-100">
              <div className="flex items-center gap-[12px]">
                <AlertTriangle className="w-[24px] h-[24px] text-[#ff9800]" />
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a]">
                  Wykryto potencjalne sprzeczności
                </h2>
              </div>
            </div>
            
            <div className="p-[24px] space-y-[16px]">
              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777]">
                System wykrył następujące potencjalne sprzeczności z istniejącymi danymi:
              </p>
              
              <div className="space-y-[12px]">
                {conflictWarning.conflicts.map((conflict, index) => (
                  <div key={index} className="bg-[#fff3cd] border border-[#ffc107] rounded-[8px] p-[12px]">
                    <p className="font-['Poppins:Medium',sans-serif] text-[13px] text-[#856404]">
                      {conflict}
                    </p>
                  </div>
                ))}
              </div>

              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777]">
                Czy chcesz kontynuować i dodać tę treść pomimo wykrytych sprzeczności?
              </p>
            </div>

            <div className="p-[24px] border-t border-gray-100 flex gap-[12px] justify-end">
              <button
                onClick={() => handleConflictResolve(false)}
                className="px-[20px] py-[10px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] transition-all duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleConflictResolve(true)}
                className="px-[20px] py-[10px] bg-[#ff9800] hover:bg-[#e68900] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-white transition-all duration-200 flex items-center gap-[8px]"
              >
                <Check className="w-[16px] h-[16px]" />
                Dodaj mimo to
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Sections Modal */}
      {showParsedSectionsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] max-w-[800px] w-full max-h-[90vh] flex flex-col">
            <div className="p-[24px] border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a]">
                    AI wykryło {parsedSections.length} {parsedSections.length === 1 ? 'sekcję' : parsedSections.length < 5 ? 'sekcje' : 'sekcji'}
                  </h2>
                  <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777] mt-[4px]">
                    Wybierz sekcje, które chcesz dodać do bazy wiedzy
                  </p>
                </div>
                <button
                  onClick={() => { setShowParsedSectionsModal(false); setParsedSections([]); setUploadedFile(null); }}
                  className="p-[8px] hover:bg-[#f5f5f7] rounded-[8px] transition-all duration-200"
                >
                  <X className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-[24px]">
              <div className="space-y-[16px]">
                {parsedSections.map(section => (
                  <div
                    key={section.id}
                    className={`border rounded-[10px] p-[16px] transition-all duration-200 cursor-pointer ${
                      section.selected
                        ? 'border-[#0b5cff] bg-[#f0f7ff]'
                        : 'border-[#e0e0e0] hover:border-[#0b5cff]/50'
                    }`}
                    onClick={() => toggleSectionSelection(section.id)}
                  >
                    <div className="flex items-start gap-[12px]">
                      <input
                        type="checkbox"
                        checked={section.selected}
                        onChange={() => toggleSectionSelection(section.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-[2px] w-[20px] h-[20px] text-[#0b5cff] border-[#e0e0e0] rounded-[4px] focus:ring-[#0b5cff] focus:ring-offset-[2px] cursor-pointer"
                      />
                      <div className="flex-1">
                        <h3 className="font-['Poppins:SemiBold',sans-serif] text-[15px] text-[#1e232a] mb-[8px]">
                          {section.title}
                        </h3>
                        <p className="font-['Poppins:Medium',sans-serif] text-[13px] text-[#777] line-clamp-3">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-[24px] border-t border-gray-100 flex gap-[12px] justify-between items-center">
              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777]">
                {parsedSections.filter(s => s.selected).length} z {parsedSections.length} zaznaczonych
              </p>
              <div className="flex gap-[12px]">
                <button
                  onClick={() => { setShowParsedSectionsModal(false); setParsedSections([]); setUploadedFile(null); }}
                  className="px-[20px] py-[10px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] transition-all duration-200"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddSelectedSections}
                  disabled={parsedSections.filter(s => s.selected).length === 0}
                  className="px-[20px] py-[10px] bg-[#0b5cff] hover:bg-[#094ac9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
                >
                  <Check className="w-[16px] h-[16px]" />
                  Dodaj wybrane
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] p-[40px] max-w-[400px] w-full text-center">
            <Loader2 className="w-[64px] h-[64px] text-[#0b5cff] mx-auto mb-[24px] animate-spin" />
            <h3 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a] mb-[8px]">
              Przetwarzanie pliku...
            </h3>
            <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777]">
              AI analizuje treść i dzieli ją na logiczne sekcje
            </p>
          </div>
        </div>
      )}

      {/* Domain Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[16px] max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
            <div className="p-[24px] border-b border-gray-100">
              <div className="flex items-center gap-[12px]">
                <Shield className="w-[24px] h-[24px] text-[#0b5cff]" />
                <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-[#1e232a]">
                  Weryfikacja własności domeny
                </h2>
              </div>
              <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-[#777] mt-[8px]">
                Aby zaczytać stronę {extractDomain(websiteUrl)}, musisz zweryfikować, że jesteś jej właścicielem.
              </p>
            </div>
            
            <div className="p-[24px] space-y-[24px]">
              {/* Verification Method Selection */}
              <div>
                <label className="block font-['Poppins:Medium',sans-serif] text-[14px] text-[#1e232a] mb-[12px]">
                  Wybierz metodę weryfikacji:
                </label>
                <div className="grid grid-cols-2 gap-[12px]">
                  <button
                    onClick={() => setVerificationMethod('meta')}
                    className={`p-[16px] border rounded-[10px] text-left transition-all duration-200 ${
                      verificationMethod === 'meta'
                        ? 'border-[#0b5cff] bg-[#f0f7ff]'
                        : 'border-[#e0e0e0] hover:border-[#0b5cff]/50'
                    }`}
                  >
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <Globe className="w-[18px] h-[18px] text-[#0b5cff]" />
                      <span className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a]">
                        Meta tag HTML
                      </span>
                    </div>
                    <p className="font-['Poppins:Medium',sans-serif] text-[12px] text-[#777]">
                      Dodaj tag do sekcji &lt;head&gt; swojej strony
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setVerificationMethod('file')}
                    className={`p-[16px] border rounded-[10px] text-left transition-all duration-200 ${
                      verificationMethod === 'file'
                        ? 'border-[#0b5cff] bg-[#f0f7ff]'
                        : 'border-[#e0e0e0] hover:border-[#0b5cff]/50'
                    }`}
                  >
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <FileText className="w-[18px] h-[18px] text-[#0b5cff]" />
                      <span className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a]">
                        Plik HTML
                      </span>
                    </div>
                    <p className="font-['Poppins:Medium',sans-serif] text-[12px] text-[#777]">
                      Wgraj plik na serwer w głównym katalogu
                    </p>
                  </button>
                </div>
              </div>

              {/* Instructions based on selected method */}
              {verificationMethod === 'meta' ? (
                <div className="bg-[#f5f5f7] rounded-[10px] p-[20px]">
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] mb-[12px]">
                    Instrukcje weryfikacji przez meta tag:
                  </h3>
                  <ol className="space-y-[8px] font-['Poppins:Medium',sans-serif] text-[13px] text-[#777] list-decimal list-inside">
                    <li>Skopiuj poniższy kod meta tag</li>
                    <li>Wklej go w sekcji &lt;head&gt; Twojej strony głównej</li>
                    <li>Upewnij się, że strona została zaktualizowana</li>
                    <li>Kliknij przycisk "Weryfikuj domenę"</li>
                  </ol>
                  
                  <div className="mt-[16px]">
                    <label className="block font-['Poppins:Medium',sans-serif] text-[13px] text-[#1e232a] mb-[8px]">
                      Kod do wklejenia:
                    </label>
                    <div className="relative">
                      <div className="bg-[#1e232a] rounded-[8px] p-[16px] pr-[60px] font-mono text-[12px] text-[#28a745] overflow-x-auto">
                        {`<meta name="figma-ai-verification" content="${verificationCode}" />`}
                      </div>
                      <button
                        onClick={copyVerificationCode}
                        className="absolute right-[12px] top-[12px] p-[8px] bg-[#333] hover:bg-[#444] rounded-[6px] transition-all duration-200"
                      >
                        {copiedCode ? (
                          <CheckCircle className="w-[16px] h-[16px] text-[#28a745]" />
                        ) : (
                          <Copy className="w-[16px] h-[16px] text-white" />
                        )}
                      </button>
                    </div>
                    {copiedCode && (
                      <p className="text-[12px] text-[#28a745] font-['Poppins:Medium',sans-serif] mt-[8px] flex items-center gap-[4px]">
                        <CheckCircle className="w-[14px] h-[14px]" />
                        Kod skopiowany do schowka!
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#f5f5f7] rounded-[10px] p-[20px]">
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] mb-[12px]">
                    Instrukcje weryfikacji przez plik HTML:
                  </h3>
                  <ol className="space-y-[8px] font-['Poppins:Medium',sans-serif] text-[13px] text-[#777] list-decimal list-inside">
                    <li>Skopiuj poniższy kod weryfikacyjny</li>
                    <li>Utwórz plik o nazwie <code className="bg-white px-[6px] py-[2px] rounded text-[#0b5cff]">figma-ai-verify.html</code></li>
                    <li>Wklej skopiowany kod do tego pliku</li>
                    <li>Wgraj plik na serwer w głównym katalogu (np. https://twoja-domena.pl/figma-ai-verify.html)</li>
                    <li>Kliknij przycisk "Weryfikuj domenę"</li>
                  </ol>
                  
                  <div className="mt-[16px]">
                    <label className="block font-['Poppins:Medium',sans-serif] text-[13px] text-[#1e232a] mb-[8px]">
                      Kod weryfikacyjny:
                    </label>
                    <div className="relative">
                      <div className="bg-[#1e232a] rounded-[8px] p-[16px] pr-[60px] font-mono text-[12px] text-[#28a745] overflow-x-auto">
                        {verificationCode}
                      </div>
                      <button
                        onClick={copyVerificationCode}
                        className="absolute right-[12px] top-[12px] p-[8px] bg-[#333] hover:bg-[#444] rounded-[6px] transition-all duration-200"
                      >
                        {copiedCode ? (
                          <CheckCircle className="w-[16px] h-[16px] text-[#28a745]" />
                        ) : (
                          <Copy className="w-[16px] h-[16px] text-white" />
                        )}
                      </button>
                    </div>
                    {copiedCode && (
                      <p className="text-[12px] text-[#28a745] font-['Poppins:Medium',sans-serif] mt-[8px] flex items-center gap-[4px]">
                        <CheckCircle className="w-[14px] h-[14px]" />
                        Kod skopiowany do schowka!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-[#fff3cd] border border-[#ffc107] rounded-[10px] p-[16px]">
                <div className="flex items-start gap-[12px]">
                  <AlertTriangle className="w-[18px] h-[18px] text-[#856404] mt-[2px] flex-shrink-0" />
                  <div>
                    <h4 className="font-['Poppins:SemiBold',sans-serif] text-[13px] text-[#856404] mb-[4px]">
                      Dlaczego weryfikacja jest wymagana?
                    </h4>
                    <p className="font-['Poppins:Medium',sans-serif] text-[12px] text-[#856404]">
                      Weryfikacja zapobiega dodawaniu treści z domen innych firm. Dzięki temu masz pewność, że tylko właściciel strony może zarządzać jej danymi w systemie AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-[24px] border-t border-gray-100 flex gap-[12px] justify-end">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-[20px] py-[10px] bg-[#f5f5f7] hover:bg-[#e9e9e9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#1e232a] transition-all duration-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleVerifyDomain}
                disabled={isVerifying}
                className="px-[20px] py-[10px] bg-[#0b5cff] hover:bg-[#094ac9] rounded-[10px] font-['Poppins:SemiBold',sans-serif] text-[14px] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-[16px] h-[16px] animate-spin" />
                    Weryfikowanie...
                  </>
                ) : (
                  <>
                    <Shield className="w-[16px] h-[16px]" />
                    Weryfikuj domenę
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}