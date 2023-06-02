import { ConnectKitButton } from "connectkit";
import Image from "next/image";

export default function ConnectEthereumButton() {
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
              <Image
                src="/ethereum_logo.svg"
                height={32}
                width={32}
                alt="Ethereum logo"
              />
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
}
