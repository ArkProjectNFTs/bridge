import { createTRPCRouter, publicProcedure } from "../trpc";

interface EveraiStatsApiResponse {
  total_tokens_bridged_on_starknet: number;
}

export const statsRouter = createTRPCRouter({
  getEveraiBridgeNumber: publicProcedure.query(async () => {
    const everaiStatsResponse = await fetch(
      "https://api.bridge.arkproject.dev/stats/0x9a38dec0590abc8c883d72e52391090e948ddf12"
    );

    const everaiStats =
      (await everaiStatsResponse.json()) as EveraiStatsApiResponse;

    return everaiStats.total_tokens_bridged_on_starknet;
  }),
});
