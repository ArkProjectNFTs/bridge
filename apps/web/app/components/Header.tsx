"use client";

import { ConnectKitButton } from "connectkit";
import ConnectStarkNetButton from "./ConnectStarkNetButton";

export default function Header() {
  return (
    <div className="fixed flex min-h-[72px] w-full items-center justify-between border-b border-neutral-50 bg-white px-8 py-4">
      <div className="text-xl font-medium">Starklane</div>
      <div className="flex space-x-4">
        <ConnectKitButton label="Connect Ethereum Wallet" />
        <ConnectStarkNetButton />
      </div>
    </div>
  );
}
