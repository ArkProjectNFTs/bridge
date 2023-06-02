"use client";

import ConnectStarkNetButton from "./ConnectStarkNetButton";
import ConnectEthereumButton from "./ConnectEthereumButton";

export default function Header() {
  return (
    <div className="fixed flex min-h-[72px] w-full items-center justify-between border-b border-neutral-50 bg-white px-8 py-4">
      <div className="text-xl font-medium">Starklane</div>
      <div className="flex space-x-4">
        <ConnectEthereumButton />
        <ConnectStarkNetButton />
      </div>
    </div>
  );
}
