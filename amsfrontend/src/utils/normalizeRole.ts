export const normalizeRole = (role: any): string => {
  if (!role) return "";

  const r = role.toString().toLowerCase().trim();

  switch (r) {
    case "personal_owner":
      return "single_user";   // ⭐ FIXED

    case "viewer":
      return "viewer";  // ⭐ FIXED

    case "company_admin":
      return "company_admin";

    case "app_admin":
      return "app_admin";
      case "editor":
        return "editor";

    default:
      return r.replace(/\s+/g, "_");
  }
};