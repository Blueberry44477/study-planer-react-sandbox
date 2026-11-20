import { useEffect, useReducer, useState, type ReactNode } from "react";
import { getInitialTasks } from "../data/initialTasks.ts";
import { readStorageValue, useLocalStorage, writeStorageValue } from "../hooks/useLocalStorage.ts";
import { DEFAULT_FILTERS,  isValidTaskFilterState,  isValidTaskList } from "../lib/taskUtils.ts";
import { taskReducer, type TaskReducerState } from "../reducers/taskReducer.ts";
import type Task from "../types/task.ts";
import type { TaskFilterState } from "../types";
import type { ToastData, ToastVariant } from "../types";
import { TaskContext } from "./task-context.ts";

const TASKS_STORAGE_KEY = "study_planner_tasks";
const FILTERS_STORAGE_KEY = "study_planner_filters";
const DELETE_UNDO_DELAY_MS = 5000;
const TOAST_DEFAULT_DURATION_MS = 3500;

function createInitialTaskState(): TaskReducerState {
  return {
    tasks: readStorageValue(TASKS_STORAGE_KEY, getInitialTasks(), isValidTaskList),
    pendingDeleteId: null,
  };
}

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(
    taskReducer,
    undefined,
    createInitialTaskState
  );
  const [filters, setFilters] = useLocalStorage<TaskFilterState>(
    FILTERS_STORAGE_KEY,
    DEFAULT_FILTERS,
    isValidTaskFilterState
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  function showToast(
    message: string,
    variant: ToastVariant,
    options?: {
      description?: string;
      durationMs?: number;
      isUndoDelete?: boolean;
    }
  ) {
    const now = Date.now();
    const durationMs = options?.durationMs ?? TOAST_DEFAULT_DURATION_MS;
    setToast((prev) => ({
      id: Math.max(now, (prev?.id ?? 0) + 1),
      message,
      description: options?.description,
      variant,
      durationMs,
      expiresAt: now + durationMs,
      isUndoDelete: options?.isUndoDelete,
    }));
  }

  // Sync tasks list to localStorage whenever tasks state changes.
  useEffect(() => {
    writeStorageValue(TASKS_STORAGE_KEY, state.tasks);
  }, [state.tasks]);

  // Derived active tasks count synchronized with browser tab title.
  const activeTasksCount = state.tasks.filter((task) => !task.completed).length;

  useEffect(() => {
    const noun = activeTasksCount === 1 ? "active task" : "active tasks";
    document.title = `Study Planner — ${activeTasksCount} ${noun}`;

    return () => {
      document.title = "Study Planner";
    };
  }, [activeTasksCount]);

  // Undoable Delete countdown side effect (5s) with clearTimeout cleanup.
  useEffect(() => {
    if (state.pendingDeleteId === null) {
      return;
    }

    const targetId = state.pendingDeleteId;
    const timerId = window.setTimeout(() => {
      const now = Date.now();
      dispatch({ type: "confirmDelete", payload: { id: targetId } });
      setToast((prev) => ({
        id: Math.max(now, (prev?.id ?? 0) + 1),
        message: "Завдання остаточно видалено",
        variant: "info",
        durationMs: TOAST_DEFAULT_DURATION_MS,
        expiresAt: now + TOAST_DEFAULT_DURATION_MS,
      }));
    }, DELETE_UNDO_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [state.pendingDeleteId]);

  // Auto-dismiss non-undo toast notifications after their configured duration.
  useEffect(() => {
    if (!toast || toast.isUndoDelete) {
      return;
    }

    const currentToastId = toast.id;
    const timerId = window.setTimeout(() => {
      setToast((prev) => (prev?.id === currentToastId ? null : prev));
    }, toast.durationMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [toast]);

  function addTask(taskData: Omit<Task, "id" | "completed">): boolean {
    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) {
      showToast("Помилка створення завдання", "error", {
        description: "Вкажіть назву завдання.",
      });
      return false;
    }

    const nextId =
      state.tasks.reduce(
        (maxId, task) => Math.max(maxId, task.id),
        Date.now() - 1
      ) + 1;

    const newTask: Task = {
      id: nextId,
      title: trimmedTitle,
      description: taskData.description.trim(),
      priority: taskData.priority,
      category: taskData.category.trim(),
      completed: false,
    };

    dispatch({ type: "add", payload: newTask });
    showToast("Завдання створено", "success", {
      description: newTask.title,
    });
    return true;
  }

  function updateTask(updatedTask: Task): boolean {
    const trimmedTitle = updatedTask.title.trim();
    if (!trimmedTitle) {
      showToast("Помилка редагування", "error", {
        description: "Назва завдання не може бути порожньою.",
      });
      return false;
    }

    const exists = state.tasks.some((task) => task.id === updatedTask.id);
    if (!exists || state.pendingDeleteId === updatedTask.id) {
      showToast("Неможливо оновити завдання", "error", {
        description: "Завдання не знайдено або воно очікує видалення.",
      });
      return false;
    }

    const sanitizedTask: Task = {
      ...updatedTask,
      title: trimmedTitle,
      description: updatedTask.description.trim(),
      category: updatedTask.category.trim(),
    };

    dispatch({ type: "update", payload: sanitizedTask });
    setEditingTask(null);
    showToast("Завдання оновлено", "success", {
      description: sanitizedTask.title,
    });
    return true;
  }

  function toggleTask(id: number): void {
    if (state.pendingDeleteId === id) {
      showToast("Дія недоступна", "error", {
        description: "Спочатку скасуйте видалення завдання.",
      });
      return;
    }

    const exists = state.tasks.some((task) => task.id === id);
    if (!exists) {
      showToast("Помилка операції", "error", {
        description: "Завдання не знайдено.",
      });
      return;
    }

    dispatch({ type: "toggle", payload: { id } });
  }

  function requestDelete(id: number): void {
    const targetTask = state.tasks.find((task) => task.id === id);
    if (!targetTask) {
      showToast("Помилка видалення", "error", {
        description: "Завдання не знайдено.",
      });
      return;
    }

    if (state.pendingDeleteId === id) {
      return;
    }

    dispatch({ type: "requestDelete", payload: { id } });
    showToast("Завдання буде видалено", "warning", {
      description: targetTask.title,
      durationMs: DELETE_UNDO_DELAY_MS,
      isUndoDelete: true,
    });
  }

  function undoDelete(): void {
    if (state.pendingDeleteId === null) {
      showToast("Немає видалення для скасування", "error");
      return;
    }

    dispatch({ type: "undoDelete" });
    showToast("Видалення скасовано", "info", {
      durationMs: 2500,
    });
  }

  function markAllComplete(): void {
    const hasIncomplete = state.tasks.some(
      (task) => !task.completed && task.id !== state.pendingDeleteId
    );
    if (!hasIncomplete) {
      showToast("Немає активних завдань", "error", {
        description: "Усі доступні завдання вже виконані.",
      });
      return;
    }

    dispatch({ type: "markAllComplete" });
    showToast("Усі завдання виконано", "success");
  }

  function resetTasks(): void {
    dispatch({ type: "reset" });
    setEditingTask(null);
    showToast("Дані скинуто", "info", {
      description: "Відновлено початковий список завдань.",
    });
  }

  function resetFilters(): void {
    setFilters(DEFAULT_FILTERS);
  }

  function dismissToast(): void {
    setToast(null);
  }

  return (
    <TaskContext
      value={{
        tasks: state.tasks,
        pendingDeleteId: state.pendingDeleteId,
        filters,
        setFilters,
        resetFilters,
        editingTask,
        setEditingTask,
        addTask,
        updateTask,
        toggleTask,
        requestDelete,
        undoDelete,
        markAllComplete,
        resetTasks,
        toast,
        dismissToast,
      }}
    >
      {children}
    </TaskContext>
  );
}
