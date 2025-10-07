import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { taskCreateCommand } from "../../domain/model/task";
import { createTask } from "../../infra/task-rdb-repository";

/**
 * タスク作成
 */
export default new Hono().post(
  "/tasks",
  zValidator("json", z.object({ content: z.string().max(1000) })),
  async (c) => {
    const input = c.req.valid("json");
    const user = { userId: "test-user" };
    const now = new Date();

    const newTask = await createTask(
      taskCreateCommand(user, input.content, now),
    );

    return c.json(newTask, 201);
  },
);
