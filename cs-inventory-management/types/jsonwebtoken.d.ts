declare module "jsonwebtoken" {
  export interface JwtPayload {
    [key: string]: unknown;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: string, options?: { expiresIn?: string | number }): string;
  export function verify(token: string, secretOrPublicKey: string): string | JwtPayload;
}
