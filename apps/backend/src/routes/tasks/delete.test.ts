import { Hono } from "hono";
import { testClient } from "hono/testing";
import route from "./delete";

const app = new Hono().route("/", route);

test("happy path", async () => {
  // GIVEN

  const task = await testPrismaClient.tasks.create({
    data: {
      userId: "test-user",
      content: "test-content",
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$delete({
    param: {
      taskId: task.taskId,
    },
  });

  // THEN
  expect(res.status).toEqual(204);
  expect(res.body).toBeNull();

  expect(
    await testPrismaClient.tasks.findUnique({
      where: { userId_taskId: { userId: task.userId, taskId: task.taskId } },
    }),
  ).toBeNull();
});

test("response 404 when the task is not found", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$delete({
    param: {
      taskId: "de767a01-ac7a-4ba3-abdf-c8ffffd300de", // 存在しないタスクID
    },
  });

  // THEN
  expect(res.status).toEqual(404);
  expect(await res.json()).toEqual({ message: "Task not found" });
});
