import { useLocalStorage } from "usehooks-ts";

import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { type Nft } from "~/server/api/types";

export const MAX_SELECTED_ITEMS = 100;

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

  const selectedTokenIds =
    userAddress !== undefined
      ? selectedTokensByUserAddress[userAddress]?.tokenIds ?? []
      : [];

  const selectedCollectionAddress =
    userAddress !== undefined
      ? selectedTokensByUserAddress[userAddress]?.collectionAddress
      : undefined;

  const totalSelectedNfts = selectedTokenIds.length;

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

  function deselectNft(tokenId: string, collectionAddress: string) {
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
  }

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

  function deselectAllNfts() {
    if (userAddress === undefined) {
      return;
    }

    setSelectedTokensByUserAddress((previousValue) => ({
      ...previousValue,
      [userAddress]: undefined,
    }));
  }

  function isNftSelected(tokenId: string, collectionAddress: string) {
    return (
      selectedTokenIds.includes(tokenId) &&
      collectionAddress === selectedCollectionAddress
    );
  }

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
