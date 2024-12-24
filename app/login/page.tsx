// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("credentials"); // credentials or otp
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep("otp");
        setMessage(data.message);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {step === "credentials" ? (
          <>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={handleLogin}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login
              </button>
            </div>
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
              />
              <button
                onClick={handleVerifyOtp}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Verify OTP
              </button>
              <button
                onClick={() => setStep("credentials")}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back
              </button>
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
