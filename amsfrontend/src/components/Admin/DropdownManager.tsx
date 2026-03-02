import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function DropdownManager() {
  const [data, setData] = useState<Record<string, string[]>>({});
  const [newValue, setNewValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deletedValues, setDeletedValues] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
   // ⭐ STATIC categories (NOT editable)
  const STATIC_DROPDOWN_KEYS = [
    "structure_type",
    "material_type",
    "work_item",
    "current_likelihood",
    "current_severity",
    "current_rating",
    "mitigation_likelihood",
    "mitigation_severity",
    "mitigation_rating",
    "status",
    "carries",
    "possible_consequence",
    "detailed_exam_years",
    "spans"
  ];

  // Load dropdown categories + values
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/dropdown/all");

        if (!res.data || typeof res.data !== "object") {
          console.error("Invalid backend response:", res.data);
          return;
        }

        setData(res.data);

        // ⭐ Pick first DYNAMIC category only
        const dynamicCategories = Object.keys(res.data).filter(
          (cat) => !STATIC_DROPDOWN_KEYS.includes(cat)
        );

        if (dynamicCategories.length > 0) {
          setSelectedCategory(dynamicCategories[0]);
        }
      } catch (err: any) {
        console.error(
          "Error loading dropdown options",
          err.response?.data || err.message
        );
      }
    };

    load();
  }, []);

  // Load deleted values whenever category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchDeletedValues();
    }
  }, [selectedCategory]);

  // Add new dropdown value
  const handleAdd = async () => {
    if (!newValue.trim() || !selectedCategory) return;

    try {
      const res = await axiosInstance.post(`/dropdown/${selectedCategory}`, {
        value: newValue.trim()
      });

      setData(res.data.dropdowns);
      setNewValue("");
      fetchDeletedValues();
    } catch (err: any) {
      console.error(
        "Error adding dropdown value",
        err.response?.data || err.message
      );
    }
  };

  // Delete dropdown value
  const handleDelete = async (category: string, value: string) => {
    try {
      const res = await axiosInstance.delete(`/dropdown/${category}/${value}`);

      setData(res.data.dropdowns);
      fetchDeletedValues();
    } catch (err: any) {
      console.error(
        "Error deleting dropdown value",
        err.response?.data || err.message
      );
    }
  };

  // Fetch deleted values
  const fetchDeletedValues = async () => {
    if (!selectedCategory) return;

    try {
      const res = await axiosInstance.get(
        `/dropdown/${selectedCategory}/deleted`
      );

      setDeletedValues(res.data.deleted || []);

      if (!res.data.deleted || res.data.deleted.length === 0) {
        setShowDeleted(false);
      }
    } catch (err: any) {
      console.error(
        "Error fetching deleted values",
        err.response?.data || err.message
      );
    }
  };

  // Restore single deleted value
  const restoreValue = async (value: string) => {
    try {
      const res = await axiosInstance.post(
        `/dropdown/${selectedCategory}/${value}/restore`
      );

      setData(res.data.dropdowns);
      fetchDeletedValues();
    } catch (err: any) {
      console.error(
        "Error restoring dropdown value",
        err.response?.data || err.message
      );
    }
  };

  // Restore all deleted values
  const restoreAll = async () => {
    if (!selectedCategory) return;
    if (deletedValues.length === 0) return;

    try {
      const res = await axiosInstance.post(
        `/dropdown/${selectedCategory}/restore-all`
      );

      setData(res.data.dropdowns);
      fetchDeletedValues();
    } catch (err: any) {
      console.error(
        "Error restoring all dropdown values",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: "#0989B1" }}>
        Dropdown Manager
      </h2>

      {/* Category Selector */}
      <div className="mb-6 flex items-center">
        <label className="font-semibold text-gray-700">
          Select Category:
        </label>
        <select
          className="border border-gray-300 px-3 py-2 ml-3 rounded-md"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {Object.keys(data).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Add New Value */}
      <div className="flex gap-3 mb-8">
        <input
          className="border border-gray-300 px-3 py-2 rounded-md w-64"
          placeholder="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-md text-white font-medium shadow"
          style={{ backgroundColor: "#0989B1" }}
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      {/* List Values */}
      <div className="bg-white shadow rounded-lg p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "#549E39" }}>
            Values
          </h3>
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
            Active
          </span>
        </div>

        {selectedCategory &&
          data[selectedCategory]?.map((val) => (
            <div
              key={val}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md mb-2 border border-gray-200"
            >
              <span className="text-gray-700">{val}</span>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  Active
                </span>
                <button
                  className="font-medium"
                  style={{ color: "#0989B1" }}
                  onClick={() => handleDelete(selectedCategory, val)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Deleted Values */}
      {deletedValues.length > 0 && (
        <div className="bg-white shadow rounded-lg p-5 border border-gray-200 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3
                className="font-semibold"
                style={{ color: "#B14A09" }}
              >
                Deleted Values
              </h3>
              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                Deleted
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="text-sm underline"
                onClick={() => setShowDeleted((prev) => !prev)}
              >
                {showDeleted ? "Hide Deleted" : "Show Deleted"}
              </button>

              <button
                className="px-3 py-1 rounded text-white text-sm"
                style={{ backgroundColor: "#549E39" }}
                onClick={restoreAll}
              >
                Restore All
              </button>
            </div>
          </div>

          {showDeleted &&
            deletedValues.map((val) => (
              <div
                key={val}
                className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-md mb-2 border border-red-200"
              >
                <span className="text-gray-700">{val}</span>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                    Deleted
                  </span>
                  <button
                    className="font-medium"
                    style={{ color: "#B14A09" }}
                    onClick={() => restoreValue(val)}
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}