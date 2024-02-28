/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import {
  type Connector,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
} from "wagmi";

import {
  CHAIN_WALLET_ILLUSTRATION_BY_NAME,
  WALLET_LOGOS_BY_ID,
} from "../_lib/utils/connectors";

export default function EthereumConnectorsList() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { connector: activeConnector } = useAccount();

  const { data: ethBalance } = useBalance({ address });

  const [, copy] = useCopyToClipboard();

  const shortAddress = useMemo(() => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  }, [address]);

  const [pendingConnector, setPendingConnector] = useState<string | undefined>(
    undefined
  );

  async function connect(connector: Connector) {
    setPendingConnector(connector.id);
    try {
      await connectAsync({ connector });
    } catch {}
    setPendingConnector(undefined);
  }

  function handleCopy() {
    if (address === undefined) {
      return;
    }

    copy(address ?? "")
      .then(() => {
        console.log("copied");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return isConnected ? (
    <>
      <Image
        alt={`Ethereum logo`}
        height={100}
        src={CHAIN_WALLET_ILLUSTRATION_BY_NAME.Ethereum}
        width={100}
      />
      <div className="w-full px-7">
        <Typography className="mt-6" component="h3" variant="heading_light_xxs">
          Ethereum Wallet
        </Typography>
        <div className="mb-6 mt-2 h-5">
          <Typography component="p" variant="body_text_14">
            {ethBalance?.formatted
              ? `${parseFloat(ethBalance.formatted).toFixed(4)} ETH`
              : null}
          </Typography>
        </div>
        <div
          className={clsx(
            "mt-6 flex h-11 items-center justify-between rounded-full bg-playground-purple-50 p-2 dark:bg-playground-purple-300 dark:text-galaxy-blue"
          )}
        >
          {WALLET_LOGOS_BY_ID[activeConnector?.id ?? ""] !== undefined ? (
            <Image
              alt="connector"
              height={28}
              src={WALLET_LOGOS_BY_ID[activeConnector?.id ?? ""] ?? ""}
              width={28}
            />
          ) : (
            activeConnector?.icon !== undefined && (
              <img
                alt="connector"
                className="h-7 w-7 rounded-full"
                src={activeConnector.icon}
              />
            )
          )}
          <Typography variant="button_text_s">{shortAddress}</Typography>

          <button onClick={handleCopy}>
            <svg
              fill="none"
              height="20"
              viewBox="0 0 21 20"
              width="21"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.125 17.5H7.375C6.68464 17.5 6.125 16.9404 6.125 16.25V6.25C6.125 5.55964 6.68464 5 7.375 5H16.125C16.8154 5 17.375 5.55964 17.375 6.25V16.25C17.375 16.9404 16.8154 17.5 16.125 17.5Z"
                stroke="currentColor"
                strokeWidth="1.25"
              />
              <path
                d="M3.625 15.625V5.625C3.625 3.89911 5.02411 2.5 6.75 2.5H15.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.25"
              />
            </svg>
          </button>
        </div>
        <button
          className="mt-4 w-full rounded-full border-2 border-space-blue-900 py-2 transition-colors hover:border-space-blue-700 hover:text-space-blue-700 dark:border-space-blue-400 dark:text-space-blue-400 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200"
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
        height={100}
        src={CHAIN_WALLET_ILLUSTRATION_BY_NAME.Ethereum}
        width={100}
      />
      <Typography className="py-6" component="p" variant="heading_light_xxs">
        Choose your Ethereum wallet
      </Typography>
      <div className="flex w-full flex-col gap-4 px-11 sm:px-7">
        {connectors.map((connector) => {
          if (connector.id === "injected") {
            return <Fragment key="injected" />;
          }

          const isConnecting = pendingConnector === connector.id;

          return (
            <button
              className="flex w-full items-center justify-between rounded-full bg-galaxy-blue py-2 pl-3.5 pr-2 text-white transition-colors hover:bg-space-blue-source hover:text-galaxy-blue dark:bg-white dark:text-galaxy-blue dark:hover:bg-space-blue-source"
              key={connector.id}
              onClick={() => void connect(connector)}
            >
              <div className="flex items-center gap-3">
                {isConnecting && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
                )}
                <Typography variant="button_text_s">
                  {connector.name}
                </Typography>
              </div>
              {WALLET_LOGOS_BY_ID[connector.id] !== undefined ? (
                <Image
                  alt={`${connector.name} logo`}
                  height={32}
                  src={WALLET_LOGOS_BY_ID[connector.id] ?? ""}
                  width={32}
                />
              ) : (
                connector.icon !== undefined && (
                  <img
                    alt={connector.name}
                    className="h-8 w-8 rounded-full"
                    src={connector.icon}
                  />
                )
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
