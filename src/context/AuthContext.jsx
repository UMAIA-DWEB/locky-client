import { createContext, useState, useEffect, useCallback } from 'react';
import { api, API_URL } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // verifica se há sessão ativa chamando GET /auth/me
  const refresh = useCallback(async () => {
    try {
      const me = await api.get('/auth/me');
      setUser(me);
    } catch (err) {
      // 401 = não autenticado, esperado
      // outros erros = problema real, mas tratar como não-auth
      if (err.status !== 401) {
        console.error('Erro inesperado em /auth/me:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // hidrata no mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // redireciona para o GitHub OAuth
  const login = useCallback(() => {
    window.location.href = `${API_URL}/auth/github`;
  }, []);

  // termina sessão na API e limpa estado local
  const logout = useCallback(async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
