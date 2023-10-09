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
  collectionName: string;
  id: string;
  image: string | undefined;
  title: string;
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
        .filter((nft) => nft.tokenType === "ERC721")
        .map((nft) => ({
          collectionName:
            nft.contract.openSea?.collectionName ??
            nft.contract.name ??
            "Unknown",
          id: `${nft.title}-${nft.tokenId}`,
          image: nft.media[0]?.thumbnail ?? undefined,
          title: nft.title,
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
