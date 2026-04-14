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
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: "linear-gradient(135deg, #066A6F 0%, #549E39 100%)",
      }}
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-blue-100">
        Welcome to AMPT
      </h1>

      <p className="text-blue-100 text-center max-w-xl mb-8 text-lg leading-relaxed">
        You can go directly to your dashboard, or create a Client Group if you need one.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {isSingleUser && (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 rounded-xl bg-[#549E39] hover:bg-[#447f2f] text-white font-semibold shadow-md transition duration-200"
          >
            Create Client Group
          </button>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl bg-[#0989B1] hover:bg-[#0A6F8A] text-white font-semibold shadow-md transition duration-200"
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
              className="bg-[#549E39] text-white px-4 py-2 rounded hover:bg-[#447f2f]"
            >
              Yes, Continue
            </button>

            <button
              onClick={() => {
                setShowConfirm(false);
                navigate("/dashboard");
              }}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              No, Go to Dashboard
            </button>
          </div>
        </ModalPopup>
      )}
    </div>
  );
}
