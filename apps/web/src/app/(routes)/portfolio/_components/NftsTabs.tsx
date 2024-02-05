"use client";

import * as Tabs from "@radix-ui/react-tabs";

import NftTabsContent from "./NftTabsContent";
import NftTabsList from "./NftTabsList";

export default function NftsTabs() {
  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <NftTabsList />
      <NftTabsContent />
    </Tabs.Root>
  );
}
