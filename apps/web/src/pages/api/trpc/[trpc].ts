import { createNextApiHandler } from "@trpc/server/adapters/next";
import { env } from "~/../env.mjs";
import { withLogtail } from "@logtail/next";

import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { log } from "@logtail/next";

// export API handler
export default withLogtail(
  createNextApiHandler({
    createContext: createTRPCContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ error, path, req }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : ({ error, path, req }) => {
            log.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
            if (error.stack !== undefined) {
              log.error(error.stack);
            }
          },
    router: appRouter,
  })
);
