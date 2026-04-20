import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual login logic
    navigate('/admin');
  };

  const handleContinueWithoutLogin = () => {
    navigate('/admin');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Login Form Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center">
          <div className="w-[450px] bg-white rounded-2xl p-8">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Masz konto?
            </h1>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email Input */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="E-mail lub login"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    style={{ fontSize: '14px' }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                      <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    style={{ fontSize: '14px' }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                      <rect x="3" y="7" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Nie pamiętam hasła
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                style={{ fontSize: '14px' }}
              >
                Zaloguj się
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">lub</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                style={{ fontSize: '14px' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Kontynuuj z kontem Google
              </button>

              {/* Apple */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ fontSize: '14px' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M14.355 15.098c-.74.822-1.554.74-2.33.428-.822-.329-1.58-.346-2.453 0-.676.263-1.27.198-1.758-.428-3.285-3.45-2.805-8.7.461-8.898 1.005.05 1.71.56 2.297.61.888-.182 1.742-.725 2.697-.65.724.031 1.967.282 2.89 1.67-2.576 1.544-2.204 4.926.362 5.873-.478 1.236-1.088 2.469-2.166 3.395zm-2.428-13.04c.181 2.06-1.513 3.76-3.433 3.622-.248-1.955 1.644-3.826 3.433-3.622z"/>
                </svg>
                Kontynuuj z kontem Apple
              </button>

              {/* TikTok */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ fontSize: '14px' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M12.53 4.57c-.82-.62-1.36-1.58-1.42-2.67h.01V1.5h-2.8v10.26c0 1.28-1.04 2.32-2.32 2.32s-2.32-1.04-2.32-2.32 1.04-2.32 2.32-2.32c.25 0 .49.04.72.11V6.7A5.1 5.1 0 006 6.56c-2.78 0-5.03 2.25-5.03 5.03S3.22 16.62 6 16.62s5.03-2.25 5.03-5.03V7.95a6.47 6.47 0 003.97 1.36V6.5c-1.02 0-1.95-.38-2.67-.98l.2-.95z"/>
                </svg>
                Kontynuuj z kontem TikTok
              </button>

              {/* Continue Without Login */}
              <button
                type="button"
                onClick={handleContinueWithoutLogin}
                className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                style={{ fontSize: '14px' }}
              >
                Kontynuuj bez logowania
              </button>
            </div>
          </div>

          {/* Sign Up Link - Outside white container */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              Nie masz konta?{' '}
              <button
                type="button"
                className="text-gray-900 font-medium hover:underline"
              >
                Załóż konto
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}