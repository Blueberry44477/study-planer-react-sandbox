import type Task from "../types/task.ts";
import type { TaskFilterState } from "../types/taskFilter.ts";

export const DEFAULT_FILTERS: TaskFilterState = {
  search: "",
  status: "all",
  subject: "all",
  priority: "all",
  sortBy: "deadline-asc",
};

export function isValidTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    Number.isFinite(candidate.id) &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.completed === "boolean" &&
    (candidate.priority === "low" ||
      candidate.priority === "medium" ||
      candidate.priority === "high") &&
    typeof candidate.category === "string"
  );
}

export function isValidTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isValidTask);
}

export function isValidTaskFilterState(value: unknown): value is TaskFilterState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.search === "string" &&
    (candidate.status === "all" ||
      candidate.status === "active" ||
      candidate.status === "completed") &&
    typeof candidate.subject === "string" &&
    (candidate.priority === "all" ||
      candidate.priority === "low" ||
      candidate.priority === "medium" ||
      candidate.priority === "high") &&
    (candidate.sortBy === "deadline-asc" ||
      candidate.sortBy === "deadline-desc" ||
      candidate.sortBy === "priority-desc" ||
      candidate.sortBy === "title-asc" ||
      candidate.sortBy === "created-desc")
  );
}

export function hasActiveFilters(filters: TaskFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.subject !== "all" ||
    filters.priority !== "all" ||
    filters.sortBy !== "deadline-asc"
  );
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  const query = filters.search.toLowerCase().trim();

  return tasks
    .filter((task) => {
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      if (filters.status === "active" && task.completed) {
        return false;
      }
      if (filters.status === "completed" && !task.completed) {
        return false;
      }

      if (filters.subject !== "all" && task.category !== filters.subject) {
        return false;
      }

      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "priority-desc": {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        case "title-asc":
          return a.title.localeCompare(b.title, "uk", { sensitivity: "base" });
        case "created-desc":
          return b.id - a.id;
        case "deadline-asc":
        case "deadline-desc":
        default:
          return 0;
      }
    });
}
