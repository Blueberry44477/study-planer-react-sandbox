import { Plus, RotateCcw } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";

interface HeaderProps {
  onCreateTask: () => void;
}

export default function Header({ onCreateTask }: HeaderProps) {
  const { resetTasks } = useTaskContext();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Study Planner
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={resetTasks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Скинути дані</span>
            </button>

            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Створити завдання</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
