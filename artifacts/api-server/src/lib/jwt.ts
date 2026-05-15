import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "syncsolar-dev-secret-change-in-production";
const EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  solarSystemId: number | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
