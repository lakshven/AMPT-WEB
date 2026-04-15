import React from "react";

interface ClientGroupFiltersProps {
  filter: string;
  sort: string;
  order: string;
  onFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
}

export default function ClientGroupFilters({
  filter,
  sort,
  order,
  onFilterChange,
  onSortChange,
  onOrderChange,
}: ClientGroupFiltersProps) {
  return (
    <div className="flex gap-4 mb-4">

      {/* Filter */}
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="border px-3 py-2 rounded text-black"
      >
        <option value="active">Active</option>
        <option value="deleted">Deleted</option>
        <option value="all">All</option>
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="border px-3 py-2 rounded text-black"
      >
        <option value="name">Name</option>
        <option value="createdAt">Created Date</option>
      </select>

      {/* Order */}
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value)}
        className="border px-3 py-2 rounded text-black"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

    </div>
  );
}