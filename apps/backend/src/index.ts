import { serve } from "@hono/node-server";
import logger from "@packages/logger";
import { app } from "./app";

serve({ fetch: app.fetch, port: 3000 }, ({ port }) => {
  logger.info(`Server is running on port http://localhost:${port}`);
});
