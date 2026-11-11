import React, {
  createContext,
  useContext,
  useState
} from 'react';

import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('smartspace_user');
    const savedToken = localStorage.getItem('smartspace_token');

    if (!savedUser || !savedToken) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smartspace_token');
  });

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const result = await apiService.login(email, password);

    setUser(result.user);
    setToken(result.token);

    localStorage.setItem(
      'smartspace_user',
      JSON.stringify(result.user)
    );

    localStorage.setItem('smartspace_token', result.token);

    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('smartspace_user');
    localStorage.removeItem('smartspace_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
};