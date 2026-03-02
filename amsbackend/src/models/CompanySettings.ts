export interface CompanyInfo {
  companyName: string;
  address: string;
  phone: string;
  website: string;
  description: string;
}

export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

export interface Preferences {
  timezone: string;
  language: string;
  notifications: boolean;
}

export interface CompanySettings {
  companyId: number;
  companyInfo: CompanyInfo;
  branding: Branding;
  preferences: Preferences;
}