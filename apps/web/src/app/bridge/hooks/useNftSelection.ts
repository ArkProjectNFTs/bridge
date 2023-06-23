import { useLocalStorage } from "usehooks-ts";
import useAccountFromChain from "~/app/hooks/useAccountFromChain";
import { type Chain } from "../helpers";

export default function useNftSelection(chain: Chain) {
  const { address } = useAccountFromChain(chain);

  const [selectedNftIdsByAddress, setSelectedNftIdsByAddress] = useLocalStorage<
    Record<`0x${string}`, Array<string>>
  >("selectedNftIdsByAddress", {});

  const selectedNftIds = address ? selectedNftIdsByAddress[address] ?? [] : [];

  function deleteNft(nftId: string) {
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
      deleteNft(nftId);
      return;
    }

    selectNft(nftId);
  }

  function toggleSelectAll() {
    return null;
  }

  return { deleteNft, toggleNftSelection, toggleSelectAll, selectNft };
}
