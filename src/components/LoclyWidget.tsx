/**
 * LoclyWidget — standalone, embeddable widget component.
 *
 * USAGE ON EXTERNAL PAGES:
 *
 *   import { LoclyWidget } from './components/LoclyWidget';
 *
 *   function ThirdPartyPage() {
 *     return (
 *       <div>
 *         <h1>My website content</h1>
 *         <LoclyWidget />
 *       </div>
 *     );
 *   }
 *
 * The widget renders only fixed-positioned elements (search bar, chat overlay,
 * modals, mobile overlays) so it won't interfere with host-page layout.
 *
 * For full CSS isolation when embedding on third-party sites, wrap with
 * ShadowDOMWrapper:
 *
 *   import { ShadowDOMWrapper } from './ShadowDOMWrapper';
 *   import { LoclyWidget } from './LoclyWidget';
 *
 *   <ShadowDOMWrapper className="locly-widget">
 *     <LoclyWidget websiteUrl="https://my-site.com" position="right" />
 *   </ShadowDOMWrapper>
 *
 * CONFIGURABLE PROPS:
 *
 *   <LoclyWidget
 *     websiteUrl="https://my-website.com"
 *     position="center"              // 'left' | 'center' | 'right'
 *     ownerName="My Business"
 *     ownerId="user_abc123"
 *     gaMeasurementId="G-XXXXXXXXXX"
 *     enableVoice={true}
 *     enableImages={true}
 *     showSocialProof={true}
 *     placeholders={["Ask anything...", "Search..."]}
 *     theme={{ primary: '#3b82f6', borderRadius: '12px' }}
 *     onMessage={(msg, imgs) => console.log('User sent:', msg)}
 *     onToggle={(isOpen) => console.log('Widget open:', isOpen)}
 *   />
 *
 * ARCHITECTURE:
 *
 *   ┌─────────────────────────────────────┐
 *   │  Host page (any website)            │
 *   │                                     │
 *   │  ┌───────────────────────────────┐  │
 *   │  │  ShadowDOMWrapper (CSS fence) │  │
 *   │  │                               │  │
 *   │  │  ┌─────────────────────────┐  │  │
 *   │  │  │  LoclyWidget            │  │  │
 *   │  │  │  • Search bar (fixed)   │  │  │
 *   │  │  │  • Chat overlay (fixed) │  │  │
 *   │  │  │  • Auth modal (fixed)   │  │  │
 *   │  │  │  • Mobile overlays      │  │  │
 *   │  │  └─────────────────────────┘  │  │
 *   │  └───────────────────────────────┘  │
 *   └─────────────────────────────────────┘
 *
 *   Host → Widget:  Shadow DOM blocks host CSS.  ✅
 *   Widget → Host:  Widget uses only fixed positioning,
 *                   no layout side-effects on host.  ✅
 */

export { LoclyWidget } from '../screens/Home/Home';
export type { LoclyWidgetProps } from './LoclyWidgetProps';
