/**
 * Setup `@chax-at/transactional-prisma-testing`
 * @see https://www.npmjs.com/package/@chax-at/transactional-prisma-testing
 *
 * Provides isolated transactions for each test case.
 * This allows each test case to perform database operations without being affected by other test cases.
 * All database operations that occur within a test case are rolled back at the end of the test case.
 */
import { PrismaTestingHelper } from "@chax-at/transactional-prisma-testing";
import { getPrisma } from "@packages/db";

type PrismaClient = ReturnType<typeof getPrisma>;

let prismaTestingHelper: PrismaTestingHelper<PrismaClient>;

declare global {
  var testPrismaClient: PrismaClient;
}

vi.doMock("@packages/db", () => {
  console.log("aaa", global.testPrismaClient);

  return {
    getPrisma: () => global.testPrismaClient,
  };
});

beforeEach(async () => {
  if (prismaTestingHelper == null) {
    const originalPrisma = getPrisma();
    prismaTestingHelper = new PrismaTestingHelper(originalPrisma);
    global.testPrismaClient = prismaTestingHelper.getProxyClient();
  }

  await prismaTestingHelper.startNewTransaction();
});

afterEach(async () => {
  prismaTestingHelper?.rollbackCurrentTransaction();
});
