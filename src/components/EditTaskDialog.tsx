import { useState, useActionState } from "react";
import type Task from "../types/task.ts";
import type { TaskPriority } from "../types/task.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog.tsx";

interface FormState {
  error?: string;
}

interface EditTaskFormProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
}

export function EditTaskForm({ task, onSave, onCancel }: EditTaskFormProps) {
  const [prevTaskId, setPrevTaskId] = useState<number>(task.id);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [completed, setCompleted] = useState<boolean>(task.completed);

  if (task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setPriority(task.priority);
    setCompleted(task.completed);
  }

  // Client Action using React 19 Form Actions (FormData)
  async function actionHandler(
    _prevState: FormState | null,
    formData: FormData
  ): Promise<FormState | null> {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    const selectedPriority = (formData.get("priority") as TaskPriority) ?? "medium";
    const category = (formData.get("category") as string)?.trim() ?? "";
    const isCompleted = formData.get("completed") === "on";

    if (!title) {
      return { error: "Вкажіть назву завдання" };
    }

    onSave({
      ...task,
      title,
      description,
      priority: selectedPriority,
      category,
      completed: isCompleted,
    });

    return null;
  }

  const [state, formAction, isPending] = useActionState(actionHandler, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="priority" value={priority} />

      {/* Title Input */}
      <div>
        <label htmlFor="edit-task-title" className="block text-xs font-semibold text-slate-700 mb-1">
          Назва завдання <span className="text-rose-500">*</span>
        </label>
        <input
          id="edit-task-title"
          name="title"
          type="text"
          defaultValue={task.title}
          key={`title-${task.id}`}
          placeholder="Наприклад: Опрацювати базові принципи компонентів React"
          aria-invalid={state?.error ? "true" : "false"}
          aria-describedby={state?.error ? "edit-title-error" : undefined}
          className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 ${
            state?.error
              ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
              : "border-slate-200 focus:ring-indigo-500"
          }`}
        />
        {state?.error && (
          <p id="edit-title-error" className="text-xs text-rose-600 mt-1 font-medium">
            {state.error}
          </p>
        )}
      </div>

      {/* Category Input */}
      <div>
        <label htmlFor="edit-task-category" className="block text-xs font-semibold text-slate-700 mb-1">
          Предмет / Категорія (необов'язково)
        </label>
        <input
          id="edit-task-category"
          name="category"
          type="text"
          defaultValue={task.category}
          key={`cat-${task.id}`}
          placeholder="Наприклад: React, TypeScript, Математика..."
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Пріоритет важливості
        </label>
        <div
          role="group"
          aria-label="Пріоритет важливості"
          className="grid grid-cols-3 gap-2"
        >
          <button
            type="button"
            onClick={() => setPriority("low")}
            aria-pressed={priority === "low"}
            className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              priority === "low"
                ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                priority === "low" ? "bg-slate-300" : "bg-slate-400"
              }`}
            />
            <span>Низький</span>
          </button>

          <button
            type="button"
            onClick={() => setPriority("medium")}
            aria-pressed={priority === "medium"}
            className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              priority === "medium"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                priority === "medium" ? "bg-amber-200" : "bg-amber-500"
              }`}
            />
            <span>Середній</span>
          </button>

          <button
            type="button"
            onClick={() => setPriority("high")}
            aria-pressed={priority === "high"}
            className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              priority === "high"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                priority === "high" ? "bg-rose-200" : "bg-rose-500"
              }`}
            />
            <span>Високий</span>
          </button>
        </div>
      </div>

      {/* Description / Notes */}
      <div>
        <label htmlFor="edit-task-desc" className="block text-xs font-semibold text-slate-700 mb-1">
          Примітки / Деталі завдання (необов'язково)
        </label>
        <textarea
          id="edit-task-desc"
          name="description"
          rows={3}
          defaultValue={task.description}
          key={`desc-${task.id}`}
          placeholder="Додаткові вимоги викладача, номери параграфів, посилання або план..."
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 resize-none"
        />
      </div>

      {/* Completion Status Toggle */}
      <div>
        <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            name="completed"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800">
              Позначити як виконане
            </span>
            <span className="text-[11px] text-slate-500">
              {completed ? "Завдання виконано" : "Завдання очікує виконання"}
            </span>
          </div>
        </label>
      </div>

      {/* Actions / Footer */}
      <DialogFooter>
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Скасувати
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          {isPending ? "Збереження..." : "Зберегти зміни"}
        </button>
      </DialogFooter>
    </form>
  );
}

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTask: Task) => void;
}

export default function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: EditTaskDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагування завдання</DialogTitle>
          <DialogDescription>
            Оновіть назву, категорію, пріоритет або статус завдання.
          </DialogDescription>
        </DialogHeader>

        <EditTaskForm
          task={task}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
