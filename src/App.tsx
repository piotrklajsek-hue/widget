import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { ShadowDOMWrapper } from './components/ShadowDOMWrapper';

/**
 * App — root component.
 *
 * ARCHITECTURE:
 *   ShadowDOMWrapper provides full CSS isolation so the widget can be
 *   embedded on third-party pages without style conflicts.
 *
 *   For standalone widget embedding (without landing page), import
 *   LoclyWidget directly:
 *     import { LoclyWidget } from './components/LoclyWidget';
 *
 *   The landing page (Home) wraps LoclyWidget with the Dark1920W background.
 *   External sites only need LoclyWidget — no landing page content is copied.
 */
export function App() {
  return (
    <ShadowDOMWrapper className="locly-widget">
      <RouterProvider router={router} />
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
  );
}