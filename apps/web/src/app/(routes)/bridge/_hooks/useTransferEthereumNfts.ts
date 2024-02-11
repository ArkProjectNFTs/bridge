"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { parseGwei } from "viem";
import { erc721Abi } from "viem";
import {
  useAccount as useEthereumAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import useNftSelection from "./useNftSelection";

// TODO @YohanTz: Divide this hook in 2 (approve / deposit)
export default function useTransferEthereumNfts() {
  const { selectedCollectionAddress, selectedTokenIds, totalSelectedNfts } =
    useNftSelection();

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: isApprovedForAll } = useReadContract({
    abi: erc721Abi,
    address: selectedCollectionAddress as `0x${string}`,
    args: [
      ethereumAddress ?? "0xa",
      process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
    ],
    functionName: "isApprovedForAll",
    query: {
      enabled: totalSelectedNfts > 0,
    },
    // watch: true,
    // TODO @YohanTz: https://wagmi.sh/react/guides/migrate-from-v1-to-v2#removed-watch-property
  });

  const { data: approveHash, writeContract: writeContractApprove } =
    useWriteContract();

  function approveForAll() {
    writeContractApprove({
      abi: erc721Abi,
      address: selectedCollectionAddress as `0x${string}`,
      args: [process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`, true],
      functionName: "setApprovalForAll",
    });
  }

  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { data: depositHash, writeContract: writeContractDeposit } =
    useWriteContract();

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
      // TODO @YohanTz: Get needed gas from ?
      value: parseGwei("40000"),
    });
  }

  useEffect(() => {
    if (depositHash !== undefined) {
      void router.push(`lounge/${depositHash}`);
    }
  }, [depositHash, router]);

  // const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } =
  //   useWaitForTransactionReceipt({ hash: depositHash });

  return {
    approveForAll: () => approveForAll(),
    depositTokens: () => depositTokens(),
    depositTransactionHash: depositHash,
    isApproveLoading: isApproveLoading && approveHash !== undefined,
    isApprovedForAll,
  };
}
