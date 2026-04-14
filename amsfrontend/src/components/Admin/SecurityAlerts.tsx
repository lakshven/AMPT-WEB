import React from "react";

const SecurityAlerts: React.FC = () => {
  const alerts = [
    { type: "Failed Login", user: "UserA", time: "Today 10:22" },
    { type: "Suspicious Activity", user: "UserB", time: "Today 09:10" },
    { type: "Outdated Password", user: "UserC", time: "Yesterday" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6"
      style={{ color: "#0989B1" }}>
        Security Alerts
      </h2>

      <ul className="space-y-3">
        {alerts.map((alert, idx) => (
          <li
            key={idx}
            className="p-4 rounded-md border shadow-sm bg-gray-50"
           style={{ borderColor: "#549E39" }}>
            <p className="font-semibold mb-1"
            style={{ color: "#0989B1" }}>{alert.type}</p>
            <p className="text-sm text-gray-700">
              User: {alert.user} — {alert.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SecurityAlerts;