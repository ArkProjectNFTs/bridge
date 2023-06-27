import {
  useAccount as useStarknetAccount,
  useConnectors,
} from "@starknet-react/core";
import {
  useConnect,
  useDisconnect,
  useAccount as useEthereumAccount,
} from "wagmi";
import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import * as Dialog from "@radix-ui/react-dialog";

import Image from "next/image";
import {
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
} from "../helpers";

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
      <span className="text-sm font-medium">{CONNECTOR_LABELS_BY_ID[id]}</span>
      <Image
        src={WALLET_LOGOS_BY_ID[id] ?? ""}
        alt={`${CONNECTOR_LABELS_BY_ID[id] ?? ""} logo`}
        className=""
        width={32}
        height={32}
        priority
      />
    </button>
  );
}

function EthereumConnectorList() {
  const { isConnected } = useEthereumAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      {isConnected ? (
        <button onClick={() => disconnect()}>Disconnect</button>
      ) : (
        <>
          <Dialog.Description className="mb-6 mt-5 font-semibold">
            Choose your Ethereum wallet
          </Dialog.Description>
          <div className="flex flex-col gap-4">
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
      )}
    </>
  );
}

function StarknetConnectorList() {
  const { isConnected } = useStarknetAccount();
  const { connect, connectors, refresh, disconnect } = useConnectors();

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      {isConnected ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <>
          <Dialog.Description className="mb-6 mt-5 font-semibold">
            Choose your Starknet wallet
          </Dialog.Description>
          <div className="flex flex-col gap-4">
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
      )}
    </>
  );
}

interface ConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chain: Chain;
}

const CHAIN_TO_CONNECTOR_LIST = {
  Ethereum: EthereumConnectorList,
  Starknet: StarknetConnectorList,
};

// TODO @YohanTz: Handle disconnect / loading states etc once the whole flow is ready
export default function ConnectModal({
  isOpen,
  onOpenChange,
  chain,
}: ConnectModalProps) {
  const ConnectorList = CHAIN_TO_CONNECTOR_LIST[chain];

  return (
    <>
      <Dialog.Root open={isOpen} modal={false} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <div className="fixed inset-0 bg-slate-800 opacity-60" />
          {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
          <Dialog.Content
            className="fixed bottom-0 right-0 top-[5.75rem] m-3 w-[21.875rem] rounded-2xl bg-white p-5 text-center"
            onInteractOutside={(event) => event.preventDefault()}
          >
            <div className="flex w-full justify-end">
              <Dialog.Close asChild>
                <button aria-label="Close">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>
            <ConnectorList />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
