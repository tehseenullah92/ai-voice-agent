import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../auth";
import { AuthLayout } from "./auth-layout";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function SignInPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    login({ email, password })
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Unable to sign in. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout>
      <div>
        <h2
          className="text-2xl text-[#0f172a] mb-1"
          style={{ fontWeight: 700 }}
        >
          Welcome back
        </h2>
        <p className="text-sm text-[#64748b] mb-8">
          Sign in to your Convaire account to continue.
        </p>

        {/* Social Sign In */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="flex items-center justify-center gap-2 h-10 rounded-[5px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 h-10 rounded-[5px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0f172a">
              <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.22.06.45.06.68zm2.67 17.38c-.018.04-.035.08-.05.11-.65 1.4-1.62 2.78-2.9 2.78-.66 0-1.11-.43-1.77-.43-.68 0-1.19.45-1.8.45-1.18 0-2.59-2.29-3.34-4.15-1.02-2.57-1.2-5.59-.53-7.15.47-.99 1.32-1.66 2.26-1.66.85 0 1.39.43 2.09.43.68 0 1.09-.43 2.07-.43.82 0 1.56.45 2.14 1.22-1.88 1.03-1.58 3.71.26 4.43-.37 1.04-.87 2.08-1.57 3.06l.03-.04z" />
            </svg>
            Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#f8fafc] px-3 text-[#94a3b8]">
              or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-[5px]">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-[#475569]">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 rounded-[5px] border-[#e2e8f0] bg-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-[#475569]">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#1a8ee9] hover:text-[#0b5b9a] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-[5px] border-[#e2e8f0] bg-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-3.5 h-3.5 rounded border-[#e2e8f0] text-[#1a8ee9] focus:ring-[#1a8ee9]"
            />
            <label
              htmlFor="remember"
              className="text-xs text-[#64748b] cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full h-10 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {loading || authLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-[#64748b] text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#1a8ee9] hover:text-[#0b5b9a] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
