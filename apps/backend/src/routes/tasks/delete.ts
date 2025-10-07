import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { taskGetCommand } from "../../domain/model/task";
import { deleteTask } from "../../infra/task-rdb-repository";

export default new Hono().delete(
  "/tasks/:taskId",
  zValidator(
    "param",
    z.object({
      taskId: z.string().uuid(),
    }),
  ),
  async (c) => {
    const { taskId } = c.req.valid("param");
    const user = { userId: "test-user" };

    const { count } = await deleteTask(taskGetCommand(user, taskId));
    if (count === 0) {
      return c.json({ message: "Task not found" }, 404);
    }

    return c.body(null, 204);
  },
);
