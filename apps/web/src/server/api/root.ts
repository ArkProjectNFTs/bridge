import { createTRPCRouter } from "~/server/api/trpc";

import { bridgeRequestRouter } from "./routers/bridgeRequest";
import { nftsRouter } from "./routers/nfts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bridgeRequest: bridgeRequestRouter,
  nfts: nftsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
