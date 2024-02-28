import {
  useAccount as useStarknetAccount,
  useBalance as useStarknetBalance,
} from "@starknet-react/core";
import clsx from "clsx";
import { SideDialog, Typography } from "design-system";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import {
  useAccountEffect,
  useAccount as useEthereumAccount,
  useBalance as useEthereumBalance,
} from "wagmi";

import useAccountFromChain from "../_hooks/useAccountFromChain";
import useConnectFromChain from "../_hooks/useConnectFromChain";
import useDisconnectFromChain from "../_hooks/useDisconnectFromChain";
import {
  CHAIN_LOGOS_BY_NAME,
  CHAIN_WALLET_ILLUSTRATION_BY_NAME,
  CONNECTOR_LABELS_BY_ID,
  WALLET_LOGOS_BY_ID,
} from "../_lib/utils/connectors";
import { type Chain } from "../_types";
import EthereumConnectorsList from "./EthereumConnectorsList";
import StarknetConnectorList from "./StarknetConnectorList";

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
      <Typography className="w-full" variant="body_text_bold_14">
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

interface ConnectorButtonProps {
  id: string;
  onClick: () => void;
}

function ConnectorButton({ id, onClick }: ConnectorButtonProps) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-full bg-galaxy-blue py-2 pl-3.5 pr-2 text-white transition-colors hover:bg-space-blue-source hover:text-galaxy-blue dark:bg-white dark:text-galaxy-blue dark:hover:bg-space-blue-source"
      onClick={onClick}
    >
      <Typography variant="button_text_s">
        {CONNECTOR_LABELS_BY_ID[id]}
      </Typography>
      <Image
        alt={`${CONNECTOR_LABELS_BY_ID[id] ?? ""} logo`}
        height={32}
        priority
        src={WALLET_LOGOS_BY_ID[id] ?? ""}
        width={32}
      />
    </button>
  );
}

interface ConnectorListProps {
  chain: Chain;
}

function ConnectorList({ chain }: ConnectorListProps) {
  if (chain === "Ethereum") {
    return <EthereumConnectorsList />;
  }

  return <StarknetConnectorList />;
}

interface ConnectModalProps {
  /* Whether the modal should directly show specific chain connectors or ask the user to chose the chain first */
  initialChain?: Chain;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectModal({
  initialChain,
  isOpen,
  onOpenChange,
}: ConnectModalProps) {
  const [displayedChain, setDisplayedChain] = useState<Chain | undefined>(
    initialChain
  );

  function onWalletConnect() {
    if (initialChain === undefined) {
      setDisplayedChain(undefined);
      return;
    }
    onOpenChange(false);
  }

  useAccountEffect({
    onConnect() {
      onWalletConnect();
    },
  });

  // TODO: Use onConnect like in the ethereum version
  const { address } = useStarknetAccount();

  useEffect(() => {
    if (address !== undefined) {
      onWalletConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <SideDialog isOpen={isOpen} onOpenChange={onOpenChange}>
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
          <Typography
            className="mt-6"
            component="p"
            variant="body_text_bold_14"
          >
            {"I don't have a wallet"}
          </Typography>
        </>
      ) : (
        <ConnectorList chain={displayedChain} />
      )}
    </SideDialog>
  );
}
