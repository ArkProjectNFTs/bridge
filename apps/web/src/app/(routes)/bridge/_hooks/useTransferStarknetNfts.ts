import {
  useContract,
  useContractRead,
  useContractWrite,
  useAccount as useStarknetAccount,
} from "@starknet-react/core";
import { CallData } from "starknet";
import { useAccount as useEthereumAccount } from "wagmi";

import useNftSelection from "./useNftSelection";

// TODO @YohanTz: Replace
const NFT_COLLECTION_TEMP_ADDRESS =
  "0x03620719dc1c1bd33555174ecf4f31e69578d94d00dd9fb387f33a220193fca6";

const L2_BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_L2_BRIDGE_ADDRESS || "";

export default function useTransferStarknetNfts() {
  const { numberOfSelectedNfts, selectedNfts } = useNftSelection("Ethereum");

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
    address: NFT_COLLECTION_TEMP_ADDRESS,
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

  const { write: approveForAll } = useContractWrite({
    calls: [
      {
        calldata: [L2_BRIDGE_ADDRESS, 1],
        contractAddress: NFT_COLLECTION_TEMP_ADDRESS,
        entrypoint: "set_approval_for_all",
      },
    ],
  });

  let depositCallData = undefined;
  if (bridgeContract?.abi !== undefined && ethereumAddress !== undefined) {
    depositCallData = new CallData(bridgeContract?.abi);
    depositCallData = depositCallData.compile("deposit_tokens", {
      collection_l2: NFT_COLLECTION_TEMP_ADDRESS,
      owner_l1: ethereumAddress,
      salt: Date.now(),
      token_ids: ["1000"],
      use_deposit_burn_auto: false,
      use_withdraw_auto: false,
    });
  }

  const { write: depositTokens } = useContractWrite({
    calls: [
      {
        calldata: depositCallData,
        contractAddress: L2_BRIDGE_ADDRESS,
        entrypoint: "deposit_tokens",
      },
    ],
  });

  return {
    approveForAll,
    depositTokens,
    isApproveLoading: false,
    isApprovedForAll,
    isDepositLoading: false,
  };
}
