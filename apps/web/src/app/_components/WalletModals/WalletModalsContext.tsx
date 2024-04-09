import {
  useAccount as useStarknetAccount,
  useNetwork as useStarknetNetwork,
} from "@starknet-react/core";
import { SideDialog } from "design-system";
import { usePathname, useRouter } from "next/navigation";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useAccount as useEthereumAccount,
  useSwitchChain as useSwitchEthereumChain,
} from "wagmi";

import ConnectModalContent from "./ConnectModalContent";
import EthereumSwitchNetworkModalContent from "./EthereumSwitchNetworkModalContent";
import StarknetSwitchNetworkModalContent from "./StarknetSwitchNetworkModalContent";

interface WalletModalsContextValue {
  toggleConnectEthereumWalletModal: () => void;
  toggleConnectStarknetWalletModal: () => void;
  toggleConnectWalletsModal: () => void;
}

const WalletModalsContext = createContext<WalletModalsContextValue | undefined>(
  undefined
);

export function WalletModalsProvider({ children }: PropsWithChildren) {
  const [userOpenedModal, setUserOpenedModal] = useState<
    "ethereumWallet" | "starknetWallet" | "wallets" | null
  >(null);

  const pathname = usePathname();
  const router = useRouter();

  const toggleConnectEthereumWalletModal = useCallback(() => {
    if (userOpenedModal === "ethereumWallet") {
      setUserOpenedModal(null);
      return;
    }
    setUserOpenedModal("ethereumWallet");
  }, [userOpenedModal]);

  const toggleConnectStarknetWalletModal = useCallback(() => {
    if (userOpenedModal === "starknetWallet") {
      setUserOpenedModal(null);
      return;
    }
    setUserOpenedModal("starknetWallet");
  }, [userOpenedModal]);

  const toggleConnectWalletsModal = useCallback(() => {
    if (userOpenedModal === "wallets") {
      setUserOpenedModal(null);
      return;
    }
    setUserOpenedModal("wallets");
  }, [userOpenedModal]);

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
      if (pathname === "/") {
        void router.push("/bridge");
      }
    }
  }, [userOpenedModal, router, starknetAddress, ethereumAddress, pathname]);

  useEffect(() => {
    if (
      pathname === "/bridge" ||
      pathname === "/portfolio" ||
      pathname === "/lounge"
    ) {
      if (starknetAddress === undefined && ethereumAddress === undefined) {
        setUserOpenedModal("wallets");
        return;
      }
      if (starknetAddress === undefined) {
        setUserOpenedModal("starknetWallet");
        return;
      }
      if (ethereumAddress === undefined) {
        setUserOpenedModal("ethereumWallet");
        return;
      }
    }
  }, [pathname]);

  return (
    <WalletModalsContext.Provider
      value={useMemo(
        () => ({
          toggleConnectEthereumWalletModal,
          toggleConnectStarknetWalletModal,
          toggleConnectWalletsModal,
        }),
        [
          toggleConnectEthereumWalletModal,
          toggleConnectStarknetWalletModal,
          toggleConnectWalletsModal,
        ]
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
        withClose={userOpenedModal !== null}
      >
        {userOpenedModal !== null ? (
          userOpenedModal === "wallets" ? (
            <ConnectModalContent
              closeModal={closeModal}
              key={userOpenedModal}
            />
          ) : userOpenedModal === "ethereumWallet" ? (
            <ConnectModalContent
              chain="Ethereum"
              closeModal={closeModal}
              key={userOpenedModal}
            />
          ) : (
            <ConnectModalContent
              chain="Starknet"
              closeModal={closeModal}
              key={userOpenedModal}
            />
          )
        ) : isStarknetWrongNetwork ? (
          <StarknetSwitchNetworkModalContent />
        ) : isEthereumWrongNetwork ? (
          <EthereumSwitchNetworkModalContent />
        ) : null}
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
    toggleConnectEthereumWalletModal,
    toggleConnectStarknetWalletModal,
    toggleConnectWalletsModal,
  } = walletModalsContext;

  return {
    toggleConnectEthereumWalletModal,
    toggleConnectStarknetWalletModal,
    toggleConnectWalletsModal,
  };
}
