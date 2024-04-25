import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { api } from "~/utils/api";

interface UseL1WithdrawProps {
  onSuccess?: () => void;
}

export default function useL1Withdraw({ onSuccess }: UseL1WithdrawProps) {
  const {
    data: withdrawHash,
    isLoading: isSigning,

    writeContract: writeContractWithdraw,
  } = useWriteContract();

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  const utils = api.useUtils();

  function withdraw(requestContent: Array<string>) {
    writeContractWithdraw({
      abi: [
        {
          inputs: [
            { internalType: "uint256[]", name: "request", type: "uint256[]" },
          ],
          name: "withdrawTokens",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "payable",
          type: "function",
        },
        { inputs: [], name: "CairoWrapError", type: "error" },
        { inputs: [], name: "NotSupportedYetError", type: "error" },
        { inputs: [], name: "WithdrawAlreadyError", type: "error" },
        { inputs: [], name: "WithdrawMethodError", type: "error" },
      ],
      address: process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
      args: [requestContent],
      functionName: "withdrawTokens",
    });
  }

  useEffect(() => {
    if (isWithdrawSuccess) {
      onSuccess?.();
      void utils.bridgeRequest.getBridgeRequestsFromAddress.invalidate();
    }
  }, [isWithdrawSuccess]);

  return {
    isSigning,
    isWithdrawLoading: isWithdrawLoading && withdrawHash !== undefined,
    withdraw,
  };
}
