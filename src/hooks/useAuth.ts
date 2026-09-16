import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import React from 'react';
import { Profile, UserRole } from '../types/database.types';
import { MOCK_PROFILES } from '../services/mockData';
import { getSupabaseClient, getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../services/supabase/client';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isDemoMode: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  loginAsDemoParent: () => void;
  loginAsDemoStaff: () => void;
  loginAsDemoTeacher: () => void;
  loginWithStudentCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateSupabaseCredentials: (url: string, key: string) => void;
  clearCredentials: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'appcole_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configState, setConfigState] = useState(() => getSupabaseConfig());

  // Cargar sesión inicial
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const client = getSupabaseClient();

      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Supabase session lookup error:', e);
        }
      }

      // Recuperar usuario mock persistido
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(MOCK_PROFILES[0]);
        }
      } else {
        // Por defecto loguear al Padre de prueba para experiencia inmediata
        setUser(MOCK_PROFILES[0]);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [configState.isConfigured]);

  const saveLocalUser = (u: Profile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  const loginAsDemoParent = () => {
    saveLocalUser(MOCK_PROFILES[0]);
  };

  const loginAsDemoStaff = () => {
    saveLocalUser(MOCK_PROFILES[1]);
  };

  const loginAsDemoTeacher = () => {
    saveLocalUser(MOCK_PROFILES[2]);
  };

  const loginWithStudentCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { api } = await import('../services/api');
      const res = await api.loginWithStudentCode(code);
      if (res.success && res.profile) {
        saveLocalUser(res.profile);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: res.error || 'Carnet no encontrado' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Error al validar el carnet' };
    }
  };

  const loginWithCredentials = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const client = getSupabaseClient();

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: identifier,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            saveLocalUser(profile);
          } else {
            saveLocalUser({
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'Usuario',
              email: data.user.email || null,
              phone: data.user.phone || null,
              role: 'PARENT',
              created_at: new Date().toISOString(),
            });
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Error de conexión con Supabase' };
      }
    }

    // Modo Demo: permitir login si coincide con demo o credenciales genéricas
    if (identifier.includes('garita') || identifier.includes('staff')) {
      saveLocalUser(MOCK_PROFILES[1]);
      setIsLoading(false);
      return { success: true };
    }

    if (identifier.includes('prof') || identifier.includes('docente') || identifier.includes('maestr')) {
      saveLocalUser(MOCK_PROFILES[2]);
      setIsLoading(false);
      return { success: true };
    }

    saveLocalUser(MOCK_PROFILES[0]);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase', e);
      }
    }
    saveLocalUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: Profile = {
      ...user,
      role: newRole,
      full_name: 
        newRole === 'STAFF' 
          ? 'Oficial Juan Pérez (Garita)' 
          : newRole === 'TEACHER'
          ? 'Prof. Carlos Méndez (Docente)'
          : 'Ing. Selvin Morales',
    };
    saveLocalUser(updated);
  };

  const updateSupabaseCredentials = (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    setConfigState(getSupabaseConfig());
  };

  const clearCredentials = () => {
    clearSupabaseConfig();
    setConfigState(getSupabaseConfig());
  };

  const role: UserRole = user?.role || 'PARENT';
  const isDemoMode = !configState.isConfigured;

  return React.createElement(AuthContext.Provider, {
    value: {
      user,
      role,
      isDemoMode,
      isConfigured: configState.isConfigured,
      isLoading,
      loginAsDemoParent,
      loginAsDemoStaff,
      loginAsDemoTeacher,
      loginWithStudentCode,
      loginWithCredentials,
      logout,
      switchRole,
      updateSupabaseCredentials,
      clearCredentials,
    }
  }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
