import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { DEFAULT_FILTERS } from "../lib/taskUtils.ts";
import type { FilterStatus, Priority, SortOption, TaskFilterState } from "../types";

const VALID_STATUSES: ReadonlySet<FilterStatus> = new Set([
  "all",
  "active",
  "completed",
]);

const VALID_PRIORITIES: ReadonlySet<"all" | Priority> = new Set([
  "all",
  "low",
  "medium",
  "high",
]);

const VALID_SORT_OPTIONS: ReadonlySet<SortOption> = new Set([
  "deadline-asc",
  "deadline-desc",
  "priority-desc",
  "title-asc",
  "created-desc",
]);

function parseStatus(value: string | null): FilterStatus {
  if (value && VALID_STATUSES.has(value as FilterStatus)) {
    return value as FilterStatus;
  }
  return DEFAULT_FILTERS.status;
}

function parsePriority(value: string | null): "all" | Priority {
  if (value && VALID_PRIORITIES.has(value as "all" | Priority)) {
    return value as "all" | Priority;
  }
  return DEFAULT_FILTERS.priority;
}

function parseSortBy(value: string | null): SortOption {
  if (value && VALID_SORT_OPTIONS.has(value as SortOption)) {
    return value as SortOption;
  }
  return DEFAULT_FILTERS.sortBy;
}

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilterState = useMemo(
    () => ({
      search: searchParams.get("search") ?? DEFAULT_FILTERS.search,
      status: parseStatus(searchParams.get("status")),
      subject: searchParams.get("subject") || DEFAULT_FILTERS.subject,
      priority: parsePriority(searchParams.get("priority")),
      sortBy: parseSortBy(searchParams.get("sortBy")),
    }),
    [searchParams]
  );

  const updateFilter = useCallback(
    <K extends keyof TaskFilterState>(key: K, value: TaskFilterState[K]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const defaultValue = DEFAULT_FILTERS[key];

          if (value === defaultValue || value === "") {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("search");
        next.delete("status");
        next.delete("subject");
        next.delete("priority");
        next.delete("sortBy");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
