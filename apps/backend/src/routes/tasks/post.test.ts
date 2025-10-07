import { Hono } from "hono";
import { testClient } from "hono/testing";
import route from "./post";

const app = new Hono().route("/", route);

test("happy path", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks.$post({
    json: {
      content: "test-content",
    },
  });

  // THEN
  expect(res.status).toEqual(201);
  expect(await res.json()).toEqual({
    userId: "test-user",
    taskId: expect.any(String),
    content: "test-content",
    completedAt: null,
    metadata: {
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    },
  });

  const tasks = await testPrismaClient.tasks.findMany({
    where: {
      userId: "test-user",
    },
  });
  expect(tasks).toEqual([
    {
      userId: "test-user",
      taskId: expect.any(String),
      content: "test-content",
      completedAt: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    },
  ]);
});

test("response 400 when content is not specified", async () => {
  // GIVEN

  // WHEN
  const res = await testClient(app).tasks.$post({
    // @ts-expect-error content is required
    json: {},
  });

  // THEN
  expect(res.status).toEqual(400);
  expect(await res.json()).toMatchObject({
    success: false,
    error: {
      name: "ZodError",
    },
  });
});

test.each`
  description              | content             | expectedStatus
  ${"1001 length content"} | ${"a".repeat(1001)} | ${400}
  ${"1000 length content"} | ${"a".repeat(1000)} | ${201}
  ${"empty string"}        | ${""}               | ${201}
  ${"null"}                | ${null}             | ${400}
  ${"undefined"}           | ${undefined}        | ${400}
`("$description", async ({ content, expectedStatus }) => {
  // WHEN
  const res = await testClient(app).tasks.$post({
    json: {
      content: content,
    },
  });

  // THEN
  expect(res.status).toEqual(expectedStatus);
});
