import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, Tag } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import { taskRepository } from "../repositories/taskRepository.ts";
import type Task from "../types/task.ts";
import type { TaskPriority } from "../types/task.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";

type DetailsStatus = "loading" | "success" | "error";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "Високий",
  medium: "Середній",
  low: "Низький",
};

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name: unknown }).name === "AbortError")
  );
}

export default function TaskDetailsDialog() {
  const { selectedTaskId, setSelectedTaskId } = useTaskContext();

  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<DetailsStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (selectedTaskId === null) {
      return;
    }

    const controller = new AbortController();
    const targetId = selectedTaskId;

    async function loadDetails() {
      setStatus("loading");
      setError(null);
      setTask(null);

      try {
        const fetchedTask = await taskRepository.getById(
          targetId,
          controller.signal
        );
        if (controller.signal.aborted) {
          return;
        }
        setTask(fetchedTask);
        setStatus("success");
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося завантажити деталі завдання."
        );
        setStatus("error");
      }
    }

    void loadDetails();

    return () => {
      controller.abort();
    };
  }, [selectedTaskId, reloadTick]);

  if (selectedTaskId === null) {
    return null;
  }

  return (
    <Dialog
      open={selectedTaskId !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedTaskId(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Деталі завдання #{selectedTaskId}</DialogTitle>
          <DialogDescription>
            Актуальна інформація про завдання, завантажена з REST API.
          </DialogDescription>
        </DialogHeader>

        {status === "loading" && (
          <div role="status" aria-busy="true" className="py-8 text-center">
            <Loader2
              className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-2"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-slate-800">Loading...</p>
            <p className="text-xs text-slate-500 mt-1">
              Отримання деталей завдання...
            </p>
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="py-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Помилка завантаження.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {error ?? "Не вдалося отримати деталі завдання."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReloadTick((prev) => prev + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Спробувати ще</span>
            </button>
          </div>
        )}

        {status === "success" && task && (
          <div className="space-y-4 pt-1">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Назва
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                {task.title}
              </h3>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Опис
              </span>
              <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-line">
                {task.description || "Опис відсутній."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[11px] text-slate-500 font-medium">
                  Категорія
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                  <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{task.category}</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[11px] text-slate-500 font-medium">
                  Пріоритет
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-800">
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[11px] text-slate-500 font-medium">
                  Статус
                </span>
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                    task.completed ? "text-emerald-700" : "text-sky-700"
                  }`}
                >
                  {task.completed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Виконано</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>В роботі</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
