import { Toaster, toast } from "sonner";
import { createContext, useContext, useMemo, type ReactNode } from "react";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  action?: ToastAction;
  description?: ReactNode;
  duration?: number;
};

export type ToastId = number | string;

export type ToastService = {
  dismiss: (toastId?: ToastId) => void;
  error: (message: string, options?: ToastOptions) => ToastId;
  info: (message: string, options?: ToastOptions) => ToastId;
  success: (message: string, options?: ToastOptions) => ToastId;
  warning: (message: string, options?: ToastOptions) => ToastId;
};

type ToastProviderProps = {
  children: ReactNode;
};

const ToastServiceContext = createContext<ToastService | null>(null);

function toSonnerOptions(options?: ToastOptions) {
  return {
    action: options?.action,
    description: options?.description,
    duration: options?.duration,
  };
}

export function ToastProvider({ children }: ToastProviderProps) {
  const service = useMemo<ToastService>(
    () => ({
      dismiss: (toastId) => toast.dismiss(toastId),
      error: (message, options) => toast.error(message, toSonnerOptions(options)),
      info: (message, options) => toast.info(message, toSonnerOptions(options)),
      success: (message, options) => toast.success(message, toSonnerOptions(options)),
      warning: (message, options) => toast.warning(message, toSonnerOptions(options)),
    }),
    [],
  );

  return (
    <ToastServiceContext.Provider value={service}>
      {children}
      <Toaster
        closeButton
        expand={false}
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            actionButton:
              "rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800",
            cancelButton:
              "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50",
            closeButton: "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
            description: "text-sm text-zinc-600",
            error: "border-rose-200",
            info: "border-sky-200",
            success: "border-emerald-200",
            title: "text-sm font-semibold text-zinc-950",
            toast: "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-lg",
            warning: "border-amber-200",
          },
          duration: 4500,
        }}
      />
    </ToastServiceContext.Provider>
  );
}

export function useToastService() {
  const service = useContext(ToastServiceContext);

  if (!service) {
    throw new Error("useToastService must be used within ToastProvider");
  }

  return service;
}
