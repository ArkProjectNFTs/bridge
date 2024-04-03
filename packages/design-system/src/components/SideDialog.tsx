"use client";

import * as RUIDialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import XIcon from "../icons/XIcon";

interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  withClose?: boolean;
}

export function SideDialog({
  children,
  isOpen,
  onOpenChange,
  withClose = true,
}: DialogProps) {
  return (
    <RUIDialog.Root open={isOpen} modal={false} onOpenChange={onOpenChange}>
      <RUIDialog.Portal>
        <div className="fixed opacity-80 inset-0 bg-void-black z-10 data-[state=closed]:fade-out data-[state=open]:fade-in duration-1000 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <RUIDialog.Content
          className={clsx(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
            "dark:bg-space-blue-900 dark:border-space-blue-800 fixed bottom-0 flex w-full flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white pb-16 text-center sm:right-0 sm:top-[5.75rem] sm:m-3 sm:w-[21.875rem] sm:rounded-2xl z-30 outline-none",
          )}
          onInteractOutside={(event) => event.preventDefault()}
        >
          {withClose && (
            <div className="flex w-full justify-end p-5">
              <RUIDialog.Close asChild className="outline-none">
                <button
                  aria-label="Close"
                  className="dark:text-space-blue-400 dark:hover:text-space-blue-200 transition-colors hover:text-space-blue-700 outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </RUIDialog.Close>
            </div>
          )}
          {children}
        </RUIDialog.Content>
      </RUIDialog.Portal>
    </RUIDialog.Root>
  );
}
