import { createContext, type Dispatch, type SetStateAction } from "react";
import type { AsyncListStatus } from "../hooks/useTasksQuery.ts";
import type Task from "../types/task.ts";
import type { TaskFilterState } from "../types";
import type { ToastData } from "../types";

export interface TaskContextValue {
  tasks: Task[];
  listStatus: AsyncListStatus;
  listError: string | null;
  page: number;
  limit: number;
  totalTasks: number;
  totalPages: number;
  setPage: (nextPage: number) => void;
  retryLoadTasks: () => void;
  pendingDeleteId: number | null;
  filters: TaskFilterState;
  setFilters: Dispatch<SetStateAction<TaskFilterState>>;
  resetFilters: () => void;
  editingTask: Task | null;
  setEditingTask: Dispatch<SetStateAction<Task | null>>;
  selectedTaskId: number | null;
  setSelectedTaskId: Dispatch<SetStateAction<number | null>>;
  deletingTask: Task | null;
  setDeletingTask: Dispatch<SetStateAction<Task | null>>;
  addTask: (
    taskData: Omit<Task, "id" | "completed" | "createdBy" | "createdAt">
  ) => Promise<boolean>;
  updateTask: (updatedTask: Task) => Promise<boolean>;
  toggleTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<boolean>;
  requestDelete: (id: number) => void;
  undoDelete: () => void;
  markAllComplete: () => void;
  resetTasks: () => void;
  toast: ToastData | null;
  dismissToast: () => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
