import { Hono } from "hono";
import { bearerAuth } from "./middlewares/bearerAuth";
import { cors } from "./middlewares/cors";
import { logger } from "./middlewares/logger";
import rootRoutes from "./routes/root";
import tasksDelete from "./routes/tasks/delete";
import tasksGet from "./routes/tasks/get";
import tasksList from "./routes/tasks/list";
import tasksPost from "./routes/tasks/post";
import tasksPut from "./routes/tasks/put";

export const app = new Hono()
  // health check endpoint
  .route("/", rootRoutes)
  // middlewares
  .use("*", logger)
  .use("*", cors)
  .use("*", bearerAuth)
  // Task
  .route("/", tasksList)
  .route("/", tasksPost)
  .route("/", tasksGet)
  .route("/", tasksPut)
  .route("/", tasksDelete);
