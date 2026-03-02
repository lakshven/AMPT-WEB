import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

// ✅ Type for URL params
type ResetParams = {
  token?: string;
};

const ResetPassword: React.FC = () => {
  const { token } = useParams<ResetParams>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ✅ Handle password reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message || "Password reset successful");

      if (res.data.message.toLowerCase().includes("success")) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      console.error("Reset error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Server error during reset");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}
        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded text-black"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border px-3 py-2 rounded text-black"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;