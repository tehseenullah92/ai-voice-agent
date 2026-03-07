import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { AuthLayout } from "./auth-layout";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "your email";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newCode.every((c) => c !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = (codeStr: string) => {
    if (codeStr.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1200);
  };

  const handleResend = () => {
    setResendTimer(60);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  if (verified) {
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
            Email verified!
          </h2>
          <p className="text-sm text-[#64748b] mb-8 leading-relaxed">
            Your account has been successfully verified. You're all set to start
            using Convaire.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-10 bg-[#1a8ee9] hover:bg-[#0b5b9a] text-white rounded-[5px] text-sm transition-colors flex items-center justify-center gap-2"
            style={{ fontWeight: 500 }}
          >
            Go to Dashboard
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign up
        </Link>

        <div className="flex items-center justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#1a8ee9]/10 flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#1a8ee9]" />
          </div>
        </div>

        <h2
          className="text-2xl text-[#0f172a] mb-1 text-center"
          style={{ fontWeight: 700 }}
        >
          Verify your email
        </h2>
        <p className="text-sm text-[#64748b] mb-8 text-center leading-relaxed">
          We've sent a 6-digit verification code to
          <br />
          <span className="text-[#0f172a]" style={{ fontWeight: 500 }}>
            {email}
          </span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-[5px] mb-4">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl rounded-[5px] border outline-none transition-all ${digit
                  ? "border-[#1a8ee9] bg-[#1a8ee9]/5 text-[#0f172a]"
                  : "border-[#e2e8f0] bg-white text-[#0f172a]"
                } focus:border-[#1a8ee9] focus:ring-2 focus:ring-[#1a8ee9]/20`}
              style={{ fontWeight: 600 }}
            />
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#1a8ee9]" />
            <span className="text-sm text-[#64748b]">Verifying...</span>
          </div>
        )}

        {/* Resend */}
        <div className="text-center">
          <p className="text-sm text-[#64748b] mb-1">
            Didn't receive the code?
          </p>
          {resendTimer > 0 ? (
            <p className="text-xs text-[#94a3b8]">
              Resend available in{" "}
              <span className="text-[#1a8ee9]" style={{ fontWeight: 500 }}>
                {resendTimer}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-sm text-[#1a8ee9] hover:text-[#0b5b9a] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend Code
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
