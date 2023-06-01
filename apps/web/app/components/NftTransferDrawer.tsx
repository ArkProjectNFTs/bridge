import Image from "next/image";
import { useAccount as useEthereumAccount } from "wagmi";
// import { useAccount as useStarknetAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

type NftTansferDrawerProps = {
  selectedNftIds: Array<string>;
};

export default function NftTransferDrawer({
  selectedNftIds,
}: NftTansferDrawerProps) {
  const { address: ethereumAddress } = useEthereumAccount();
  // const { address: starknetAddress } = useStarknetAccount();

  // TODO @YohanTz: Support both sides
  const { data: nfts } = api.nfts.getL1NftsByCollection.useQuery({
    address: ethereumAddress || "",
  });

  const selectedNfts = selectedNftIds.map((selectedNftId) =>
    nfts?.raw.find((nft) => nft.id === selectedNftId)
  );

  return (
    <div className="mr-3 w-80 shrink-0">
      {/* TODO @YohanTz: Try to extract magic values like this somewhere (top-[72px]) */}
      <div className="fixed bottom-0 right-0 top-[72px] m-3 flex w-80 shrink-0 flex-col rounded-lg border border-neutral-100 bg-white p-5">
        <h2 className="text-xl font-bold">Your assets to transfer</h2>
        <p className="mt-4 text-sm">
          You need to confirm the transaction in your wallet to start the
          migration.
        </p>
        <div className="mt-8">
          <div className="rounded-lg bg-neutral-100 p-8"></div>
          <div className="mt-1.5 rounded-lg bg-neutral-100 p-8"></div>
        </div>
        {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
        <div className="mt-8 flex flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex items-center gap-4" key={selectedNft?.id}>
                <Image
                  src={selectedNft?.image || ""}
                  height={52}
                  width={52}
                  alt={selectedNft?.title ?? ""}
                />
                <div className="flex flex-col">
                  <span className="text-sm">{selectedNft?.collectionName}</span>
                  <span className="font-semibold">{selectedNft?.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <p>Total Nfts to migrate</p>
          <span>
            {selectedNfts.length}/{selectedNfts.length}
          </span>
        </div>
        <p className="mt-8 rounded-md bg-purple-100 p-3 text-sm">
          You must approve the selection of your assets before confirming the
          migration. Each collection will require a signature via your wallet.
        </p>
        <button className="mt-8 w-full rounded-md bg-black p-3 text-sm text-white">
          Approve the selected Nfts{" "}
        </button>
      </div>
    </div>
  );
}
