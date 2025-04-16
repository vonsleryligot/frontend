import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { AxiosError } from "axios";

export default function VerificationForm() {
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/accounts/verify-email", { token: verificationToken.trim() });
      setSuccess("Verification successful! You can now log in.");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Invalid verification token.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("No email found. Please check your registration email.");
      return;
    }

    if (resendCountdown > 0) return;

    setResending(true);
    setError("");
    setResendMessage("");

    try {
      await api.post("/accounts/resend-verification", { email }); // endpoint name fixed
      setResendMessage("A new verification email has been sent.");
      setResendCountdown(30);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto">
      <div>
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the verification token sent to your email.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>Verification Token</Label>
              <Input
                type="text"
                placeholder="Enter verification token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
              />
            </div>
            {error && <p className="text-error-500 text-sm">{error}</p>}
            {success && <p className="text-success-500 text-sm">{success}</p>}
            {resendMessage && <p className="text-success-500 text-sm">{resendMessage}</p>}
            <div>
              <Button className="w-full" size="sm" data-type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </form>
        <div className="mt-5 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Didn’t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resending || resendCountdown > 0}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              {resending
                ? "Resending..."
                : resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
