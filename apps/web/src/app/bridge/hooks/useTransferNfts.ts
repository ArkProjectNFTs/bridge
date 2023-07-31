import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { parseGwei } from "viem";
import {
  erc721ABI,
  useContractRead,
  useContractWrite,
  useAccount as useEthereumAccount,
  useWaitForTransaction,
} from "wagmi";

import { BRIDGE_ADDRESS } from "~/app/helpers";

import useNftSelection from "./useNftSelection";

// TODO @YohanTz: Take the source chain as a parameter ?
export default function useTransferNfts() {
  const { numberOfSelectedNfts, selectedNfts } = useNftSelection("Ethereum");

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: isApprovedForAll } = useContractRead({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [ethereumAddress ?? "0xtest", BRIDGE_ADDRESS],
    enabled: numberOfSelectedNfts > 0,
    functionName: "isApprovedForAll",
    watch: true,
  });

  // TODO @YohanTz: use usePrepareContractWrite
  const { data: approveData, write: approveForAll } = useContractWrite({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [BRIDGE_ADDRESS, true],
    functionName: "setApprovalForAll",
  });

  const { isLoading: isApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // TODO @YohanTz: use usePrepareContractWrite ?
  const { data: depositData, write: depositTokens } = useContractWrite({
    abi: [
      {
        inputs: [
          { internalType: "uint256", name: "reqHash", type: "uint256" },
          {
            internalType: "address",
            name: "collectionAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "ownerL2Address",
            type: "uint256",
          },
          { internalType: "uint256[]", name: "tokensIds", type: "uint256[]" },
        ],
        name: "depositTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    address: BRIDGE_ADDRESS,
    args: [
      // TODO @YohanTz: Get the proper request hash from ?
      "0xbeef",
      selectedNfts[0]?.collectionContractAddress,
      starknetAddress,
      selectedNfts.map((selectedNft) => selectedNft?.tokenId),
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
