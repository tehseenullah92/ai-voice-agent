import { useState } from "react";
import { Link } from "react-router";
import { AuthLayout } from "./auth-layout";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, ArrowLeft, Loader2, CheckCircle2, Send } from "lucide-react";

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-[#10b981]" />
          </div>
          <h2
            className="text-2xl text-[#0f172a] mb-2"
            style={{ fontWeight: 700 }}
          >
            Check your email
          </h2>
          <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
            We've sent a password reset link to
            <br />
            <span
              className="text-[#0f172a]"
              style={{ fontWeight: 500 }}
            >
              {email}
            </span>
          </p>

          <div className="bg-[#f1f5f9] rounded-[5px] p-4 mb-6">
            <p className="text-xs text-[#64748b] leading-relaxed">
              The link will expire in 60 minutes. If you don't see the email,
              check your spam folder or request a new one.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full h-10 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
            style={{ fontWeight: 500 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Resend Email
              </>
            )}
          </button>

          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
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
          Forgot your password?
        </h2>
        <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
          No worries. Enter the email associated with your account and we'll
          send you a reset link.
        </p>

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
                autoFocus
              />
            </div>
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
              <>
                Send Reset Link <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
