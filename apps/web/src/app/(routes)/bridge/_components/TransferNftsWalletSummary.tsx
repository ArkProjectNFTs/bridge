import {
  useStarkProfile,
  useAccount as useStarknetAccount,
} from "@starknet-react/core";
import { Typography } from "design-system";
import { useMemo } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { type Chain } from "../../../_types";
import TargetChainButton from "./TargetChainButton";

export default function TransferNftsWalletSummary() {
  const { sourceChain, targetChain } = useCurrentChain();

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: starkProfile } = useStarkProfile({
    address: starknetAddress,
  });

  // TODO @YohanTz: Hook wrapper around wagmi and starknet-react
  const shortEthereumAddress = useMemo(
    () =>
      ethereumAddress
        ? `${ethereumAddress.slice(0, 6)}...${ethereumAddress.slice(-4)}`
        : undefined,
    [ethereumAddress]
  );

  const shortStarknetAddress = useMemo(
    () =>
      starknetAddress
        ? `${starknetAddress.slice(0, 6)}...${starknetAddress.slice(-4)}`
        : undefined,
    [starknetAddress]
  );

  const shortAddressByChain: Record<Chain, string | undefined> = {
    Ethereum: shortEthereumAddress,
    Starknet: starkProfile?.name ?? shortStarknetAddress,
  };

  return (
    <div className="mt-8 grid grid-cols-[1fr_4rem_1fr] rounded-xl bg-space-blue-50 px-3 py-3 dark:bg-void-black">
      <div className="flex flex-col items-start">
        <Typography
          className="mb-1 rounded-[4px] bg-space-blue-100 px-1 py-0.5 text-space-blue-500 dark:bg-space-blue-300 dark:text-space-blue-900"
          variant="body_text_11"
        >
          From wallet
        </Typography>
        <Typography variant="button_text_xs">
          {shortAddressByChain[sourceChain] ?? "Not connected"}
        </Typography>
      </div>
      <TargetChainButton />
      <div className="flex flex-col items-start">
        <Typography
          className="mb-1 rounded-[4px] bg-space-blue-100 px-1 py-0.5 text-space-blue-500 dark:bg-space-blue-300 dark:text-space-blue-900"
          variant="body_text_11"
        >
          To wallet
        </Typography>
        <Typography variant="button_text_xs">
          {shortAddressByChain[targetChain] ?? "Not connected"}
        </Typography>
      </div>
    </div>
  );
}
