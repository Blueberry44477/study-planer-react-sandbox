import { useEffect, useRef } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Undo2,
  X,
} from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import type { ToastVariant } from "../types/toast.ts";

interface VariantStyles {
  icon: typeof Info;
  iconBg: string;
  iconText: string;
  border: string;
  progressFill: string;
}

const VARIANT_STYLES: Record<ToastVariant, VariantStyles> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-700",
    border: "border-emerald-200",
    progressFill: "rgb(5 150 105)",
  },
  info: {
    icon: Info,
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-700",
    border: "border-indigo-200",
    progressFill: "rgb(79 70 229)",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    border: "border-amber-200",
    progressFill: "rgb(217 119 6)",
  },
  error: {
    icon: AlertCircle,
    iconBg: "bg-rose-50",
    iconText: "text-rose-700",
    border: "border-rose-200",
    progressFill: "rgb(225 29 72)",
  },
};

type DocumentWithAriaNotify = Document & {
  ariaNotify?: (announcement: string) => void;
};

export default function Toast() {
  const { toast, dismissToast, undoDelete, editingTask } = useTaskContext();
  const visibleToast = editingTask ? null : toast;

  const toastRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLProgressElement>(null);
  const politeRegionRef = useRef<HTMLDivElement>(null);
  const assertiveRegionRef = useRef<HTMLDivElement>(null);
  const priorFocusRef = useRef<HTMLElement | null>(null);

  // Show/hide native Top-Layer popover when visibleToast changes.
  useEffect(() => {
    const el = toastRef.current;
    if (!visibleToast || !el) {
      return;
    }

    if (typeof el.showPopover === "function") {
      try {
        if (!el.matches(":popover-open")) {
          el.showPopover();
        }
      } catch {
        // Fallback styling via data-open handles browsers without top-layer support.
      }
    }

    return () => {
      if (typeof el.hidePopover === "function") {
        try {
          if (el.matches(":popover-open")) {
            el.hidePopover();
          }
        } catch {
          // Ignore if already detached or closed.
        }
      }
    };
  }, [visibleToast]);

  // Announce toast updates via ariaNotify() when supported, or fallback ARIA live regions.
  useEffect(() => {
    const politeEl = politeRegionRef.current;
    const assertiveEl = assertiveRegionRef.current;

    if (!visibleToast) {
      if (politeEl) politeEl.textContent = "";
      if (assertiveEl) assertiveEl.textContent = "";
      return;
    }

    const parts = [visibleToast.message];
    if (visibleToast.description) {
      parts.push(visibleToast.description);
    }
    if (visibleToast.isUndoDelete) {
      parts.push("Доступні дії");
    }
    const announcement = parts.join(". ");

    const doc = document as DocumentWithAriaNotify;
    if (typeof doc.ariaNotify === "function") {
      doc.ariaNotify(announcement);
      return;
    }

    if (visibleToast.variant === "error") {
      if (politeEl) politeEl.textContent = "";
      if (assertiveEl) assertiveEl.textContent = announcement;
    } else {
      if (assertiveEl) assertiveEl.textContent = "";
      if (politeEl) politeEl.textContent = announcement;
    }
  }, [visibleToast]);

  // Animate visual 5s countdown progress bar without triggering React re-renders.
  useEffect(() => {
    const progressEl = progressRef.current;
    if (!visibleToast?.isUndoDelete || !progressEl) {
      return;
    }

    const duration = visibleToast.durationMs;
    const expiresAt = visibleToast.expiresAt;
    progressEl.max = duration;
    progressEl.value = Math.max(0, expiresAt - Date.now());

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const intervalId = window.setInterval(() => {
        const remaining = Math.max(0, expiresAt - Date.now());
        progressEl.value = remaining;
        if (remaining <= 0) {
          window.clearInterval(intervalId);
        }
      }, 500);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    let rafId = 0;
    const updateProgress = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      progressEl.value = remaining;
      if (remaining > 0) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    rafId = window.requestAnimationFrame(updateProgress);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [visibleToast]);

  function restorePriorFocusIfInsideToast() {
    const el = toastRef.current;
    const prior = priorFocusRef.current;
    if (
      el &&
      document.activeElement &&
      el.contains(document.activeElement) &&
      prior &&
      prior.isConnected
    ) {
      prior.focus();
    }
    priorFocusRef.current = null;
  }

  function handleDismiss() {
    restorePriorFocusIfInsideToast();
    dismissToast();
  }

  function handleUndo() {
    restorePriorFocusIfInsideToast();
    undoDelete();
  }

  const styles = visibleToast ? VARIANT_STYLES[visibleToast.variant] : null;
  const Icon = styles?.icon;

  return (
    <div role="region" aria-label="Сповіщення">
      <p className="visually-hidden">Оголошення про статус дій</p>
      <div
        ref={politeRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      />
      <div
        ref={assertiveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="visually-hidden"
      />

      {visibleToast && styles && Icon && (
        <div
          key={visibleToast.id}
          ref={toastRef}
          popover="manual"
          data-open="true"
          onFocusCapture={(e) => {
            const container = toastRef.current;
            const related = e.relatedTarget as HTMLElement | null;
            if (container && related && !container.contains(related)) {
              priorFocusRef.current = related;
            }
          }}
          className="app-toast"
        >
          <div
            className={`bg-white border ${styles.border} rounded-xl shadow-lg overflow-hidden`}
          >
            <div className="p-3.5 sm:p-4 flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${styles.iconBg} ${styles.iconText} shrink-0`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {visibleToast.message}
                </p>
                {visibleToast.description && (
                  <p className="text-xs text-slate-600 mt-0.5 wrap-break-word line-clamp-2">
                    {visibleToast.description}
                  </p>
                )}

                {visibleToast.isUndoDelete && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Скасувати</span>
                    </button>
                    <span className="text-[11px] font-medium text-slate-500">
                      Видалення через 5 с
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer shrink-0"
                aria-label="Закрити сповіщення"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {visibleToast.isUndoDelete && (
              <div className="px-3.5 pb-3 sm:px-4">
                <progress
                  ref={progressRef}
                  max={visibleToast.durationMs}
                  value={visibleToast.durationMs}
                  aria-label="Залишок часу до остаточного видалення"
                  className="styled-progress styled-progress--countdown block w-full h-1.5"
                  style={
                    {
                      "--progress-track": "rgb(254 243 199)",
                      "--progress-fill": styles.progressFill,
                    } as React.CSSProperties
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
