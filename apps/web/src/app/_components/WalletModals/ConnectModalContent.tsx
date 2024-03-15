"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccountEffect } from "wagmi";

import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import { CHAIN_LOGOS_BY_NAME } from "~/app/_lib/utils/connectors";
import { type Chain } from "~/app/_types";

import EthereumConnectorsList from "../EthereumConnectorsList";
import StarknetConnectorList from "../StarknetConnectorList";

interface ChainButtonProps {
  chain: Chain;
  onClick: () => void;
}

function ChainButton({ chain, onClick }: ChainButtonProps) {
  const { isConnected, shortAddress } = useAccountFromChain(chain);

  return (
    <button
      className="flex w-full items-center justify-between rounded-full bg-galaxy-blue py-2 pl-3.5 pr-2 text-white transition-colors hover:bg-space-blue-source hover:text-galaxy-blue dark:bg-white dark:text-galaxy-blue dark:hover:bg-space-blue-source"
      onClick={onClick}
    >
      <Typography className="w-full" variant="button_text_s">
        {isConnected ? shortAddress : `Connect ${chain} wallet`}
      </Typography>
      <Image
        alt={`${chain} logo`}
        height={32}
        priority
        src={CHAIN_LOGOS_BY_NAME[chain] ?? ""}
        width={32}
      />
    </button>
  );
}

interface ConnectorListProps {
  chain: Chain;
  onStarknetWalletConnect: () => void;
}

function ConnectorList({ chain, onStarknetWalletConnect }: ConnectorListProps) {
  if (chain === "Ethereum") {
    return <EthereumConnectorsList />;
  }

  return <StarknetConnectorList onWalletConnect={onStarknetWalletConnect} />;
}

interface ConnectModalProps {
  /* Whether the modal should directly show specific chain connectors or ask the user to chose the chain first */
  chain?: Chain;
  closeModal: () => void;
}

export default function ConnectModalContent({
  chain,
  closeModal,
}: ConnectModalProps) {
  const [displayedChain, setDisplayedChain] = useState<Chain | undefined>(
    chain
  );

  function onWalletConnect() {
    if (chain === undefined) {
      setDisplayedChain(undefined);
      return;
    }
    closeModal();
  }

  useAccountEffect({
    onConnect() {
      onWalletConnect();
    },
  });

  const { address } = useStarknetAccount();

  useEffect(() => {
    if (address !== undefined) {
      // onWalletConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      {displayedChain === undefined ? (
        <>
          <Image
            alt="wallet icon"
            height={80}
            src="/medias/default_wallet.svg"
            width={105}
          />
          <Typography
            className="pb-4 pt-6"
            component="p"
            variant="heading_light_xxs"
          >
            Connect your wallets to login
          </Typography>
          <Typography
            className="mx-7 mb-6"
            component="p"
            variant="body_text_14"
          >
            You must connect an Ethereum wallet and a Starknet wallet to start
            bridging your assets.
          </Typography>
          <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
            <ChainButton
              chain="Ethereum"
              onClick={() => setDisplayedChain("Ethereum")}
            />
            <ChainButton
              chain="Starknet"
              onClick={() => setDisplayedChain("Starknet")}
            />
          </div>
        </>
      ) : (
        <ConnectorList
          chain={displayedChain}
          onStarknetWalletConnect={onWalletConnect}
        />
      )}
    </>
  );
}
