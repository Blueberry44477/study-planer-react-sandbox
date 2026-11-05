import Header from "./components/Header.tsx";
import TaskForm from "./components/TaskForm.tsx";
import type Task from "./types/task.ts";
import {useEffect, useState} from "react";
import {getInitialTasks} from "./data/initialTasks.ts";

const STORAGE_KEY = "study_planner_tasks";

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
    }
    setTasks((prev: any) => [newTask, ...prev]);
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to save tasks to localStorage", e);
    }
  }, [tasks]);

  return(
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header onCreateTask={handleCreateTaskScroll}/>


      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/*<TaskStats stats={stats} />*/}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <TaskForm onSubmitTask={handleCreateTask}/>
        </div>
      </main>
    </div>
  )
}
