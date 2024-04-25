import {
  useContract,
  useContractRead,
  useAccount as useStarknetAccount,
} from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CallData } from "starknet";
import { useAccount as useEthereumAccount } from "wagmi";

import useNftSelection from "./useNftSelection";

const L2_BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_L2_BRIDGE_ADDRESS || "";

export default function useTransferStarknetNfts() {
  const [isSigning, setIsSigning] = useState(false);
  const { selectedCollectionAddress, selectedTokenIds } = useNftSelection();

  const { address: ethereumAddress } = useEthereumAccount();
  const { account: starknetAccount, address: starknetAddress } =
    useStarknetAccount();

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
    address: selectedCollectionAddress ?? "",
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

  const getDepositCalldata = useCallback(() => {
    if (
      bridgeContract?.abi !== undefined &&
      ethereumAddress !== undefined &&
      selectedCollectionAddress !== undefined
    ) {
      const depositCallData = new CallData(bridgeContract?.abi);
      return depositCallData.compile("deposit_tokens", {
        collection_l2: selectedCollectionAddress,
        owner_l1: ethereumAddress,
        salt: Date.now(),
        token_ids: selectedTokenIds,
        use_deposit_burn_auto: false,
        use_withdraw_auto: false,
      });
    }
  }, [
    bridgeContract?.abi,
    ethereumAddress,
    selectedCollectionAddress,
    selectedTokenIds,
  ]);

  const depositCalls = useMemo(() => {
    const approveCall = {
      calldata: [L2_BRIDGE_ADDRESS, 1],
      contractAddress: selectedCollectionAddress ?? "",
      entrypoint: "set_approval_for_all",
    };

    const depositCall = {
      calldata: getDepositCalldata(),
      contractAddress: L2_BRIDGE_ADDRESS,
      entrypoint: "deposit_tokens",
    };

    if (!isApprovedForAll) {
      return [approveCall, depositCall];
    }

    return [depositCall];
  }, [getDepositCalldata, isApprovedForAll, selectedCollectionAddress]);

  async function depositTokens() {
    setIsSigning(true);
    try {
      // await writeAsync();
      const depositData = await starknetAccount?.execute(depositCalls);
      if (depositData !== undefined) {
        router.push(`/lounge/${depositData.transaction_hash}`);
        setIsSigning(false);
      }
    } catch (error) {
      console.error(error);
      setIsSigning(false);
    }
  }

  const router = useRouter();

  return {
    depositTokens: () => depositTokens(),
    // isSigning: isSigning && depositData?.transaction_hash !== undefined,
    isSigning,
  };
}
