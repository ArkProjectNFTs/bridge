import { Typography } from "design-system";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import NftCard from "../../../_components/NftCard/NftCard";
import useNftSelection from "../_hooks/useNftSelection";

/*
 * TODO @YohanTz: Take time to optimize the lists with React.memo etc.
 * TODO @YohanTz: Support Ethereum AND Starknet sides
 */
export default function TokenList() {
  const { sourceChain } = useCurrentChain();

  const {
    allCollectionSelected,
    isSelected,
    lastSelectedCollectionName,
    nfts,
    selectCollection,
    selectedCollection,
    selectedCollectionName,
    toggleNftSelection,
    toggleSelectAll,
  } = useNftSelection();

  if (nfts === undefined) {
    return null;
  }

  return (
    <>
      <div className="w-full">
        <div className="mb-10 flex w-full flex-wrap justify-between gap-3.5">
          <div className="flex max-w-full items-center gap-3.5">
            <Typography ellipsable variant="heading_light_s">
              {selectedCollectionName
                ? `${selectedCollectionName} Collection`
                : "Collections"}
            </Typography>
            {selectedCollectionName !== null && (
              <Typography
                className="shrink-0 rounded-full bg-primary-source px-2 py-1.5 text-white"
                variant="body_text_bold_12"
              >
                {selectedCollection.length}
                {selectedCollection.length > 1 ? " Nfts" : " Nft"}
              </Typography>
            )}
          </div>
          {selectedCollectionName !== null && (
            <button
              className="rounded-full bg-dark-blue-950 px-3.5 py-2 font-medium text-white"
              onClick={toggleSelectAll}
            >
              <Typography variant="button_text_s">
                {allCollectionSelected ? "Deselect all" : "Select all"}
              </Typography>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-5">
          {selectedCollectionName === null
            ? Object.entries(nfts.byCollection).map(
                ([collectionName, nfts]) => {
                  return (
                    <NftCard
                      cardType="collection"
                      chain={sourceChain}
                      image={nfts[0]?.image}
                      isSelected={collectionName === lastSelectedCollectionName}
                      key={collectionName}
                      numberOfNfts={nfts.length}
                      onClick={() => selectCollection(collectionName)}
                      title={collectionName}
                    />
                  );
                }
              )
            : selectedCollection.map((nft) => {
                return (
                  <NftCard
                    cardType="nft"
                    chain={sourceChain}
                    image={nft.image}
                    isSelected={isSelected(nft.id)}
                    key={nft.id}
                    onClick={() => toggleNftSelection(nft.id)}
                    title={nft.title.length > 0 ? nft.title : nft.tokenId}
                  />
                );
              })}
        </div>
      </div>
    </>
  );
}
