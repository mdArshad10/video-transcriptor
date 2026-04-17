export interface AuthUser {
  sub: string;
  vendorId?: string;
  role?: string;
}

export interface GatewayTokenPayload {
  sub?: string;
  userId?: string;
  vendorId?: string;
  role?: string;
  exp?: number;
  iat?: number;
}
