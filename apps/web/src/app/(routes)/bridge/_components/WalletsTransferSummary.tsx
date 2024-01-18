import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import { useMemo } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import { type Chain } from "../../../_types";
import TargetChainButton from "./TargetChainButton";

export default function WalletsTransferSummary() {
  const { sourceChain, targetChain } = useCurrentChain();

  const { address: ethereumAddress } =
    useEthereumAccount();
  const { address: starknetAddress } =
    useStarknetAccount();

  // TODO @YohanTz: Hook wrapper around wagmi and starknet-react
  const shortEthereumAddress = useMemo(
    () =>
      ethereumAddress
        ? `${ethereumAddress.slice(0, 6)}...${ethereumAddress.slice(-4)}`
        : "",
    [ethereumAddress]
  );

  const shortStarknetAddress = useMemo(
    () =>
      starknetAddress
        ? `${starknetAddress.slice(0, 6)}...${starknetAddress.slice(-4)}`
        : "",
    [starknetAddress]
  );

  const shortAddressByChain: Record<Chain, string> = {
    Ethereum: shortEthereumAddress,
    Starknet: shortStarknetAddress,
  };

  return (
    <div className="mt-8 grid grid-cols-[1fr_4rem_1fr] rounded-xl bg-space-blue-50 px-3 py-3 dark:bg-space-blue-900">
      <div className="flex flex-col items-start">
        <Typography
          className="mb-1 rounded-[4px] bg-space-blue-100 p-1 text-asteroid-grey-600 dark:bg-space-blue-300 dark:text-space-blue-900"
          variant="button_text_xs"
        >
          From wallet
        </Typography>
        <Typography variant="body_text_14">
          {shortAddressByChain[sourceChain]}
        </Typography>
      </div>
      <TargetChainButton />
      <div className="flex flex-col items-start">
        <Typography
          className="mb-1 rounded-[4px] bg-space-blue-100 p-1 text-asteroid-grey-600 dark:bg-space-blue-300 dark:text-space-blue-900"
          variant="button_text_xs"
        >
          To wallet
        </Typography>
        <Typography variant="body_text_14">
          {shortAddressByChain[targetChain]}
        </Typography>
      </div>
    </div>
  );
}
