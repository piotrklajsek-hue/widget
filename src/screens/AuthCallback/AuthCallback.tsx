import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleOAuthCallback, consumePendingAction, type AuthProvider } from '../../services/auth';

/**
 * OAuth Callback Page
 *
 * Obsluguje redirecty z providerow OAuth (Google, Facebook, TikTok, Instagram).
 * URL pattern: /auth/:provider/callback?code=...&state=...
 *
 * Flow:
 * 1. Provider redirectuje na /auth/google/callback?code=ABC&state=XYZ
 * 2. Ta strona odczytuje code i state z URL
 * 3. Wywoluje handleOAuthCallback() ktora:
 *    - Weryfikuje CSRF state
 *    - W production: wysyla code do backendu (POST /auth/callback)
 *    - W mock: tworzy fikcyjna sesje
 * 4. Po sukcesie: redirectuje na / z pending action
 * 5. Po bledzie: wyswietla komunikat
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Provider zwrocil blad (user odmowil dostepu)
    if (error) {
      setStatus('error');
      setErrorMessage(
        error === 'access_denied'
          ? 'Odmowiono dostepu. Sprobuj ponownie.'
          : `Blad autentykacji: ${error}`
      );
      return;
    }

    if (!code || !state || !provider) {
      setStatus('error');
      setErrorMessage('Brakujace parametry w URL. Sprobuj zalogowac sie ponownie.');
      return;
    }

    const validProviders: AuthProvider[] = ['google', 'facebook', 'tiktok', 'instagram'];
    if (!validProviders.includes(provider as AuthProvider)) {
      setStatus('error');
      setErrorMessage(`Nieobslugiwany provider: ${provider}`);
      return;
    }

    // Wymien code na sesje
    handleOAuthCallback(provider as AuthProvider, code, state)
      .then((result) => {
        if (result.success) {
          setStatus('success');

          // Odczytaj pending action i przekieruj
          const pending = consumePendingAction();
          const redirectUrl = pending
            ? `/?action=${pending.type}`
            : '/';

          // Krotkie opoznienie zeby user zobaczyl komunikat sukcesu
          setTimeout(() => {
            navigate(redirectUrl, { replace: true });
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Nieznany blad autentykacji');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Blad polaczenia z serwerem');
      });
  }, [provider, searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#18181B]">
      <div className="text-center space-y-4 px-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mx-auto" />
            <p className="text-white/70 text-sm">Logowanie przez {provider}...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
            <p className="text-white text-sm">Zalogowano! Przekierowywanie...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-white/70 text-sm max-w-xs mx-auto">{errorMessage}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-600 text-black rounded-lg transition-all text-sm"
            >
              Wróc na strone
            </button>
          </>
        )}
      </div>
    </div>
  );
}
