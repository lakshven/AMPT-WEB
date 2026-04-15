import axiosInstance from "../utils/axiosInstance";

export const getClientGroups = async () => {
  return axiosInstance.get("/client-groups");
};

export const createClientGroup = async (payload: {
  name: string;
  accessCode: string;
  companyId?: number;
}) => {
  return axiosInstance.post("/client-groups", payload);
};

export const sendInviteEmail = async (payload: {
  email: string;
  link: string;
}) => {
  return axiosInstance.post("/client-groups/send-invite", payload);
};

export const getClientGroupAssetSummary = async () => {
  return axiosInstance.get("/client-groups/assets-summary");
};