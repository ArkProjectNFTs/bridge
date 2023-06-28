"use client";

import Banner from "./components/Banner";
import ChainSwitch from "./components/ChainSwitch";
import NftTransferList from "./components/NftTransferList";

export default function Page() {
  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-5xl px-4 text-center">
        <ChainSwitch />
        <Banner />
        <NftTransferList />
      </main>
    </div>
  );
}
