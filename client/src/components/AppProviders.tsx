import type { ReactNode } from "react";

import { ModalProvider } from "@components/modal/ModalProvider";
import { ThemeProvider } from "@components/theme/ThemeProvider";
import { ToastProvider } from "@components/toast/ToastProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>{children}</ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
