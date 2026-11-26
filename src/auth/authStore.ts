let accessToken: string | null = null;

export const authStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => localStorage.getItem("refreshToken"),

  setAccessToken: (token: string) => accessToken = token,
  setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),

  clearTokens: () => {
    accessToken = null;
    localStorage.removeItem("refreshToken");
  },

  isAuthenticated: (): boolean => Boolean(accessToken)
}
