"use client";

import { ConnectKitButton } from "connectkit";
import ConnectStarkNetButton from "./ConnectStarkNetButton";

export default function Header() {
  return (
    <div className="flex min-h-[72px] items-center justify-between px-8 py-4">
      <div className="text-xl font-medium">Starklane</div>
      <div className="flex space-x-4">
        <ConnectKitButton label="Connect Ethereum Wallet" />
        <ConnectStarkNetButton />
      </div>
    </div>
  );
}
