"use client";

import PageConnectModal from "~/app/_components/PageConnectModal";

import Collections from "./_components/Collections";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  return (
    <>
      <Collections />
      <PageConnectModal />
    </>
  );
}
