import {
  useNetwork,
  useAccount as useStarknetAccount,
} from "@starknet-react/core";
import {
  useAccount as useEthereumAccount,
  useSwitchChain as useSwitchEthereumChain,
} from "wagmi";

export default function useIsFullyConnected() {
  const { chainId: starknetChainId, isConnected: isStarknetConnected } =
    useStarknetAccount();
  const { chain: starknetChain } = useNetwork();

  const { chainId: ethereumChainId, isConnected: isEthereumConnected } =
    useEthereumAccount();
  const { chains: ethereumChains } = useSwitchEthereumChain();
  const isEthereumRightNetwork =
    ethereumChainId === ethereumChains[0].id && ethereumChainId !== undefined;

  const isStarknetRightNetwork =
    starknetChainId === starknetChain.id && starknetChainId !== undefined;

  return (
    isStarknetConnected &&
    isEthereumConnected &&
    isEthereumRightNetwork &&
    isStarknetRightNetwork
  );
}
