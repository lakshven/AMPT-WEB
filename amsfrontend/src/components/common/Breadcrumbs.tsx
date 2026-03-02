import { Link, useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/startup": "Home",
  "/dashboard": "Dashboard",
  "/issues": "Issues",
  "/users": "Users",
  "/admin/client-groups": "Client Groups",
  "/client-group-setup": "Client Group Setup",
  "/login": "Login",
    "/signup": "Signup", 
    "/asset-log": "Asset Log",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const paths = segments.map((_, index) => {
    return "/" + segments.slice(0, index + 1).join("/");
  });

  return (
    <nav className="text-sm text-gray-400 mb-3 px-4">
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const label = routeLabels[path] || path;

        return (
          <span key={path}>
            {!isLast ? (
              <>
                <Link
                  to={path}
                  className="hover:text-black transition"
                >
                  {label}
                </Link>
                <span className="mx-1">/</span>
              </>
            ) : (
              <span className="text-black font-semibold">{label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}