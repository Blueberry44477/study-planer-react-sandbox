import { use, useCallback, useEffect, useReducer, useState, type ReactNode } from "react";
import { AuthContext } from "../auth/context/authContext.ts";
import { authStore } from "../auth/authStore.ts";
import { useLocalStorage } from "../hooks/useLocalStorage.ts";
import { useTasksQuery } from "../hooks/useTasksQuery.ts";
import { DEFAULT_FILTERS, isValidTaskFilterState } from "../lib/taskUtils.ts";
import { taskReducer, type TaskReducerState } from "../reducers/taskReducer.ts";
import { taskRepository } from "../repositories/taskRepository.ts";
import type Task from "../types/task.ts";
import type { TaskFilterState } from "../types";
import type { ToastData, ToastVariant } from "../types";
import { TaskContext } from "./task-context.ts";

const FILTERS_STORAGE_KEY = "study_planner_filters";
const DELETE_UNDO_DELAY_MS = 5000;
const TOAST_DEFAULT_DURATION_MS = 3500;

const INITIAL_TASK_STATE: TaskReducerState = {
  tasks: [],
  pendingDeleteId: null,
};

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const auth = use(AuthContext);
  const [state, dispatch] = useReducer(taskReducer, INITIAL_TASK_STATE);
  const [filters, setFilters] = useLocalStorage<TaskFilterState>(
    FILTERS_STORAGE_KEY,
    DEFAULT_FILTERS,
    isValidTaskFilterState
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleTasksLoaded = useCallback((loadedTasks: Task[]) => {
    dispatch({ type: "setTasks", payload: loadedTasks });
  }, []);

  const {
    status: listStatus,
    error: listError,
    page,
    limit,
    total: totalTasks,
    totalPages,
    setPage,
    retry: retryLoadTasks,
  } = useTasksQuery({ onTasksLoaded: handleTasksLoaded });

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

  async function addTask(
    taskData: Omit<Task, "id" | "completed" | "createdBy" | "createdAt">
  ): Promise<boolean> {
    if (!authStore.isAuthenticated()) {
      showToast("Потрібна авторизація", "error", {
        description: "Увійдіть у систему, щоб створювати завдання.",
      });
      return false;
    }

    const trimmedTitle = taskData.title.trim();
    if (!trimmedTitle) {
      showToast("Помилка створення завдання", "error", {
        description: "Вкажіть назву завдання.",
      });
      return false;
    }

    try {
      const createdTask = await taskRepository.create({
        title: trimmedTitle,
        description: taskData.description.trim(),
        priority: taskData.priority,
        category: taskData.category.trim() || "General",
        completed: false,
        createdBy: auth?.user?.username ?? "User",
        createdAt: new Date().toISOString(),
      });

      const hasCollision = state.tasks.some((t) => t.id === createdTask.id);
      const uniqueId = hasCollision
        ? state.tasks.reduce((max, t) => Math.max(max, t.id), createdTask.id) +
          1
        : createdTask.id;

      const newTask: Task = {
        ...createdTask,
        id: uniqueId,
      };

      dispatch({ type: "add", payload: newTask });
      showToast("Завдання створено", "success", {
        description: newTask.title,
      });
      return true;
    } catch (err) {
      showToast("Помилка створення завдання", "error", {
        description:
          err instanceof Error ? err.message : "Не вдалося створити завдання.",
      });
      return false;
    }
  }

  async function updateTask(updatedTask: Task): Promise<boolean> {
    if (!authStore.isAuthenticated()) {
      showToast("Потрібна авторизація", "error", {
        description: "Увійдіть у систему, щоб редагувати завдання.",
      });
      return false;
    }

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
      category: updatedTask.category.trim() || "General",
    };

    try {
      await taskRepository.update(sanitizedTask.id, {
        title: sanitizedTask.title,
        completed: sanitizedTask.completed,
        description: sanitizedTask.description,
        priority: sanitizedTask.priority,
        category: sanitizedTask.category,
      });

      dispatch({ type: "update", payload: sanitizedTask });
      setEditingTask(null);
      showToast("Завдання оновлено", "success", {
        description: sanitizedTask.title,
      });
      return true;
    } catch (err) {
      showToast("Помилка оновлення", "error", {
        description:
          err instanceof Error ? err.message : "Не вдалося оновити завдання.",
      });
      return false;
    }
  }

  async function toggleTask(id: number): Promise<void> {
    if (!authStore.isAuthenticated()) {
      showToast("Потрібна авторизація", "error", {
        description: "Увійдіть у систему, щоб змінювати статус завдання.",
      });
      return;
    }

    if (state.pendingDeleteId === id) {
      showToast("Дія недоступна", "error", {
        description: "Спочатку скасуйте видалення завдання.",
      });
      return;
    }

    const targetTask = state.tasks.find((task) => task.id === id);
    if (!targetTask) {
      showToast("Помилка операції", "error", {
        description: "Завдання не знайдено.",
      });
      return;
    }

    const nextCompleted = !targetTask.completed;
    dispatch({ type: "toggle", payload: { id } });

    try {
      await taskRepository.update(id, { completed: nextCompleted });
    } catch (err) {
      dispatch({ type: "toggle", payload: { id } });
      showToast("Помилка оновлення статусу", "error", {
        description:
          err instanceof Error ? err.message : "Не вдалося змінити статус.",
      });
    }
  }

  async function deleteTask(id: number): Promise<boolean> {
    if (!authStore.isAuthenticated()) {
      showToast("Потрібна авторизація", "error", {
        description: "Увійдіть у систему, щоб видаляти завдання.",
      });
      return false;
    }

    const targetTask = state.tasks.find((task) => task.id === id);
    if (!targetTask) {
      showToast("Помилка видалення", "error", {
        description: "Завдання не знайдено.",
      });
      return false;
    }

    try {
      await taskRepository.delete(id);
      dispatch({ type: "delete", payload: { id } });
      setDeletingTask(null);
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
      showToast("Завдання видалено", "success", {
        description: targetTask.title,
      });
      return true;
    } catch (err) {
      showToast("Помилка видалення", "error", {
        description:
          err instanceof Error ? err.message : "Не вдалося видалити завдання.",
      });
      return false;
    }
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
    setEditingTask(null);
    retryLoadTasks();
    showToast("Список оновлено", "info", {
      description: "Завантажено актуальні завдання із сервера.",
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
        listStatus,
        listError,
        page,
        limit,
        totalTasks,
        totalPages,
        setPage,
        retryLoadTasks,
        pendingDeleteId: state.pendingDeleteId,
        filters,
        setFilters,
        resetFilters,
        editingTask,
        setEditingTask,
        selectedTaskId,
        setSelectedTaskId,
        deletingTask,
        setDeletingTask,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
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
