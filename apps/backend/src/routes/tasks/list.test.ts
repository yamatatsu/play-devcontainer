import { Hono } from "hono";
import { testClient } from "hono/testing";
import route from "./list";

const app = new Hono().route("/", route);

test("happy path", async () => {
  // GIVEN
  const createdAt = new Date("2024-11-01T12:30:00.000+0900");

  await testPrismaClient.tasks.createMany({
    data: [
      {
        userId: "test-user",
        content: "test-content-1",
        completedAt: null,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
      {
        userId: "test-user",
        content: "test-content-2",
        completedAt: null,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    ],
  });

  // WHEN
  const res = await testClient(app).tasks.$get({
    header: {
      authorization: "dummy",
    },
  });

  // THEN
  expect(res.status).toEqual(200);
  const json = await res.json();
  expect(json).toEqual(
    expect.arrayContaining([
      {
        taskId: expect.any(String),
        content: "test-content-1",
        completedAt: null,
        metadata: {
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
        },
      },
      {
        taskId: expect.any(String),
        content: "test-content-2",
        completedAt: null,
        metadata: {
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
        },
      },
    ]),
  );
  expect(json).toHaveLength(2);
});

test("response 200 with empty array when the task is not found", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks.$get({
    header: {
      authorization: "dummy",
    },
  });

  // THEN
  expect(res.status).toEqual(200);
  expect(await res.json()).toEqual([]);
});
