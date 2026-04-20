/**
 * LoclyWidgetProps — configuration interface for the embeddable widget.
 *
 * All props are optional with sensible defaults, making the widget
 * zero-config for quick embedding:
 *
 *   <LoclyWidget />                         // all defaults
 *   <LoclyWidget position="left" />          // bottom-left
 *   <LoclyWidget theme={{ primary: '#3b82f6' }} />  // blue accent
 */

export interface LoclyWidgetTheme {
  /** Primary accent color (default: '#FADA00' — yellow) */
  primary?: string;
  /** Primary text color on primary bg (default: '#000') */
  primaryForeground?: string;
  /** Widget background (glass effect base, default: 'rgba(0,0,0,0.5)') */
  widgetBg?: string;
  /** Widget border color (default: 'rgba(255,255,255,0.2)') */
  widgetBorder?: string;
  /** Text color (default: '#fff') */
  textColor?: string;
  /** Muted text color (default: 'rgba(255,255,255,0.7)') */
  mutedTextColor?: string;
  /** Border radius for the search bar (default: '16px') */
  borderRadius?: string;
}

export interface LoclyWidgetProps {
  /**
   * The URL of the website to search / scrape for answers.
   * When set, the LLM search service will use this as the target domain.
   * Default: current window.location.origin
   */
  websiteUrl?: string;

  /**
   * Widget position on the page.
   * Default: 'center'
   */
  position?: 'left' | 'center' | 'right';

  /**
   * Theme overrides for colors and styling.
   */
  theme?: LoclyWidgetTheme;

  /**
   * Owner / business name shown in the about modal.
   * Default: 'locly'
   */
  ownerName?: string;

  /**
   * Owner ID for analytics.
   * Default: 'demo_user_123'
   */
  ownerId?: string;

  /**
   * Google Analytics Measurement ID (e.g. 'G-XXXXXXXXXX').
   * Default: from VITE_GA_MEASUREMENT_ID env var
   */
  gaMeasurementId?: string;

  /**
   * Placeholder texts that rotate in the search bar.
   * Default: ["Zapytaj o cokolwiek...", "Zapytaj o cennik...", "Znajdź odpowiedź na pytanie..."]
   */
  placeholders?: string[];

  /**
   * Whether to show the recommendations / social proof section.
   * Default: true
   */
  showSocialProof?: boolean;

  /**
   * Whether to enable voice input (microphone button).
   * Default: true
   */
  enableVoice?: boolean;

  /**
   * Whether to enable image attachments (plus button).
   * Default: true
   */
  enableImages?: boolean;

  /**
   * Callback fired when the widget sends a user message.
   */
  onMessage?: (message: string, images?: string[]) => void;

  /**
   * Callback fired when the widget opens/closes.
   */
  onToggle?: (isOpen: boolean) => void;

  /**
   * Initial collapsed state.
   * Default: false
   */
  initialCollapsed?: boolean;

  /**
   * Language code for UI strings.
   * Default: 'pl'
   */
  locale?: 'pl' | 'en';
}

/** Default props values */
export const DEFAULT_WIDGET_PROPS: Required<Pick<
  LoclyWidgetProps,
  'position' | 'ownerName' | 'ownerId' | 'showSocialProof' | 'enableVoice' | 'enableImages' | 'initialCollapsed' | 'locale'
>> = {
  position: 'center',
  ownerName: 'locly',
  ownerId: 'demo_user_123',
  showSocialProof: true,
  enableVoice: true,
  enableImages: true,
  initialCollapsed: false,
  locale: 'pl',
};
