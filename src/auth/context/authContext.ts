import { createContext } from "react";
import type AuthUser from '../dto/authUser.ts';
import type LoginRequest from '../dto/loginRequest.ts';

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
