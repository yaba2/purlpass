import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  User,
  Shield,
  QrCode,
  LogOut,
  Menu,
  X,
  Compass,
  Lock,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, role, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Allow other components (e.g. BookingModal) to open the login modal
  useEffect(() => {
    const handler = () => {
      setIsLoginMode(true);
      setLoginModalOpen(true);
    };
    window.addEventListener('open-login-modal', handler);
    return () => window.removeEventListener('open-login-modal', handler);
  }, []);

  // Redirect admin to dashboard when they log in
  useEffect(() => {
    if (role === 'admin' && currentTab !== 'admin' && currentTab !== 'check-in') {
      setCurrentTab('admin');
    }
  }, [role, currentTab, setCurrentTab]);

  const navItems =
    role === 'admin'
      ? []
      : [
          { id: 'home', label: 'Discover', icon: Compass },
          { id: 'explore', label: 'Explore Events', icon: Search },
        ];

  // Customer can see My Tickets
  if (role === 'customer') {
    navItems.push({ id: 'my-tickets', label: 'My Tickets', icon: Ticket });
  }

  // Staff can access Check-In Desk
  if (role === 'staff' || role === 'admin') {
    navItems.push({ id: 'check-in', label: 'Check-In Desk', icon: QrCode });
  }

  // Organizer can access Admin Hub and their own tickets
  if (role === 'organizer') {
    navItems.push({ id: 'my-tickets', label: 'My Tickets', icon: Ticket });
    navItems.push({ id: 'admin', label: 'Event Manager', icon: Shield });
  }

  // Admin has access to everything
  if (role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Hub', icon: Shield });
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
        setLoginModalOpen(false);
      } else {
        // Register
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName, phone }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }
        // Auto-login after registration
        await login(email, password);
        setLoginModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-[#EADBCA] bg-[#FAF7F0]/95 backdrop-blur-md">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#9B5E28] via-[#B87A3E] to-[#DEC69E] flex items-center justify-center shadow-lg shadow-[#B87A3E]/25 group-hover:scale-105 transition-transform">
              <Ticket className="w-7 h-7 text-white transform -rotate-12" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-stone-900 flex items-center gap-1.5">
                Punch,Munch<span className="text-[#9B5E28]">$Crunch</span>
              </span>
              <span className="text-xs text-stone-500 font-mono tracking-wider block -mt-1 uppercase font-semibold">
                Ticketing Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#EFE3D2] text-[#4F2B07] border border-[#DECAAC] shadow-sm'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-[#F2E8DC]/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#8A5120]' : 'text-stone-500'}`} />
                  {item.label}
                  {item.id === 'admin' && (
                    <span className="text-xs bg-[#E2CEB0] text-[#4F2B07] px-2 py-0.5 rounded font-mono uppercase font-bold">
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* User Profile / Sign in */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-[#DFD3C3] hover:border-stone-400 bg-white shadow-sm transition-colors"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#C2824A]/40"
                  />
                  <span className="text-sm font-bold text-stone-800 max-w-[120px] truncate">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E5DAC8] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#F0E6D8]">
                      <p className="text-xs font-bold text-stone-900">{user.displayName}</p>
                      <p className="text-[11px] text-stone-500 font-mono truncate">{user.email}</p>
                      <div className="mt-1.5 inline-block text-[10px] font-mono uppercase bg-[#F5EFE6] text-[#7A4B1D] px-2 py-0.5 rounded border border-[#E2D4C1]">
                        Role: {user.role}
                      </div>
                    </div>
                    <div className="py-1">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setCurrentTab('my-tickets')}
                          className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:text-stone-950 hover:bg-[#FAF6EF] rounded-xl flex items-center gap-2"
                        >
                          <Ticket className="w-3.5 h-3.5 text-[#965A28]" />
                          My Digital Tickets
                        </button>
                      )}
                      {(user.role === 'admin' || user.role === 'organizer') && (
                        <button
                          onClick={() => setCurrentTab('admin')}
                          className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:text-stone-950 hover:bg-[#FAF6EF] rounded-xl flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#965A28]" />
                          Management Hub
                        </button>
                      )}
                    </div>
                    <div className="border-t border-[#F0E6D8] pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#965A28] hover:bg-[#824B1E] text-white shadow-md shadow-[#965A28]/20 transition-all"
              >
                <Lock className="w-4.5 h-4.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#F2E8DC]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EADBCA] bg-[#FAF7F0] p-4 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  currentTab === item.id
                    ? 'bg-[#965A28] text-white'
                    : 'text-stone-700 hover:bg-[#F0E6D8]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="pt-2">
              <button
                onClick={logout}
                className="w-full text-center py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
              >
                Sign Out ({user.displayName || user.email})
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full py-2.5 text-xs font-semibold bg-[#965A28] text-white rounded-xl"
            >
              Sign In
            </button>
          )}
        </div>
      )}

    </header>

    {/* Login/Register Modal - rendered outside header to avoid positioning issues */}
    {loginModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-[#9B5E28] via-[#B87A3E] to-[#DEC69E] px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {isLoginMode ? <Lock className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isLoginMode ? 'Welcome Back' : 'Join Us'}
                  </h2>
                  <p className="text-xs text-white/80 font-medium">
                    {isLoginMode ? 'Sign in to your account' : 'Create your account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLoginModalOpen(false);
                  setAuthError('');
                }}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-5">
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-[#E5DAC8] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#965A28] focus:ring-2 focus:ring-[#965A28]/10 transition-all placeholder:text-stone-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-[#E5DAC8] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#965A28] focus:ring-2 focus:ring-[#965A28]/10 transition-all placeholder:text-stone-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••"
                  className="w-full px-4 py-3 border-2 border-[#E5DAC8] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#965A28] focus:ring-2 focus:ring-[#965A28]/10 transition-all placeholder:text-stone-400"
                />
              </div>

              {!isLoginMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-4 py-3 border-2 border-[#E5DAC8] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#965A28] focus:ring-2 focus:ring-[#965A28]/10 transition-all placeholder:text-stone-400"
                  />
                </div>
              )}

              {!isLoginMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Phone <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-4 py-3 border-2 border-[#E5DAC8] rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#965A28] focus:ring-2 focus:ring-[#965A28]/10 transition-all placeholder:text-stone-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#965A28] to-[#B87A3E] hover:from-[#824B1E] hover:to-[#9B5E28] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#965A28]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                    {isLoginMode ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLoginMode ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {isLoginMode ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-sm text-stone-600">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setAuthError('');
                  }}
                  className="text-[#965A28] font-bold hover:text-[#824B1E] underline underline-offset-2 decoration-2 transition-colors"
                >
                  {isLoginMode ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
