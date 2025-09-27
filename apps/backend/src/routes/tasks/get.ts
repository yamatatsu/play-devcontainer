import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { taskGetCommand } from "../../domain/model/task";
import { findTask } from "../../infra/task-rdb-repository";

type Response = {
  taskId: string;
  content: string;
  completedAt: Date | null;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
};

export default new Hono().get(
  "/tasks/:taskId",
  zValidator("param", z.object({ taskId: z.string().uuid() })),
  async (c) => {
    const { taskId } = c.req.valid("param");
    const user = { userId: "test-user" };

    const result = await findTask(taskGetCommand(user, taskId));
    if (!result) {
      return c.newResponse(null, 404);
    }

    const response = {
      taskId: result.taskId,
      content: result.content,
      completedAt: result.completedAt,
      metadata: result.metadata,
    } satisfies Response;

    return c.json(response, 200);
  },
);
