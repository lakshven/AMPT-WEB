// utils/authService.ts
import axiosInstance from "./axiosInstance";

export interface SignupPayload {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  accountType: "single" | "company";
  isCompanyAdmin?: boolean;
  clientGroupName?: string;
  clientGroupId?: number;
  accessCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  // backend may also return user, role, permissions, etc.
  user?: any;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>("/auth/signup", payload);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>("/auth/login", payload);
  return res.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await axiosInstance.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await axiosInstance.post(`/auth/reset-password/${token}`, { password });
}

export interface StartupResponse {
  success: boolean;
  next: "personal_dashboard" | "company_dashboard" | "join_client_group" | "unknown";
}

export async function getStartupOptions(): Promise<StartupResponse> {
  const res = await axiosInstance.get<StartupResponse>("/startup");
  return res.data;
}