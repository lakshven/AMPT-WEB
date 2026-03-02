import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientGroupCreateForm from "../../components/ClientGroups/forms/ClientGroupCreateForm";
import { useAuth } from "../../context/AuthContext";

export default function CreateClientGroupPage() {
  const navigate = useNavigate();
  const {  refreshUser } = useAuth();

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white px-4 py-2 rounded-md hover:opacity-90"
            style={{ backgroundColor: "#549E39" }} 
          >
            Go to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4" style={{color: "#0989B1"}}>
          Create Client Group
        </h2>

        {error && <p className="mb-4 px-3 py-2 rounded font-medium"
            style={{ backgroundColor: "#0989B1", color: "white" }} >{error}</p>}
        {success && <p className="mb-4 px-3 py-2 rounded font-medium"
            style={{ backgroundColor: "#549E39", color: "white" }} >{success}</p>}

        <ClientGroupCreateForm
          onCreated={async() => {
            setSuccess("Client group created successfully");
            setError("");
            // ⭐ Refresh user so role becomes company_admin
            await refreshUser();
            // ⭐ After refresh, user is now company_admin → go to admin pages
            navigate("/admin/client-groups/manage-new");
          }}
        />
        
      </div>
    </div>
  );
}