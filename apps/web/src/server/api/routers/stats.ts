import { createTRPCRouter, publicProcedure } from "../trpc";

interface EveraiStatsApiResponse {
  total_tokens_bridged_on_starknet: number;
}

export const statsRouter = createTRPCRouter({
  getEveraiBridgeNumber: publicProcedure.query(async () => {
    const everaiStatsResponse = await fetch(
      "https://api.bridge.arkproject.dev/stats/0xC9ea1AFf83F0B35371729935E1bBecC41e590728"
    );

    const everaiStats =
      (await everaiStatsResponse.json()) as EveraiStatsApiResponse;

    return everaiStats.total_tokens_bridged_on_starknet;
  }),
});
