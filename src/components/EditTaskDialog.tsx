import { useTaskContext } from "../hooks/useTaskContext.ts";
import TaskForm from "./TaskForm.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";

export default function EditTaskDialog() {
  const { editingTask, setEditingTask } = useTaskContext();

  if (!editingTask) {
    return null;
  }

  return (
    <Dialog
      open={Boolean(editingTask)}
      onOpenChange={(open) => {
        if (!open) {
          setEditingTask(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагування завдання</DialogTitle>
          <DialogDescription>
            Оновіть назву, категорію, пріоритет, деталі або статус завдання.
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          key={editingTask.id}
          editingTask={editingTask}
          onCancelEdit={() => setEditingTask(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
