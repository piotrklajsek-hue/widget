import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, MessageSquare, Star, Image, Clock, Search } from 'lucide-react';
import { fetchWidgetAnalytics, WidgetAnalyticsSummary, DATE_RANGE_PRESETS, formatDuration } from '../utils/analyticsAPI';

interface AnalyticsStatsProps {
  ownerId: string; // ID właściciela do filtrowania danych
  ownerDomain?: string; // Opcjonalnie domena
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon, subtitle, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-blue-50 ${getTrendColor()}`}>
          {icon}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 ml-1">vs poprzedni okres</span>
        </div>
      )}
    </div>
  );
}

export function AnalyticsStats({ ownerId, ownerDomain }: AnalyticsStatsProps) {
  const [analytics, setAnalytics] = useState<WidgetAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<keyof typeof DATE_RANGE_PRESETS>('last7Days');

  useEffect(() => {
    loadAnalytics();
  }, [ownerId, selectedRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual GA4 Property ID from environment
      const propertyId = import.meta.env.VITE_GA4_PROPERTY_ID || 'properties/123456789';
      const dateRange = DATE_RANGE_PRESETS[selectedRange];
      
      const data = await fetchWidgetAnalytics(propertyId, ownerId, dateRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ładowanie statystyk...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 font-medium">Brak danych analitycznych</p>
        <p className="text-sm text-blue-600 mt-1">Upewnij się, że widget jest poprawnie skonfigurowany</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statystyki widgetu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Domena: <span className="font-medium">{ownerDomain || 'Wszystkie'}</span>
          </p>
        </div>
        
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value as keyof typeof DATE_RANGE_PRESETS)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Dzisiaj</option>
          <option value="yesterday">Wczoraj</option>
          <option value="last7Days">Ostatnie 7 dni</option>
          <option value="last30Days">Ostatnie 30 dni</option>
          <option value="last90Days">Ostatnie 90 dni</option>
          <option value="thisMonth">Ten miesiąc</option>
          <option value="lastMonth">Poprzedni miesiąc</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Przegląd</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Całkowite interakcje"
            value={analytics.totalEvents.toLocaleString()}
            icon={<TrendingUp className="w-5 h-5" />}
            change={12.5}
            trend="up"
          />
          <StatCard
            title="Użytkownicy"
            value={analytics.totalUsers.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            change={8.3}
            trend="up"
          />
          <StatCard
            title="Sesje"
            value={analytics.totalSessions.toLocaleString()}
            icon={<MessageSquare className="w-5 h-5" />}
            change={-2.1}
            trend="down"
          />
          <StatCard
            title="Śr. czas trwania"
            value={formatDuration(analytics.avgSessionDuration)}
            icon={<Clock className="w-5 h-5" />}
            subtitle={`${analytics.avgSessionDuration}s`}
          />
        </div>
      </div>

      {/* Search Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wyszukiwania</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Całkowite wyszukiwania"
            value={analytics.totalSearches.toLocaleString()}
            icon={<Search className="w-5 h-5" />}
            change={15.7}
            trend="up"
          />
          <StatCard
            title="Średnia długość zapytania"
            value={`${analytics.avgQueryLength} znaków`}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            title="Wyszukiwania ze zdjęciami"
            value={analytics.searchesWithImages.toLocaleString()}
            icon={<Image className="w-5 h-5" />}
            subtitle={`${((analytics.searchesWithImages / analytics.totalSearches) * 100).toFixed(1)}% wszystkich`}
          />
        </div>
      </div>

      {/* Top Queries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Najpopularniejsze zapytania</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zapytanie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liczba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topQueries.map((query, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{query.query}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{query.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chat Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Konwersacje</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Sesje chatowe"
            value={analytics.totalChatSessions.toLocaleString()}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            title="Całkowite wiadomości"
            value={analytics.totalMessages.toLocaleString()}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            title="Śr. wiadomości/sesja"
            value={analytics.avgMessagesPerSession.toFixed(2)}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            title="Zakończone przez użytkownika"
            value={analytics.conversationEndedByUser.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            subtitle={`vs ${analytics.conversationEndedByTimeout} przez timeout`}
          />
        </div>
      </div>

      {/* Recommendations & Auth */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendacje & Autentykacja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Otwarcia rekomendacji"
            value={analytics.totalRecommendationsOpened.toLocaleString()}
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            title="Wyświetlone rekomendacje"
            value={analytics.totalRecommendationsViewed.toLocaleString()}
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            title="Próby logowania"
            value={analytics.totalAuthAttempts.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Logowania Google"
            value={analytics.authCompletedGoogle.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Współczynnik konwersji"
            value={`${analytics.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={analytics.conversionRate > 30 ? 'up' : analytics.conversionRate > 20 ? 'neutral' : 'down'}
          />
        </div>
      </div>

      {/* Query Types Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rozkład typów zapytań</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-3">
            {Object.entries(analytics.queryTypes).map(([type, count]) => {
              const total = Object.values(analytics.queryTypes).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Statystyki w czasie rzeczywistym</h4>
            <p className="text-sm text-blue-700">
              Dane są aktualizowane co 24 godziny. Aby zobaczyć statystyki w czasie rzeczywistym, 
              wejdź na <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Analytics</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
