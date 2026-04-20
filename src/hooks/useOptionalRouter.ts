/**
 * useOptionalRouter — provides navigate & searchParams without requiring
 * React Router. Uses window.location as a universal fallback.
 *
 * This makes LoclyWidget work both inside the landing page (with Router)
 * and in standalone embed mode (without Router).
 */

import { useState, useCallback, useMemo } from 'react';

type NavigateFn = (to: string | number, opts?: any) => void;

/**
 * Returns a navigate function that uses window.location.
 */
export function useOptionalNavigate(): NavigateFn {
  return useMemo<NavigateFn>(() => (to, _opts) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else if (typeof to === 'string') {
      window.location.href = to;
    }
  }, []);
}

/**
 * Returns [searchParams, setSearchParams] using window.location.search.
 * Used only for reading OAuth callback params on mount.
 */
export function useOptionalSearchParams(): [URLSearchParams, (params: any, opts?: any) => void] {
  const [params] = useState(() => new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  ));

  const setParams = useCallback((_newParams: any, opts?: { replace?: boolean }) => {
    if (typeof window !== 'undefined' && opts?.replace) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return [params, setParams];
}
