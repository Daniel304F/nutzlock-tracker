import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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

const intentButtonClass: Record<ModalIntent, string> = {
  danger:
    "border-rose-700 bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-500",
  default:
    "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-500",
  warning:
    "border-amber-500 bg-amber-500 text-zinc-950 hover:bg-amber-400 focus-visible:ring-amber-400",
};

function getPrimaryButtonClass(intent: ModalIntent) {
  return [
    "inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    intentButtonClass[intent],
  ].join(" ");
}

const secondaryButtonClass = [
  "inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors",
  "hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

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

      <Dialog.Root open={activeModal !== null} onOpenChange={(isOpen) => !isOpen && closeModal()}>
        {activeModal ? (
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/35 backdrop-blur-[1px]" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-zinc-200 bg-white p-0 text-zinc-950 shadow-xl focus:outline-none">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-base font-semibold leading-6">
                    {activeModal.title}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm leading-6 text-zinc-600">
                    {activeModal.description ?? "Dialog action"}
                  </Dialog.Description>
                </div>
                <button
                  aria-label="Close modal"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2"
                  disabled={isSubmitting}
                  type="button"
                  onClick={closeModal}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              {activeModal.content ? (
                <div className="overflow-y-auto px-5 py-4 text-sm leading-6 text-zinc-700">
                  {activeModal.content}
                </div>
              ) : null}

              {(activeModal.primaryAction || activeModal.secondaryAction) && (
                <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:justify-end">
                  {activeModal.secondaryAction ? (
                    <button
                      className={secondaryButtonClass}
                      disabled={isSubmitting}
                      type="button"
                      onClick={handleSecondaryAction}
                    >
                      {activeModal.secondaryAction.label}
                    </button>
                  ) : null}
                  {activeModal.primaryAction ? (
                    <button
                      className={getPrimaryButtonClass(activeModal.primaryAction.intent ?? "default")}
                      disabled={isSubmitting}
                      type="button"
                      onClick={handlePrimaryAction}
                    >
                      {activeModal.primaryAction.label}
                    </button>
                  ) : null}
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </Dialog.Root>
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
