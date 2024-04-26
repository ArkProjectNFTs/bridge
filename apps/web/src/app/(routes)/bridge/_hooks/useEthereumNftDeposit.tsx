"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { parseGwei } from "viem";
import { useWriteContract } from "wagmi";

import useNftSelection from "./useNftSelection";

export default function useEthereumNftDeposit() {
  const { deselectAllNfts, selectedCollectionAddress, selectedTokenIds } =
    useNftSelection();

  const { address: starknetAddress } = useStarknetAccount();

  const {
    data: depositTransactionHash,
    isLoading,
    writeContract: writeContractDeposit,
  } = useWriteContract();

  const router = useRouter();

  function depositTokens() {
    writeContractDeposit({
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "salt",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "collectionL1",
              type: "address",
            },
            {
              internalType: "snaddress",
              name: "ownerL2",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "ids",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "useAutoBurn",
              type: "bool",
            },
          ],
          name: "depositTokens",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      address: process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
      args: [
        // TODO @YohanTz: Get the proper request hash from ?
        Date.now(),
        selectedCollectionAddress as `0x${string}`,
        starknetAddress,
        selectedTokenIds,
        false,
      ],
      functionName: "depositTokens",
      value: parseGwei((40000 * selectedTokenIds.length).toString()),
    });
  }

  useEffect(() => {
    if (depositTransactionHash !== undefined) {
      void router.push(`/lounge/${depositTransactionHash}?from=ethereum`);
    }
  }, [depositTransactionHash, deselectAllNfts, router]);

  return {
    depositTokens: () => depositTokens(),
    depositTransactionHash,
    isSigning: isLoading && depositTransactionHash === undefined,
  };
}
