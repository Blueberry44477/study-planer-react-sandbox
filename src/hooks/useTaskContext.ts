import { use } from "react";
import { TaskContext, type TaskContextValue } from "../context/task-context.ts";

export function useTaskContext(): TaskContextValue {
  const context = use(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }

  return context;
}
