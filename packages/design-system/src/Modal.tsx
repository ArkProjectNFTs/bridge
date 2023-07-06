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
          className={`dark:bg-dark-blue-950 dark:border-dark-blue-900 fixed bottom-0 left-0 right-0 flex flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white p-6 lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[26.25rem] lg:max-w-[100vw] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl ${className} max-h-[calc(100vh-6.75rem)]`}
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
