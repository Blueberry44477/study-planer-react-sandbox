import { useCallback, useEffect, useState, type ReactNode } from "react";
import type AuthUser from "../dto/authUser.ts";
import {authStore} from "../authStore.ts";
import type LoginRequest from "../dto/loginRequest.ts";
import {authService} from "../authService.ts";
import {setUnauthorizedHandler} from "../../api/httpClient.ts";
import {AuthContext} from "./authContext.ts";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    authStore.getAccessToken()
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(() =>
    Boolean(authStore.getRefreshToken())
  );

  const logout = useCallback(() => {
    authStore.clearTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    authStore.setAccessToken(response.accessToken);
    authStore.setRefreshToken(response.refreshToken);
    setAccessToken(response.accessToken);

    const currentUser = await authService.getMe();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!authStore.getRefreshToken()) {
      return;
    }

    const controller = new AbortController();

    async function restoreSession() {
      const newAccessToken = await authService.refreshSession();
      if (!newAccessToken || controller.signal.aborted) {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        setAccessToken(newAccessToken);
        const currentUser = await authService.getMe(controller.signal);
        if (!controller.signal.aborted) {
          setUser(currentUser);
        }
      } catch {
        if (!controller.signal.aborted) {
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
      }
    }

    void restoreSession();

    return () => controller.abort();
  }, [logout]);

  return (
    <AuthContext
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken && user),
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
