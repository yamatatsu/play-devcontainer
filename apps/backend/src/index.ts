import { serve } from "@hono/node-server";
import { app } from "./app";
import logger from "./utils/logger";

serve({ fetch: app.fetch, port: 3000 }, ({ port }) => {
  logger.info(`Server is running on port http://localhost:${port}`);
});
