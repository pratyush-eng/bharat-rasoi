import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  CookingPot,
  Award,
  CheckCircle,
  KeyRound,
  Shield
} from 'lucide-react';
import { AdminCredentials, SiteSettings } from '../types';

interface LoginPageProps {
  credentials: AdminCredentials;
  siteSettings: SiteSettings;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onLogout: () => void;
}

const LOGO_ICONS: Record<string, any> = {
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  CookingPot,
  Award
};

export const LoginPage: React.FC<LoginPageProps> = ({
  credentials,
  siteSettings,
  isAdminLoggedIn,
  onLoginSuccess,
  onNavigateHome,
  onNavigateAdmin,
  onLogout
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const LogoIcon = LOGO_ICONS[siteSettings.logoIcon] || ChefHat;
  const brandName = siteSettings.siteName || 'BRASOI';
  const accentColor = siteSettings.accentColor || '#FF5F1F';

  useEffect(() => {
    // Update document title for login page
    document.title = `Admin Login - ${brandName}`;
  }, [brandName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      if (
        usernameInput.trim().toLowerCase() === credentials.username.toLowerCase() &&
        passwordInput === credentials.password
      ) {
        if (rememberMe) {
          localStorage.setItem('chef_studio_admin_session', 'true');
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid admin username or password. Please verify your credentials.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-between text-[#1A1A1A] selection:bg-[#FF5F1F] selection:text-white">
      {/* Top Header Navigation */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-gray-600 hover:text-[#1A1A1A] bg-white border border-[#E5E5E1] hover:border-gray-400 px-4 py-2 rounded-full transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to {brandName}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">256-Bit SSL Encrypted Admin Gateway</span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E5E1] shadow-xl overflow-hidden animate-fadeIn">
          
          {/* Card Header & Brand Ribbon */}
          <div className="bg-[#1A1A1A] text-white p-8 text-center relative">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white mb-4 transition-transform hover:scale-105"
                 style={{ backgroundColor: siteSettings.customLogoUrl ? '#FFFFFF' : accentColor }}>
              {siteSettings.customLogoUrl ? (
                <img
                  src={siteSettings.customLogoUrl}
                  alt={brandName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <LogoIcon className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/15 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <KeyRound className="w-3 h-3 text-[#FF5F1F]" />
              <span>Admin Authentication Portal</span>
            </div>

            <h1 className="text-2xl font-black tracking-tight">{brandName}</h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Secure administrative access for video tutorials, cookbook PDFs, branding, and subscribers.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {isAdminLoggedIn ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#1A1A1A]">Session Active</h3>
                  <p className="text-xs text-gray-500">
                    You are currently signed in with administrator privileges.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={onNavigateAdmin}
                    className="w-full py-3 px-6 rounded-2xl font-extrabold text-xs text-white bg-[#1A1A1A] hover:bg-[#FF5F1F] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-4 h-4" /> Go to Admin Dashboard
                  </button>

                  <button
                    onClick={onNavigateHome}
                    className="w-full py-2.5 px-6 rounded-2xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Return to Public Website
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full py-2 text-xs font-extrabold text-red-500 hover:text-red-700 hover:underline pt-1"
                  >
                    Sign Out Administrator Session
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#1A1A1A]">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter administrator username"
                      className="w-full bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#FF5F1F] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#1A1A1A]">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl pl-10 pr-10 py-3 text-xs text-[#1A1A1A] font-semibold focus:outline-none focus:border-[#FF5F1F] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E5E5E1] text-[#FF5F1F] focus:ring-[#FF5F1F]"
                    />
                    <span>Remember on this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs text-white bg-[#1A1A1A] hover:bg-[#FF5F1F] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#FF5F1F]" />
                      <span>Authenticate & Enter Admin Panel</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer of Card */}
          <div className="px-8 py-4 bg-[#FAF9F6] border-t border-[#E5E5E1] text-center text-[11px] text-gray-500">
            Protected endpoint &bull; Access restricted to channel owner
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full px-6 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {brandName} &bull; All Rights Reserved.
      </footer>
    </div>
  );
};
