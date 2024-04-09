import { createTRPCRouter } from "~/server/api/trpc";

import { bridgeRequestRouter } from "./routers/bridgeRequest";
import { gasInfoRouter } from "./routers/gasInfo";
import { l1NftsRouter } from "./routers/l1Nfts";
import { l2NftsRouter } from "./routers/l2Nfts";
import { statsRouter } from "./routers/stats";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bridgeRequest: bridgeRequestRouter,
  gasInfo: gasInfoRouter,
  l1Nfts: l1NftsRouter,
  l2Nfts: l2NftsRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
