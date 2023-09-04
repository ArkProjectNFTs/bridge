import { Alchemy, Network } from "alchemy-sdk";
import { isAddress } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

export type Nft = {
  collectionContractAddress: string;
  collectionName: string;
  id: string;
  image: string | undefined;
  title: string;
  tokenId: string;
};

const Address = z.object({
  address: z.custom<string>((address) => {
    return isAddress(address as string);
  }, "Invalid Address"),
});

export const nftsRouter = createTRPCRouter({
  getL1NftsByCollection: publicProcedure
    .input(Address)
    .query(async ({ input }) => {
      const { address } = input;

      const { ownedNfts } = await alchemy.nft.getNftsForOwner(
        address.toLowerCase()
      );

      const rawNfts = ownedNfts
        .filter(
          (nft) => nft.tokenType === "ERC721" || nft.tokenType === "ERC1155"
        )
        .map((nft) => ({
          collectionContractAddress: nft.contract.address,
          collectionName:
            nft.contract.openSea?.collectionName ??
            nft.contract.name ??
            "Unknown",
          id: `${nft.contract.address}-${nft.tokenId}`,
          // TODO @YohanTz: Support videos
          image: nft.media[0]?.thumbnail ?? undefined,
          title: nft.title,
          tokenId: nft.tokenId,
        }));

      const nftsByCollection = rawNfts.reduce<Record<string, Array<Nft>>>(
        (acc, nft) => {
          if (acc[nft.collectionName] === undefined) {
            acc[nft.collectionName] = [];
          }

          acc[nft.collectionName]?.push(nft);
          return acc;
        },
        {}
      );

      return { byCollection: nftsByCollection, raw: rawNfts };
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
