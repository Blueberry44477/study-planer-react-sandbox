import type Task from '../types/task.ts';
import {Inbox, RotateCcw, SearchX} from "lucide-react";
import TaskItem from "./TaskItem.tsx";

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  onToggleComplete: (id: number) => void;
  onMarkAllComplete?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export default function TaskList({
  tasks,
  totalTasksCount,
  onToggleComplete,
  onMarkAllComplete,
  onEdit,
  onDelete,
  onResetFilters,
  isFiltered,
}: TaskListProps) {
  const uncompletedInView = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-3">
      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Tasks</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
            {tasks.length} {tasks.length !== totalTasksCount ? `з ${totalTasksCount}` : ""}
          </span>
        </div>

        {tasks.length > 0 && uncompletedInView > 0 && onMarkAllComplete && (
          <button
            type="button"
            onClick={onMarkAllComplete}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
          >
            <span>Mark all as completed</span>
          </button>
        )}
      </div>

      {/* Empty State: No results from filters */}
      {tasks.length === 0 && isFiltered && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">No tasks found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            No tasks match the specified search criteria or selected filters.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State: No tasks */}
      {tasks.length === 0 && !isFiltered && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Список завдань порожній</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            У вас наразі немає жодного завдання. Створіть нове завдання за допомогою форми або
            завантажте зразкові дані.
          </p>
        </div>
      )}

      {/* Task Items List */}
      {tasks.length > 0 && (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
