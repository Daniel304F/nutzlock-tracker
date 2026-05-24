import type { ReactNode } from "react";

import { ModalProvider } from "@components/modal/ModalProvider";
import { ToastProvider } from "@components/toast/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ToastProvider>
      <ModalProvider>{children}</ModalProvider>
    </ToastProvider>
  );
}
