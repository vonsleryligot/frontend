import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { forgotPassword,  } from "../../api";
import { AxiosError } from "axios";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  // const navigate = useNavigate();

  // If token exists in URL, show Reset Password Form instead of Forgot Password
  if (token) {
    return <ResetPasswordForm token={token} />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
  
    if (!email) {
      setError("Email is required");
      return;
    }
  
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccessMessage("A password reset link has been sent to your email.");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Forgot password error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to receive a password reset link.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  aria-required="true"
                />
              </div>
              {/* Error Message */}
              {error && <p className="text-red-500">{error}</p>}
              {/* Success Message */}
              {successMessage && <p className="text-green-500">{successMessage}</p>}
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs 
                  ${loading ? "cursor-not-allowed opacity-70" : "hover:bg-brand-600"}`}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remembered your password? <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reset Password Form Component
function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/accounts/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setError(data.message || "Password reset failed.");
      }
    } catch {
      setError("An error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }    
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
