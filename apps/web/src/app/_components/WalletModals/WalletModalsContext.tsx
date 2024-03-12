import {
  useAccount as useStarknetAccount,
  useNetwork as useStarknetNetwork,
} from "@starknet-react/core";
import { SideDialog } from "design-system";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useAccount as useEthereumAccount,
  useSwitchChain as useSwitchEthereumChain,
} from "wagmi";

import EthereumSwitchNetworkModalContent from "./EthereumSwitchNetworkModalContent";
import StarknetSwitchNetworkModalContent from "./StarknetSwitchNetworkModalContent";

interface WalletModalsContextValue {
  openConnectEthereumWallet?: () => void;
  openConnectStarknetWallet?: () => void;
  openConnectWallets?: () => void;
}

const WalletModalsContext = createContext<WalletModalsContextValue>({});

export function WalletModalsProvider({ children }: PropsWithChildren) {
  const [userOpenedModal, setUserOpenedModal] = useState<
    "ethereumWallet" | "starknetWallet" | "wallets" | null
  >("wallets");

  function openConnectEthereumWallet() {
    setUserOpenedModal("ethereumWallet");
  }

  function openConnectStarknetWallet() {
    setUserOpenedModal("starknetWallet");
  }

  function openConnectWallets() {
    setUserOpenedModal("wallets");
  }

  function closeModal() {
    setUserOpenedModal(null);
  }

  const { address: ethereumAddress, chainId: ethereumChainId } =
    useEthereumAccount();
  const { chains: ethereumChains } = useSwitchEthereumChain();

  const { address: starknetAddress, chainId: starknetChainId } =
    useStarknetAccount();
  const { chain: starknetChain } = useStarknetNetwork();

  const isEthereumWrongNetwork =
    ethereumChainId !== ethereumChains[0].id && ethereumChainId !== undefined;

  const isStarknetWrongNetwork =
    starknetChainId !== starknetChain.id && starknetChainId !== undefined;

  useEffect(() => {
    if (
      userOpenedModal === "wallets" &&
      starknetAddress !== undefined &&
      ethereumAddress !== undefined
    ) {
      setUserOpenedModal(null);
      return;
    }
  }, [starknetAddress, ethereumAddress, userOpenedModal]);

  return (
    <WalletModalsContext.Provider
      value={useMemo(
        () => ({
          openConnectEthereumWallet,
          openConnectStarknetWallet,
          openConnectWallets,
        }),
        []
      )}
    >
      {children}
      <SideDialog
        isOpen={
          isEthereumWrongNetwork ||
          isStarknetWrongNetwork ||
          userOpenedModal !== null
        }
        onOpenChange={closeModal}
        withClose={!isEthereumWrongNetwork && !isStarknetWrongNetwork}
      >
        {isStarknetWrongNetwork ? (
          <StarknetSwitchNetworkModalContent />
        ) : isEthereumWrongNetwork ? (
          <EthereumSwitchNetworkModalContent />
        ) : (
          userOpenedModal !== null && <></>
        )}
      </SideDialog>
    </WalletModalsContext.Provider>
  );
}

export function useConnectModals() {
  const walletModalsContext = useContext(WalletModalsContext);

  if (walletModalsContext === undefined) {
    throw new Error(
      "useConnectModals must be used within a WalletModalsProvider"
    );
  }

  const {
    openConnectEthereumWallet,
    openConnectStarknetWallet,
    openConnectWallets,
  } = walletModalsContext;

  return {
    openConnectEthereumWallet,
    openConnectStarknetWallet,
    openConnectWallets,
  };
}
