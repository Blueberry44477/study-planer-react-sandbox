import { useId } from "react";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import type TaskStatsData from "../types/taskStatsData.ts";

export default function TaskStats() {
  const { tasks } = useTaskContext();
  const progressId = useId();

  // Derived statistics computed directly during render (no useEffect).
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const completionPercentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats: TaskStatsData = {
    total,
    completed,
    pending,
    completionPercentage,
  };

  return (
    <section aria-label="Статистика завдань" className="space-y-3">
      {/* Progress bar card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={progressId}
            className="text-xs sm:text-sm font-semibold text-slate-700"
          >
            Загальний прогрес
          </label>
          <span className="text-xs sm:text-sm font-bold text-indigo-600">
            {stats.completed} з {stats.total} ({stats.completionPercentage}%)
          </span>
        </div>
        <progress
          id={progressId}
          max={100}
          value={stats.completionPercentage}
          className="styled-progress block w-full h-2.5"
        />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
            <ListTodo className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">
              Всього завдань
            </p>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
            <Clock className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">
              В роботі
            </p>
            <p className="text-lg font-bold text-sky-700">{stats.pending}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">
              Виконано
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {stats.completed}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
