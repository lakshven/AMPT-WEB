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
          container: "bg-red-100 border-red-300 shadow-sm",
          text: "text-red-800",
          icon: "❗",
        };
      case "medium":
        return {
          container: "bg-amber-100 border-amber-300 shadow-sm",
          text: "text-amber-800",
          icon: "⚠️",
        };
      case "low":
        return {
          container: "bg-blue-100 border-blue-300 shadow-sm",
          text: "text-blue-800",
          icon: "ℹ️",
        };
      default:
        return {
          container: "bg-gray-100 border-gray-300 shadow-sm",
          text: "text-gray-800",
          icon: "🔔",
        };
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Company Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-gray-600">No alerts for your company.</p>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);

            return ( 
              <li
                key={alert.id}
                className={`p-4 border rounded-lg flex flex-col ${style.container}`}
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
