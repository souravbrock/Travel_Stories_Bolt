import { useState, useCallback } from "react";
import {
  Compass,
  Mail,
  Phone,
  User,
  Lock,
  Shield,
  Store,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import type { UserRole, VendorType } from "../lib/types";

type Step = "welcome" | "role" | "details" | "verify" | "password" | "login";
type SelectedRole = "customer" | "vendor" | "admin";

const VENDOR_TYPES: { id: VendorType; label: string; icon: typeof Store }[] = [
  { id: "travel_agent", label: "Travel Agent", icon: Compass },
  { id: "hotel", label: "Hotel", icon: Store },
  { id: "homestay", label: "Homestay", icon: Store },
  { id: "transport", label: "Transport Company", icon: Store },
  { id: "ticket_booking", label: "Ticket Booking Agent", icon: Store },
];

export function AuthScreen() {
  const { signUp, sendVerificationCode, signIn, setPassword, session, profile } = useAuth();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("travel_agent");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [password, setPasswordVal] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = useCallback(async () => {
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email first");
      return;
    }
    setBusy(true);
    const { error, devCode } = await sendVerificationCode(email);
    setBusy(false);
    if (error) {
      setError(error);
    } else {
      setCodeSent(true);
      setDevCode(devCode ?? null);
    }
  }, [email, sendVerificationCode]);

  const handleVerifyAndSignUp = useCallback(async () => {
    setError(null);
    if (!verificationCode.trim()) {
      setError("Please enter the 5-digit code");
      return;
    }
    if (verificationCode.length !== 5) {
      setError("Code must be 5 digits");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await signUp(
      email,
      fullName,
      phone,
      selectedRole as UserRole,
      selectedRole === "vendor" ? vendorType : undefined,
      password,
      verificationCode,
    );
    setBusy(false);
    if (error) {
      setError(error);
    }
  }, [verificationCode, password, confirmPassword, email, fullName, phone, selectedRole, vendorType, signUp]);

  const handleLogin = useCallback(async () => {
    setError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setError("Please enter email and password");
      return;
    }
    setBusy(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setBusy(false);
    if (error) setError(error);
  }, [loginEmail, loginPassword, signIn]);

  // If user is logged in but hasn't set password yet
  if (session?.user && profile && !profile.password_set) {
    return (
      <SetPasswordScreen
        password={password}
        confirmPassword={confirmPassword}
        setPasswordVal={setPasswordVal}
        setConfirmPassword={setConfirmPassword}
        error={error}
        busy={busy}
        onSubmit={async () => {
          setError(null);
          if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
          }
          if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
          }
          setBusy(true);
          const { error } = await setPassword(password);
          setBusy(false);
          if (error) setError(error);
        }}
      />
    );
  }

  return (
    <div className="ts-app-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ts-gradient-primary shadow-lg shadow-cyan-500/30">
            <Compass className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Travel Stories</h1>
          <p className="text-sm text-slate-500">Discover Incredible India</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-sand-200 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* WELCOME STEP */}
          {step === "welcome" && (
            <div className="ts-fade-in text-center">
              <h2 className="text-xl font-bold text-slate-800">Welcome!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Create your profile to explore India's best travel destinations,
                book tours, and connect with verified travel agents.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setStep("role")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110"
                >
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setStep("login")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-sand-200"
                >
                  I already have an account
                </button>
              </div>
            </div>
          )}

          {/* ROLE SELECTION */}
          {step === "role" && (
            <div className="ts-fade-in">
              <button
                onClick={() => setStep("welcome")}
                className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-slate-800">Choose Your Role</h2>
              <p className="mt-1 text-sm text-slate-500">
                How will you be using Travel Stories?
              </p>
              <div className="mt-5 space-y-3">
                {[
                  {
                    id: "customer" as SelectedRole,
                    label: "Customer / Traveler",
                    desc: "Browse tours, book packages, explore destinations",
                    icon: ShoppingBag,
                    gradient: "from-cyan-500 to-teal-500",
                  },
                  {
                    id: "vendor" as SelectedRole,
                    label: "Vendor / Service Provider",
                    desc: "List your packages, hotels, homestays, vehicles",
                    icon: Store,
                    gradient: "from-orange-500 to-amber-500",
                  },
                  {
                    id: "admin" as SelectedRole,
                    label: "Admin",
                    desc: "Manage all content, approve vendors, edit listings",
                    icon: Shield,
                    gradient: "from-emerald-500 to-green-500",
                  },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRole(r.id);
                        setStep("details");
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        selectedRole === r.id
                          ? "border-cyan-400 bg-cyan-50"
                          : "border-sand-200 hover:border-sand-300 hover:bg-sand-50"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${r.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{r.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DETAILS STEP */}
          {step === "details" && (
            <div className="ts-fade-in">
              <button
                onClick={() => setStep("role")}
                className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {selectedRole === "vendor" ? "Vendor Details" : selectedRole === "admin" ? "Admin Registration" : "Your Details"}
              </h2>

              {selectedRole === "vendor" && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Vendor Type
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {VENDOR_TYPES.map((vt) => {
                      const Icon = vt.icon;
                      return (
                        <button
                          key={vt.id}
                          onClick={() => setVendorType(vt.id)}
                          className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm transition-all ${
                            vendorType === vt.id
                              ? "border-orange-400 bg-orange-50 text-orange-700"
                              : "border-sand-200 text-slate-600 hover:border-sand-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {vt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!fullName.trim() || !email.trim() || !phone.trim()) {
                    setError("Please fill in all fields");
                    return;
                  }
                  setError(null);
                  setStep("verify");
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* VERIFY + PASSWORD STEP */}
          {step === "verify" && (
            <div className="ts-fade-in">
              <button
                onClick={() => setStep("details")}
                className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-slate-800">Verify Your Email</h2>
              <p className="mt-1 text-sm text-slate-500">
                We sent a 5-digit verification code to{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>

              {devCode && (
                <div className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
                  <span className="font-semibold">Dev mode:</span> Your code is{" "}
                  <span className="font-mono font-bold">{devCode}</span>
                </div>
              )}

              {!codeSent ? (
                <button
                  onClick={handleSendCode}
                  disabled={busy}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-sand-200"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Send Verification Code
                </button>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Enter 5-Digit Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • • •"
                        className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-center text-lg font-bold tracking-widest text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                    <button
                      onClick={handleSendCode}
                      disabled={busy}
                      className="mt-2 text-xs text-cyan-600 hover:text-cyan-700"
                    >
                      Resend code
                    </button>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Set Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-600">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyAndSignUp}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Verify & Create Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LOGIN STEP */}
          {step === "login" && (
            <div className="ts-fade-in">
              <button
                onClick={() => setStep("welcome")}
                className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-slate-800">Sign In</h2>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back! Sign in to continue exploring.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Sign In
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <button
                  onClick={() => setStep("role")}
                  className="font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Create one
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Sparkles className="mr-1 inline h-3 w-3" />
          Travel Stories — Discover Incredible India
        </p>
      </div>
    </div>
  );
}

function SetPasswordScreen({
  password,
  confirmPassword,
  setPasswordVal,
  setConfirmPassword,
  error,
  busy,
  onSubmit,
}: {
  password: string;
  confirmPassword: string;
  setPasswordVal: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  error: string | null;
  busy: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="ts-app-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ts-gradient-primary shadow-lg shadow-cyan-500/30">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Set Your Password</h1>
          <p className="text-sm text-slate-500">
            Your email is verified. Now set a password to access your account.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-sand-200 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-sand-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
            <button
              onClick={onSubmit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Set Password & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
