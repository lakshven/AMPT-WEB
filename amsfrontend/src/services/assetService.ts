import axiosInstance from "../utils/axiosInstance";
export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  location?: string;
  risk?: string;
  showDeleted?: boolean;
}

export interface AssetPayload {
  name: string;
  description?: string;
  [key: string]: any;
}

const assetService = {
  // ⭐ UPDATED — now accepts pagination + filtering params
  getAssets(params: AssetQueryParams = {}) {
    return axiosInstance.get("/assets", { params });
  },

  getAssetById(id: number) {
    return axiosInstance.get(`/assets/${id}`);
  },

  createAsset(payload: AssetPayload) {
    return axiosInstance.post("/assets", payload);
  },

  updateAsset(id: number, payload: AssetPayload) {
    return axiosInstance.put(`/assets/${id}`, payload);
  },

  deleteAsset(id: number) {
    return axiosInstance.delete(`/assets/${id}`);
  },
};

export default assetService;