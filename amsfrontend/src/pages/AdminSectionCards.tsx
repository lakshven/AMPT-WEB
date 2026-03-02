import { Link } from "react-router-dom";
import { adminSections } from "../config/adminSections";

export default function AdminSectionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {adminSections.map(section => (
        <Link
          key={section.key}
          to={`/admin/${section.path}`}
          className="bg-white shadow rounded-lg p-6 hover:bg-gray-50 transition"
        >
          <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{section.description}</p>
        </Link>
      ))}
    </div>
  );
}