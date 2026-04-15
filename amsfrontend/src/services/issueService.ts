import axiosInstance from "../utils/axiosInstance";

export interface IssuePayload {
  title: string;
  description?: string;
  score?: number;
  assignedTo?: number;
  [key: string]: any;
}

const issueService = {
  async getAssignableUsers(): Promise<any[]> {
  const res = await axiosInstance.get("/users");
  return res.data || [];
},


  getIssues(showDeleted: boolean = false) {
    return axiosInstance.get(`/issues?deleted=${showDeleted}`);
  },

  getIssueById(id: number) {
    return axiosInstance.get(`/issues/${id}`);
  },

  createIssue(payload: IssuePayload) {
    return axiosInstance.post("/issues", payload);
  },

  updateIssue(id: number, payload: IssuePayload) {
    return axiosInstance.put(`/issues/${id}`, payload);
  },

  assignIssue(id: number, payload: { assignedTo: number }) {
    return axiosInstance.put(`/issues/${id}/assign`, payload);
  },

  completeIssue(id: number) {
    return axiosInstance.put(`/issues/${id}/complete`);
  },

  deleteIssue(id: number) {
    return axiosInstance.delete(`/issues/${id}`);
  },
};

export default issueService;