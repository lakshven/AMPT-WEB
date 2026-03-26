import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import ClientGroupListNew from "../../components/ClientGroups/table/ClientGroupListNew";
import InviteUserModal from "../../components/Users/InviteUserModal";
import { useAuth } from "../../context/AuthContext";

export default function ClientGroupManagementNew() {
  const navigate = useNavigate();
  const { role, companyId } = useAuth();

  const [groups, setGroups] = useState([]);
  const [inviteGroupId, setInviteGroupId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      let query = `/client-groups?filter=active`;
      // ⭐ company_admin → restrict to their company (backend-safe, optional)
      if (role === "company_admin" && companyId) {
        query += `&companyId=${companyId}`;
      }

      const res = await axiosInstance.get(query);
      if (res.data.success) {
        setGroups(res.data.groups);
        setMessage("");
      }else{
        setMessage("Failed to load client groups");

      }
    } catch {
      setMessage("Failed to load client groups");
    }
  }, [role, companyId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className=" text-white px-4 py-2 rounded-md hover:opacity-90"
            style={{ backgroundColor: "#549E39" }}
          >
            Go to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4" style={{color: "#0989B1"}}>
          Client Groups — New Invite Token Flow
        </h2>

        {message && (
          <p
            className="mb-4 font-medium px-3 py-2 rounded"
            style={{
              backgroundColor: "#0989B1",            // ⭐ company blue
              color: "white"
            }}
          >
            {message}
          </p>
        )}


        <ClientGroupListNew
          groups={groups}
          onInvite={(id) => setInviteGroupId(id)}
        />
      </div>
       {inviteGroupId && (
        <InviteUserModal
          groupId={inviteGroupId}
          onClose={() => setInviteGroupId(null)}
        />
      )}
    </div>
  );
}
