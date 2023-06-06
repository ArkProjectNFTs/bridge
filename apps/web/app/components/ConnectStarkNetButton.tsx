import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import { useMemo } from "react";

import ConnectStarkNetModal from "./ConnectStarknetModal";
import { CHAIN_LOGOS_BY_NAME, WALLET_LOGOS_BY_ID } from "../helpers";

interface ConnectStarknetButtonProps {
  isModalOpen: boolean;
  onOpenModalChange: (open: boolean) => void;
}

export default function ConnectStarknetButton({
  isModalOpen,
  onOpenModalChange,
}: ConnectStarknetButtonProps) {
  const { address, isConnected, connector } = useAccount();

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}••••${address.slice(-4)}` : ""),
    [address]
  );

  return (
    <>
      <button
        className="flex items-center gap-2.5 rounded-full bg-sky-950 px-3 py-2 text-sm font-semibold text-white"
        onClick={() => onOpenModalChange(!isModalOpen)}
      >
        {isConnected ? shortAddress : "Connect StarkNet Wallet"}
        <div className="flex">
          <Image
            src={CHAIN_LOGOS_BY_NAME.Starknet}
            height={28}
            width={28}
            alt="Starknet logo"
          />
          {connector !== undefined && (
            <Image
              src={WALLET_LOGOS_BY_ID[connector.id()] || ""}
              height={28}
              width={28}
              alt={`${connector.name()} logo`}
              className="-ml-2 rounded-full outline outline-2 outline-sky-950"
            />
          )}
        </div>
      </button>
      <ConnectStarkNetModal
        chain="Starknet"
        isOpen={isModalOpen}
        onOpenChange={onOpenModalChange}
      />
    </>
  );
}
