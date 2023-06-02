import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { CHAIN_LOGOS_BY_NAME, WALLET_LOGOS_BY_ID } from "../helpers";

export default function ConnectEthereumButton() {
  const { connector } = useAccount();

  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName }) => {
          return (
            <button
              className="flex items-center gap-2.5 rounded-full bg-sky-950 px-3 py-2 text-sm font-semibold text-white"
              onClick={show}
            >
              {isConnected
                ? ensName ?? truncatedAddress
                : "Connect Ethereum Wallet"}
              <div className="flex">
                <Image
                  src={CHAIN_LOGOS_BY_NAME.Ethereum}
                  height={28}
                  width={28}
                  alt="Ethereum logo"
                />

                {connector !== undefined && (
                  <Image
                    src={WALLET_LOGOS_BY_ID[connector.id] || ""}
                    height={28}
                    width={28}
                    alt={`${connector.name} logo`}
                    className="-ml-2 rounded-full outline outline-2 outline-sky-950"
                  />
                )}
              </div>
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
}
