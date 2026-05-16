import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Role = "client" | "technician";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  solarSystemId: number | null;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  selectedSystemId: number | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedSystem: (id: number) => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  selectedSystemId: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  setSelectedSystem: () => {},
});

const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const TOKEN_KEY = "syncsolarsystems-jwt";
const SYSTEM_KEY = "syncsolarsystems-system-id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedSystemId] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(SYSTEM_KEY),
        ]);
        if (storedToken) {
          const res = await fetch(`${BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
            const sysId = storedSystemId
              ? parseInt(storedSystemId)
              : data.user.solarSystemId ?? 1;
            setSelectedSystemId(sysId);
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const register = async (name: string, email: string, password: string, role: Role = "client") => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error ?? "Registration failed";
      throw new Error(
        msg === "Email already registered"
          ? "هذا البريد الإلكتروني مسجّل بالفعل"
          : msg
      );
    }
    const data = await res.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    const sysId = data.user.solarSystemId ?? 1;
    setSelectedSystemId(sysId);
    await AsyncStorage.setItem(SYSTEM_KEY, String(sysId));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Login failed");
    }
    const data = await res.json();
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    const sysId = data.user.solarSystemId ?? 1;
    setSelectedSystemId(sysId);
    await AsyncStorage.setItem(SYSTEM_KEY, String(sysId));
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, SYSTEM_KEY]);
    setToken(null);
    setUser(null);
    setSelectedSystemId(null);
  };

  const setSelectedSystem = (id: number) => {
    setSelectedSystemId(id);
    AsyncStorage.setItem(SYSTEM_KEY, String(id)).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, token, selectedSystemId, isLoading, login, register, logout, setSelectedSystem }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
