import { useActionState, useId, useRef, useState } from "react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import type Task from "../types/task.ts";
import type { TaskPriority } from "../types/task.ts";

interface TaskFormProps {
  editingTask?: Task | null;
  onCancelEdit?: () => void;
  className?: string;
}

interface FormState {
  error?: string;
}

const PRIORITY_OPTIONS: ReadonlyArray<{
  value: TaskPriority;
  label: string;
  activeClass: string;
  idleClass: string;
  activeDotClass: string;
  idleDotClass: string;
}> = [
  {
    value: "low",
    label: "Низький",
    activeClass: "bg-slate-800 text-white border-slate-800 shadow-xs",
    idleClass: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
    activeDotClass: "bg-slate-300",
    idleDotClass: "bg-slate-400",
  },
  {
    value: "medium",
    label: "Середній",
    activeClass: "bg-amber-600 text-white border-amber-600 shadow-xs",
    idleClass:
      "bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800",
    activeDotClass: "bg-amber-200",
    idleDotClass: "bg-amber-500",
  },
  {
    value: "high",
    label: "Високий",
    activeClass: "bg-rose-600 text-white border-rose-600 shadow-xs",
    idleClass:
      "bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700",
    activeDotClass: "bg-rose-200",
    idleDotClass: "bg-rose-500",
  },
];

export default function TaskForm({
  editingTask = null,
  onCancelEdit,
  className = "lg:col-span-5",
}: TaskFormProps) {
  const { tasks, addTask, updateTask } = useTaskContext();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const titleId = useId();
  const categoryId = useId();
  const categoryListId = useId();
  const descriptionId = useId();
  const completedId = useId();
  const errorId = useId();

  const [title, setTitle] = useState(editingTask?.title ?? "");
  const [category, setCategory] = useState(editingTask?.category ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority ?? "medium"
  );
  const [description, setDescription] = useState(
    editingTask?.description ?? ""
  );
  const [completed, setCompleted] = useState(editingTask?.completed ?? false);
  const [errorClearedOnEdit, setErrorClearedOnEdit] = useState(false);

  const categorySuggestions = Array.from(
    new Set([
      "React",
      "TypeScript",
      ...tasks.map((task) => task.category).filter(Boolean),
    ])
  );

  async function actionHandler(
    _previousState: FormState | null,
    formData: FormData
  ): Promise<FormState | null> {
    setErrorClearedOnEdit(false);

    const submittedTitle = ((formData.get("title") as string) ?? "").trim();
    const submittedDescription = (
      (formData.get("description") as string) ?? ""
    ).trim();
    const submittedPriority =
      (formData.get("priority") as TaskPriority) ?? "medium";
    const submittedCategory = (
      (formData.get("category") as string) ?? ""
    ).trim();
    const submittedCompleted = formData.get("completed") === "on";

    if (!submittedTitle) {
      titleInputRef.current?.focus();
      return { error: "Вкажіть назву завдання" };
    }

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: submittedTitle,
        description: submittedDescription,
        priority: submittedPriority,
        category: submittedCategory,
        completed: submittedCompleted,
      });
      return null;
    }

    const created = addTask({
      title: submittedTitle,
      description: submittedDescription,
      priority: submittedPriority,
      category: submittedCategory,
    });

    if (created) {
      setTitle("");
      setCategory("");
      setPriority("medium");
      setDescription("");
    }

    return null;
  }

  const [state, formAction, isPending] = useActionState(actionHandler, null);
  const visibleError = errorClearedOnEdit ? undefined : state?.error;

  function handleReset() {
    setTitle("");
    setCategory("");
    setPriority("medium");
    setDescription("");
    setErrorClearedOnEdit(true);
  }

  const isEditMode = Boolean(editingTask);

  const formElement = (
    <form
      action={formAction}
      aria-labelledby={isEditMode ? undefined : headingId}
      className="space-y-4"
      noValidate
    >
      {/* Title Input */}
      <div>
        <label
          htmlFor={titleId}
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Назва завдання{" "}
          <span className="text-rose-500" aria-hidden="true">
            *
          </span>
        </label>
        <input
          ref={titleInputRef}
          id={titleId}
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (visibleError && e.target.value.trim()) {
              setErrorClearedOnEdit(true);
            }
          }}
          placeholder="Наприклад: Опрацювати базові принципи компонентів React"
          aria-invalid={visibleError ? "true" : "false"}
          aria-describedby={visibleError ? errorId : undefined}
          className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 ${
            visibleError
              ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
              : "border-slate-200 focus:ring-indigo-500"
          }`}
        />
        {visibleError && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-rose-600 mt-1 font-medium"
          >
            {visibleError}
          </p>
        )}
      </div>

      {/* Category Input */}
      <div>
        <label
          htmlFor={categoryId}
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Предмет / Категорія (необов'язково)
        </label>
        <input
          id={categoryId}
          name="category"
          type="text"
          list={categoryListId}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Наприклад: React, TypeScript, Алгоритми..."
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
        />
        <datalist id={categoryListId}>
          {categorySuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>

      {/* Priority Selection */}
      <fieldset>
        <legend className="block text-xs font-semibold text-slate-700 mb-1.5">
          Пріоритет важливості
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = priority === option.value;
            return (
              <label
                key={option.value}
                className={`relative py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 ${
                  isSelected ? option.activeClass : option.idleClass
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setPriority(option.value)}
                  className="visually-hidden"
                />
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? option.activeDotClass : option.idleDotClass
                  }`}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Description / Notes */}
      <div>
        <label
          htmlFor={descriptionId}
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Примітки / Деталі завдання (необов'язково)
        </label>
        <textarea
          id={descriptionId}
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Додаткові вимоги викладача, номери параграфів, посилання або план..."
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Completion toggle in edit mode */}
      {isEditMode && (
        <div>
          <label
            htmlFor={completedId}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
          >
            <input
              id={completedId}
              type="checkbox"
              name="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600 border-slate-300 cursor-pointer"
            />
            <span className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                Позначити як виконане
              </span>
              <span className="text-[11px] text-slate-500">
                {completed
                  ? "Завдання виконано"
                  : "Завдання очікує виконання"}
              </span>
            </span>
          </label>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {!isEditMode && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            Очистити
          </button>
        )}

        {isEditMode && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            Скасувати
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
        >
          {isPending
            ? "Збереження..."
            : isEditMode
              ? "Зберегти зміни"
              : "Додати завдання"}
        </button>
      </div>
    </form>
  );

  if (isEditMode) {
    return formElement;
  }

  return (
    <section
      id="task-form"
      aria-labelledby={headingId}
      className={`bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs transition-all ${className}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h2 id={headingId} className="text-base font-semibold text-slate-900">
            Нове навчальне завдання
          </h2>
          <p className="text-xs text-slate-500">
            Заповніть інформацію про навчальне завдання
          </p>
        </div>
      </div>

      {formElement}
    </section>
  );
}

export { TaskForm };
