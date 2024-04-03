"use client";

import { useEffect } from "react";
import { erc721Abi } from "viem";
import {
  useBlockNumber,
  useAccount as useEthereumAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import useNftSelection from "./useNftSelection";

export default function useEthereumCollectionApproval() {
  const { selectedCollectionAddress, totalSelectedNfts } = useNftSelection();

  const { address: ethereumAddress } = useEthereumAccount();

  const { data: isApprovedForAll, refetch } = useReadContract({
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
  });

  const {
    data: approveHash,
    isLoading: isSigning,
    writeContract: writeContractApprove,
  } = useWriteContract();

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

  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    void refetch();
  }, [blockNumber, refetch]);

  return {
    approveForAll: () => approveForAll(),
    isApproveLoading: isApproveLoading && approveHash !== undefined,
    isApprovedForAll,
    isSigning,
  };
}
