import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { usePopup } from "../context/PopupContext";
import { useAuth } from "../context/AuthContext";
import { recalcWorkItem } from "../utils/riskCalculations";
export interface Asset {
  id?: number | string;
  isNewAsset?: boolean;
  workItems?: WorkItem[];
  [key: string]: any;
}
export interface WorkItem {
  id?: number | string;
  asset_id?: number | string;
  work_item?: string;
  possible_consequence?: string;
  current_likelihood?: number;
  current_severity?: number;
  current_rating?: number;
  current_date_logged?: string;
  risk_mitigation_proposals?: string;
  mitigation_likelihood?: number;
  mitigation_severity?: number;
  mitigation_rating?: number;
  mitigation_completion?: string;
  status?: string;
  [key: string]: any;
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editedAsset, setEditedAsset] = useState<Asset>({});
  const [newAsset, setNewAsset] = useState<Asset | null>(null);

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

  //  FETCH ASSETS
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

        const normalized: Asset[] = list.map((a: any) => ({
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
  }, [
    user,
    token,
    page,
    limit,
    search,
    showDeleted,
    sortBy,
    sortOrder,
    filters,
    fetchAssets,
  ]);

  //  EDIT ASSET
  const handleEdit = (asset: Asset) => {
    if (!canModify) return;

    const realAssetId = asset.id;
    if (!realAssetId) return;

    setEditingId(realAssetId);
    setEditedAsset({ ...asset });
  };

  //  DELETE ASSET
  const handleDelete = async (id: number | string): Promise<void> => {
    if (!canModify || !user || !token) return Promise.resolve();

    try {
      const params: any = { includeDeleted: true };

      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        params.clientGroupId = clientGroupId;
      }

      const res = await axiosInstance.delete(`/assets/${id}`, { params });

      showPopup(res.data.message || "Asset deleted successfully");

      setAssets((prev) => prev.filter((a) => a.id !== id));

      await fetchAssets({ includeDeleted: true });
    } catch (err) {
      console.error("Error deleting asset:", err);
    }
  };

  //  RESTORE ASSET
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

  //  ADD WORK ITEM
  const addWorkItem = (assetId?: number | string) => {
    let newWI: WorkItem;

    setEditedAsset((prev: any) => {
      const updated = { ...prev };
      if (!updated.workItems) updated.workItems = [];

      const tempId = `wi-${Math.random().toString(36).slice(2)}`;

      newWI = {
        id: tempId,
        asset_id: undefined,
        work_item: "",
        possible_consequence: "",
        current_likelihood: 1,
        current_severity: 1,
        current_rating: 1,
        current_date_logged: new Date().toISOString(),
        risk_mitigation_proposals: "",
        mitigation_likelihood: 1,
        mitigation_severity: 1,
        mitigation_rating: 1,
        mitigation_completion: "",
        status: "Open",
        isNew: true,
      };

      updated.workItems.push(newWI);
      return updated;
    });

    return newWI!;
  };

  //  CLEAN WORK ITEMS BEFORE SENDING
  const sanitizeWorkItems = (items: any[]) => {
    return items.map((wi: any) => {
      // Remove temporary IDs
      if (typeof wi.id === "string" && wi.id.startsWith("wi-")) {
        delete wi.id;
      }

      // Convert numeric IDs
      if (typeof wi.id === "string" && !isNaN(Number(wi.id))) {
        wi.id = Number(wi.id);
      }

      // Remove invalid asset_id
      if (typeof wi.asset_id === "string") {
        delete wi.asset_id;
      }

      return wi;
    });
  };

  //  SAVE EDITED ASSET
  const handleSave = async (): Promise<void> => {
    if (!canModify || !user || !token || editingId == null) return Promise.resolve();

    try {
      const original = assets.find((a) => a.id === editingId) || {};

      const merged: any = {
        ...original,
        ...editedAsset,
      };

      const updatedWorkItems = (merged.workItems || [])
        .map((wi: any) => recalcWorkItem(wi))
        .sort((a: any, b: any) => b.current_rating - a.current_rating);

      const assetPayload: any = {
        ...merged,
        workItems: sanitizeWorkItems(updatedWorkItems),
      };

      delete assetPayload.isNewAsset;

      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        assetPayload.clientGroupId = Number(clientGroupId);
      }

      const assetId = merged.id;

      if (assetId) {
        await axiosInstance.put(`/assets/${assetId}`, assetPayload);
      }

      showPopup("Asset updated successfully");

      setEditingId(null);
      setEditedAsset({});
      await fetchAssets();
    } catch (err) {
      console.error("Error updating asset:", err);
      showPopup("Failed to update asset");
    }
  };

  //  ADD NEW ASSET
  const handleAdd = () => {
    if (!canModify) return;
    if (newAsset) return;

    const blankAsset: Asset = {
      isNewAsset: true,
      workItems: [],
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
      visual_report: "",
      detailed_report: "",
      assessment: "",
      records: "",
      detailed_exam_years: "",
      last_exam: "",
      next_exam: "",
    };

    setNewAsset(blankAsset);
    setEditingId("new");
    setEditedAsset(blankAsset);
  };
  //  SAVE NEW ASSET
  const handleSaveNew = async (): Promise<void> => {
    if (!canModify || !user || !token || !newAsset) return Promise.resolve();

    try {
      const merged: any = {
        ...newAsset,
        ...editedAsset,
      };

      const updatedWorkItems = (merged.workItems || [])
        .map((wi: any) => recalcWorkItem(wi))
        .sort((a: any, b: any) => b.current_rating - a.current_rating);

      const assetPayload: any = {
        ...merged,
        workItems: sanitizeWorkItems(updatedWorkItems),
      };

      delete assetPayload.id;
      delete assetPayload.isNewAsset;

      if (isCompanyAccount && clientGroupId != null && !isAppAdmin) {
        assetPayload.clientGroupId = Number(clientGroupId);
      }

      const res = await axiosInstance.post("/assets", assetPayload);

      showPopup(res.data.message || "Asset created successfully");

      const created: Asset = {
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
      showPopup("Failed to create asset");
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
    addWorkItem,
  };
}
