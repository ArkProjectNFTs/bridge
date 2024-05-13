"use client";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import { useAccount as useEthereumAccount } from "wagmi";

import { useConnectModals } from "./WalletModals/WalletModalsContext";

export default function ConnectWalletsButton() {
  const {
    toggleConnectEthereumWalletModal,
    toggleConnectStarknetWalletModal,
    toggleConnectWalletsModal,
  } = useConnectModals();
  const { address: ethereumAddress } = useEthereumAccount();

  const { address: starknetAddress } = useStarknetAccount();

  function toggleConnectModal() {
    if (starknetAddress === undefined && ethereumAddress === undefined) {
      toggleConnectWalletsModal();
      return;
    }
    if (starknetAddress === undefined) {
      toggleConnectStarknetWalletModal();
      return;
    }
    if (ethereumAddress === undefined) {
      toggleConnectEthereumWalletModal();
      return;
    }
    toggleConnectWalletsModal();
  }

  return (
    <>
      <button
        className="mx-auto hidden h-12 w-full items-center justify-center gap-2.5 rounded-full bg-space-blue-source px-9 dark:bg-space-blue-source sm:w-auto md:flex"
        onClick={toggleConnectModal}
      >
        <Typography
          className="text-white dark:text-black"
          variant="button_text_l"
        >
          Start now
        </Typography>
      </button>
    </>
  );
}
