import {
  useContract,
  useContractRead,
  useContractWrite,
  useAccount as useStarknetAccount,
  useWaitForTransaction,
} from "@starknet-react/core";
import { CallData } from "starknet";
import { useAccount as useEthereumAccount } from "wagmi";

import useNftSelection from "./useNftSelection";

const L2_BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_L2_BRIDGE_ADDRESS || "";

export default function useTransferStarknetNfts() {
  const { selectedNfts } = useNftSelection();

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  // TODO @YohanTz: Cast type
  const { data: isApprovedForAll } = useContractRead({
    abi: [
      {
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "operator",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        name: "is_approved_for_all",
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
        type: "function",
      },
    ],
    address: selectedNfts[0]?.collectionContractAddress ?? "",
    args: [starknetAddress ?? "0xtest", L2_BRIDGE_ADDRESS],
    functionName: "is_approved_for_all",
    watch: true,
  });

  const { contract: bridgeContract } = useContract({
    abi: [
      {
        inputs: [
          {
            name: "salt",
            type: "core::felt252",
          },
          {
            name: "collection_l2",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "owner_l1",
            type: "core::felt252",
          },
          {
            name: "token_ids",
            type: "core::array::Array::<core::integer::u256>",
          },
          {
            name: "use_withdraw_auto",
            type: "core::bool",
          },
          {
            name: "use_deposit_burn_auto",
            type: "core::bool",
          },
        ],
        name: "deposit_tokens",
        outputs: [],
        state_mutability: "external",
        type: "function",
      },
    ],
    address: L2_BRIDGE_ADDRESS,
  });

  const { data: approveData, write: approveForAll } = useContractWrite({
    calls: [
      {
        calldata: [L2_BRIDGE_ADDRESS, 1],
        contractAddress: selectedNfts[0]?.collectionContractAddress ?? "",
        entrypoint: "set_approval_for_all",
      },
    ],
  });

  const { isLoading: isApproveLoading } = useWaitForTransaction({
    hash: approveData?.transaction_hash,
  });

  // TODO @YohanTz: Refacto
  let depositCallData = undefined;
  if (
    bridgeContract?.abi !== undefined &&
    ethereumAddress !== undefined &&
    selectedNfts[0] !== undefined
  ) {
    depositCallData = new CallData(bridgeContract?.abi);
    depositCallData = depositCallData.compile("deposit_tokens", {
      collection_l2: selectedNfts[0]?.collectionContractAddress ?? "",
      owner_l1: ethereumAddress,
      salt: Date.now(),
      token_ids: selectedNfts.map((selectedNft) => selectedNft?.tokenId),
      use_deposit_burn_auto: false,
      use_withdraw_auto: true,
    });
  }

  const { data: depositData, write: depositTokens } = useContractWrite({
    calls: [
      {
        calldata: depositCallData,
        contractAddress: L2_BRIDGE_ADDRESS,
        entrypoint: "deposit_tokens",
      },
    ],
  });

  const { isLoading: isDepositLoading, isSuccess: isDepositSuccess } =
    useWaitForTransaction({
      hash: depositData?.transaction_hash,
    });

  return {
    approveForAll: () => approveForAll(),
    depositTokens: () => depositTokens(),
    isApproveLoading:
      isApproveLoading && approveData?.transaction_hash !== undefined,
    isApprovedForAll,
    isDepositLoading:
      isDepositLoading && depositData?.transaction_hash !== undefined,
    isDepositSuccess,
  };
}
