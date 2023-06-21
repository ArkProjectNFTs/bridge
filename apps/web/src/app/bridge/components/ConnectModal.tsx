import {
  useAccount as useStarknetAccount,
  useConnectors,
} from "@starknet-react/core";
import {
  useConnect,
  useDisconnect,
  useEnsName,
  useAccount as useEthereumAccount,
} from "wagmi";
import { useEffect, useMemo, useState } from "react";
import * as RUIDialog from "@radix-ui/react-dialog";

import Image from "next/image";
import {
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
  CHAIN_LOGOS_BY_NAME,
} from "../helpers";
import { Dialog, Typography } from "design-system";

interface ChainButtonProps {
  chain: Chain;
  onClick: () => void;
}

function ChainButton({ chain, onClick }: ChainButtonProps) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-full bg-sky-950 py-2 pl-3.5 pr-2 text-white"
      onClick={onClick}
    >
      <Typography variant="body_text_bold_14" className="w-full">
        Connect {chain} wallet
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
      className="flex w-full items-center justify-between rounded-full bg-sky-950 py-2 pl-3.5 pr-2 text-white"
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

function EthereumConnectorList() {
  const { address, isConnected } = useEthereumAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: ensName } = useEnsName({
    address: address,
  });

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""),
    [address]
  );

  return isConnected ? (
    <>
      <Image
        src="/icons/ethereum.svg"
        height={68}
        width={68}
        alt="Ethereum icon"
      />
      <div className="w-full px-7">
        <Typography
          component={RUIDialog.Title}
          variant="heading_light_xxs"
          className="m-6"
        >
          Ethereum Wallet
        </Typography>
        <div className="mt-6 flex justify-center rounded-full bg-sky-100 py-3 ">
          <Typography variant="body_text_bold_14">
            {ensName ?? shortAddress}
          </Typography>
        </div>
        <button
          className="mt-4 w-full rounded-full border-2 border-sky-950 py-2"
          onClick={() => disconnect()}
        >
          <Typography variant="body_text_bold_14">Disconnect</Typography>
        </button>
      </div>
    </>
  ) : (
    <>
      <Image src="/icons/wallet.svg" height={68} width={68} alt="wallet icon" />
      <Typography
        variant="heading_light_xxs"
        component={RUIDialog.Title}
        className="m-6"
      >
        Choose your Ethereum wallet
      </Typography>
      <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
        {connectors.map((connector) => {
          return (
            <ConnectorButton
              key={connector.id}
              onClick={() => connect({ connector })}
              id={connector.id}
            />
          );
        })}
      </div>
    </>
  );
}

function StarknetConnectorList() {
  const { address, isConnected } = useStarknetAccount();
  const { connect, connectors, refresh, disconnect } = useConnectors();

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""),
    [address]
  );

  return isConnected ? (
    <>
      <Image
        src="/icons/starknet.svg"
        height={68}
        width={68}
        alt="Starknet icon"
      />
      <div className="w-full px-7">
        <Typography
          component={RUIDialog.Title}
          variant="heading_light_xxs"
          className="m-6"
        >
          Starknet Wallet
        </Typography>
        <div className="mt-6 flex w-full justify-center rounded-full bg-sky-100 py-3">
          <Typography variant="body_text_bold_14">{shortAddress}</Typography>
        </div>
        <button
          className="mt-4 w-full rounded-full border-2 border-sky-950 py-2.5"
          onClick={disconnect}
        >
          <Typography variant="body_text_bold_14">Disconnect</Typography>
        </button>
      </div>
    </>
  ) : (
    <>
      <Image src="/icons/wallet.svg" height={68} width={68} alt="wallet icon" />
      <Typography
        variant="heading_light_xxs"
        component={RUIDialog.Title}
        className="m-6"
      >
        Choose your Starknet wallet
      </Typography>
      <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
        {connectors.map((connector) => {
          return (
            <ConnectorButton
              key={connector.id()}
              onClick={() => connect(connector)}
              id={connector.id()}
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

/*
 * TODO @YohanTz: Handle disconnect / loading states etc once the whole flow is ready
 * + Refacto to use a custom hook `useAccountFromChain` that will make the code easier to read
 */
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
            src="/icons/wallet.svg"
            height={68}
            width={68}
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
      ) : displayedChain === "Ethereum" ? (
        <EthereumConnectorList />
      ) : (
        <StarknetConnectorList />
      )}
    </Dialog>
  );
}
