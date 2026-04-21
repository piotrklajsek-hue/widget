/**
 * Locly Widget — Standalone Embed Entry Point
 *
 * This file is the entry point for embedding the Locly widget on
 * third-party websites. It renders LoclyWidget inside ShadowDOMWrapper
 * without React Router or the landing page.
 *
 * ────────────────────────────────────────────────────────────
 * USAGE (on third-party websites):
 *
 *   <!-- Option 1: Script tag (simplest) -->
 *   <div id="locly-widget"></div>
 *   <script src="https://cdn.locly.app/widget.js"></script>
 *
 *   <!-- Option 2: Script tag with config -->
 *   <div id="locly-widget"></div>
 *   <script>
 *     window.LOCLY_CONFIG = {
 *       websiteUrl: 'https://my-website.com',
 *       position: 'right',
 *       theme: { primary: '#3b82f6' },
 *       ownerId: 'user_abc123',
 *     };
 *   </script>
 *   <script src="https://cdn.locly.app/widget.js"></script>
 *
 * ────────────────────────────────────────────────────────────
 * BUILD:
 *
 *   Add to vite.config.ts:
 *
 *   build: {
 *     rollupOptions: {
 *       input: {
 *         main: 'index.html',
 *         widget: 'src/embed.tsx',
 *       },
 *       output: {
 *         entryFileNames: (chunk) =>
 *           chunk.name === 'widget' ? 'widget.js' : '[name]-[hash].js',
 *       },
 *     },
 *   }
 *
 * ────────────────────────────────────────────────────────────
 * ARCHITECTURE:
 *
 *   Host page
 *     └─ <div id="locly-widget">
 *          └─ ShadowDOMWrapper (CSS isolation)
 *               └─ LoclyWidget (all fixed-positioned)
 *               └─ Toaster
 *
 *   No React Router. No landing page. Pure widget.
 * ────────────────────────────────────────────────────────────
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { LoclyWidget } from './components/LoclyWidget';
import { ShadowDOMWrapper } from './components/ShadowDOMWrapper';
import type { LoclyWidgetProps } from './components/LoclyWidgetProps';
// Pull in Tailwind + theme + widget-scoped styles so the embed bundle
// ships with CSS (vite-plugin-css-injected-by-js will inline + inject
// them into document.head at runtime).
import './styles/index.css';

// Direct import so @tailwindcss/vite's content scan sees Home.tsx as a
// top-level graph node. Library builds routed through re-exports miss
// some utility classes (fractional spacings, arbitrary values, etc.).
import * as _homeForTailwind from './screens/Home/Home';
void _homeForTailwind;

// Read config from global variable (set by host page before this script loads)
declare global {
  interface Window {
    LOCLY_CONFIG?: LoclyWidgetProps;
  }
}

function EmbeddedWidget() {
  const config = window.LOCLY_CONFIG || {};

  return (
    <React.StrictMode>
      <ShadowDOMWrapper className="locly-widget">
        <LoclyWidget {...config} />
        <Toaster
          position="bottom-center"
          offset="50px"
          toastOptions={{
            style: {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: '0',
              width: 'fit-content',
              maxWidth: '560px',
            },
            className: 'custom-toast',
          }}
        />
      </ShadowDOMWrapper>
    </React.StrictMode>
  );
}

// ── Mount ──
function mount() {
  // Find or create container
  let container = document.getElementById('locly-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'locly-widget';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<EmbeddedWidget />);

  // Return cleanup function
  return () => root.unmount();
}

// Auto-mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}

// Export for programmatic usage
export { mount, LoclyWidget, ShadowDOMWrapper };
export type { LoclyWidgetProps };
