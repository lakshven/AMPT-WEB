export const getHomeRoute = (role: string | null) => {
  switch (role) {
    case "single_user":
      return "/startup";

    case "viewer":
    case "editor":
      return "/dashboard";

    case "company":
    case "company_admin":
      return "/company-admin";

    case "app_admin":
      return "/admin";

    default:
      return "/login";
  }
};
