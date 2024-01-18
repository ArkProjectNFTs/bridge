import { Typography } from "design-system";
import Image from "next/image";
import { useMemo } from "react";
import { useAccount, useEnsName } from "wagmi";

import { useIsSSR } from "~/app/_hooks/useIsSSR";

import {
  CHAIN_LOGOS_BY_NAME,
  DEFAULT_ETHEREUM_CONNECTOR_LOGO,
  WALLET_LOGOS_BY_ID,
} from "../_lib/utils/connectors";
import ConnectModal from "./ConnectModal";

interface ConnectEthereumButtonProps {
  isModalOpen: boolean;
  onOpenModalChange: (open: boolean) => void;
}

export default function ConnectEthereumButton({
  isModalOpen,
  onOpenModalChange,
}: ConnectEthereumButtonProps) {
  const isSSR = useIsSSR();
  const { address, connector, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address: address,
  });

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""),
    [address]
  );

  if (isSSR) {
    return null;
  }

  return (
    <>
      <button
        className="flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-3 py-2 text-sm font-semibold text-white"
        onClick={() => onOpenModalChange(!isModalOpen)}
      >
        <Typography variant="button_text_s">
          {isConnected ? ensName ?? shortAddress : "Connect Ethereum Wallet"}
        </Typography>
        <div className="flex">
          <Image
            alt="Ethereum logo"
            height={28}
            src={CHAIN_LOGOS_BY_NAME.Ethereum}
            width={28}
          />

          {connector !== undefined && (
            <Image
              src={
                WALLET_LOGOS_BY_ID[connector.id] ??
                DEFAULT_ETHEREUM_CONNECTOR_LOGO
              }
              alt={`${connector.name} logo`}
              className="-ml-2 rounded-full outline outline-2 outline-dark-blue-950"
              height={28}
              width={28}
            />
          )}
        </div>
      </button>
      <ConnectModal
        initialChain="Ethereum"
        isOpen={isModalOpen}
        onOpenChange={onOpenModalChange}
      />
    </>
  );
}
