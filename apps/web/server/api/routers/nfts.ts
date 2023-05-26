import { Alchemy, Network } from "alchemy-sdk";
import { isAddress } from "viem";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

const Address = z.object({
  address: z.custom<string>((address) => {
    return isAddress(address as string);
  }, "Invalid Address"),
});

export const nftsRouter = createTRPCRouter({
  getL1NftsFromAddress: publicProcedure
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
          contract: nft.contract.address,
        }));

      return {
        nfts,
      };
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
