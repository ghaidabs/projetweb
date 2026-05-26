import { useState } from 'react';
import React from 'react';
import { useApp } from '@/context/AppContext';
import Modal from './Modal';
import { CarFront } from 'lucide-react';

// Debug logging helper - saves to localStorage
const debugLog = (message: string, data?: any) => {
  const fullMessage = data ? `${message} ${JSON.stringify(data)}` : message;
  console.log(fullMessage);
  // Save to localStorage
  const logs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
  logs.push({ time: new Date().toLocaleTimeString(), msg: fullMessage });
  localStorage.setItem('authDebugLogs', JSON.stringify(logs.slice(-50))); // Keep last 50
};

export default function AuthModal() {
  const { authModal, setAuthModal, login, register, authLoading, authModalMode, setAuthModalMode } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // On mount, restore error state from localStorage (in case of page reload)
  React.useEffect(() => {
    const savedError = localStorage.getItem('authModalError');
    const savedEmail = localStorage.getItem('authModalEmail');
    const savedPassword = localStorage.getItem('authModalPassword');
    const savedName = localStorage.getItem('authModalName');
    const savedPhone = localStorage.getItem('authModalPhone');
    
    if (savedError) {
      debugLog('📝 [AuthModal] Restoring error state from localStorage: ' + savedError);
      setError(savedError);
    }
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    
    // Show saved debug logs from localStorage
    const savedLogs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
    if (savedLogs.length > 0) {
      console.log('📋 [AuthModal] Saved debug logs from localStorage:');
      savedLogs.forEach((log: any) => console.log(`[${log.time}] ${log.msg}`));
    }
  }, []);

  // Sync with context authModalMode
  React.useEffect(() => {
    debugLog('📱 [AuthModal] authModalMode changed:', authModalMode);
    setIsLogin(authModalMode === 'login');
  }, [authModalMode]);

  // Log modal state changes
  React.useEffect(() => {
    debugLog('📱 [AuthModal] Modal state changed - open:', { authModal, error });
  }, [authModal, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debugLog('📝 [AuthModal] handleSubmit called - Mode:', isLogin ? 'LOGIN' : 'REGISTER');
    setError('');
    
    try {
      debugLog('🔐 [AuthModal] Attempting login with email:', email);
      if (isLogin) {
        await login(email, password);
        debugLog('✅ [AuthModal] Login successful! Clearing form...');
        setEmail('');
        setPassword('');
      } else {
        debugLog('📋 [AuthModal] Attempting register with email:', email);
        await register(name, email, password, phone);
        debugLog('✅ [AuthModal] Register successful! Clearing form...');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
      }
    } catch (err: any) {
      debugLog('❌ [AuthModal] Error caught in handleSubmit:', err.message);
      debugLog('❌ [AuthModal] Error response:', err.response?.data);
      
      // Extract error message from backend response - PRIORITY ORDER
      let errorMessage = 'Email ou mot de passe incorrect';
      
      // Priority 1: error.response.data.message (from backend)
      if (err.response?.data?.message) {
        debugLog('✅ [AuthModal] Found error message in response.data.message:', err.response.data.message);
        errorMessage = err.response.data.message;
      } 
      // Priority 2: error.response.data.error (some backends use this)
      else if (err.response?.data?.error) {
        debugLog('✅ [AuthModal] Found error message in response.data.error:', err.response.data.error);
        errorMessage = err.response.data.error;
      }
      // Priority 3: error.message
      else if (err.message) {
        debugLog('✅ [AuthModal] Using error.message:', err.message);
        errorMessage = err.message;
      }
      
      console.log('⚠️ [AuthModal] Final error message to display:', errorMessage);
      console.log('⚠️ [AuthModal] Calling setError() with:', errorMessage);
      setError(errorMessage);
      // Persist error to localStorage in case of page reload
      localStorage.setItem('authModalError', errorMessage);
      localStorage.setItem('authModalEmail', email);
      localStorage.setItem('authModalPassword', password);
      localStorage.setItem('authModalName', name);
      localStorage.setItem('authModalPhone', phone);
      debugLog('⚠️ [AuthModal] Error persisted to localStorage');
      console.log('⚠️ [AuthModal] After setError, error state should be:', errorMessage);
    }
  };

  return (
    <Modal 
      open={authModal} 
      onClose={() => {
        debugLog('🔴 [AuthModal] onClose called - error state:', error, '!error:', !error);
        if (!error) {
          debugLog('🔴 [AuthModal] No error, closing modal');
          setAuthModal(false);
        } else {
          debugLog('🔴 [AuthModal] Error present, NOT closing modal');
        }
      }} 
      maxWidth="420px" 
      closeOnEscape={!error}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-orange mb-3">
          <CarFront size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="text-sm text-covoit-text-secondary mt-1">
          {isLogin
            ? 'Connectez-vous pour accéder à votre compte'
            : 'Rejoignez la communauté Wassalni'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-lg flex items-start justify-between">
            <div>
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300 font-medium text-sm ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom"
              className="input-field"
              required
              disabled={authLoading}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@email.tn"
            className="input-field"
            required
            disabled={authLoading}
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="input-field"
              disabled={authLoading}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
            required
            disabled={authLoading}
          />
        </div>

        <button 
          type="submit" 
          className="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={authLoading}
        >
          {authLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer mon compte')}
        </button>
      </form>

      <p className="text-center text-sm text-covoit-text-secondary mt-5">
        {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setAuthModalMode(isLogin ? 'register' : 'login');
          }}
          className="text-covoit-orange hover:underline font-medium"
        >
          {isLogin ? "S'inscrire" : 'Se connecter'}
        </button>
      </p>
    </Modal>
  );
}
