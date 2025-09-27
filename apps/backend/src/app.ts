import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import rootRoutes from "./routes/root";
import tasksDelete from "./routes/tasks/delete";
import tasksGet from "./routes/tasks/get";
import tasksList from "./routes/tasks/list";
import tasksPost from "./routes/tasks/post";
import tasksPut from "./routes/tasks/put";
import { runWithRequestId } from "@packages/logger";

export const app = new Hono()
  .use("/*", async (_, next) => {
    await runWithRequestId(randomUUID(), next);
  })
  .route("/", rootRoutes)
  // Task
  .route("/", tasksList)
  .route("/", tasksPost)
  .route("/", tasksGet)
  .route("/", tasksPut)
  .route("/", tasksDelete);
