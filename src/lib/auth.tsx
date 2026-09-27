import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiPost, API_BASE } from "./api";
import type { Profile, UserRole } from "./types";

export interface Session {
  token: string;
  user: { id: number; email: string };
}

const TOKEN_KEY = "trvlstory_token";

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    fullName: string,
    phone: string,
    role: UserRole,
    vendorType: string | undefined,
    password: string,
    verificationCode: string,
  ) => Promise<{ error: string | null }>;
  sendVerificationCode: (email: string) => Promise<{ error: string | null; devCode?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ error: string | null }>;
  setPassword: (password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authed<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error("API unreachable — is the server online?");
  }
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (token: string) => {
    const user = await authed<Profile>(token, "/auth/me.php");
    setProfile(user);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authed<Profile>(token, "/auth/me.php")
      .then((user) => {
        setSession({ token, user: { id: user.id, email: user.email } });
        setProfile(user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const sendVerificationCode = useCallback(
    async (email: string): Promise<{ error: string | null; devCode?: string }> => {
      try {
        const data = await apiPost<{ ok: boolean; dev_code?: string }>("/auth/send-code.php", { email });
        return { error: null, devCode: data.dev_code };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Failed to send verification code" };
      }
    },
    [],
  );

  const verifyCode = useCallback(
    async (email: string, code: string): Promise<{ error: string | null }> => {
      try {
        await apiPost("/auth/verify-code.php", { email, code });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Verification failed" };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      fullName: string,
      phone: string,
      role: UserRole,
      vendorType: string | undefined,
      password: string,
      verificationCode: string,
    ): Promise<{ error: string | null }> => {
      try {
        const data = await apiPost<{ token: string; user: Profile }>("/auth/signup.php", {
          email,
          full_name: fullName,
          phone,
          role,
          vendor_type: vendorType ?? null,
          password,
          code: verificationCode,
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        setSession({ token: data.token, user: { id: data.user.id, email: data.user.email } });
        setProfile(data.user);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Sign up failed" };
      }
    },
    [],
  );

  const setPassword = useCallback(
    async (password: string): Promise<{ error: string | null }> => {
      if (!session) return { error: "Not signed in" };
      try {
        await authed(session.token, "/auth/set-password.php", {
          method: "POST",
          body: JSON.stringify({ password }),
        });
        await fetchProfile(session.token);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Failed to set password" };
      }
    },
    [session, fetchProfile],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        const data = await apiPost<{ token: string; user: Profile }>("/auth/signin.php", {
          email,
          password,
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        setSession({ token: data.token, user: { id: data.user.id, email: data.user.email } });
        setProfile(data.user);
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Sign in failed" };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session) {
      await fetchProfile(session.token);
    }
  }, [session, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signUp,
        sendVerificationCode,
        verifyCode,
        setPassword,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
