import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { taskUpsertCommand } from "../../domain/model/task";
import { upsertTask } from "../../infra/task-rdb-repository";

export default new Hono().put(
  "/tasks/:taskId",
  zValidator("param", z.object({ taskId: z.string().uuid() })),
  zValidator(
    "json",
    z.object({
      content: z.string().max(1000),
      completedAt: z.string().datetime().nullable(),
    }),
  ),
  async (c) => {
    const { taskId } = c.req.valid("param");
    const input = c.req.valid("json");
    const user = { userId: "test-user" };
    const now = new Date();

    await upsertTask(
      taskUpsertCommand(user, taskId, input.content, input.completedAt, now),
    );

    return c.newResponse(null, 204);
  },
);
