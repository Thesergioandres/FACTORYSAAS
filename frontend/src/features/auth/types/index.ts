export interface IAuthUser {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export interface AuthResponse {
  token: string;
  user: IAuthUser;
  tenantConfig?: any;
}
