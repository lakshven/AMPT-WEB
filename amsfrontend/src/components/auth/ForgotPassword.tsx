import React, { useState } from "react";
import axiosInstance  from "../../utils/axiosInstance";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ✅ Step 1: Send Reset Code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });

      if (res.data.success) {
        setMessage("If this email exists, a reset code has been sent.");
      } else {
        setError(res.data.message || "Request failed");
      }
    } catch (err) {
      console.error("Forgot password error:", err.response?.data || err.message);
      setError("Server error. Please try again.");
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>

      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

  <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 border rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Send Reset Link
        </button>
      </form>


    </div>
  );
};

export default ForgotPassword;