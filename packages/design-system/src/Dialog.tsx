"use client";

import * as RUIDialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface DialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ children, isOpen, onOpenChange }: DialogProps) {
  return (
    <>
      <RUIDialog.Root open={isOpen} modal={false} onOpenChange={onOpenChange}>
        <RUIDialog.Portal>
          <div className="fixed inset-0 bg-slate-800 opacity-60" />
          {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
          <RUIDialog.Content
            className="dark:bg-dark-blue-950 dark:border-dark-blue-900 fixed bottom-0 flex w-full flex-col items-center rounded-t-2xl border border-[#e4edec] bg-white pb-16 text-center sm:right-0 sm:top-[5.875rem] sm:m-3 sm:w-[21.875rem] sm:rounded-2xl"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <div className="flex w-full justify-end p-5">
              <RUIDialog.Close asChild>
                <button aria-label="Close">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </RUIDialog.Close>
            </div>
            {children}
          </RUIDialog.Content>
        </RUIDialog.Portal>
      </RUIDialog.Root>
    </>
  );
}
