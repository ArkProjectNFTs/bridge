import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

import CollectionGrid from "./CollectionGrid";
import CollectionHeader from "./CollectionHeader";

export default function Collections() {
  const { sourceChain } = useCurrentChain();
  const { address } = useAccountFromChain(sourceChain);

  const { data } = api.nfts.getL1NftCollectionsByWallet.useQuery(
    {
      address: address ?? "",
    },
    {
      enabled: address !== undefined,
    }
  );

  return (
    <>
      <CollectionHeader collectionTotalCount={data?.totalCount} />
      <CollectionGrid nftContracts={data?.contracts} />
    </>
  );
}
