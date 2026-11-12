export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastData {
  id: number;
  message: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
  expiresAt: number;
  isUndoDelete?: boolean;
}
