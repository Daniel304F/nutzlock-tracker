import { toast } from "sonner";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

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
        toastOptions={{ duration: 4500 }}
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
