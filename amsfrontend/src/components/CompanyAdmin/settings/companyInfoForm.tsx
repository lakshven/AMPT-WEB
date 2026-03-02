import React, { useState } from "react";
import { updateCompanyInfo } from "../../../services/companySettingsService";

interface Props {
  data: {
    companyName?: string | null;
    address?: string | null;
    website?: string | null;
    phone?: string | null;
    description?: string | null;
  };
}

const CompanyInfoForm: React.FC<Props> = ({ data }) => {
  const [companyName, setCompanyName] = useState(data.companyName || "");
  const [address, setAddress] = useState(data.address || "");
  const [website, setWebsite] = useState(data.website || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [description, setDescription] = useState(data.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateCompanyInfo({
      companyName,
      address,
      website,
      phone,
      description,
    });

    alert("Company info updated successfully");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Company Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
          />
        </div>

        <button className="bg-[#0989B1] text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
};

export default CompanyInfoForm;