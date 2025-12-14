import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/auth/verify")({
  component: VerifyPage,
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || "",
      email: (search.email as string) || "",
    };
  },
});

function VerifyPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/verify" });
  const [code, setCode] = useState(search.code || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const verifyMutation = useMutation(api.auth.verifyEmail);
  const resendAction = useAction(api.auth.resendVerificationCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Auto-verify if code is in URL
  useEffect(() => {
    if (search.code) {
      handleAutoVerify(search.code);
    }
  }, [search.code]);

  const handleAutoVerify = async (code: string) => {
    setIsVerifying(true);
    try {
      const data = await verifyMutation({ code });
      setSuccess("Email verified successfully! Redirecting...");
      setError("");
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Verification failed");
      setSuccess("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyMutation({ code });
      setSuccess("Email verified successfully! Redirecting...");
      setError("");
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Verification failed");
      setSuccess("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!search.email) {
      setError("Email not found. Please try signing up again.");
      return;
    }
    setIsResending(true);
    try {
      await resendAction({ email: search.email });
      setSuccess("Verification code resent! Check your email.");
      setError("");
    } catch (error: any) {
      setError(error.message || "Failed to resend code");
      setSuccess("");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-400">
              We've sent a verification code to{" "}
              <span className="text-cyan-400">{search.email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {!search.code && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="XXXXXXXXXX"
                  maxLength={10}
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          )}

          {isVerifying && search.code && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              <p className="text-gray-400 mt-4">Verifying your email...</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-cyan-400 hover:text-cyan-300 font-medium text-sm disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
