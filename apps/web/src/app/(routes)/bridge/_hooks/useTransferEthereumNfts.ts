import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { parseGwei } from "viem";
import {
  erc721ABI,
  useContractRead,
  useContractWrite,
  useAccount as useEthereumAccount,
  useWaitForTransaction,
} from "wagmi";

import useNftSelection from "./useNftSelection";

export default function useTransferEthereumNfts() {
  const { numberOfSelectedNfts, selectedNfts } = useNftSelection();

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: isApprovedForAll } = useContractRead({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [
      ethereumAddress ?? "0xtest",
      process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
    ],
    enabled: numberOfSelectedNfts > 0,
    functionName: "isApprovedForAll",
    watch: true,
  });

  const { data: approveData, write: approveForAll } = useContractWrite({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`, true],
    functionName: "setApprovalForAll",
  });

  const { isLoading: isApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  const { data: depositData, write: depositTokens } = useContractWrite({
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
      selectedNfts[0]?.collectionContractAddress as `0x${string}`,
      starknetAddress,
      selectedNfts.map((selectedNft) => selectedNft?.tokenId),
      false,
    ],
    functionName: "depositTokens",
    // TODO @YohanTz: Get needed gas from ?
    value: parseGwei("40000"),
  });

  // Use isSuccess from useWaitForTransaction once fixed... or once we do not rely on a public provider ?
  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } =
    useWaitForTransaction({
      hash: depositData?.hash,
    });

  return {
    approveForAll: () => approveForAll(),
    depositTokens: () => depositTokens(),
    isApproveLoading,
    isApprovedForAll,
    isDepositLoading,
    isDepositSuccess,
  };
}
