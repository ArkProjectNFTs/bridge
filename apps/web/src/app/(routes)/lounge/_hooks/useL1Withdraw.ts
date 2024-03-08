import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export default function useL1Withdraw() {
  const {
    data: withdrawHash,
    isLoading: isSigning,
    writeContract: writeContractWithdraw,
  } = useWriteContract();

  const { isLoading: isWithdrawLoading, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  function withdraw(requestContent: Array<string>) {
    console.log(requestContent);
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

  return {
    isSigning,
    isWithdrawLoading: isWithdrawLoading && withdrawHash !== undefined,
    isWithdrawSuccess,
    withdraw,
  };
}
