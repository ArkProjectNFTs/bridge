import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import { useMemo, useState } from "react";

import ConnectStarkNetModal from "./ConnectStarkNetModal";

export default function ConnectStarkNetButton() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}••••${address.slice(-4)}` : ""),
    [address]
  );

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function handleClick() {
    openModal();
  }

  return (
    <>
      <button
        className="flex items-center gap-2.5 rounded-full bg-sky-950 px-3 py-2 text-sm font-semibold text-white"
        onClick={handleClick}
      >
        {isConnected ? shortAddress : "Connect StarkNet Wallet"}
        <Image
          src="/starknet_logo.svg"
          height={32}
          width={32}
          alt="Starknet logo"
        />
      </button>
      <ConnectStarkNetModal isOpen={isOpen} closeModal={closeModal} />
    </>
  );
}
