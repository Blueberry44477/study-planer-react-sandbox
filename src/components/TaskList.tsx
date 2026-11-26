import {
  AlertTriangle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import { useTaskFilters } from "../hooks/useTaskFilters.ts";
import { filterAndSortTasks, hasActiveFilters } from "../lib/taskUtils.ts";
import TaskItem from "./TaskItem.tsx";

export default function TaskList() {
  const {
    tasks,
    listStatus,
    listError,
    page,
    limit,
    totalTasks,
    totalPages,
    setPage,
    retryLoadTasks,
    pendingDeleteId,
    markAllComplete,
  } = useTaskContext();

  const { filters, resetFilters } = useTaskFilters();

  // Derived filtered list computed directly during render (no useEffect).
  const filteredTasks = filterAndSortTasks(tasks, filters);
  const isFiltered = hasActiveFilters(filters);
  const uncompletedInView = filteredTasks.filter(
    (task) => !task.completed && task.id !== pendingDeleteId
  ).length;

  const startItem = totalTasks === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalTasks);

  return (
    <section aria-label="Список завдань" className="space-y-3">
      {/* List Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Завдання
          </h2>
          {listStatus === "success" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {filteredTasks.length}
              {filteredTasks.length !== tasks.length
                ? ` з ${tasks.length}`
                : ""}
            </span>
          )}
          {totalTasks > 0 && (
            <span className="text-xs text-slate-500">
              Показано {startItem}–{endItem} з {totalTasks}
            </span>
          )}
        </div>

        {listStatus === "success" &&
          filteredTasks.length > 0 &&
          uncompletedInView > 0 && (
            <button
              type="button"
              onClick={markAllComplete}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Позначити всі виконаними</span>
            </button>
          )}
      </div>

      {/* Loading State */}
      {listStatus === "loading" && (
        <div
          role="status"
          aria-busy="true"
          className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center"
        >
          <Loader2
            className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-slate-800">Loading...</p>
          <p className="text-xs text-slate-500 mt-1">
            Завантаження завдань зі сторінки {page}...
          </p>
        </div>
      )}

      {/* Error State */}
      {listStatus === "error" && (
        <div
          role="alert"
          className="bg-white border border-rose-200 rounded-xl p-8 sm:p-10 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Помилка завантаження.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            {listError ?? "Не вдалося отримати дані із сервера."}
          </p>
          <button
            type="button"
            onClick={retryLoadTasks}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Спробувати ще</span>
          </button>
        </div>
      )}

      {/* Empty State: No results from filters */}
      {listStatus === "success" && filteredTasks.length === 0 && isFiltered && (
        <div
          role="status"
          className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Завдань не знайдено.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Жодне завдання на цій сторінці не відповідає поточним критеріям
            пошуку або фільтрам.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Скинути фільтри</span>
          </button>
        </div>
      )}

      {/* Empty State: No tasks on page */}
      {listStatus === "success" &&
        filteredTasks.length === 0 &&
        !isFiltered && (
          <div
            role="status"
            className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Завдань не знайдено.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
              На цій сторінці немає завдань. Створіть нове завдання або оновіть
              список.
            </p>
            <button
              type="button"
              onClick={retryLoadTasks}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Оновити список</span>
            </button>
          </div>
        )}

      {/* Success State: Task Items List */}
      {listStatus === "success" && filteredTasks.length > 0 && (
        <ul role="list" className="space-y-2.5">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <nav
        aria-label="Пагінація списку завдань"
        className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
      >
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Попередня</span>
        </button>

        <span className="text-xs font-semibold text-slate-700">
          Сторінка {page} з {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
        >
          <span>Наступна</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}
