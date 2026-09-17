import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import React from 'react';
import { Profile, UserRole } from '../types/database.types';
import { MOCK_PROFILES, MOCK_STUDENT_MATEO_ID } from '../services/mockData';
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
        // Inicialmente mostrar al padre por defecto
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
    localStorage.setItem('appcole_selected_student_id', MOCK_STUDENT_MATEO_ID);
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
        if (res.student) {
          localStorage.setItem('appcole_selected_student_id', res.student.id);
        }
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
    const cleanId = identifier.trim().toLowerCase();

    // 1. Intentar inicio de sesión con Supabase Auth si está configurado
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: identifier.trim(),
          password: pass,
        });

        if (!error && data.user) {
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
        console.warn('Error intentando Supabase Auth:', err);
      }
    }

    // 2. Soporte inteligente para cuentas de prueba y acceso por roles
    if (cleanId.includes('garita') || cleanId.includes('staff') || cleanId.includes('seguridad')) {
      saveLocalUser(MOCK_PROFILES[1]);
      setIsLoading(false);
      return { success: true };
    }

    if (
      cleanId.includes('carlos') ||
      cleanId.includes('prof') || 
      cleanId.includes('docente') || 
      cleanId.includes('maestr') ||
      cleanId.includes('mendez')
    ) {
      saveLocalUser(MOCK_PROFILES[2]);
      setIsLoading(false);
      return { success: true };
    }

    if (
      cleanId.includes('padre') || 
      cleanId.includes('tutor') || 
      cleanId.includes('selvin') ||
      cleanId.includes('familia') ||
      cleanId.includes('@')
    ) {
      localStorage.setItem('appcole_selected_student_id', MOCK_STUDENT_MATEO_ID);
      saveLocalUser(MOCK_PROFILES[0]);
      setIsLoading(false);
      return { success: true };
    }

    // Si no coincide con nada pero escribió texto, dar acceso como padre o indicar error
    if (cleanId.length > 2) {
      saveLocalUser(MOCK_PROFILES[0]);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Por favor ingresa un correo o usuario válido' };
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
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem('appcole_selected_student_id');
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'PARENT') {
      loginAsDemoParent();
      return;
    }
    if (newRole === 'TEACHER') {
      loginAsDemoTeacher();
      return;
    }
    if (newRole === 'STAFF') {
      loginAsDemoStaff();
      return;
    }
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
