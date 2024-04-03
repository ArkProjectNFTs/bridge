import { useAccount, useEnsName } from "wagmi";
import Image from "next/image";
import {
  CHAIN_LOGOS_BY_NAME,
  DEFAULT_ETHEREUM_CONNECTOR_LOGO,
  WALLET_LOGOS_BY_ID,
} from "../helpers";
import { useMemo } from "react";
import ConnectModal from "./ConnectModal";
import { useIsSSR } from "~/hooks/useIsSSR";

interface ConnectEthereumButtonProps {
  isModalOpen: boolean;
  onOpenModalChange: (open: boolean) => void;
}

export default function ConnectEthereumButton({
  isModalOpen,
  onOpenModalChange,
}: ConnectEthereumButtonProps) {
  const isSSR = useIsSSR();
  const { address, isConnected, connector } = useAccount();
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
        className="flex items-center gap-2.5 rounded-full bg-sky-950 px-3 py-2 text-sm font-semibold text-white"
        onClick={() => onOpenModalChange(!isModalOpen)}
      >
        {isConnected ? ensName ?? shortAddress : "Connect Ethereum Wallet"}
        <div className="flex">
          <Image
            src={CHAIN_LOGOS_BY_NAME.Ethereum}
            height={28}
            width={28}
            alt="Ethereum logo"
          />

          {connector !== undefined && (
            <Image
              src={
                WALLET_LOGOS_BY_ID[connector.id] ??
                DEFAULT_ETHEREUM_CONNECTOR_LOGO
              }
              height={28}
              width={28}
              alt={`${connector.name} logo`}
              className="-ml-2 rounded-full outline outline-2 outline-sky-950"
            />
          )}
        </div>
      </button>
      <ConnectModal
        chain="Ethereum"
        isOpen={isModalOpen}
        onOpenChange={onOpenModalChange}
      />
    </>
  );
}
