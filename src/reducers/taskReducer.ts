import { getInitialTasks } from "../data/initialTasks.ts";
import type Task from "../types/task.ts";

export interface TaskReducerState {
  tasks: Task[];
  pendingDeleteId: number | null;
}

export type TaskAction =
  | { type: "add"; payload: Task }
  | { type: "toggle"; payload: { id: number } }
  | { type: "update"; payload: Task }
  | { type: "requestDelete"; payload: { id: number } }
  | { type: "confirmDelete"; payload: { id: number } }
  | { type: "undoDelete" }
  | { type: "markAllComplete" }
  | { type: "reset" };

export function taskReducer(
  state: TaskReducerState,
  action: TaskAction
): TaskReducerState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      };

    case "toggle":
      if (state.pendingDeleteId === action.payload.id) {
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task
        ),
      };

    case "update":
      if (state.pendingDeleteId === action.payload.id) {
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case "requestDelete": {
      const targetExists = state.tasks.some((task) => task.id === action.payload.id);
      if (!targetExists || state.pendingDeleteId === action.payload.id) {
        return state;
      }

      // Single active Undoable Delete: commit any previous pending deletion before scheduling the new one.
      const nextTasks =
        state.pendingDeleteId !== null
          ? state.tasks.filter((task) => task.id !== state.pendingDeleteId)
          : state.tasks;

      return {
        tasks: nextTasks,
        pendingDeleteId: action.payload.id,
      };
    }

    case "confirmDelete":
      if (state.pendingDeleteId !== action.payload.id) {
        return state;
      }
      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
        pendingDeleteId: null,
      };

    case "undoDelete":
      if (state.pendingDeleteId === null) {
        return state;
      }
      return {
        ...state,
        pendingDeleteId: null,
      };

    case "markAllComplete":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === state.pendingDeleteId ? task : { ...task, completed: true }
        ),
      };

    case "reset":
      return {
        tasks: getInitialTasks(),
        pendingDeleteId: null,
      };

    default:
      return state;
  }
}
