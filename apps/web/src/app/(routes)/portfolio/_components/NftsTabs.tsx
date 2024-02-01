"use client";

import * as Tabs from "@radix-ui/react-tabs";

import NftTabsContent from "./NftTabsContent";
import NftTabsList from "./NftTabsList";

export default function NftsTabs() {
  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <Tabs.List className="flex items-center gap-4 overflow-x-scroll">
        <NftTabsList />
      </Tabs.List>

      <NftTabsContent />
    </Tabs.Root>
  );
}
