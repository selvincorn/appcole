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
  signUp: (data: { email: string; password: string; fullName: string; role: UserRole; phone?: string; studentCode?: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateSupabaseCredentials: (url: string, key: string) => void;
  clearCredentials: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'appcole_current_user';
const USERS_REGISTRY_KEY = 'appcole_users_registry';

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

      // Recuperar usuario mock/local persistido
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
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuario',
              email: data.user.email || null,
              phone: data.user.phone || null,
              role: (data.user.user_metadata?.role as UserRole) || 'PARENT',
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

    // 2. Verificar en el registro local de usuarios creados
    try {
      const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (registryRaw) {
        const registry: Array<{ email: string; password?: string; profile: Profile }> = JSON.parse(registryRaw);
        const matched = registry.find(r => r.email.toLowerCase() === cleanId);
        if (matched) {
          if (matched.password && matched.password !== pass) {
            setIsLoading(false);
            return { success: false, error: 'Contraseña incorrecta. Por favor inténtalo de nuevo.' };
          }
          saveLocalUser(matched.profile);
          setIsLoading(false);
          return { success: true };
        }
      }
    } catch (e) {
      console.error('Error leyendo registro local de usuarios:', e);
    }

    // 3. Soporte inteligente para cuentas de prueba y acceso por roles
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

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    studentCode?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const client = getSupabaseClient();

    // 1. Intentar registrar en Supabase Auth si está conectado
    if (client) {
      try {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              role: data.role,
              phone: data.phone?.trim() || null,
            },
          },
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          // Crear perfil en tabla profiles
          const newProfile: Profile = {
            id: authData.user.id,
            full_name: data.fullName.trim(),
            email: data.email.trim(),
            phone: data.phone?.trim() || null,
            role: data.role,
            created_at: new Date().toISOString(),
          };

          await client.from('profiles').upsert(newProfile);

          // Si es padre y proveyó código de carnet, vincular alumno
          if (data.role === 'PARENT' && data.studentCode) {
            const { data: student } = await client
              .from('students')
              .select('id')
              .ilike('student_code', data.studentCode.trim())
              .single();

            if (student) {
              await client.from('parent_student').insert({
                parent_id: authData.user.id,
                student_id: student.id,
                relationship: 'PADRE',
                is_primary_contact: true,
              });
              localStorage.setItem('appcole_selected_student_id', student.id);
            }
          }

          saveLocalUser(newProfile);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Error en Supabase signUp:', err);
      }
    }

    // 2. Registro Local con persistencia en localStorage
    const newLocalProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || '+502 5555-0000',
      role: data.role,
      created_at: new Date().toISOString(),
    };

    // Guardar en registro local
    try {
      const raw = localStorage.getItem(USERS_REGISTRY_KEY);
      const registry = raw ? JSON.parse(raw) : [];
      registry.push({
        email: data.email.trim(),
        password: data.password,
        profile: newLocalProfile,
        studentCode: data.studentCode,
      });
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error('Error guardando en registro local:', e);
    }

    if (data.role === 'PARENT') {
      localStorage.setItem('appcole_selected_student_id', MOCK_STUDENT_MATEO_ID);
    }

    saveLocalUser(newLocalProfile);
    setIsLoading(false);
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    const client = getSupabaseClient();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setIsLoading(false);
      return { success: false, error: 'Por favor ingresa un correo válido.' };
    }

    if (client) {
      try {
        const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        setIsLoading(false);
        if (error) {
          return { success: false, error: error.message };
        }
        return { 
          success: true, 
          message: `Se ha enviado un enlace de recuperación a ${cleanEmail}. Revisa tu bandeja de entrada.` 
        };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Error al solicitar recuperación.' };
      }
    }

    // Respuesta en modo Demo / Local
    setIsLoading(false);
    return {
      success: true,
      message: `Enlace de restablecimiento generado para ${cleanEmail}. En modo Demo puedes continuar ingresando normalmente.`,
    };
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
      signUp,
      resetPassword,
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
