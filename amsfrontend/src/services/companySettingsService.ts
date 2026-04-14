import axiosInstance from "../utils/axiosInstance";

export const getCompanySettings = async () => {
  const res = await axiosInstance.get("/company-admin/settings");
  return res.data;
};

// ----------------------
// Strongly typed payloads
// ----------------------

export interface CompanyInfoPayload {
  companyName: string;
  address: string;
  website: string;
  phone: string;
  description: string;
}

export interface BrandingPayload {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface PreferencesPayload {
  timezone: string;
  language: string;
  notifications: boolean;
}

// ----------------------
// Update functions
// ----------------------

export const updateCompanyInfo = async (payload: CompanyInfoPayload) => {
  const res = await axiosInstance.put(
    "/company-admin/settings/company-info",
    payload
  );
  return res.data;
};

export const updateBranding = async (payload: BrandingPayload) => {
  const res = await axiosInstance.put(
    "/company-admin/settings/branding",
    payload
  );
  return res.data;
};

export const updatePreferences = async (payload: PreferencesPayload) => {
  const res = await axiosInstance.put(
    "/company-admin/settings/preferences",
    payload
  );
  return res.data;
};