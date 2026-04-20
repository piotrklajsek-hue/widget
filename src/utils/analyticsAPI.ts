// Google Analytics 4 Data API - for fetching analytics in admin dashboard
// This uses GA4 Data API to retrieve statistics filtered by owner/domain

export interface AnalyticsDateRange {
  startDate: string; // Format: YYYY-MM-DD or 'today', '7daysAgo', etc.
  endDate: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
}

export interface AnalyticsDimension {
  name: string;
  value: string;
}

export interface AnalyticsRow {
  dimensions: AnalyticsDimension[];
  metrics: AnalyticsMetric[];
}

export interface WidgetAnalyticsSummary {
  // Overview
  totalEvents: number;
  totalUsers: number;
  totalSessions: number;
  avgSessionDuration: number; // in seconds
  
  // Search analytics
  totalSearches: number;
  avgQueryLength: number;
  searchesWithImages: number;
  
  // Chat analytics
  totalChatSessions: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  conversationEndedByUser: number;
  conversationEndedByTimeout: number;
  
  // Recommendations
  totalRecommendationsOpened: number;
  totalRecommendationsViewed: number;
  seeMoreClicks: number;
  seeWhoClicks: number;
  
  // Authentication
  totalAuthAttempts: number;
  authCompletedGoogle: number;
  authCompletedFacebook: number;
  conversionRate: number; // % of users who authenticated
  
  // Images
  totalImagesAdded: number;
  imagesFromUpload: number;
  imagesFromPaste: number;
  
  // Engagement
  micButtonClicks: number;
  settingsClicks: number;
  loclyLinkClicks: number;
  avgTimeToFirstInteraction: number; // in seconds
  
  // Top queries
  topQueries: Array<{ query: string; count: number }>;
  
  // Query types distribution
  queryTypes: {
    website: number;
    mobile_app: number;
    crm_system: number;
    dashboard_analytics: number;
    general: number;
  };
}

/**
 * Fetch analytics data from GA4 Data API
 * 
 * IMPORTANT: This requires:
 * 1. Google Cloud Project with Analytics Data API enabled
 * 2. Service Account with "Viewer" role on GA4 property
 * 3. Service Account credentials (JSON key file)
 * 
 * For server-side implementation (recommended):
 * - Use this on your backend API
 * - Never expose credentials in frontend code
 * 
 * @param propertyId - GA4 Property ID (format: "properties/123456789")
 * @param ownerId - Filter by specific owner ID
 * @param dateRange - Date range for the report
 */
