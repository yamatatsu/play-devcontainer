import { Hono } from "hono";
import { findManyTasks } from "../../infra/task-rdb-repository";

type Response = {
  taskId: string;
  content: string;
  completedAt: Date | null;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}[];

export default new Hono().get("/tasks", async (c) => {
  const user = { userId: "test-user" };

  const result = await findManyTasks(user);
  if (!result) {
    return c.json([], 404);
  }

  const response: Response = result.map((task) => ({
    taskId: task.taskId,
    content: task.content,
    completedAt: task.completedAt,
    metadata: task.metadata,
  }));

  return c.json(response, 200);
});
