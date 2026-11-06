import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import type TaskStatsData from "../types/taskStatsData.ts";

interface TaskStatsProps {
  stats: TaskStatsData;
}

export default function TaskStats({ stats }: TaskStatsProps) {
  return (
    <div className="space-y-3">
      {/* Progress bar card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            Total progress
          </span>
          <span className="text-xs sm:text-sm font-bold text-indigo-600">
            {stats.completed} з {stats.total} ({stats.completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">Total tasks</p>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">Active</p>
            <p className="text-lg font-bold text-sky-700">{stats.pending}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">Completed</p>
            <p className="text-lg font-bold text-emerald-700">{stats.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
