import { useAccount, useConnectors } from "@starknet-react/core";
import { Fragment, useEffect, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import * as Dialog from "@radix-ui/react-dialog";

import Image from "next/image";
import { CONNECTOR_LABELS_BY_ID, WALLET_LOGOS_BY_ID } from "../helpers";

interface ConnectStarkNetModalProps {
  onOpenChange: (open: boolean) => void;
}

export default function ConnectStarkNetModal({
  onOpenChange,
}: ConnectStarkNetModalProps) {
  const { connect, connectors, refresh, disconnect } = useConnectors();
  const { address, status } = useAccount();

  const shortAddress = useMemo(
    () => (address ? `${address.slice(0, 6)}••••${address.slice(-4)}` : ""),
    [address]
  );

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      {/* <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-[22.5rem] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="relative mb-8 text-center">
                <div className="font-medium">
                  {isDisconnected ? "Connect Wallet" : "Connected"}
                </div>
                <button onClick={closeModal} className="absolute right-0 top-0">
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog> */}
      <Dialog.Root open={true} modal={false} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-red-500" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5">
            <Dialog.Title />
            <Dialog.Description />
            {
              <div className="flex flex-col gap-4">
                {connectors.map((connector) => (
                  <button
                    key={connector.id()}
                    className="flex h-16 w-full items-center justify-between rounded-xl bg-gray-100 px-4 py-2 text-left"
                    onClick={() => connect(connector)}
                  >
                    <div className="text-lg font-medium">
                      {CONNECTOR_LABELS_BY_ID[connector.id()]}
                    </div>
                    <Image
                      src={WALLET_LOGOS_BY_ID[connector.id()] || ""}
                      alt={connector.id()}
                      className=""
                      width={32}
                      height={32}
                      priority
                    />
                  </button>
                ))}
              </div>
            }
            <Dialog.Close asChild>
              <button aria-label="Close">CLOSE</button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
