import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkStartup = async () => {
      try {
        const res = await axiosInstance.get("/startup");

        if (res.data?.next === "personal_dashboard") {
          navigate("/dashboard/personal", { replace: true });
        } else if (res.data?.next === "company_dashboard") {
          navigate("/dashboard/company", { replace: true });
        } else if (res.data?.next === "join_client_group") {
          navigate("/join-group", { replace: true });
        } else {
          navigate("/dashboard/company", { replace: true });
        }
      } catch (err) {
        console.error("Startup error:", err);
      }
    };

    checkStartup();
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background: "linear-gradient(135deg, #549E39 0%, #066A6F 100%)",
      }}
    >
      <Navbar mode="landing" />

      {/* ⭐ Responsive Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-10 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-blue-100">
          Asset Management Prioritisation Tool
        </h1>

        <p className="mt-4 text-blue-100 text-base md:text-lg leading-relaxed">
          A unified platform for managing rail and highway assets, bringing together condition data,
          risk insights, maintenance history, and geospatial mapping in one secure environment.
          Designed to support operational teams today and evolve toward predictive analytics,
          automated prioritisation, and long‑term investment planning.
        </p>
      </main>

      {/* ⭐ Responsive Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-6 py-6 gap-4 border-t border-white/20 text-white/80 text-sm">
        <img
          src="/images/ECSL-Transparent.png"
          alt="ECSL Logo"
          className="w-40 opacity-80"
        />

        <p className="text-center md:text-right text-[16px] md:text-[20px] font-bold text-blue-100">
          © 2026 ECSL • 24-hour customer support • Compliant with Network Rail and
          National Highways standards
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
