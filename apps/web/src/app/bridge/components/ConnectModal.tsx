import { useAccount as useEthereumAccount } from "wagmi";
import { useState } from "react";
import * as RUIDialog from "@radix-ui/react-dialog";

import Image from "next/image";
import {
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
  CHAIN_LOGOS_BY_NAME,
} from "../helpers";
import { Dialog, Typography } from "design-system";
import useAccountFromChain from "~/app/hooks/useAccountFromChain";
import useConnectFromChain from "~/app/hooks/useConnectFromChain";
import useDisconnectFromChain from "~/app/hooks/useDisconnectFromChain";

interface ChainButtonProps {
  chain: Chain;
  onClick: () => void;
}

function ChainButton({ chain, onClick }: ChainButtonProps) {
  const { isConnected, shortAddress } = useAccountFromChain(chain);

  return (
    <button
      className="flex w-full items-center justify-between rounded-full bg-dark-blue-950 py-2 pl-3.5 pr-2 text-white"
      onClick={onClick}
    >
      <Typography variant="body_text_bold_14" className="w-full">
        {isConnected ? shortAddress : `Connect ${chain} wallet`}
      </Typography>
      <Image
        src={CHAIN_LOGOS_BY_NAME[chain] ?? ""}
        alt={`${chain} logo`}
        width={32}
        height={32}
        priority
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
      className="flex w-full items-center justify-between rounded-full bg-dark-blue-950 py-2 pl-3.5 pr-2 text-white"
      onClick={onClick}
    >
      <Typography variant="body_text_bold_14">
        {CONNECTOR_LABELS_BY_ID[id]}
      </Typography>
      <Image
        src={WALLET_LOGOS_BY_ID[id] ?? ""}
        alt={`${CONNECTOR_LABELS_BY_ID[id] ?? ""} logo`}
        width={32}
        height={32}
        priority
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
        src="/icons/ethereum.svg"
        height={68}
        width={68}
        alt={`${chain} icon`}
      />
      <div className="w-full px-7">
        <Typography
          component={RUIDialog.Title}
          variant="heading_light_xxs"
          className="m-6"
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
        src="/medias/wallet.svg"
        height={80}
        width={105}
        alt="wallet icon"
      />
      <Typography
        variant="heading_light_xxs"
        component={RUIDialog.Title}
        className="m-6"
      >
        Choose your {chain} wallet
      </Typography>
      <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
        {connectors.map((connector) => {
          return (
            <ConnectorButton
              key={connector.id}
              onClick={() => connector.connect()}
              id={connector.id}
            />
          );
        })}
      </div>
    </>
  );
}

interface ConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /* Whether the modal should directly show specific chain connectors or ask the user to chose the chain first */
  initialChain?: Chain;
}

export default function ConnectModal({
  isOpen,
  onOpenChange,
  initialChain,
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
            src="/medias/wallet.svg"
            height={80}
            width={105}
            alt="wallet icon"
          />
          <Typography
            variant="heading_light_xxs"
            className="m-6"
            component={RUIDialog.Title}
          >
            Connect your wallets to login
          </Typography>
          <Typography
            variant="body_text_14"
            component={RUIDialog.Description}
            className="mx-7 mb-6 mt-4"
          >
            You must connect an Ethereum wallet and a Starknet wallet to start
            bridging your assets.
          </Typography>
          <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
            <ChainButton
              onClick={() => setDisplayedChain("Ethereum")}
              chain="Ethereum"
            />
            <ChainButton
              onClick={() => setDisplayedChain("Starknet")}
              chain="Starknet"
            />
          </div>
          <Typography
            variant="body_text_bold_14"
            className="mt-6"
            component="p"
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
