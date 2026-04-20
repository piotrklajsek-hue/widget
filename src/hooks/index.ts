/**
 * Custom hooks barrel export.
 *
 * Usage in LoclyWidget:
 *   import { useChat, useRecording, useWidgetAuth, useOpinions, useMobileOverlay, useWidgetUI } from '../hooks';
 */

export { useChat } from './useChat';
export type { ChatMessage } from './useChat';

export { useRecording } from './useRecording';

export { useWidgetAuth } from './useWidgetAuth';

export { useOpinions } from './useOpinions';
export type { Recommendation } from './useOpinions';

export { useMobileOverlay } from './useMobileOverlay';
export type { MobileView } from './useMobileOverlay';

export { useWidgetUI } from './useWidgetUI';
export type { UseWidgetUIOptions } from './useWidgetUI';

export { useOptionalNavigate, useOptionalSearchParams } from './useOptionalRouter';