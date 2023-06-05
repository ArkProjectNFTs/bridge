import { useAccount } from "@starknet-react/core";
import Image from "next/image";
import { useMemo, useState } from "react";

import ConnectStarkNetModal from "./ConnectStarkNetModal";
import { CHAIN_LOGOS_BY_NAME, WALLET_LOGOS_BY_ID } from "../helpers";

export default function ConnectStarknetButton() {
  const { address, isConnected, connector } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}••••${address.slice(-4)}` : ""),
    [address]
  );

  function handleClick() {
    setIsOpen(true);
  }

  return (
    <>
      <button
        className="flex items-center gap-2.5 rounded-full bg-sky-950 px-3 py-2 text-sm font-semibold text-white"
        onClick={handleClick}
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
      {isOpen && <ConnectStarkNetModal onOpenChange={setIsOpen} />}
    </>
  );
}
