"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Modal({ children, isOpen, onOpenChange }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Dialog.Portal>
        <div className="fixed inset-0 bg-[#16334999] backdrop-blur-lg" />
        <Dialog.Content
          className="dark:bg-dark-blue-950 dark:border-dark-blue-900 fixed bottom-0 left-0 right-0 flex flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white p-6 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[26.25rem] sm:max-w-[100vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
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
