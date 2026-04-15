import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface AlertItem {
  id: number;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
  isRead: boolean;
}

const severityColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-700 border-blue-300",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  critical: "bg-red-100 text-red-700 border-red-300"
};

const SystemAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
 // Create alert form state
  const [newType, setNewType] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newSeverity, setNewSeverity] = useState<"info" | "warning" | "critical">("info");

  const loadAlerts = () => {
    axiosInstance
      .get("/admin/alerts")
      .then((res) => {
        setAlerts(res.data);
        setLoading(false);
      })
      .catch((err) => console.error("Failed to load alerts", err));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAllRead = () => {
    const unreadIds = alerts.filter(a => !a.isRead).map(a => a.id);
    if (unreadIds.length === 0) return;

    axiosInstance
      .post("/admin/alerts/mark-read", { ids: unreadIds })
      .then(() => loadAlerts())
      .catch((err) => console.error("Failed to mark alerts read", err));
  };
  const createAlert = (e: React.FormEvent) => {
    e.preventDefault();

    axiosInstance
      .post("/admin/alerts/create", {
        type: newType,
        message: newMessage,
        severity: newSeverity
      })
      .then(() => {
        setNewType("");
        setNewMessage("");
        setNewSeverity("info");
        loadAlerts();
      })
      .catch((err) => console.error("Failed to create alert", err));
  };
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-[#549E39]/30">
      {/* CREATE ALERT SECTION */}
      <h2 className="text-2xl font-bold text-[#0989B1] mb-4">Create Alert</h2>

      <form onSubmit={createAlert} className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Alert Type"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <textarea
          placeholder="Alert Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <select
          value={newSeverity}
          onChange={(e) => setNewSeverity(e.target.value as any)}
          className="w-full border rounded p-2"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-[#0989B1] text-white rounded hover:bg-[#05575B]"
        >
          Add Alert
        </button>
      </form>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#0989B1]">System Alerts</h2>

        <button
          onClick={markAllRead}
          className="text-sm px-3 py-1 rounded bg-[#0989B1]/10 text-[#0989B1] hover:bg-[#066A6F]/20 transition"
        >
          Mark All Read
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-600">No alerts found.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map(alert => (
            <li
              key={alert.id}
              className={`border rounded p-4 shadow-sm ${
                severityColors[alert.severity]
              } ${alert.isRead ? "opacity-70" : "opacity-100"} border-[#549E39]/40`}
            >
              <p className="font-semibold capitalize">{alert.type}</p>
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemAlertsPanel;