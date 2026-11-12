import Header from "./components/Header.tsx";
import TaskForm from "./components/TaskForm.tsx";
import TaskList from "./components/TaskList.tsx";
import TaskFilters from "./components/TaskFilters.tsx";
import EditTaskDialog from "./components/EditTaskDialog.tsx";
import TaskStats from "./components/TaskStats.tsx";
import type Task from "./types/task.ts";
import type TaskStatsData from "./types/taskStatsData.ts";
import type { TaskFilterState } from "./types";
import { useEffect, useState, useMemo } from "react";
import { getInitialTasks } from "./data/initialTasks.ts";

const STORAGE_KEY = "study_planner_tasks";

const initialFilters: TaskFilterState = {
  search: "",
  status: "all",
  subject: "all",
  priority: "all",
  sortBy: "deadline-asc",
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load tasks from localStorage", e);
    }
    return getInitialTasks();
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>(initialFilters);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats: TaskStatsData = {
    total,
    completed,
    pending,
    completionPercentage,
  };

  const counts = {
    all: total,
    active: pending,
    completed,
  };

  const availableSubjects = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));
  }, [tasks]);

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.subject !== "all" ||
    filters.priority !== "all" ||
    filters.sortBy !== "deadline-asc";

  function handleResetFilters() {
    setFilters(initialFilters);
  }

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search in title or description
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = task.description?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesDesc) {
            return false;
          }
        }

        // Status filter
        if (filters.status === "active" && task.completed) {
          return false;
        }
        if (filters.status === "completed" && !task.completed) {
          return false;
        }

        // Subject / Category filter
        if (filters.subject !== "all" && task.category !== filters.subject) {
          return false;
        }

        // Priority filter
        return !(filters.priority !== "all" && task.priority !== filters.priority);
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
  }, [tasks, filters]);

  function handleCreateTaskScroll(): void {
    const formElement = document.getElementById("task-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = formElement.querySelector("input");
      if (input) input.focus();
    }
  }

  function handleCreateTask(taskData: Omit<Task, "id" | "completed">): void {
    const newTask: Task = {
      id: Math.random(),
      ...taskData,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function handleUpdateTask(updatedTask: Task): void {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
  }

  function handleToggleComplete(id: number) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }

  function handleDeleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleMarkAllComplete() {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to save tasks to localStorage", e);
    }
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header onCreateTask={handleCreateTaskScroll} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <TaskStats stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <TaskForm onSubmitTask={handleCreateTask} />
          <div className="lg:col-span-7 space-y-4">
            <TaskFilters
              filters={filters}
              onFilterChange={setFilters}
              availableSubjects={availableSubjects}
              counts={counts}
            />
            <TaskList
              tasks={filteredTasks}
              totalTasksCount={tasks.length}
              onToggleComplete={handleToggleComplete}
              onMarkAllComplete={handleMarkAllComplete}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              isFiltered={isFiltered}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </main>

      <EditTaskDialog
        task={editingTask}
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        onSave={handleUpdateTask}
      />
    </div>
  );
}
