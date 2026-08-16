import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, Sparkles, X } from 'lucide-react';
import { AdminCredentials } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  credentials: AdminCredentials;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  credentials
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setUsernameInput(credentials.username);
    setPasswordInput(credentials.password);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      if (
        usernameInput.trim() === credentials.username &&
        passwordInput === credentials.password
      ) {
        if (rememberMe) {
          localStorage.setItem('chef_studio_admin_session', 'true');
        }
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid Username or Password. Use demo credentials (admin / admin123)');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white rounded-3xl border border-[#E5E5E1] shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#1A1A1A] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center text-white mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>

          <span className="bg-brand-accent-light text-brand-accent border border-brand-accent-light text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
            Restricted Admin Area
          </span>
          <h2 className="text-xl font-extrabold">Chef Studio Portal</h2>
          <p className="text-xs text-gray-300 mt-1">Sign in to manage videos, cookbooks, branding & channel settings.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Demo Hint Banner */}
          <div className="bg-brand-accent-light/30 border border-brand-accent-light rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-accent shrink-0" />
              <div>
                <span className="font-extrabold text-[#1A1A1A]">Demo Credentials:</span>
                <span className="text-gray-600 block text-[11px]">User: <code className="font-mono text-brand-accent">admin</code> | Pass: <code className="font-mono text-brand-accent">admin123</code></span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="bg-[#1A1A1A] hover:bg-brand-accent text-white font-bold text-[10px] px-2.5 py-1.5 rounded-full transition-colors shrink-0 flex items-center gap-1 group"
            >
              <Sparkles className="w-3 h-3 text-brand-accent group-hover:text-white" /> Fill Demo
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" /> Admin Username
            </label>
            <input
              type="text"
              required
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-[#F3F3F1] border border-[#E5E5E1] rounded-2xl px-4 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F] font-medium"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-500" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F3F3F1] border border-[#E5E5E1] rounded-2xl pl-4 pr-10 py-3 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF5F1F] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-[#FF5F1F] focus:ring-[#FF5F1F]"
              />
              Keep me logged in
            </label>
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secured Local Session
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-extrabold rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#FF5F1F]" /> Access Admin Dashboard
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
