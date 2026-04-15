import React, { useEffect, useState } from "react";
import CompanyInfoForm from "../../components/CompanyAdmin/settings/companyInfoForm";
import BrandingForm from "../../components/CompanyAdmin/settings/BrandingForm";
import PreferencesForm from "../../components/CompanyAdmin/settings/PreferencesForm";
import { getCompanySettings } from "../../services/companySettingsService";

const CompanySettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getCompanySettings();

        // ⭐ Ensure safe defaults so UI never crashes
        setSettings({
          companyInfo: res?.companyInfo ?? {},
          branding: res?.branding ?? {},
          preferences: res?.preferences ?? {},
        });
      } catch (err) {
        console.error("Error loading company settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-[#0989B1] mb-6">
        Company Settings
      </h1>

      <CompanyInfoForm data={settings.companyInfo} />
      <BrandingForm data={settings.branding} />
      <PreferencesForm data={settings.preferences} />
    </div>
  );
};

export default CompanySettings;