import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, loading } = useAuth();
  const [loginLoading, setLoginLoading] = useState<'google' | 'facebook' | null>(null);

  const handleLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoginLoading(provider);
      await login(provider);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      // In a real app, show error message to user
    } finally {
      setLoginLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          disabled={loading}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Zaloguj się
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Zaloguj się, aby przewidywać wyniki meczów i rywalizować z innymi użytkownikami!
          </p>
        </div>

        {/* Login buttons */}
        <div className="space-y-3">
          {/* Google Login */}
          <button
            onClick={() => handleLogin('google')}
            disabled={loading || loginLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading === 'google' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            ) : (
              <Mail className="h-5 w-5 text-red-500" />
            )}
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Kontynuuj z Google
            </span>
          </button>

          {/* Facebook Login */}
          <button
            onClick={() => handleLogin('facebook')}
            disabled={loading || loginLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginLoading === 'facebook' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            <span className="font-medium">
              Kontynuuj z Facebook
            </span>
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Logując się, akceptujesz nasze Warunki korzystania i Politykę prywatności.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;