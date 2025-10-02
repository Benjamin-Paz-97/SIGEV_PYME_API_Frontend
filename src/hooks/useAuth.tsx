import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { authService, type AuthResponse, type User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getAuthToken();
        if (token) {
          // Verificar el token y obtener los datos del usuario
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (userError: any) {
            console.error('Error obteniendo datos del usuario:', userError);
            // Si falla obtener el usuario pero tenemos token, mantener el estado de autenticación
            // Solo limpiar si es un error 401 (no autorizado)
            if (userError.response?.status === 401) {
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login({ email, password });
      authService.setAuthToken(response.token);
      
      // Intentar obtener los datos completos del usuario
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (userError: any) {
        console.error('Error obteniendo datos del usuario después del login:', userError);
        // Si falla obtener el usuario pero el login fue exitoso, crear un usuario básico
        setUser({
          id: 'temp',
          userName: email.split('@')[0],
          email: email,
          telefono: null,
          direccion: null,
          role: 0,
          estado: 1,
          fechaRegistro: new Date().toISOString(),
          companyId: null,
          companyNombre: null
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.register(userData);
      authService.setAuthToken(response.token);
      
      // Intentar obtener los datos completos del usuario
      try {
        const userDataFromApi = await authService.getCurrentUser();
        setUser(userDataFromApi);
      } catch (userError: any) {
        console.error('Error obteniendo datos del usuario después del registro:', userError);
        // Si falla obtener el usuario pero el registro fue exitoso, crear un usuario básico
        setUser({
          id: 'temp',
          userName: userData.userName || userData.email.split('@')[0],
          email: userData.email,
          telefono: userData.telefono || null,
          direccion: userData.direccion || null,
          role: userData.role || 0,
          estado: 1,
          fechaRegistro: new Date().toISOString(),
          companyId: null,
          companyNombre: null
        });
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      console.log('Usuario actualizado:', userData);
    } catch (error) {
      console.error('Error refrescando datos del usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
