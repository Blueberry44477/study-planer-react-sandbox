import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useTaskContext } from "../hooks/useTaskContext.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";

export default function DeleteTaskDialog() {
  const { deletingTask, setDeletingTask, deleteTask } = useTaskContext();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deletingTask) {
    return null;
  }

  async function handleConfirmDelete() {
    if (!deletingTask) {
      return;
    }
    setIsDeleting(true);
    await deleteTask(deletingTask.id);
    setIsDeleting(false);
  }

  return (
    <Dialog
      open={Boolean(deletingTask)}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDeletingTask(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалити завдання?</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити завдання «{deletingTask.title}»? Цю
            дію неможливо скасувати.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setDeletingTask(null)}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            Скасувати
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              void handleConfirmDelete();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>{isDeleting ? "Видалення..." : "Видалити"}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
