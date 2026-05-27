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
    isCompanyAdmin: true,
  });

  const location = useLocation();
  const navigate = useNavigate();
  // ⭐ Read invite token from URL query string
  const query = new URLSearchParams(location.search);
  const inviteToken = query.get("token");
  const [error, setError] = useState<string>("");
  const [loadingInvite, setLoadingInvite] = useState<boolean>(true);
  // ⭐ If inviteToken exists → verify with backend
  useEffect(() => {
    const verifyInvite = async () => {
      if (!inviteToken) {
        setLoadingInvite(false);
        return;
      }

      try {
        const res = await axiosInstance.get(
          `/client-groups/verify-invite-token?token=${inviteToken}`
        );
 
        if (res.data.success) {
          setForm(prev => ({
            ...prev,
            email: res.data.email || "",
            accountType: "company",
            isCompanyAdmin: false
          }));
        } else {
          setError("Invalid or expired invite link");
        }
      } catch (err) {
        setError("Invalid or expired invite link");
      }

      setLoadingInvite(false);
    };

    verifyInvite();
  }, [inviteToken]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
      };

      if (inviteToken) {
        payload.inviteToken = inviteToken;
        payload.accountType = "company";
        payload.isCompanyAdmin = false;
      } else {
        payload.accountType = form.accountType;
        payload.isCompanyAdmin = form.isCompanyAdmin;

        if (form.accountType === "company") {
          if (form.isCompanyAdmin) {
            payload.companyName = form.companyName;
          }
        }
      }
      const endpoint = inviteToken
       ? "/auth/signup"            // Public route for invited users
       : "/auth/admin/signup";     // Protected route for app_admin manual signup

      const res = await axiosInstance.post(endpoint, payload, {
         headers: {
           Authorization: `Bearer ${localStorage.getItem("token")}`
         }
      });
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
  if (loadingInvite) {
    return (
      <div className="text-center text-white text-xl mt-20">
        Verifying invite link...
      </div>
    );
  }
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

        {/* ⭐ WELCOME + AMPT ICON (same as login) */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center whitespace-nowrap animate-pulse">
            <h4 className="text-3xl font-bold text-white">WELCOME</h4>
            <h2 className="text-2xl font-bold text-white">AMPT</h2>
          </div>

          <img
            src="/images/AMPT5.png"
            alt="Logo"
            className="h-16 w-auto animate-pulse"
          />
        </div>

        {/* SIGNUP BOX */}
        <div className="bg-blue-100 p-6 rounded shadow-md w-[350px] mx-auto z-20">
          <h3 className="text-center text-sm text-gray-500 mb-6">USER SIGNUP</h3>

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
              value={form.email}
              placeholder="Email"
              onChange={handleChange}
              required
              disabled={!!inviteToken} // Disable if email is pre-filled from invite
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
            {!inviteToken && (
              <>
                <select
                  name="accountType"
                  value={form.accountType}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-md text-black"
                >
                  <option value="single">Single User</option>
                  <option value="company">Company</option>
                </select>

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
