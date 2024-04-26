import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { type Nft } from "~/server/api/types";

export const MAX_SELECTED_ITEMS = 30;

export default function useNftSelection() {
  const { sourceChain } = useCurrentChain();
  const { address: userAddress } = useAccountFromChain(sourceChain);

  const [selectedTokensByUserAddress, setSelectedTokensByUserAddress] =
    useLocalStorage<
      Record<
        `0x${string}`,
        { collectionAddress: string; tokenIds: Array<string> } | null
      >
    >("selectedTokensByUserAddress", {});

  const { selectedCollectionAddress, selectedTokenIds } = useMemo(
    () => ({
      selectedCollectionAddress: userAddress
        ? selectedTokensByUserAddress[userAddress]?.collectionAddress
        : undefined,
      selectedTokenIds: userAddress
        ? selectedTokensByUserAddress[userAddress]?.tokenIds ?? []
        : [],
    }),
    [selectedTokensByUserAddress, userAddress]
  );

  const totalSelectedNfts = useMemo(
    () => selectedTokenIds.length,
    [selectedTokenIds]
  );

  const isNftSelected = useCallback(
    (tokenId: string, collectionAddress: string) => {
      return (
        selectedTokenIds.includes(tokenId) &&
        collectionAddress === selectedCollectionAddress
      );
    },
    [selectedCollectionAddress, selectedTokenIds]
  );

  function selectNft(tokenId: string, collectionAddress: string) {
    if (
      isNftSelected(tokenId, collectionAddress) ||
      userAddress === undefined
    ) {
      return;
    }

    if (
      totalSelectedNfts === MAX_SELECTED_ITEMS &&
      collectionAddress === selectedCollectionAddress
    ) {
      // TODO @YohanTz: Trigger toast here
      return;
    }

    if (
      collectionAddress !==
      selectedTokensByUserAddress[userAddress]?.collectionAddress
    ) {
      setSelectedTokensByUserAddress((previousValue) => ({
        ...previousValue,
        [userAddress]: { collectionAddress, tokenIds: [tokenId] },
      }));
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: {
        collectionAddress,
        tokenIds: [...selectedTokenIds, tokenId],
      },
    }));
  }

  const deselectNft = useCallback(
    (tokenId: string, collectionAddress: string) => {
      if (
        !isNftSelected(tokenId, collectionAddress) ||
        userAddress === undefined
      ) {
        return;
      }

      if (selectedTokenIds.length === 1) {
        setSelectedTokensByUserAddress((previousValue) => ({
          ...previousValue,
          [userAddress]: undefined,
        }));
        return;
      }

      setSelectedTokensByUserAddress((previousValue) => ({
        ...previousValue,
        [userAddress]: {
          collectionAddress,
          tokenIds: selectedTokenIds.filter(
            (selectedTokenId) => selectedTokenId !== tokenId
          ),
        },
      }));
    },
    [
      isNftSelected,
      selectedTokenIds,
      setSelectedTokensByUserAddress,
      userAddress,
    ]
  );

  function selectBatchNfts(nfts: Array<Nft>) {
    if (nfts.length === 0 || userAddress === undefined) {
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: {
        collectionAddress: nfts[0]?.contractAddress,
        tokenIds: nfts.map((nft) => nft.tokenId).slice(0, MAX_SELECTED_ITEMS),
      },
    }));
  }

  const deselectAllNfts = useCallback(() => {
    if (userAddress === undefined) {
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: undefined,
    }));
  }, [setSelectedTokensByUserAddress, userAddress]);

  function toggleNftSelection(tokenId: string, collectionAddress: string) {
    if (userAddress === undefined) {
      return;
    }

    if (isNftSelected(tokenId, collectionAddress)) {
      deselectNft(tokenId, collectionAddress);
      return;
    }

    selectNft(tokenId, collectionAddress);
  }

  return {
    deselectAllNfts,
    deselectNft,
    isNftSelected,
    selectBatchNfts,
    selectedCollectionAddress,
    selectedTokenIds,
    toggleNftSelection,
    totalSelectedNfts,
  };
}
