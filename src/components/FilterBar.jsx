import { Search, Filter } from "lucide-react";

const PRIORITIES = ["all", "low", "medium", "high"];

export default function FilterBar({ filters, onChange, categories }) {
  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search size={16} className="filter-icon" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="filter-search-input"
        />
      </div>

      <div className="filter-group">
        <Filter size={14} />
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="filter-select"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
