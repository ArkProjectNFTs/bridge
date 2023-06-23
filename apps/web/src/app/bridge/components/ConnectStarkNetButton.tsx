import { useAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import Image from "next/image";
import { useMemo } from "react";

import { useIsSSR } from "~/app/hooks/useIsSSR";

import {
  CHAIN_LOGOS_BY_NAME,
  DEFAULT_STARKNET_CONNECTOR_LOGO,
  WALLET_LOGOS_BY_ID,
} from "../../helpers";
import ConnectModal from "./ConnectModal";

interface ConnectStarknetButtonProps {
  isModalOpen: boolean;
  onOpenModalChange: (open: boolean) => void;
}

export default function ConnectStarknetButton({
  isModalOpen,
  onOpenModalChange,
}: ConnectStarknetButtonProps) {
  const isSSR = useIsSSR();
  // Implement onConnect in starknet-react to close the modal on wallet connexion
  const { address, connector, isConnected } = useAccount();

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
        className="flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-3 py-2 text-sm font-semibold text-white dark:bg-dark-blue-900"
        onClick={() => onOpenModalChange(!isModalOpen)}
      >
        <Typography variant="body_text_bold_14">
          {isConnected ? shortAddress : "Connect Starknet Wallet"}
        </Typography>
        <div className="flex">
          <Image
            alt="Starknet logo"
            height={28}
            src={CHAIN_LOGOS_BY_NAME.Starknet}
            width={28}
          />
          {connector !== undefined && (
            <Image
              src={
                WALLET_LOGOS_BY_ID[connector.id()] ??
                DEFAULT_STARKNET_CONNECTOR_LOGO
              }
              alt={`${connector.name()} logo`}
              className="-ml-2 rounded-full outline outline-2 outline-dark-blue-950"
              height={28}
              width={28}
            />
          )}
        </div>
      </button>
      <ConnectModal
        initialChain="Starknet"
        isOpen={isModalOpen}
        onOpenChange={onOpenModalChange}
      />
    </>
  );
}
