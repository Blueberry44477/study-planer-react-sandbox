import type { TaskPriority } from "./task.ts";

export type FilterStatus = "all" | "active" | "completed";
export type Priority = TaskPriority;
export type SortOption =
  | "deadline-asc"
  | "deadline-desc"
  | "priority-desc"
  | "title-asc"
  | "created-desc";

export interface TaskFilterState {
  search: string;
  status: FilterStatus;
  subject: string;
  priority: "all" | Priority;
  sortBy: SortOption;
}
