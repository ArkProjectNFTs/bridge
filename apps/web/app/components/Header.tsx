"use client";

import ConnectStarkNetButton from "./ConnectStarknetButton";
import ConnectEthereumButton from "./ConnectEthereumButton";

export default function Header() {
  return (
    <div className="fixed flex w-full items-center justify-between border-b border-neutral-50 bg-white p-6">
      <div className="text-xl font-medium">Starklane</div>
      <div className="flex space-x-4">
        <ConnectEthereumButton />
        <ConnectStarkNetButton />
      </div>
    </div>
  );
}
