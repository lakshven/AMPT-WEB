import axiosInstance from "../utils/axiosInstance";

export const getUsers = (params: any) => {
  return axiosInstance.get("/users/list", { params });
};

export const getAssignableUsers = () => {
  return axiosInstance.get("/users/assignable");
};

export const getUserById = (id: number | string) => {
  return axiosInstance.get(`/users/${id}`);
};

export const createUser = (data: any) => {
  return axiosInstance.post("/users", data);
};

export const updateUser = (id: number | string, data: any) => {
  return axiosInstance.put(`/users/${id}`, data);
};

// Soft delete (disable user)
export const deleteUser = (id: number | string) => {
  return axiosInstance.delete(`/users/${id}`);
};

// Restore disabled user
export const restoreUser = (id: number | string) => {
  return axiosInstance.put(`/users/${id}/restore`);
};

export const getMyPermissions = () => {
  return axiosInstance.get("/me/permissions");
};

export const getMe = () => {
  return axiosInstance.get("/me");
};