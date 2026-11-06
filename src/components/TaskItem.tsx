import type Task from "../types/task.ts";
import {useState} from "react";
import {Check, ChevronDown, ChevronUp, Pencil, Trash2} from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
      <div className="p-4 sm:p-5 flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            task.completed
              ? "bg-emerald-600 text-white shadow-xs"
              : "border-2 border-slate-300 hover:border-indigo-600 bg-white hover:bg-indigo-50/50"
          }`}
          aria-label={task.completed ? "Mark as uncompleted" : "Mark as completed"}
          title={task.completed ? "Mark as uncompleted" : "Mark as completed"}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-3" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Badges row: Priority, Deadline status */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {/* Priority badge */}
            {/*<span*/}
            {/*  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${priorityInfo.badgeClass}`}*/}
            {/*>*/}
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  task.priority === "high"
                    ? "bg-rose-500"
                    : task.priority === "medium"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <span>{task.priority}</span>
            {/*</span>*/}
          </div>

          {/* Title */}
          <h3
            onClick={() => onToggleComplete(task.id)}
            className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer select-none transition-colors ${
              task.completed
                ? "line-through text-slate-400"
                : "text-slate-900 hover:text-indigo-600"
            }`}
          >
            {task.title}
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
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-0.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium mt-1 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Згорнути</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Читати повністю</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 self-start sm:self-center">
          {showConfirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
              <span className="text-[11px] font-medium text-rose-700 px-1">Видалити?</span>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Так
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer"
              >
                Ні
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Редагувати завдання"
                title="Редагувати завдання"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Видалити завдання"
                title="Видалити завдання"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
  );
}
