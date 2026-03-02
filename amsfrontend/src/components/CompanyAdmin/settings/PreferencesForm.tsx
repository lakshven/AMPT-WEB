import React, { useState } from "react";
import { updatePreferences } from "../../../services/companySettingsService";

interface Props {
  data: {
    timezone?: string | null;
    language?: string | null;
    notifications?: boolean | null;
  };
}

const PreferencesForm: React.FC<Props> = ({ data }) => {
  const [timezone, setTimezone] = useState(data.timezone || "UTC");
  const [language, setLanguage] = useState(data.language || "en");
  const [notifications, setNotifications] = useState(
    data.notifications ?? true
  ); // ⭐ safe default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updatePreferences({
      timezone,
      language,
      notifications, // ⭐ send to backend
    });

    alert("Preferences updated successfully");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Preferences
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Notifications</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="h-4 w-4"
          />
        </div>

        <button className="bg-[#0989B1] text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default PreferencesForm;