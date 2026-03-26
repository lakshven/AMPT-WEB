import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { usePopup } from "../context/PopupContext";
import { useAuth } from "../context/AuthContext";

export interface Asset {
  id?: number | string;
  isNewAsset?: boolean;
  [key: string]: any;
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Search
  const [search, setSearch] = useState("");

  // Deleted toggle
  const [showDeleted, setShowDeleted] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Column filters
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Editing state
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editedAsset, setEditedAsset] = useState<Asset>({});
  const [newAsset, setNewAsset] = useState<Asset | null>(null);

  // Temp file state (kept for compatibility)
  const [tempUploadedFiles, setTempUploadedFiles] = useState<Record<string, File | null>>({});
  const [tempDefaultSelected, setTempDefaultSelected] = useState<Record<string, boolean>>({});

  const { showPopup } = usePopup();
  const { user, role, clientGroupId } = useAuth();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isCompanyAccount = user?.accountType === "company";
  const isAppAdmin = role === "app_admin";

  const canModify =
    role === "company_admin" ||
    role === "asset_manager" ||
    role === "editor" ||
    role === "app_admin" ||
    role === "single_user" ||
    role === "personal_owner";

  // Fetch assets
  const fetchAssets = useCallback(
    async (params: any = {}) => {
      if (!user || !token) return;

      try {
        const finalParams: any = {
          includeDeleted: params.includeDeleted ?? showDeleted,
          page: params.page ?? page,
          limit: params.limit ?? limit,
          search: params.search ?? search,
          sortBy: params.sortBy ?? sortBy,
          sortOrder: params.sortOrder ?? sortOrder,
          filters: JSON.stringify(params.filters ?? filters),
        };

        if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
          finalParams.clientGroupId = clientGroupId;
        }

        const res = await axiosInstance.get("/assets", {
          params: finalParams,
          headers: { "Cache-Control": "no-cache" },
        });

        const list = Array.isArray(res.data)
          ? res.data
          : res.data.assets || res.data.data || [];

        const normalized = list.map((a: any) => ({
          ...a,
          isNewAsset: false,
        }));

        setAssets(normalized);
        setTotal(res.data.total ?? normalized.length);
      } catch (err) {
        console.error("Error fetching assets:", err);
      }
    },
    [
      user,
      token,
      page,
      limit,
      search,
      showDeleted,
      sortBy,
      sortOrder,
      filters,
      clientGroupId,
      isCompanyAccount,
      isAppAdmin,
    ]
  );

  useEffect(() => {
    if (user && token) {
      fetchAssets();
    }
  }, [user, token, page, limit, search, showDeleted, sortBy, sortOrder, filters, fetchAssets]);

  // Edit existing asset
  const handleEdit = (asset: Asset) => {
    if (!canModify) return;
    if (!asset.id) return;
    setEditingId(asset.id!);
    setEditedAsset({ ...asset });
  };

  // Delete asset
  const handleDelete = async (id: number | string): Promise<void> => {
    if (!canModify || !user || !token) return Promise.resolve();

    try {
      const params: any = { includeDelete: true };
      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        params.clientGroupId = clientGroupId;
      }

      const res = await axiosInstance.delete(`/assets/${id}`, { params });

      showPopup(res.data.message || "Row deleted successfully");

      setAssets((prev) => prev.filter((a) => a.id !== id));

      await fetchAssets({ includeDeleted: true });
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  };

  // Restore asset
  const handleRestore = async (id: number | string): Promise<void> => {
    if (!canModify || !user || !token) return Promise.resolve();
    try {
      const res = await axiosInstance.put(`/assets/restore/${id}`);
      showPopup(res.data.message || "Asset restored successfully");
      await fetchAssets({ includeDeleted: false });
    } catch (err) {
      console.error("Error restoring asset:", err);
    }
  };

  // Save edited asset
  const handleSave = async (): Promise<void> => {
    if (!canModify || !user || !token || editingId == null) return Promise.resolve();

    try {
      const original = assets.find((a) => a.id === editingId) || {};

      const payload: any = {
        ...original,
        ...editedAsset,
      };
      // ⭐ FIX: ensure Prisma-safe values (no undefined)
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) payload[key] = "";
      });
      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        payload.clientGroupId = Number(clientGroupId);
      }

      const res = await axiosInstance.put(`/assets/${editingId}`, payload);

      showPopup(res.data.message || "Asset updated successfully");

      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...res.data.asset,
                isNewAsset: false,
                geocodeWarning: res.data.geocodeWarning,
              }
            : a
        )
      );

      setEditingId(null);
      setEditedAsset({});
      await fetchAssets();
    } catch (err) {
      console.error("Error updating asset:", err);
    }
  };

  // Add new asset row
  const handleAdd = () => {
    if (!canModify) return;
    if (newAsset) return;

    const tempId = `temp-${Math.random().toString(36).slice(2)}`;

    const blankAsset: Asset = {
      id: tempId,
      elr: "",
      structure_no: "",
      mileage: "",
      structure_type: "",
      spans: "",
      structure_name: "",
      location: "",
      carries: "",
      over: "",
      material_type: "",
      work_item: "",
      possible_consequence: "",
      current_likelihood: "",
      current_severity: "",
      current_rating: "",
      current_date_logged: "",
      risk_mitigation_proposals: "",
      mitigation_likelihood: "",
      mitigation_severity: "",
      mitigation_rating: "",
      mitigation_completion: "",
      status: "",
      detailed_exam_years: "",
      last_exam: "",
      next_exam: "",
      visual_report: "",
      detailed_report: "",
      assessment: "",
      records: "",
      isNewAsset: true,
    };

    setNewAsset(blankAsset);
    setEditingId(blankAsset.id!);
    setEditedAsset(blankAsset);
  };

  // Save new asset
  const handleSaveNew = async (): Promise<void> => {
    if (!canModify || !user || !token || !newAsset) return Promise.resolve();

    try {
      const payload: any = {
        ...newAsset,
        ...editedAsset,
      };
      // ⭐ FIX: ensure Prisma-safe values (no undefined)
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) payload[key] = "";
      });
      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        payload.clientGroupId = Number(clientGroupId);
      }

      const res = await axiosInstance.post("/assets", payload);

      showPopup(res.data.message || "Asset created successfully");

      const created = {
        ...res.data.asset,
        isNewAsset: false,
        geocodeWarning: res.data.geocodeWarning,
      };

      setAssets((prev) => [created, ...prev]);
      setNewAsset(null);
      setEditingId(null);
      setEditedAsset({});
      setTempUploadedFiles({});
      setTempDefaultSelected({});
      await fetchAssets();
    } catch (err) {
      console.error("Error creating asset:", err);
    }
  };

  return {
    assets,
    total,
    page,
    limit,
    search,
    showDeleted,
    setPage,
    setLimit,
    setSearch,
    setShowDeleted,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    filters,
    setFilters,
    editingId,
    editedAsset,
    setEditedAsset,
    newAsset,
    fetchAssets,
    handleEdit,
    handleDelete,
    handleRestore,
    handleSave,
    handleAdd,
    handleSaveNew,
    setEditingId,
    tempUploadedFiles,
    setTempUploadedFiles,
    tempDefaultSelected,
    setTempDefaultSelected,
  };
}

