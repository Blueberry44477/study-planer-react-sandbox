import { Search, X, ArrowUpDown, Tag, AlertCircle } from "lucide-react";
import type { Priority, SortOption, TaskFilterState } from "../types";

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: (newFilters: TaskFilterState) => void;
  availableSubjects: string[];
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export default function TaskFilters({
  filters,
  onFilterChange,
  availableSubjects,
  counts,
}:TaskFiltersProps) {
  const isFiltered =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.subject !== "all" ||
    filters.priority !== "all" ||
    filters.sortBy !== "deadline-asc";

  const handleResetFilters = () => {
    onFilterChange({
      search: "",
      status: "all",
      subject: "all",
      priority: "all",
      sortBy: "deadline-asc",
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
      {/* Top row: Search and Status pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Пошук за назвою або примітками..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Очистити пошук"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: "all" })}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filters.status === "all"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Всі ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: "active" })}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filters.status === "active"
                ? "bg-white text-indigo-700 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            В роботі ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, status: "completed" })}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filters.status === "completed"
                ? "bg-white text-emerald-700 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Виконані ({counts.completed})
          </button>
        </div>
      </div>

      {/* Bottom row: Dropdowns for Subject, Priority, Sort and Reset */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Subject filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium">Предмет:</span>
          <select
            value={filters.subject}
            onChange={(e) => onFilterChange({ ...filters, subject: e.target.value })}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Всі предмети</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium">Пріоритет:</span>
          <select
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({ ...filters, priority: e.target.value as "all" | Priority })
            }
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Всі рівні</option>
            <option value="high">Високий</option>
            <option value="medium">Середній</option>
            <option value="low">Низький</option>
          </select>
        </div>

        {/* Sort filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500 font-medium">Сортування:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as SortOption })}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="deadline-asc">Дедлайн (спочатку найближчі)</option>
            <option value="deadline-desc">Дедлайн (спочатку пізніші)</option>
            <option value="priority-desc">Пріоритет (спочатку найвищий)</option>
            <option value="title-asc">Назва (А - Я)</option>
            <option value="created-desc">Нещодавно додані</option>
          </select>
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-medium transition-colors cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Скинути фільтри</span>
          </button>
        )}
      </div>
    </div>
  );
}
