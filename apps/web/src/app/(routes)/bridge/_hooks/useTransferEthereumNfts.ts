import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { parseGwei } from "viem";
import {
  erc721ABI,
  useContractRead,
  useContractWrite,
  useAccount as useEthereumAccount,
  useWaitForTransaction,
} from "wagmi";

import { L1_BRIDGE_ADDRESS } from "~/app/(routes)/helpers";

import useNftSelection from "./useNftSelection";

// TODO @YohanTz: Take the source chain as a parameter ?
export default function useTransferEthereumNfts() {
  const { numberOfSelectedNfts, selectedNfts } = useNftSelection("Ethereum");

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: isApprovedForAll } = useContractRead({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [ethereumAddress ?? "0xtest", L1_BRIDGE_ADDRESS],
    enabled: numberOfSelectedNfts > 0,
    functionName: "isApprovedForAll",
    watch: true,
  });

  const { data: approveData, write: approveForAll } = useContractWrite({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [L1_BRIDGE_ADDRESS, true],
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
    address: L1_BRIDGE_ADDRESS,
    args: [
      // TODO @YohanTz: Get the proper request hash from ?
      Date.now(),
      selectedNfts[0]?.collectionContractAddress,
      starknetAddress,
      selectedNfts.map((selectedNft) => selectedNft?.tokenId),
      false,
    ],
    functionName: "depositTokens",
    // TODO @YohanTz: Get needed gas from ?
    value: parseGwei("40000"),
  });

  const { isLoading: isDepositLoading } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  return {
    approveForAll,
    depositTokens,
    isApproveLoading,
    isApprovedForAll,
    isDepositLoading,
  };
}
