// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("registration"); // registration or otp
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    try {
      setError("");
      setMessage("");
      setLoading(true);

      if (!validateInputs()) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        setMessage(data.message);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError("");
      setMessage("");
      setLoading(true);

      if (!otp) {
        setError("Please enter the OTP");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setError("");
      setMessage("");
      setLoading(true);

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("OTP resent successfully!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {step === "registration" ? (
          <>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-600">
                Login here
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Please enter the OTP sent to your email
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep("registration")}
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to registration
                </button>
                <button
                  onClick={resendOtp}
                  disabled={loading}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
