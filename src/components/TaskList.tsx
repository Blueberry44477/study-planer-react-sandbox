import { CheckCheck, Inbox, RotateCcw, SearchX } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import { filterAndSortTasks, hasActiveFilters } from "../lib/taskUtils.ts";
import TaskItem from "./TaskItem.tsx";

export default function TaskList() {
  const {
    tasks,
    pendingDeleteId,
    filters,
    resetFilters,
    markAllComplete,
    resetTasks,
  } = useTaskContext();

  // Derived filtered list computed directly during render (no useEffect).
  const filteredTasks = filterAndSortTasks(tasks, filters);
  const isFiltered = hasActiveFilters(filters);
  const uncompletedInView = filteredTasks.filter(
    (task) => !task.completed && task.id !== pendingDeleteId
  ).length;

  return (
    <section aria-label="Список завдань" className="space-y-3">
      {/* List Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Завдання
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
            {filteredTasks.length}
            {filteredTasks.length !== tasks.length ? ` з ${tasks.length}` : ""}
          </span>
        </div>

        {filteredTasks.length > 0 && uncompletedInView > 0 && (
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

      {/* Empty State: No results from filters */}
      {filteredTasks.length === 0 && isFiltered && (
        <div
          role="status"
          className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Завдань не знайдено
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Жодне завдання не відповідає поточним критеріям пошуку або фільтрам.
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

      {/* Empty State: No tasks at all */}
      {filteredTasks.length === 0 && !isFiltered && (
        <div
          role="status"
          className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Список завдань порожній
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            У вас наразі немає жодного завдання. Створіть нове завдання за
            допомогою форми або відновіть зразкові дані.
          </p>
          <button
            type="button"
            onClick={resetTasks}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Відновити початкові завдання</span>
          </button>
        </div>
      )}

      {/* Task Items List */}
      {filteredTasks.length > 0 && (
        <ul role="list" className="space-y-2.5">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
