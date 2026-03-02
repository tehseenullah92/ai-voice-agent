import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { AuthLayout } from "./auth-layout";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Check,
  ShieldCheck,
} from "lucide-react";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const failedRules = passwordRules.filter((r) => !r.test(password));
    if (failedRules.length > 0) {
      setError("Password does not meet the requirements.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-[#10b981]" />
          </div>
          <h2
            className="text-2xl text-[#0f172a] mb-2"
            style={{ fontWeight: 700 }}
          >
            Password reset successful
          </h2>
          <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
            Your password has been updated. You can now sign in with your new
            password.
          </p>

          <button
            onClick={() => navigate("/signin")}
            className="w-full h-10 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center justify-center gap-2"
            style={{ fontWeight: 500 }}
          >
            Continue to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <Link
          to="/signin"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <h2
          className="text-2xl text-[#0f172a] mb-1"
          style={{ fontWeight: 700 }}
        >
          Set a new password
        </h2>
        <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
          Your new password must be different from previously used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-[5px]">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-[#475569]">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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
            {password && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {passwordRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                        rule.test(password) ? "bg-[#10b981]" : "bg-[#e2e8f0]"
                      }`}
                    >
                      {rule.test(password) && (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] ${
                        rule.test(password)
                          ? "text-[#10b981]"
                          : "text-[#94a3b8]"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[#475569]">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-[5px] border-[#e2e8f0] bg-white text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword && password && (
              <div className="flex items-center gap-1.5 mt-1">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[11px] text-[#10b981]">
                      Passwords match
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-[8px]" style={{ fontWeight: 700 }}>!</span>
                    </div>
                    <span className="text-[11px] text-red-500">
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
