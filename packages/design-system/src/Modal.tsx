"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ModalProps {
  backdropClassName?: string;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Modal({
  backdropClassName,
  children,
  className,
  isOpen,
  onOpenChange,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <div
          className={`fixed inset-0 bg-[#16334999] backdrop-blur-lg ${backdropClassName}`}
        />
        <Dialog.Content
          className={`dark:bg-dark-blue-950 dark:border-dark-blue-900 fixed bottom-0 left-0 right-0 flex max-h-screen flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white p-6 md:bottom-auto md:left-1/2 md:top-1/2 md:h-auto md:w-[26.25rem] md:max-w-[100vw] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl ${className} z-30`}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex w-full justify-end">
            <Dialog.Close asChild>
              <button aria-label="Close">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
