import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

interface SignupForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  accountType: "single" | "company";
  isCompanyAdmin?: boolean;
  companyName?: string;
}
const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    accountType: "single",
    isCompanyAdmin: true, // default for company
  });
// ⭐ NEW: inviteToken flow state
  const location = useLocation();
  const inviteState = location.state as any;
  console.log("🔥 INVITE STATE FROM NAVIGATION:", inviteState);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  // ⭐ NEW INVITE TOKEN FLOW — detect token from VerifyInvitePage
  useEffect(() => {
    if (inviteState?.token) {
      setForm(prev => ({
        ...prev,
        email: inviteState.email || "",
        accountType: "company",
        isCompanyAdmin: false
      }));
    }
  }, [inviteState]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("🔥 SUBMITTING SIGNUP FORM");
      let payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      };
      // ⭐ NEW INVITE TOKEN FLOW
      if (inviteState?.token) {
        payload.inviteToken = inviteState.token;
        payload.accountType = "company";
        payload.isCompanyAdmin = false;
      } else {
        // Normal signup
        payload.accountType = form.accountType;
        payload.isCompanyAdmin = form.isCompanyAdmin;
        // ⭐ SINGLE USER → MUST SEND companyId
        if (form.accountType === "single") {
         // Single users do NOT send companyId or isCompanyAdmin
        }
        if (form.accountType === "company") {
           payload.isCompanyAdmin = form.isCompanyAdmin;
          if (form.isCompanyAdmin) {
            payload.companyName = form.companyName;
          } 
        }
      }
      console.log("🔥 PAYLOAD SENT TO BACKEND:", payload);
      const res = await axiosInstance.post("/auth/signup", payload);
      const data = res.data;

      if (data.success) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      setError("Server error during signup");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/amsimage.png')" }}
      ></div>
      {/* Company brand gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r 
                      from-[#549E39]/40 
                      via-[#549E39]/10 
                      to-[#0989B1]/40 
                      mix-blend-multiply">
      </div>

      {/* Slight darkening for readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      {/* Signup container */}
      <div className="relative z-10 w-full max-w-4xl p-8 rounded-lg">

        <div className="flex justify-end mb-4">
          <img
            src="/images/AMPT5.png"
            alt="Logo"
            className="h-12 w-auto ml-auto mb-4"
          />
        </div>

        <div className="text-left text-white mb-6">
          <h4 className="text-lg font-semiblod tracking-wide">WELCOME</h4>
          <h2 className="text-3xl font-bold leading-tight">
            ASSET MANAGEMENT PRIORITISATION TOOL
          </h2>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h3 className="text-center text-base font-medium text-gray-700 mb-6">
            USER SIGNUP
          </h3>

          {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md text-black"
            />

            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md text-black"
            />

            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md text-black"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md text-black"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md text-black"
            />
            {/* Hide company fields if invited */}
            {!inviteState?.token && (
              <>
                {/* ACCOUNT TYPE */}
                <select
                  name="accountType"
                  value={form.accountType}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md text-black"
                >
                  <option value="single">Single User</option>
                  <option value="company">Company</option>
                </select>

                {/* COMPANY ACCOUNT */}
                {form.accountType === "company" && (
                  <>
                    <select
                      name="isCompanyAdmin"
                      value={form.isCompanyAdmin ? "true" : "false"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isCompanyAdmin: e.target.value === "true"
                        })
                      }
                      className="w-full border px-3 py-2 rounded-md text-black"
                    >
                      <option value="true">Company Admin</option>
                      <option value="false">Company User</option>
                    </select>

                    {form.isCompanyAdmin && (
                      <input
                        name="companyName"
                        placeholder="Company Name"
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded-md text-black"
                      />
                    )}
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            <span>Already have an account? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;