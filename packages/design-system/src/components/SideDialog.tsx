"use client";

import * as RUIDialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SideDialog({ children, isOpen, onOpenChange }: DialogProps) {
  return (
    <RUIDialog.Root open={isOpen} modal={false} onOpenChange={onOpenChange}>
      <RUIDialog.Portal>
        <div className="fixed inset-0 bg-void-black opacity-80 z-10" />
        {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
        <RUIDialog.Content
          className="dark:bg-space-blue-900 dark:border-space-blue-800 fixed bottom-0 flex w-full flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white pb-16 text-center sm:right-0 sm:top-[5.75rem] sm:m-3 sm:w-[21.875rem] sm:rounded-2xl z-30"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="flex w-full justify-end p-5">
            <RUIDialog.Close asChild>
              <button
                aria-label="Close"
                className="dark:text-space-blue-400 dark:hover:text-space-blue-200 transition-colors hover:text-space-blue-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </RUIDialog.Close>
          </div>
          {children}
        </RUIDialog.Content>
      </RUIDialog.Portal>
    </RUIDialog.Root>
  );
}
