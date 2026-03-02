import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import ClientGroupsTable from "../../components/ClientGroups/table/ClientGroupsTable";
import ClientGroupFilters from "../../components/ClientGroups/table/ClientGroupFilters";
import ClientGroupPagination from "../../components/ClientGroups/table/ClientGroupPagination";
import ClientGroupModals from "../../components/ClientGroups/forms/ClientGroupModals";
import {useAuth} from "../../context/AuthContext";
export default function ClientGroupListPage() {
  const navigate = useNavigate();
  const { role, companyId } = useAuth();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [filter, setFilter] = useState("active");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGroups = async () => {
    
    try {
      let query= `/client-groups?filter=${filter}&sort=${sort}&order=${order}&page=${page}&limit=${limit}`;
      // ⭐ company_admin → restrict to their company (backend-safe, optional)
      if (role === "company_admin" && companyId) {
        query += `&companyId=${companyId}`;
      }
      const res = await axiosInstance.get( query );

      if (res.data.success) {
        setGroups(res.data.groups);
        setPagination(res.data.pagination);
      }
    } catch {
      setError("Failed to load client groups");
    }
  };

  useEffect(() => {
    loadGroups();
  }, [filter, sort, order, page, role, companyId]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white px-4 py-2 rounded-md hover:opacity-90"
            style={{ backgroundColor: "#549E39" }}   // ⭐ company green
          >
            Go to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4" style={{color: "#0989B1"}}>
          Existing Client Groups 
        </h2>

        {error && <p className="mb-2 px-3 py-2 rounded font-medium"
            style={{ backgroundColor: "#0989B1", color: "white" }} >{error}</p>}
        {success && <p className="mb-2 px-3 py-2 rounded font-medium"
            style={{ backgroundColor: "#549E39", color: "white" }} >{success}</p>}
         <ClientGroupFilters
          filter={filter}
          sort={sort}
          order={order}
          onFilterChange={(v) => {
            setPage(1);
            setFilter(v);
          }}
          onSortChange={(v) => {
            setPage(1);
            setSort(v);
          }}
          onOrderChange={(v) => {
            setPage(1);
            setOrder(v);
          }}
        />
        {/* ⭐ NEW FLOW LIST ONLY */}
        <ClientGroupsTable
          groups={groups}
          onEdit={(g) => {
            setSelectedGroup(g);
            setModalType("edit");
          }}
          onDelete={(g) => {
            setSelectedGroup(g);
            setModalType("delete");
          }}
          onRestore={(g) => {
            setSelectedGroup(g);
            setModalType("restore");
          }}
        />
       

        <ClientGroupPagination
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />
      </div>

      <ClientGroupModals
        modalType={modalType}
        selectedGroup={selectedGroup}
        onClose={() => setModalType(null)}
        onSuccess={loadGroups}
      />
    </div>
  );
}