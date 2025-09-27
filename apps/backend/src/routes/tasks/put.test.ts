import { Hono } from "hono";
import { testClient } from "hono/testing";
import route from "./put";

const app = new Hono().route("/", route);

test("happy path", async () => {
  // GIVEN
  const createdAt = new Date("2024-11-01T12:30:00.000+0900");

  const task = await testPrismaClient.tasks.create({
    data: {
      userId: "test-user",
      taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
      content: "test-content",
      completedAt: null,
      createdAt: createdAt,
      updatedAt: createdAt,
    },
  });

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$put({
    json: {
      content: "test-content-updated",
      completedAt: new Date("2024-11-01T12:50:00.000+0900").toISOString(),
    },
    param: {
      taskId: task.taskId,
    },
  });

  // THEN
  expect(res.status).toEqual(204);
  expect(res.body).toBeNull();

  const updatedTask = await testPrismaClient.tasks.findUnique({
    where: {
      userId_taskId: {
        userId: "test-user",
        taskId: task.taskId,
      },
    },
  });
  expect(updatedTask).toEqual({
    userId: "test-user",
    taskId: task.taskId,
    content: "test-content-updated",
    completedAt: new Date("2024-11-01T12:50:00.000+0900"),
    createdAt: createdAt,
    updatedAt: expect.any(Date),
  });
});

test("overwriting task", async () => {
  // GIVEN
  const createdAt = new Date("2024-11-01T12:30:00.000+0900");

  const task = await testPrismaClient.tasks.create({
    data: {
      userId: "test-user",
      taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
      content: "test-content",
      completedAt: new Date("2024-11-01T12:50:00.000+0900"),
      createdAt: createdAt,
      updatedAt: createdAt,
    },
  });

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$put({
    json: {
      content: "test-content-updated",
      completedAt: null,
    },
    param: {
      taskId: task.taskId,
    },
  });

  // THEN
  expect(res.status).toEqual(204);
  expect(res.body).toBeNull();

  const updatedTask = await testPrismaClient.tasks.findUnique({
    where: {
      userId_taskId: {
        userId: "test-user",
        taskId: task.taskId,
      },
    },
  });
  expect(updatedTask).toEqual({
    userId: "test-user",
    taskId: task.taskId,
    content: "test-content-updated",
    completedAt: null,
    createdAt: createdAt,
    updatedAt: expect.any(Date),
  });
});

test("create new task when it does not exist", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$put({
    json: {
      content: "test-content-updated",
      completedAt: new Date("2024-11-01T12:50:00.000+0900").toISOString(),
    },
    param: {
      taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
    },
  });

  // THEN
  expect(res.status).toEqual(204);
  expect(res.body).toBeNull();

  const createdTask = await testPrismaClient.tasks.findUnique({
    where: {
      userId_taskId: {
        userId: "test-user",
        taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
      },
    },
  });
  expect(createdTask).toEqual({
    userId: "test-user",
    taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
    content: "test-content-updated",
    completedAt: new Date("2024-11-01T12:50:00.000+0900"),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  });
});

test.each`
  description              | content             | expectedStatus
  ${"1001 length content"} | ${"a".repeat(1001)} | ${400}
  ${"1000 length content"} | ${"a".repeat(1000)} | ${204}
  ${"empty string"}        | ${""}               | ${204}
  ${"null"}                | ${null}             | ${400}
  ${"undefined"}           | ${undefined}        | ${400}
`("$description", async ({ content, expectedStatus }) => {
  // GIVEN
  const createdAt = new Date("2024-11-01T12:30:00.000+0900");

  const task = await testPrismaClient.tasks.create({
    data: {
      userId: "test-user",
      taskId: "122a3691-6e2f-4a56-b0c7-c25d0a67fca9",
      content: "test-content",
      completedAt: null,
      createdAt: createdAt,
      updatedAt: createdAt,
    },
  });

  // WHEN
  const res = await testClient(app).tasks[":taskId"].$put({
    json: {
      content: content,
      completedAt: null,
    },
    param: {
      taskId: task.taskId,
    },
  });

  // THEN
  expect(res.status).toEqual(expectedStatus);
});
