import type LoginRequest from './dto/loginRequest';
import type LoginResponse from './dto/loginResponse.ts';
import { httpClient, setRefreshHandler } from '../api/httpClient.ts';
import type AuthUser from './dto/authUser.ts';
import type RefreshTokenResponse from './dto/refreshTokenResponse.ts';
import { authStore } from './authStore.ts';

export const authService = {
  login(loginRequest: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/login', loginRequest);
  },

  getMe(signal?: AbortSignal): Promise<AuthUser> {
    return httpClient.get<AuthUser>('/auth/me', {
      requiresAuth: true,
      signal,
    });
  },

  refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    return httpClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
  },

  async refreshSession(): Promise<string | null> {
    const currentRefresh = authStore.getRefreshToken();
    if (!currentRefresh) {
      return null;
    }

    try {
      const data = await authService.refresh(currentRefresh);
      authStore.setAccessToken(data.accessToken);
      authStore.setRefreshToken(data.refreshToken);
      return data.accessToken;
    } catch {
      authStore.clearTokens();
      return null;
    }
  },
};

setRefreshHandler(() => authService.refreshSession());
