export interface User {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    tenantId: number;
    name: string;
    email: string;
  };
  verificationToken?: string;
}
