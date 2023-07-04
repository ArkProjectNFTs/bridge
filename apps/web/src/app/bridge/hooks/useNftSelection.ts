import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import useAccountFromChain from "~/hooks/useAccountFromChain";
import { api } from "~/utils/api";

import { type Chain } from "../../helpers";

export default function useNftSelection(chain: Chain) {
  const { address } = useAccountFromChain(chain);

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

  const { data: nfts } = api.nfts.getL1NftsByCollection.useQuery(
    {
      address: address ?? "",
    },
    { enabled: address !== undefined }
  );

  const [selectedCollectionName, setSelectedCollectionName] = useState<
    null | string
  >(null);

  const selectedCollection = selectedCollectionName
    ? nfts?.byCollection[selectedCollectionName] ?? []
    : [];

  const selectedNftIds = address ? selectedNftIdsByAddress[address] ?? [] : [];

  // TODO @YohanTz: Directly search in the collection and filter nft not in the wallet anymore
  const selectedNfts = selectedNftIds.map((selectedNftId) =>
    nfts?.raw.find((nft) => nft.id === selectedNftId)
  );

  const allCollectionSelected =
    selectedCollection.length === selectedNftIds.length;

  function deselectNft(nftId: string) {
    if (address === undefined) {
      return null;
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

    // TODO @YohanTz: Check if selectedNft is from another collection !
    if (
      selectedCollectionName !== null &&
      lastSelectedCollectionNameByAddress[address] !== null &&
      lastSelectedCollectionNameByAddress[address] !== selectedCollectionName
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
      return;
    }
    setSelectedNftIdsByAddress({
      ...selectedNftIdsByAddress,
      [address]: selectedCollection.map((nft) => nft.id),
    });
  }

  function selectCollection(collectionName: string) {
    setSelectedCollectionName(collectionName);
  }

  function isSelected(nftId: string) {
    return selectedNftIds.includes(nftId);
  }

  return {
    allCollectionSelected,
    deselectNft,
    isSelected,
    nfts,
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
