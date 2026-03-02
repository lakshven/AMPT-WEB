import React, { useState } from "react";
import { useNavigator } from "../router/NavigationProvider";
import { useAuth } from "../context/AuthContext";
import ModalPopup from "../components/common/ModalPopup";

export default function StartupPage() {
  const navigate = useNavigator();
  const { role } = useAuth();

  const [showConfirm, setShowConfirm] = useState(false);

  const isSingleUser = role === "single_user";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a47] to-[#1e3a5f] text-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Welcome to AMPS
      </h1>

      <p className="text-blue-200 text-center max-w-xl mb-8 text-lg">
        You can go directly to your dashboard, or create a Client Group if you need one.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {isSingleUser && (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-[#073b24] font-semibold shadow-md transition duration-200"
          >
            Create Client Group
          </button>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-md transition duration-200"
        >
          Go to Dashboard
        </button>
      </div>

      {showConfirm && (
        <ModalPopup
          message="Do you want to create a new Client Group?"
          onClose={() => setShowConfirm(false)}
        >
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => navigate("/onboarding/create-group")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Yes, Continue
            </button>

            <button
              onClick={() => {
                setShowConfirm(false);
                navigate("/dashboard");
              }}
              className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500"
            >
              No, Go to Dashboard
            </button>
          </div>
        </ModalPopup>
      )}
    </div>
  );
}