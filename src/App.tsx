import EditTaskDialog from "./components/EditTaskDialog.tsx";
import Header from "./components/Header.tsx";
import TaskFilters from "./components/TaskFilters.tsx";
import TaskForm from "./components/TaskForm.tsx";
import TaskList from "./components/TaskList.tsx";
import TaskStats from "./components/TaskStats.tsx";
import Toast from "./components/Toast.tsx";
import { TaskProvider } from "./context/TaskContext.tsx";

export default function App() {
  function handleCreateTaskScroll(): void {
    const formElement = document.getElementById("task-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = formElement.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  }

  return (
    <TaskProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Header onCreateTask={handleCreateTaskScroll} />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <TaskStats />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <TaskForm />
            <div className="lg:col-span-7 space-y-4">
              <TaskFilters />
              <TaskList />
            </div>
          </div>
        </main>

        <EditTaskDialog />
        <Toast />
      </div>
    </TaskProvider>
  );
}
