import React from "react";

export interface FilterState {
  searchQuery: string;
  statusFilter: "ALL" | "VERIFIED" | "PENDING" | "REJECTED" | "EXPIRED";
  sortBy: "newest" | "oldest";
}

interface AuditFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onChange,
  onExportCsv,
  onExportJson,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-midnight-900/60 border border-white/10 rounded-2xl backdrop-blur-sm">
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Search by wallet address, request ID, or predicate..."
          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filters.statusFilter}
          onChange={(e) => onChange({ ...filters, statusFilter: e.target.value as any })}
          className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          aria-label="Filter by verification status"
        >
          <option value="ALL">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
          aria-label="Sort order"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Export Buttons */}
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-colors"
          >
            Export CSV
          </button>
        )}

        {onExportJson && (
          <button
            type="button"
            onClick={onExportJson}
            className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-medium transition-colors"
          >
            Export JSON
          </button>
        )}
      </div>
    </div>
  );
};
