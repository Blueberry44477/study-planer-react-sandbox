import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Pencil,
  Tag,
  Trash2,
  Undo2,
} from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import type Task from "../types/task.ts";
import type { TaskPriority } from "../types/task.ts";

interface TaskItemProps {
  task: Task;
}

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badgeClass: string; dotClass: string }
> = {
  high: {
    label: "Високий",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
  },
  medium: {
    label: "Середній",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  low: {
    label: "Низький",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  },
};

export default function TaskItem({ task }: TaskItemProps) {
  const {
    pendingDeleteId,
    toggleTask,
    requestDelete,
    undoDelete,
    setEditingTask,
  } = useTaskContext();

  const [isExpanded, setIsExpanded] = useState(false);

  const isPendingDelete = pendingDeleteId === task.id;
  const priorityInfo = PRIORITY_META[task.priority];

  return (
    <article
      aria-label={task.title}
      className={`rounded-xl border transition-all p-4 sm:p-5 flex items-start gap-3.5 ${
        isPendingDelete
          ? "bg-amber-50/50 border-amber-300 border-dashed opacity-75"
          : task.completed
            ? "bg-slate-50/80 border-slate-200/90"
            : "bg-white border-slate-200 shadow-xs"
      }`}
    >
      {/* Completion Toggle Checkbox */}
      <button
        type="button"
        disabled={isPendingDelete}
        onClick={() => toggleTask(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          isPendingDelete
            ? "border-2 border-slate-200 bg-slate-100 cursor-not-allowed"
            : task.completed
              ? "bg-emerald-600 text-white shadow-xs cursor-pointer"
              : "border-2 border-slate-300 hover:border-indigo-600 bg-white hover:bg-indigo-50/50 cursor-pointer"
        }`}
        aria-label={
          task.completed
            ? `Позначити "${task.title}" як невиконане`
            : `Позначити "${task.title}" як виконане`
        }
        aria-pressed={task.completed}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-3" aria-hidden="true" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {/* Badges row: Priority, Category, Pending Deletion */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${priorityInfo.badgeClass}`}
          >
            <span
              aria-hidden="true"
              className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`}
            />
            <span>{priorityInfo.label}</span>
          </span>

          {task.category && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">
              <Tag className="w-3 h-3" aria-hidden="true" />
              <span>{task.category}</span>
            </span>
          )}

          {isPendingDelete && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-rose-50 text-rose-700 border-rose-200">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Буде видалено</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold leading-snug">
          <button
            type="button"
            disabled={isPendingDelete}
            onClick={() => toggleTask(task.id)}
            className={`text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded ${
              isPendingDelete
                ? "text-slate-500 line-through cursor-not-allowed"
                : task.completed
                  ? "line-through text-slate-400 hover:text-slate-600 cursor-pointer"
                  : "text-slate-900 hover:text-indigo-600 cursor-pointer"
            }`}
          >
            {task.title}
          </button>
        </h3>

        {/* Description preview or full */}
        {task.description && (
          <div className="mt-1.5">
            <p
              className={`text-xs text-slate-600 whitespace-pre-line leading-relaxed ${
                !isExpanded ? "line-clamp-2" : ""
              }`}
            >
              {task.description}
            </p>

            {task.description.length > 90 && (
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-0.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <span>Згорнути</span>
                    <ChevronUp className="w-3 h-3" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>Читати повністю</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 self-start sm:self-center">
        {isPendingDelete ? (
          <button
            type="button"
            onClick={undoDelete}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Скасувати</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditingTask(task)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
              aria-label={`Редагувати завдання "${task.title}"`}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => requestDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
              aria-label={`Видалити завдання "${task.title}"`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
