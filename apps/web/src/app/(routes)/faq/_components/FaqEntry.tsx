"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { MinusIcon, PlusIcon, Typography } from "design-system";
import { type PropsWithChildren, useState } from "react";

interface FaqEntryProps {
  title: string;
}

export default function FaqEntry({
  children,
  title,
}: PropsWithChildren<FaqEntryProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root onOpenChange={setOpen} open={open}>
      <div className="overflow-hidden rounded-2xl border border-asteroid-grey-100 bg-white p-6 shadow-[0px_4px_4px_0px_#e9f5fe] dark:border-space-blue-800 dark:bg-space-blue-900 dark:shadow-none">
        <div className="flex items-center justify-between">
          <Typography variant="heading_light_s">{title}</Typography>
          <Collapsible.Trigger asChild>
            <button className="flex h-9 w-9 items-center justify-center justify-self-end rounded-md border-2 border-asteroid-grey-600 text-2xl text-asteroid-grey-600 transition-colors hover:border-asteroid-grey-800 hover:text-asteroid-grey-800 dark:border-space-blue-400 dark:text-space-blue-400 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200">
              {open ? <MinusIcon /> : <PlusIcon />}
            </button>
          </Collapsible.Trigger>
        </div>

        <Collapsible.Content className="pr-16 text-asteroid-grey-800 data-[state=closed]:animate-[collapsible-up_300ms_ease] data-[state=open]:animate-[collapsible-down_300ms_ease] dark:text-asteroid-grey-100">
          <Typography
            className="pt-4 text-left"
            component="p"
            variant="body_text_16"
          >
            {children}
          </Typography>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  );
}
