"use client";

import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import XIcon from "../icons/XIcon";

interface ModalProps {
  backdropClassName?: string;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SideModal({
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
          className={clsx(
            backdropClassName,
            "fixed inset-0 bg-void-black opacity-80 backdrop-blur-lg",
          )}
        />
        <Dialog.Content
          className={clsx(
            className,
            "dark:bg-space-blue-900 dark:border-space-blue-800 fixed bottom-0 left-0 right-0 flex max-h-screen flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white p-6 md:bottom-auto md:left-1/2 md:top-1/2 md:h-auto md:w-[26.25rem] md:max-w-[100vw] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl z-30",
          )}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex w-full justify-end">
            <Dialog.Close asChild className="outline-none">
              <button
                aria-label="Close"
                className="dark:text-space-blue-400 dark:hover:text-space-blue-200 transition-colors hover:text-space-blue-700"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
