import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'customer' | 'organizer' | 'staff' | 'admin';
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  role: 'customer' | 'organizer' | 'staff' | 'admin';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pulsepass_user');
    const savedToken = localStorage.getItem('pulsepass_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('pulsepass_user');
        localStorage.removeItem('pulsepass_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('pulsepass_user', JSON.stringify(data.user));
      localStorage.setItem('pulsepass_token', data.token);
    } catch (err: any) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string, phone?: string) => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulsepass_user');
    localStorage.removeItem('pulsepass_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || 'customer',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
