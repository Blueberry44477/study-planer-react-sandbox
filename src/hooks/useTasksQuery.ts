import { useCallback, useEffect, useState } from "react";
import { taskRepository } from "../repositories/taskRepository.ts";
import type Task from "../types/task.ts";

export type AsyncListStatus = "loading" | "success" | "error";

const DEFAULT_PAGE_LIMIT = 10;

interface UseTasksQueryOptions {
  limit?: number;
  onTasksLoaded: (tasks: Task[]) => void;
}

export interface UseTasksQueryResult {
  status: AsyncListStatus;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (nextPage: number) => void;
  retry: () => void;
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name: unknown }).name === "AbortError")
  );
}

export function useTasksQuery({
  limit = DEFAULT_PAGE_LIMIT,
  onTasksLoaded,
}: UseTasksQueryOptions): UseTasksQueryResult {
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<AsyncListStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    const controller = new AbortController();
    const skip = (page - 1) * limit;

    async function loadTasks() {
      setStatus("loading");
      setError(null);

      try {
        const result = await taskRepository.getAll(
          { limit, skip },
          controller.signal
        );
        if (controller.signal.aborted) {
          return;
        }
        setTotal(result.total);
        onTasksLoaded(result.tasks);
        setStatus("success");
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) {
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося завантажити список завдань."
        );
        setStatus("error");
      }
    }

    void loadTasks();

    return () => {
      controller.abort();
    };
  }, [page, limit, reloadTick, onTasksLoaded]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const retry = useCallback(() => {
    setReloadTick((prev) => prev + 1);
  }, []);

  return {
    status,
    error,
    page,
    limit,
    total,
    totalPages,
    setPage,
    retry,
  };
}
