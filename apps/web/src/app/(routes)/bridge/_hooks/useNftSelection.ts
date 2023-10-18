import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

export default function useNftSelection() {
  const { sourceChain } = useCurrentChain();
  const { address } = useAccountFromChain(sourceChain);

  const [selectedNftIdsByAddress, setSelectedNftIdsByAddress] = useLocalStorage<
    Record<`0x${string}`, Array<string>>
  >("selectedNftIdsByAddress", {});

  const [
    lastSelectedCollectionNameByAddress,
    setLastSelectedCollectionNameByAddress,
  ] = useLocalStorage<Record<`0x${string}`, null | string>>(
    "lastSelectedCollectionNameByAddress",
    {}
  );

  // Change to use contract address
  const [selectedCollectionName, setSelectedCollectionName] = useState<
    null | string
  >(null);

  const { data: l1Nfts } = api.nfts.getL1NftsByCollection.useQuery(
    {
      address: address ?? "",
    },
    {
      enabled: address !== undefined && sourceChain === "Ethereum",
    }
  );
  const { data: l2Nfts } = api.nfts.getL2NftsByCollection.useQuery(
    {
      address: address ?? "",
    },
    {
      enabled: address !== undefined && sourceChain === "Starknet",
    }
  );

  const nfts = sourceChain === "Ethereum" ? l1Nfts : l2Nfts;

  const selectedCollection = selectedCollectionName
    ? nfts?.byCollection[selectedCollectionName] ?? []
    : [];

  /**
   * array.filter() is used because we need to clean the nft ids that are still in the local storage
   * but that are not in the user wallet anymore
   */
  const selectedNftIds = address
    ? selectedNftIdsByAddress[address]?.filter(
        (nftId) => nfts?.raw.find((rawNft) => rawNft.id === nftId) !== undefined
      ) ?? []
    : [];

  const numberOfSelectedNfts = selectedNftIds.length;

  const lastSelectedCollectionName =
    address && selectedNftIds.length > 0
      ? lastSelectedCollectionNameByAddress[address]
      : undefined;

  // TODO @YohanTz: Directly search in the collection
  const selectedNfts = selectedNftIds
    .map((selectedNftId) => nfts?.raw.find((nft) => nft.id === selectedNftId))
    .filter((nft) => nft !== undefined);

  const allCollectionSelected =
    selectedCollection.length === selectedNftIds.length;

  // @YohanTz: Refacto to remove the need of useEffect
  useEffect(() => {
    setSelectedCollectionName(null);
  }, [sourceChain]);

  function deselectNft(nftId: string) {
    if (address === undefined || !selectedNftIds.includes(nftId)) {
      return null;
    }

    if (selectedNftIds.length === 1) {
      setLastSelectedCollectionNameByAddress({
        ...lastSelectedCollectionNameByAddress,
        [address]: null,
      });
    }

    setSelectedNftIdsByAddress({
      ...selectedNftIdsByAddress,
      [address]: selectedNftIds.filter(
        (selectedNftId) => selectedNftId !== nftId
      ),
    });
  }

  function selectNft(nftId: string) {
    if (address === undefined) {
      return null;
    }

    if (
      selectedCollectionName !== lastSelectedCollectionNameByAddress[address]
    ) {
      setSelectedNftIdsByAddress({
        ...selectedNftIdsByAddress,
        [address]: [nftId],
      });
      setLastSelectedCollectionNameByAddress({
        ...lastSelectedCollectionNameByAddress,
        [address]: selectedCollectionName,
      });
      return;
    }

    setSelectedNftIdsByAddress({
      ...selectedNftIdsByAddress,
      [address]: [...selectedNftIds, nftId],
    });
  }

  function toggleNftSelection(nftId: string) {
    if (address === undefined) {
      return null;
    }

    if (selectedNftIds.includes(nftId)) {
      deselectNft(nftId);
      return;
    }

    selectNft(nftId);
  }

  function toggleSelectAll() {
    if (address === undefined || nfts === undefined) {
      return;
    }

    if (allCollectionSelected) {
      setSelectedNftIdsByAddress({
        ...selectedNftIdsByAddress,
        [address]: [],
      });
      setLastSelectedCollectionNameByAddress({
        ...lastSelectedCollectionNameByAddress,
        [address]: null,
      });
      return;
    }
    setSelectedNftIdsByAddress({
      ...selectedNftIdsByAddress,
      [address]: selectedCollection.map((nft) => nft.id),
    });
    setLastSelectedCollectionNameByAddress({
      ...lastSelectedCollectionNameByAddress,
      [address]: selectedCollectionName,
    });
  }

  function selectCollection(collectionName: null | string) {
    setSelectedCollectionName(collectionName);
  }

  function isSelected(nftId: string) {
    return selectedNftIds.includes(nftId);
  }

  return {
    allCollectionSelected,
    deselectNft,
    isSelected,
    lastSelectedCollectionName,
    nfts,
    numberOfSelectedNfts,
    selectCollection,
    selectNft,
    selectedCollection,
    selectedCollectionName,
    selectedNftIds,
    selectedNfts,
    toggleNftSelection,
    toggleSelectAll,
  };
}
