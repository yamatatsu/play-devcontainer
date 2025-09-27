import { Hono } from "hono";
import { testClient } from "hono/testing";
import route from "./get";

const app = new Hono().route("/", route);

test("happy path", async () => {
  // GIVEN
  const createdAt = new Date("2024-11-01T12:30:00.000+0900");

  const task = await testPrismaClient.tasks.create({
    data: {
      userId: "test-user",
      content: "test-content",
      completedAt: null,
      createdAt: createdAt,
      updatedAt: createdAt,
    },
  });

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$get({
    param: {
      taskId: task.taskId,
    },
  });

  // THEN
  expect(res.status).toEqual(200);
  expect(await res.json()).toEqual({
    taskId: task.taskId,
    content: "test-content",
    completedAt: null,
    metadata: {
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    },
  });
});

test("response 404 when the task is not found", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$get({
    param: {
      taskId: "de767a01-ac7a-4ba3-abdf-c8ffffd300de", // non-existent task ID
    },
  });

  // THEN
  expect(res.status).toEqual(404);
  expect(res.body).toEqual(null);
});
