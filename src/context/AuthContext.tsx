import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { RoleInfo, UserInfo } from '../types/auth';
import { TokenStorage } from '../services/storage';
import { AuthService } from '../services/authService';
import { api } from '../services/api';

interface AuthContextType {
  user: UserInfo | null;
  activeRole: RoleInfo | null;
  availableRoles: RoleInfo[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<RoleInfo | null>;
  switchRole: (schoolId: number | null, roleId: number) => Promise<RoleInfo | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeRole, setActiveRole] = useState<RoleInfo | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearLocalState = useCallback(() => {
    setUser(null);
    setActiveRole(null);
    setAvailableRoles([]);
    setIsAuthenticated(false);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const token = await TokenStorage.getAccessToken();
      const userInfo = await TokenStorage.getUserInfo();

      if (!token || !userInfo) {
        await TokenStorage.clearSession();
        clearLocalState();
        return;
      }

      const expiry = await TokenStorage.getAccessTokenExpiry();
      const isExpiredOrUnknown = !expiry || Date.parse(expiry) <= Date.now() + 10_000;

      if (isExpiredOrUnknown) {
        const refreshed = await api.refreshSession();
        if (!refreshed) {
          await TokenStorage.clearSession();
          clearLocalState();
          return;
        }
      }

      const currentRole = await TokenStorage.getActiveRole();
      const roles = await TokenStorage.getAvailableRoles();

      setUser(userInfo);
      setActiveRole(currentRole);
      setAvailableRoles(roles);
      setIsAuthenticated(true);
    } catch {
      await TokenStorage.clearSession();
      clearLocalState();
    } finally {
      setIsLoading(false);
    }
  }, [clearLocalState]);

  useEffect(() => {
    loadSession();

    const unsubscribe = api.onSessionExpired(async () => {
      await TokenStorage.clearSession();
      clearLocalState();
      setIsLoading(false);
      try {
        router.replace('/(auth)/login');
      } catch {}
    });

    return () => {
      unsubscribe();
    };
  }, [loadSession, clearLocalState, router]);

  const login = async (username: string, password: string): Promise<RoleInfo | null> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(username, password);

      await TokenStorage.setSession(
        response.accessToken,
        response.refreshToken,
        response.accessTokenExpiry,
        response.user,
        response.availableRoles,
        response.activeRole
      );

      setUser(response.user);
      setActiveRole(response.activeRole);
      setAvailableRoles(response.availableRoles);
      setIsAuthenticated(true);

      setIsLoading(false);
      return response.activeRole;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const switchRole = async (
    schoolId: number | null,
    roleId: number
  ): Promise<RoleInfo | null> => {
    setIsLoading(true);
    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('Refresh token missing. Please sign in again.');

      const response = await AuthService.switchRole(schoolId, roleId, refreshToken);

      await TokenStorage.updateTokens(
        response.accessToken,
        response.refreshToken,
        response.accessTokenExpiry,
        response.activeRole
      );

      setActiveRole(response.activeRole);
      setIsLoading(false);
      return response.activeRole;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
    } catch {
      // Ignore network failures on logout — local state is cleared regardless.
    } finally {
      await TokenStorage.clearSession();
      clearLocalState();
      setIsLoading(false);
      try {
        router.replace('/(auth)/login');
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        availableRoles,
        isAuthenticated,
        isLoading,
        login,
        switchRole,
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
