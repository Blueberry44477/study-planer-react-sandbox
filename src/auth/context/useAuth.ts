import { use } from "react";
import {AuthContext, type AuthContextValue} from './authContext.ts';

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
