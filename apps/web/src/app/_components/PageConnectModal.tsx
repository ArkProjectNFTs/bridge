"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import ConnectModal from "./ConnectModal";

export default function PageConnectModal() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { address: starknetAddress } = useStarknetAccount();
  const { address: ethereumAddress } = useEthereumAccount();

  useEffect(() => {
    if (
      isModalOpen &&
      starknetAddress !== undefined &&
      ethereumAddress !== undefined
    ) {
      setIsModalOpen(false);
      return;
    }
  }, [starknetAddress, ethereumAddress, isModalOpen]);

  return (
    <ConnectModal
      isOpen={isModalOpen}
      // key used to reset the internal states of ConnectModal when isModalOpen changes
      key={isModalOpen ? "open" : "closed"}
      onOpenChange={(open) => setIsModalOpen(open)}
    />
  );
}
