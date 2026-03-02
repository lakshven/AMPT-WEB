import React, { useState } from "react";
import { updateBranding } from "../../../services/companySettingsService";

interface Props {
  data: {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;   // ⭐ added for backend alignment
  };
}

const BrandingForm: React.FC<Props> = ({ data }) => {
  const [logoUrl, setLogoUrl] = useState(data.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor || "#0989B1");
  const [secondaryColor, setSecondaryColor] = useState(data.secondaryColor || "#0BB5D4"); // ⭐ safe default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateBranding({
      logoUrl,
      primaryColor,
      secondaryColor,   // ⭐ send to backend
    });

    alert("Branding updated successfully");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">Branding</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Logo URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Primary Color</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-20 h-10 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Secondary Color</label>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="w-20 h-10 border rounded"
          />
        </div>

        <button className="bg-[#0989B1] text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default BrandingForm;