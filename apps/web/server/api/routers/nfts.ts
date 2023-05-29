import { Alchemy, Network } from "alchemy-sdk";
import { isAddress } from "viem";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
  // network: Network.ETH_GOERLI,
});

type Nft = {
  title: string;
  image: string | undefined;
  tokenId: string;
  collectionName: string;
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

      const nfts = ownedNfts
        .filter((nft) => nft.tokenType === "ERC721")
        .map((nft) => ({
          title: nft.title,
          image: nft.media[0]?.thumbnail ?? undefined,
          tokenId: nft.tokenId,
          collectionName:
            nft.contract.openSea?.collectionName ||
            nft.contract.name ||
            "Unknown",
        }))
        .reduce<Record<string, Array<Nft>>>((acc, nft) => {
          if (acc[nft.collectionName] === undefined) {
            acc[nft.collectionName] = [];
          }

          acc[nft.collectionName]?.push(nft);
          return acc;
        }, {});

      return nfts;
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
