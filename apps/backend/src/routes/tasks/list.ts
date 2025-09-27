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
    return c.newResponse(null, 404);
  }

  const response = result.map(
    (task) =>
      ({
        taskId: task.taskId,
        content: task.content,
        completedAt: task.completedAt,
        metadata: task.metadata,
      }) satisfies Response[number],
  );

  return c.json(response, 200);
});
