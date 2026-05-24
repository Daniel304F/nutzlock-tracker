import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ModalIntent = "danger" | "default" | "warning";

export type ModalAction = {
  intent?: ModalIntent;
  label: string;
  onAction?: () => Promise<void> | void;
};

export type OpenModalOptions = {
  content?: ReactNode;
  description?: string;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  title: string;
};

export type ConfirmModalOptions = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  intent?: ModalIntent;
  title: string;
};

export type ModalService = {
  closeModal: () => void;
  confirm: (options: ConfirmModalOptions) => Promise<boolean>;
  openModal: (options: OpenModalOptions) => void;
};

type ActiveModal = OpenModalOptions & {
  id: number;
  resolvesOnPrimary: boolean;
};

type ModalProviderProps = {
  children: ReactNode;
};

const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_CONFIRM_LABEL = "Confirm";

const ModalServiceContext = createContext<ModalService | null>(null);

const intentToButtonVariant: Record<
  ModalIntent,
  "default" | "destructive" | "warning"
> = {
  danger: "destructive",
  default: "default",
  warning: "warning",
};

export function ModalProvider({ children }: ModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalIdRef = useRef(0);
  const pendingResolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const resolvePendingConfirm = useCallback((confirmed: boolean) => {
    const resolver = pendingResolverRef.current;

    if (!resolver) {
      return;
    }

    pendingResolverRef.current = null;
    resolver(confirmed);
  }, []);

  const closeModal = useCallback(() => {
    resolvePendingConfirm(false);
    setIsSubmitting(false);
    setActiveModal(null);
  }, [resolvePendingConfirm]);

  const openModal = useCallback(
    (options: OpenModalOptions) => {
      resolvePendingConfirm(false);
      modalIdRef.current += 1;
      setIsSubmitting(false);
      setActiveModal({
        ...options,
        id: modalIdRef.current,
        resolvesOnPrimary: false,
      });
    },
    [resolvePendingConfirm],
  );

  const confirm = useCallback(
    (options: ConfirmModalOptions) =>
      new Promise<boolean>((resolve) => {
        resolvePendingConfirm(false);
        pendingResolverRef.current = resolve;
        modalIdRef.current += 1;
        setIsSubmitting(false);
        setActiveModal({
          description: options.description,
          id: modalIdRef.current,
          primaryAction: {
            intent: options.intent ?? "default",
            label: options.confirmLabel ?? DEFAULT_CONFIRM_LABEL,
          },
          resolvesOnPrimary: true,
          secondaryAction: {
            label: options.cancelLabel ?? DEFAULT_CANCEL_LABEL,
          },
          title: options.title,
        });
      }),
    [resolvePendingConfirm],
  );

  const service = useMemo(
    () => ({
      closeModal,
      confirm,
      openModal,
    }),
    [closeModal, confirm, openModal],
  );

  async function handlePrimaryAction() {
    if (!activeModal) {
      return;
    }

    setIsSubmitting(true);

    try {
      await activeModal.primaryAction?.onAction?.();

      if (activeModal.resolvesOnPrimary) {
        resolvePendingConfirm(true);
      }

      setActiveModal(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSecondaryAction() {
    if (!activeModal) {
      return;
    }

    setIsSubmitting(true);

    try {
      await activeModal.secondaryAction?.onAction?.();
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalServiceContext.Provider value={service}>
      {children}

      <Dialog open={activeModal !== null} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        {activeModal ? (
          <DialogContent className="max-h-[calc(100dvh-2rem)] p-0 sm:max-w-md">
            <DialogHeader className="border-b border-border px-5 py-4 text-left">
              <DialogTitle>{activeModal.title}</DialogTitle>
              <DialogDescription>
                {activeModal.description ?? "Dialog action"}
              </DialogDescription>
            </DialogHeader>

            {activeModal.content ? (
              <div className="overflow-y-auto px-5 text-sm leading-6 text-foreground">
                {activeModal.content}
              </div>
            ) : null}

            {(activeModal.primaryAction || activeModal.secondaryAction) && (
              <DialogFooter className="border-t border-border px-5 py-4">
                {activeModal.secondaryAction ? (
                  <Button
                    disabled={isSubmitting}
                    type="button"
                    variant="outline"
                    onClick={handleSecondaryAction}
                  >
                    {activeModal.secondaryAction.label}
                  </Button>
                ) : null}
                {activeModal.primaryAction ? (
                  <Button
                    disabled={isSubmitting}
                    type="button"
                    variant={
                      intentToButtonVariant[activeModal.primaryAction.intent ?? "default"]
                    }
                    onClick={handlePrimaryAction}
                  >
                    {activeModal.primaryAction.label}
                  </Button>
                ) : null}
              </DialogFooter>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </ModalServiceContext.Provider>
  );
}

export function useModalService() {
  const service = useContext(ModalServiceContext);

  if (!service) {
    throw new Error("useModalService must be used within ModalProvider");
  }

  return service;
}
