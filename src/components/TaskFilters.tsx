import { useId } from "react";
import { AlertCircle, ArrowUpDown, Search, Tag, X } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import { hasActiveFilters } from "../lib/taskUtils.ts";
import type { Priority, SortOption } from "../types";

export default function TaskFilters() {
  const { tasks, filters, setFilters, resetFilters } = useTaskContext();

  const searchId = useId();
  const subjectId = useId();
  const priorityId = useId();
  const sortId = useId();

  // Derived filter metadata computed during render.
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const availableSubjects = Array.from(
    new Set(tasks.map((task) => task.category).filter(Boolean))
  );
  const isFiltered = hasActiveFilters(filters);

  return (
    <search
      aria-label="Пошук та фільтрація завдань"
      className="block bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5"
    >
      {/* Top row: Search and Status pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor={searchId} className="visually-hidden">
            Пошук завдань за назвою або примітками
          </label>
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Пошук за назвою або примітками..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer"
              aria-label="Очистити пошук"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div
          role="group"
          aria-label="Фільтр за статусом"
          className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium self-start md:self-auto shrink-0"
        >
          <button
            type="button"
            aria-pressed={filters.status === "all"}
            onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ${
              filters.status === "all"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Всі ({total})
          </button>
          <button
            type="button"
            aria-pressed={filters.status === "active"}
            onClick={() =>
              setFilters((prev) => ({ ...prev, status: "active" }))
            }
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ${
              filters.status === "active"
                ? "bg-white text-indigo-700 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            В роботі ({active})
          </button>
          <button
            type="button"
            aria-pressed={filters.status === "completed"}
            onClick={() =>
              setFilters((prev) => ({ ...prev, status: "completed" }))
            }
            className={`px-3 py-1.5 rounded-md transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ${
              filters.status === "completed"
                ? "bg-white text-emerald-700 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Виконані ({completed})
          </button>
        </div>
      </div>

      {/* Bottom row: Dropdowns for Subject, Priority, Sort and Reset */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Subject filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          <label htmlFor={subjectId} className="text-slate-500 font-medium">
            Предмет:
          </label>
          <select
            id={subjectId}
            value={filters.subject}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, subject: e.target.value }))
            }
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Всі предмети</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
            {filters.subject !== "all" &&
              !availableSubjects.includes(filters.subject) && (
                <option value={filters.subject}>{filters.subject}</option>
              )}
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <AlertCircle
            className="w-3.5 h-3.5 text-slate-500 shrink-0"
            aria-hidden="true"
          />
          <label htmlFor={priorityId} className="text-slate-500 font-medium">
            Пріоритет:
          </label>
          <select
            id={priorityId}
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priority: e.target.value as "all" | Priority,
              }))
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
          <ArrowUpDown
            className="w-3.5 h-3.5 text-slate-500 shrink-0"
            aria-hidden="true"
          />
          <label htmlFor={sortId} className="text-slate-500 font-medium">
            Сортування:
          </label>
          <select
            id={sortId}
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as SortOption,
              }))
            }
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="deadline-asc">За замовчуванням</option>
            <option value="priority-desc">Пріоритет (спочатку найвищий)</option>
            <option value="title-asc">Назва (А - Я)</option>
            <option value="created-desc">Нещодавно додані</option>
          </select>
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Скинути фільтри</span>
          </button>
        )}
      </div>
    </search>
  );
}
