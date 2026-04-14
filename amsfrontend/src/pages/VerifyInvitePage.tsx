// src/pages/VerifyInvitePage.tsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [group, setGroup] = useState(null);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await axiosInstance.get("/client-groups/verify-invite", {
          params: { token },
        });

        if (res.data.success) {
          setGroup(res.data.group);
          setRole(res.data.role);
          setEmail(res.data.email || "");
          setValid(true);
        }
      } catch (err) {
        console.error("Invalid invite:", err);
        setValid(false);
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  const goToSignup = () => {
    navigate("/signup", {
      state: {
        token,
        groupId: group.id,
        role,
        email,
        accountType: "company",
      },
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 text-lg">
        Validating invite...
      </div>
    );

  if (!valid)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">
          Invalid or expired invite link
        </p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">You're Invited!</h2>

        <p className="text-gray-700 mb-2">
          You have been invited to join{" "}
          <strong className="text-blue-600">{group.name}</strong> as a{" "}
          <strong className="text-blue-600">{role}</strong>.
        </p>

        {email && (
          <p className="text-gray-600 mb-4">
            Invited Email: <span className="font-medium">{email}</span>
          </p>
        )}

        <button
          onClick={goToSignup}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md text-lg font-medium hover:bg-blue-700 transition"
        >
          Continue to Signup
        </button>
      </div>
    </div>
  );
}