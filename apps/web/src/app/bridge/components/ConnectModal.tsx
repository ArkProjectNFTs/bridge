import * as RUIDialog from "@radix-ui/react-dialog";
import { Dialog, Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import useAccountFromChain from "~/hooks/useAccountFromChain";
import useConnectFromChain from "~/hooks/useConnectFromChain";
import useDisconnectFromChain from "~/hooks/useDisconnectFromChain";

import {
  CHAIN_LOGOS_BY_NAME,
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
} from "../../helpers";

interface ChainButtonProps {
  chain: Chain;
  onClick: () => void;
}

function ChainButton({ chain, onClick }: ChainButtonProps) {
  const { isConnected, shortAddress } = useAccountFromChain(chain);

  return (
    <button
      className="flex w-full items-center justify-between rounded-full bg-dark-blue-950 py-2 pl-3.5 pr-2 text-white dark:bg-white dark:text-dark-blue-950"
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
      className="flex w-full items-center justify-between rounded-full bg-dark-blue-950 py-2 pl-3.5 pr-2 text-white dark:bg-primary-300 dark:text-dark-blue-950 dark:hover:bg-primary-400"
      onClick={onClick}
    >
      <Typography variant="body_text_bold_14">
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
  const { isConnected, shortAddress } = useAccountFromChain(chain);
  const { connectors } = useConnectFromChain(chain);
  const { disconnect } = useDisconnectFromChain(chain);

  return isConnected ? (
    <>
      <Image
        alt={`${chain} icon`}
        height={68}
        src="/icons/ethereum.svg"
        width={68}
      />
      <div className="w-full px-7">
        <Typography
          className="m-6"
          component={RUIDialog.Title}
          variant="heading_light_xxs"
        >
          {chain} Wallet
        </Typography>
        <div className="mt-6 flex justify-center rounded-full bg-sky-100 py-3 ">
          <Typography variant="body_text_bold_14">{shortAddress}</Typography>
        </div>
        <button
          className="mt-4 w-full rounded-full border-2 border-dark-blue-950 py-2"
          onClick={() => disconnect()}
        >
          <Typography variant="body_text_bold_14">Disconnect</Typography>
        </button>
      </div>
    </>
  ) : (
    <>
      <Image
        alt="wallet icon"
        height={80}
        src="/medias/wallet.svg"
        width={105}
      />
      <Typography
        className="m-6"
        component={RUIDialog.Title}
        variant="heading_light_xxs"
      >
        Choose your {chain} wallet
      </Typography>
      <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
        {connectors.map((connector) => {
          return (
            <ConnectorButton
              id={connector.id}
              key={connector.id}
              onClick={() => connector.connect()}
            />
          );
        })}
      </div>
    </>
  );
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

  // TODO @YohanTz: Implement onConnect in useAccount hook from starknet-react
  function onWalletConnect() {
    if (initialChain === undefined) {
      setDisplayedChain(undefined);
      return;
    }
    onOpenChange(false);
  }

  useEthereumAccount({
    onConnect() {
      onWalletConnect();
    },
  });

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {displayedChain === undefined ? (
        <>
          <Image
            alt="wallet icon"
            height={80}
            src="/medias/wallet.svg"
            width={105}
          />
          <Typography
            className="m-6"
            component={RUIDialog.Title}
            variant="heading_light_xxs"
          >
            Connect your wallets to login
          </Typography>
          <Typography
            className="mx-7 mb-6 mt-4"
            component={RUIDialog.Description}
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
    </Dialog>
  );
}
