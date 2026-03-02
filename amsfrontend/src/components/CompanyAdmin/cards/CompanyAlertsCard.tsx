import React from "react";

interface Alert {
  id: number;
  message: string;
  createdAt: string;
  type?: string;       // optional, safe
  severity?: string;   // optional, safe
}

interface Props {
  alerts: Alert[];
}

const CompanyAlertsCard: React.FC<Props> = ({ alerts }) => {
  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case "high":
        return {
          container: "bg-red-50 border-red-300",
          text: "text-red-700",
          icon: "❗",
        };
      case "medium":
        return {
          container: "bg-yellow-50 border-yellow-300",
          text: "text-yellow-700",
          icon: "⚠️",
        };
      case "low":
        return {
          container: "bg-blue-50 border-blue-300",
          text: "text-blue-700",
          icon: "ℹ️",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-300",
          text: "text-gray-700",
          icon: "🔔",
        };
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Company Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-gray-600">No alerts for your company.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);

            return (
              <li
                key={alert.id}
                className={`p-3 border rounded-lg flex flex-col ${style.container}`}
              >
                <p className={`font-medium flex items-center gap-2 ${style.text}`}>
                  <span>{style.icon}</span>
                  {alert.message}
                </p>

                {alert.type && (
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {alert.type}
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CompanyAlertsCard;