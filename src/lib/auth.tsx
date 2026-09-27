import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../lib/types";

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    fullName: string,
    phone: string,
    role: UserRole,
    vendorType?: string,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) return;
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          (async () => {
            await fetchProfile(newSession.user.id);
          })();
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const sendVerificationCode = useCallback(
    async (email: string): Promise<{ error: string | null; devCode?: string }> => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(
          `${supabaseUrl}/functions/v1/send-verification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({ email }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return { error: data.error ?? "Failed to send verification code" };
        }
        return { error: null, devCode: data.dev_code };
      } catch {
        return { error: "Failed to send verification code" };
      }
    },
    [],
  );

  const verifyCode = useCallback(
    async (email: string, code: string): Promise<{ error: string | null }> => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const response = await fetch(
          `${supabaseUrl}/functions/v1/verify-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({ email, code }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return { error: data.error ?? "Verification failed" };
        }
        return { error: null };
      } catch {
        return { error: "Verification failed" };
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
        // First verify the code
        const verifyResult = await verifyCode(email, verificationCode);
        if (verifyResult.error) return { error: verifyResult.error };

        // Then create the auth account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              role,
              vendor_type: vendorType ?? null,
            },
          },
        });

        if (error) return { error: error.message };

        // Update profile with email_verified and password_set flags
        if (data.user) {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              password_set: true,
              role,
              vendor_type: vendorType ?? null,
            })
            .eq("id", data.user.id);
        }

        return { error: null };
      } catch {
        return { error: "Sign up failed" };
      }
    },
    [verifyCode],
  );

  const setPassword = useCallback(
    async (password: string): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return { error: error.message };

        if (session?.user) {
          await supabase
            .from("profiles")
            .update({ password_set: true })
            .eq("id", session.user.id);
        }

        return { error: null };
      } catch {
        return { error: "Failed to set password" };
      }
    },
    [session],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: error.message };
        return { error: null };
      } catch {
        return { error: "Sign in failed" };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
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
