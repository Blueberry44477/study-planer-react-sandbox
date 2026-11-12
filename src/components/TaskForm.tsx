import { useState, useRef, useActionState } from "react";
import type Task from "../types/task.ts";
import type { TaskPriority } from "../types/task.ts";

interface TaskFormProps {
  onSubmitTask: (taskData: Omit<Task, "id" | "completed">) => void;
  editingTask?: Task | null;
  onCancelEdit?: () => void;
  className?: string;
}

interface FormState {
  error?: string;
}

export default function TaskForm({
  onSubmitTask,
  editingTask,
  onCancelEdit,
  className = "lg:col-span-5",
}: TaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [prevTaskId, setPrevTaskId] = useState<number | undefined>(editingTask?.id);
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask ? editingTask.priority : "medium"
  );

  if (editingTask?.id !== prevTaskId) {
    setPrevTaskId(editingTask?.id);
    setPriority(editingTask ? editingTask.priority : "medium");
  }

  // Client Action using React 19 Form Actions (FormData)
  async function actionHandler(
    _previousState: FormState | null,
    formData: FormData
  ): Promise<FormState | null> {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    const selectedPriority = (formData.get("priority") as TaskPriority) ?? "medium";
    const category = (formData.get("category") as string)?.trim() ?? "";

    if (!title) {
      return { error: "Вкажіть назву завдання" };
    }

    onSubmitTask({
      title,
      description,
      priority: selectedPriority,
      category,
    });

    if (!editingTask) {
      formRef.current?.reset();
      setPriority("medium");
    }

    return null;
  }

  const [state, formAction, isPending] = useActionState(actionHandler, null);

  function handleReset() {
    formRef.current?.reset();
    setPriority("medium");
  }

  return (
    <div
      id="task-form"
      className={`bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs transition-all ${className}`}
    >
      {/* Form header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {editingTask ? "Редагування завдання" : "Нове навчальне завдання"}
          </h2>
          <p className="text-xs text-slate-500">
            {editingTask
              ? "Оновіть параметри завдання"
              : "Заповніть інформацію про навчальне завдання"}
          </p>
        </div>

        {editingTask && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Скасувати
          </button>
        )}
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="priority" value={priority} />
        <input type="hidden" name="category" value={editingTask?.category ?? ""} />

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-slate-700 mb-1">
            Назва завдання <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={editingTask?.title ?? ""}
            key={editingTask ? `title-${editingTask.id}` : "title-new"}
            placeholder="Наприклад: Опрацювати базові принципи компонентів React"
            aria-invalid={state?.error ? "true" : "false"}
            aria-describedby={state?.error ? "title-error" : undefined}
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 ${
              state?.error
                ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                : "border-slate-200 focus:ring-indigo-500"
            }`}
          />
          {state?.error && (
            <p id="title-error" className="text-xs text-rose-600 mt-1 font-medium">
              {state.error}
            </p>
          )}
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
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
            Примітки / Деталі завдання (необов'язково)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={editingTask?.description ?? ""}
            key={editingTask ? `desc-${editingTask.id}` : "desc-new"}
            placeholder="Додаткові вимоги викладача, номери параграфів, посилання або план..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Actions buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {!editingTask && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Очистити
            </button>
          )}

          {editingTask && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Скасувати
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {isPending
              ? "Збереження..."
              : editingTask
              ? "Зберегти зміни"
              : "Додати завдання"}
          </button>
        </div>
      </form>
    </div>
  );
}

export { TaskForm };