export async function fetchWidgetAnalytics(
  propertyId: string,
  ownerId: string,
  dateRange: AnalyticsDateRange = { startDate: '7daysAgo', endDate: 'today' }
): Promise<WidgetAnalyticsSummary> {
  const apiBase = import.meta.env?.VITE_API_BASE_URL || '';
  const apiKey = import.meta.env?.VITE_API_KEY || '';

  // ── PRODUCTION MODE ──
  if (apiBase) {
    try {
      const params = new URLSearchParams({
        ownerId,
        propertyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const response = await fetch(`${apiBase}/analytics/widget?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      if (!response.ok) throw new Error(`Analytics API: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('[Analytics API] Błąd, fallback na mock:', error);
    }
  } else {
    console.info(
      '📊 Analytics API nie skonfigurowane. Używam mock danych.\n' +
      'Aby podłączyć, ustaw VITE_API_BASE_URL w .env\n' +
      'Backend endpoint: GET /analytics/widget?ownerId=...&startDate=...&endDate=...'
    );
  }

  // ── MOCK MODE ──
  // Symulacja opóźnienia sieciowego
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  return getMockAnalytics(ownerId, dateRange);
}

/**
 * Server-side function example (implement on your backend)
 * 
 * This should be implemented in your backend (Node.js, Python, etc.)
 * 
 * Example using @google-analytics/data npm package:
 * 
 * ```typescript
 * import { BetaAnalyticsDataClient } from '@google-analytics/data';
 * 
 * const analyticsDataClient = new BetaAnalyticsDataClient({
 *   credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY)
 * });
 * 
 * async function getWidgetAnalytics(propertyId: string, ownerId: string, dateRange: AnalyticsDateRange) {
 *   const [response] = await analyticsDataClient.runReport({
 *     property: `properties/${propertyId}`,
 *     dateRanges: [dateRange],
 *     dimensions: [
 *       { name: 'eventName' },
 *       { name: 'customEvent:widget_owner_id' }
 *     ],
 *     metrics: [
 *       { name: 'eventCount' },
 *       { name: 'totalUsers' }
 *     ],
 *     dimensionFilter: {
 *       filter: {
 *         fieldName: 'customEvent:widget_owner_id',
 *         stringFilter: {
 *           value: ownerId,
 *           matchType: 'EXACT'
 *         }
 *       }
 *     }
 *   });
 *   
 *   return processGA4Response(response);
 * }
 * ```
 */
export const serverSideAnalyticsExample = `
// Backend API endpoint (Express.js example)
// File: /api/analytics/widget.ts

import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY)
});

app.get('/api/analytics/widget', async (req, res) => {
  const { ownerId, startDate, endDate } = req.query;
  const propertyId = process.env.GA4_PROPERTY_ID;
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: \`properties/\${propertyId}\`,
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
    
    const analytics = processGA4Response(response);
    res.json(analytics);
  } catch (error) {
    console.error('GA4 API Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
`;

/**
 * Mock analytics data for development/testing
 */
function getMockAnalytics(ownerId: string, dateRange: AnalyticsDateRange): WidgetAnalyticsSummary {
  return {
    totalEvents: 1247,
    totalUsers: 342,
    totalSessions: 456,
    avgSessionDuration: 184, // seconds
    
    totalSearches: 289,
    avgQueryLength: 42,
    searchesWithImages: 67,
    
    totalChatSessions: 289,
    totalMessages: 734,
    avgMessagesPerSession: 2.54,
    conversationEndedByUser: 198,
    conversationEndedByTimeout: 91,
    
    totalRecommendationsOpened: 156,
    totalRecommendationsViewed: 234,
    seeMoreClicks: 89,
    seeWhoClicks: 67,
    
    totalAuthAttempts: 156,
    authCompletedGoogle: 98,
    authCompletedFacebook: 34,
    conversionRate: 38.6, // %
    
    totalImagesAdded: 67,
    imagesFromUpload: 45,
    imagesFromPaste: 22,
    
    micButtonClicks: 23,
    settingsClicks: 12,
    loclyLinkClicks: 34,
    avgTimeToFirstInteraction: 8.5,
    
    topQueries: [
      { query: 'Ile kosztuje strona internetowa?', count: 45 },
      { query: 'Aplikacja mobilna cennik', count: 38 },
      { query: 'CRM dla małej firmy', count: 29 },
      { query: 'Dashboard analytics', count: 23 },
      { query: 'Strona e-commerce', count: 18 }
    ],
    
    queryTypes: {
      website: 142,
      mobile_app: 89,
      crm_system: 34,
      dashboard_analytics: 18,
      general: 6
    }
  };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

/**
 * Get date range presets
 */
export const DATE_RANGE_PRESETS = {
  today: { startDate: 'today', endDate: 'today' },
  yesterday: { startDate: 'yesterday', endDate: 'yesterday' },
  last7Days: { startDate: '7daysAgo', endDate: 'today' },
  last30Days: { startDate: '30daysAgo', endDate: 'today' },
  last90Days: { startDate: '90daysAgo', endDate: 'today' },
  thisMonth: { startDate: '2026-03-01', endDate: 'today' }, // Current month
  lastMonth: { startDate: '2026-02-01', endDate: '2026-02-28' }
};

/**
 * SETUP INSTRUCTIONS FOR BACKEND IMPLEMENTATION
 * 
 * 1. Enable GA4 Data API:
 *    - Go to: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
 *    - Click "Enable"
 * 
 * 2. Create Service Account:
 *    - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
 *    - Create new service account
 *    - Download JSON key file
 * 
 * 3. Grant access to GA4 property:
 *    - Go to GA4 Admin → Property Access Management
 *    - Add service account email with "Viewer" role
 * 
 * 4. Install dependencies:
 *    npm install @google-analytics/data
 * 
 * 5. Set environment variables:
 *    GA4_PROPERTY_ID=123456789
 *    GA4_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
 * 
 * 6. Implement backend endpoint (see serverSideAnalyticsExample)
 * 
 * 7. Update this file to call your backend:
 *    const response = await fetch(`/api/analytics/widget?ownerId=${ownerId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
 *    return response.json();
 */