import React, { useState } from "react";
import { HiUserCircle, HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useHandleLogin } from "../../hooks/useHandleLogin";

interface LoginProps {
  onLogin?: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const handleLogin = useHandleLogin(); // ⭐ Centralized login handler

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login", {
        identifier,
        password,
        rememberMe,
      });

      const data = response.data;

      if (!data.success) {
       localStorage.removeItem("token"); 
       setError(data.message || "Invalid credentials");
        return;
      }
      //only store token login actually successed
      if(data.token)
      {
        localStorage.setItem("token", data.token);
      }

      handleLogin(data);
      if (onLogin) onLogin(data.user);

      navigate("/redirect");
    } catch (err: any) {
      console.error("Login error full response:", {
         status: err.response?.data,
         data: err.response?.data,
         headers: err.response?.headers,
       });
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/amsimage.png')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r 
                      from-[#549E39]/60 
                      via-[#549E39]/20 
                      to-[#0989B1]/60 
                      mix-blend-multiply" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 p-6 rounded shadow-md h-full min-h-[700px] w-[700px]">

        {/* ⭐ WELCOME + AMPT ICON SIDE BY SIDE */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* Left: WELCOME AMPT */}
          <div className="text-center whitespace-nowrap animate-pulse">
            <h4 className="text-3xl font-bold text-white">WELCOME</h4>
          </div>

          {/* Right: AMPT Icon */}
          <img
            src="/images/AMPT5.png"
            alt="Logo"
            className="h-16 w-auto animate-pulse"
          />
        </div>

        {/* LOGIN BOX */}
        <div className="bg-blue-100 p-6 rounded shadow-md w-[350px] mx-auto z-20">
          <div className="flex justify-center mb-4 text-white-600">
            <HiUserCircle size={64} />
          </div>

          <h3 className="text-center text-sm text-gray-500 mb-6">USER LOGIN</h3>

          {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Identifier */}
            <div className="relative">
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="peer w-full border px-3 pt-5 pb-2 rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <label
                htmlFor="identifier"
                className="absolute left-3 top-3 text-gray-500 text-sm transition-all
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-red-600"
              >
                Username / Email
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full border px-3 pt-5 pb-2 rounded focus:outline-none focus:ring focus:border-blue-300 text-black pr-10"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-3 text-gray-500 text-sm transition-all
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
                  peer-focus:top-2 peer-focus:text-sm peer-focus:text-red-600"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
                tabIndex={-1}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 font-bold"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          {/* Signup link */}
          {/* <div className="mt-4 text-sm text-center">
            <span className="text-white">New user? </span>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
