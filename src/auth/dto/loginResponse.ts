import type AuthUser from './authUser.ts';

export default interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken: string;
}
