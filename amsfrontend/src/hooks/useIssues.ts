import { useCallback, useState } from "react";
import axios from "../utils/axiosInstance";

export interface Issue {
  id?: number;
  assetId?: number;
  code?: string;
  title?: string;
  issue?: string;
  score?: number;
  mitigation?: string;
  status?: string;
  assignedTo?: number | null;
  assignedAt?: string | null;
  completedBy?: number | null;
  completedAt?: string | null;
  clientGroupId?: number | null;
  [key: string]: any;
}

interface UseIssuesResult {
  issues: Issue[];
  currentIssue: Issue | null;
  loading: boolean;
  error: string | null;
  message: string | null;

  fetchIssues: (includeDeleted?: boolean) => Promise<void>;
  fetchIssueById: (id: number) => Promise<Issue | null>;
  createIssue: (payload: Partial<Issue>) => Promise<Issue | null>;
  updateIssue: (id: number, payload: Partial<Issue>) => Promise<Issue | null>;
  assignIssue: (id: number, assignedTo: number) => Promise<Issue | null>;
  completeIssue: (id: number) => Promise<Issue | null>;
  deleteIssue: (id: number) => Promise<void>;

  clearMessage: () => void;
  clearError: () => void;
}

export function useIssues(): UseIssuesResult {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleError = (err: any, fallbackMessage: string) => {
    console.error(fallbackMessage, err);
    const apiMessage =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      fallbackMessage;
    setError(apiMessage);
  };

  const fetchIssues = useCallback(
    async (includeDeleted: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        // backend already enforces clientGroupId / role via middleware
        const res = await axios.get("/issues", {
          params: { includeDeleted },
        });
        setIssues(res.data || []);
      } catch (err) {
        handleError(err, "Failed to fetch issues");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchIssueById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`/issues/${id}`);
      setCurrentIssue(res.data);
      return res.data as Issue;
    } catch (err) {
      handleError(err, "Failed to fetch issue");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createIssue = useCallback(
    async (payload: Partial<Issue>) => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const res = await axios.post("/issues", payload);
        const created: Issue = res.data.issue || res.data;

        // optimistic local update
        setIssues((prev) => [created, ...prev]);
        setMessage("Issue created successfully");
        return created;
      } catch (err) {
        handleError(err, "Failed to create issue");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateIssue = useCallback(
    async (id: number, payload: Partial<Issue>) => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const res = await axios.put(`/issues/${id}`, payload);
        const updated: Issue = res.data.issue || res.data;

        setIssues((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        setCurrentIssue((prev) =>
          prev && prev.id === updated.id ? updated : prev
        );
        setMessage("Issue updated successfully");
        return updated;
      } catch (err) {
        handleError(err, "Failed to update issue");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const assignIssue = useCallback(
    async (id: number, assignedTo: number) => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const res = await axios.put(`/issues/${id}/assign`, { assignedTo });
        const updated: Issue = res.data.issue || res.data;

        setIssues((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        setCurrentIssue((prev) =>
          prev && prev.id === updated.id ? updated : prev
        );
        setMessage("Issue assigned successfully");
        return updated;
      } catch (err) {
        handleError(err, "Failed to assign issue");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completeIssue = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const res = await axios.put(`/issues/${id}/complete`);
        const updated: Issue = res.data.issue || res.data;

        setIssues((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        setCurrentIssue((prev) =>
          prev && prev.id === updated.id ? updated : prev
        );
        setMessage("Issue marked as completed");
        return updated;
      } catch (err) {
        handleError(err, "Failed to complete issue");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteIssue = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await axios.delete(`/issues/${id}`);
      setIssues((prev) => prev.filter((i) => i.id !== id));
      setMessage("Issue deleted successfully");
    } catch (err) {
      handleError(err, "Failed to delete issue");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessage = () => setMessage(null);
  const clearError = () => setError(null);

  return {
    issues,
    currentIssue,
    loading,
    error,
    message,
    fetchIssues,
    fetchIssueById,
    createIssue,
    updateIssue,
    assignIssue,
    completeIssue,
    deleteIssue,
    clearMessage,
    clearError,
  };
}