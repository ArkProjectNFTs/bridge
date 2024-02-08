import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { erc721Abi } from "viem";
import { parseGwei } from "viem";
import {
  useAccount as useEthereumAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import useNftSelection from "./useNftSelection";

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

  console.log(approveHash);

  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // console.log(isApproveLoading);

  const { data: depositHash, writeContract: writeContractDeposit } =
    useWriteContract();

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

  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({ hash: depositHash });

  return {
    approveForAll: () => approveForAll(),
    depositTokens: () => depositTokens(),
    isApproveLoading: isApproveLoading && approveHash !== undefined,
    isApprovedForAll,
    isDepositLoading: isDepositLoading && depositHash !== undefined,
    isDepositSuccess: isDepositSuccess && depositHash !== undefined,
  };
}
