import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Limpia y normaliza la URL de Supabase para evitar sufijos como /rest/v1/
export const normalizeSupabaseUrl = (rawUrl: string): string => {
  let cleaned = rawUrl.trim();
  // Remover sufijos de API REST si los copiaron directamente
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

// Permitir configuración dinámica desde localStorage o variables de entorno
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  let storedUrl = localStorage.getItem('appcole_supabase_url');
  let storedKey = localStorage.getItem('appcole_supabase_anon_key');

  // Si la clave guardada en localStorage es la antigua publishable que causaba error 401 por RLS, limpiarla
  if (storedKey && storedKey.startsWith('sb_publishable_')) {
    localStorage.removeItem('appcole_supabase_anon_key');
    storedKey = null;
  }

  const rawUrl = storedUrl || envUrl;
  const key = storedKey || envKey;
  const url = normalizeSupabaseUrl(rawUrl);

  const isValid = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('tu-proyecto') && 
    key.length > 20
  );

  return { url, key, isConfigured: isValid };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  const normalized = normalizeSupabaseUrl(url);
  localStorage.setItem('appcole_supabase_url', normalized);
  localStorage.setItem('appcole_supabase_anon_key', key.trim());
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('appcole_supabase_url');
  localStorage.removeItem('appcole_supabase_anon_key');
};

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const clientKey = `${url}:::${key}`;
  if (!cachedClient || lastClientKey !== clientKey) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = clientKey;
  }

  return cachedClient;
};
