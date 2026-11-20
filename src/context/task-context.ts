import { createContext, type Dispatch, type SetStateAction } from "react";
import type Task from "../types/task.ts";
import type { TaskFilterState } from "../types";
import type { ToastData } from "../types";

export interface TaskContextValue {
  tasks: Task[];
  pendingDeleteId: number | null;
  filters: TaskFilterState;
  setFilters: Dispatch<SetStateAction<TaskFilterState>>;
  resetFilters: () => void;
  editingTask: Task | null;
  setEditingTask: Dispatch<SetStateAction<Task | null>>;
  addTask: (taskData: Omit<Task, "id" | "completed">) => boolean;
  updateTask: (updatedTask: Task) => boolean;
  toggleTask: (id: number) => void;
  requestDelete: (id: number) => void;
  undoDelete: () => void;
  markAllComplete: () => void;
  resetTasks: () => void;
  toast: ToastData | null;
  dismissToast: () => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
