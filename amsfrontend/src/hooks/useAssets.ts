import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { usePopup } from "../context/PopupContext";
import { useAuth } from "../context/AuthContext";

// ✅ Asset type (id optional so {} is valid)
export interface Asset {
  id?: number | string;
  isNewAsset?: boolean; // NEW flag to indicate if this asset is newly created and not yet saved to backend
  [key: string]: any;
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  // ⭐ Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  // ⭐ Globalsearch
  const [search, setSearch] = useState("");
  // ⭐ Deleted toggle
  const [showDeleted, setShowDeleted] = useState(false);
  // ⭐ Sorting
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
   // ⭐ NEW — Column Filters
  const [filters, setFilters] = useState<Record<string, any>>({});
  //  ⭐ Editing states
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editedAsset, setEditedAsset] = useState<Asset>({});
  const [newAsset, setNewAsset] = useState<Asset | null>(null);
  const [isNewAsset, setIsNewAsset] = useState<boolean>(false); // NEW state to track if we're adding a new asset
  const [message, setMessage] = useState<string>("");
  // ⭐ NEW — temp file state for new assets
  const [tempUploadedFiles, setTempUploadedFiles] = useState<Record<string, File | null>>({});
  const [tempDefaultSelected, setTempDefaultSelected] = useState<Record<string, boolean>>({});

  const { showPopup } = usePopup();
  const { user, role, clientGroupId } = useAuth();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isCompanyAccount = user?.accountType === "company";
  const isSingleAccount = user?.accountType === "single";
  const isAppAdmin = role === "app_admin";

  const canModify =
    role === "company_admin" ||
    role === "asset_manager" ||
    role === "editor" ||
    role === "app_admin" ||
    role === "single_user" ||
    role === "personal_owner";

  // ⭐ fetchAssets now also respects sortBy/sortOrder
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
          // ⭐ NEW — send filters to backend
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
        // ⭐ IMPORTANT: list assets are NEVER new assets
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
  // ⭐ Auto-refresh when pagination/filter/sort changes
  useEffect(() => {
    if (user && token) {
      fetchAssets();
    }
  }, [user, token, page, limit, search, showDeleted, sortBy, sortOrder, filters, fetchAssets]);
 // Editing logic
  const handleEdit = (asset: Asset) => {
    if (!canModify) return;
    if (!asset.id) return;
    setEditingId(asset.id!);
    setEditedAsset({ ...asset });
  };

  const handleDelete = async (id: number | string): Promise<void> => {
    if (!canModify || !user || !token) return Promise.resolve();

    try {
      const params: any = { includeDelete: true };
      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        params.clientGroupId = clientGroupId;
      }

      const res = await axiosInstance.delete(`/assets/${id}`, { params,});

      showPopup(res.data.message || "Row deleted successfully");

      setAssets((prev) => prev.filter((a) => a.id !== id));

      await fetchAssets({ includeDeleted: true });
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  };

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

  const handleSave = async (): Promise<void> => {
    if (!canModify || !user || !token || editingId == null)
      return Promise.resolve();
    try {
      const original = assets.find((a) => a.id === editingId) || {};

      const payload: any = {
        ...original,
        ...editedAsset,
      };

      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        payload.clientGroupId = Number(clientGroupId);
      }

      const res = await axiosInstance.put(`/assets/${editingId}`, payload);

      showPopup(res.data.message || "Asset updated successfully");

      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...res.data.asset, isNewAsset: false, geocodeWarning: res.data.geocodeWarning }
            : a
        )
      );

      setEditingId(null);
      setIsNewAsset(false);
      await fetchAssets();
    } catch (err) {
      console.error("Error updating asset:", err);
    }
  };

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
      isNewAsset: true, // Mark this asset as new
    };

    setNewAsset(blankAsset);
    // setAssets((prev) => [blankAsset, ...prev]);
    setEditingId(blankAsset.id!);
    setEditedAsset(blankAsset);
    setIsNewAsset(true);
  };

  const handleSaveNew = async (): Promise<void> => {
    if (!canModify || !user || !token || editingId === null)
      return Promise.resolve();
    try {
      const trimmedEntries = Object.entries(editedAsset).map(([key, val]) => [
        key,
        typeof val === "string" ? val.trim() : val,
      ]);
      const trimmed: any = Object.fromEntries(trimmedEntries);

      const cleanedEntries = Object.entries(trimmed).filter(
        ([_, val]) => val !== "" && val !== null && val !== undefined
      );
      const cleaned: any = Object.fromEntries(cleanedEntries);

      const dateFields = [
        "current_date_logged",
        "mitigation_completion",
        "last_exam",
        "next_exam",
      ];

      for (const field of dateFields) {
        if (cleaned[field]) {
          cleaned[field] = new Date(cleaned[field]);
        }
      }
      // Prevent sending temporary frontend-only fields
    delete cleaned.id;
    delete cleaned.isNewAsset;

    // Prevent Prisma INT overflow for risk_rating
    if (cleaned.risk_rating != null && cleaned.risk_rating !== "") {
      const n = Number(cleaned.risk_rating);
      if (Number.isNaN(n) || n < -2147483648 || n > 2147483647) {
        delete cleaned.risk_rating; // backend will treat as null
      }
    }

      const payload: any = { ...cleaned, };

      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        payload.clientGroupId = Number(clientGroupId);
      }

      const res = await axiosInstance.post("/assets", payload);
      const newId = res.data.asset.id;
      showPopup(res.data.message || "Asset added successfully");
          // ⭐ STEP 2 — Apply default file (if selected)
      const tempKey = String(editingId);

      if (tempDefaultSelected[tempKey]) {
      await axiosInstance.post("/upload/set-default-file", {
        rowId: newId,
        column: "exam_report", // You may need to loop through columns if multiple
      });
    }

    // ⭐ STEP 3 — Upload file (if user uploaded one)
    const uploadedFile = tempUploadedFiles[tempKey];
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("column", "exam_report" ); // Same note: loop if needed
      formData.append("rowId", String(newId));

      await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }


      setAssets((prev) => {
        const withoutTemp = prev.filter((a) => a.id !== editingId);
        return [...withoutTemp, {...res.data.asset, isNewAsset: false}];
      });

      setEditingId(null);
      setNewAsset(null);
      setEditedAsset({});
      setIsNewAsset(false);
      setTempUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[editingId];
      return copy;
      });

     setTempDefaultSelected((prev) => {
      const copy = { ...prev };
      delete copy[editingId];
      return copy;
     });
      await fetchAssets();
    } catch (err) {
      console.error("Error adding asset:", err);
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
    newAsset,

    fetchAssets,
    handleEdit,
    handleDelete,
    handleRestore,
    handleSave,
    handleAdd,
    handleSaveNew,
    setEditingId,
    setEditedAsset,
    isNewAsset,
    setIsNewAsset,
    message,
  };
}