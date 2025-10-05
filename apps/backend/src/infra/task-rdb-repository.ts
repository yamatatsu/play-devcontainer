import { getPrisma } from "@packages/db";
import logger from "@packages/logger";
import type {
  Task,
  TaskCreateCommand,
  TaskGetCommand,
  TaskUpsertCommand,
} from "../domain/model/task";
import type { User } from "../domain/model/user";
import { getMetadata, isNotFoundError } from "./utils";

export async function createTask(command: TaskCreateCommand): Promise<void> {
  logger.info({ command }, "タスクの作成を開始");
  const prisma = getPrisma();

  const result = await prisma.tasks.create({
    data: {
      userId: command.user.userId,
      content: command.content,
      createdAt: command.metadata.createdAt,
      updatedAt: command.metadata.updatedAt,
    },
  });

  logger.info({ result }, "タスクの作成が完了");
}

export async function upsertTask(command: TaskUpsertCommand): Promise<void> {
  logger.info({ command }, "タスクの更新を開始");
  const prisma = getPrisma();

  const result = await prisma.tasks.upsert({
    where: {
      userId_taskId: { userId: command.user.userId, taskId: command.taskId },
    },
    create: {
      userId: command.user.userId,
      taskId: command.taskId,
      content: command.content,
      completedAt: command.completedAt,
      createdAt: command.metadata.createdAt,
      updatedAt: command.metadata.updatedAt,
    },
    update: {
      content: command.content,
      completedAt: command.completedAt,
      updatedAt: command.metadata.updatedAt,
    },
  });
  logger.info({ result }, "タスクの更新が完了");
}

export async function findTask(command: TaskGetCommand): Promise<Task | null> {
  logger.info({ command }, "タスクの取得を開始");
  const prisma = getPrisma();

  const result = await prisma.tasks.findUnique({
    where: {
      userId_taskId: { userId: command.user.userId, taskId: command.taskId },
    },
  });
  if (!result) {
    logger.info({ command }, "タスクが見つかりません");
    return null;
  }

  logger.info({ result }, "タスクの取得が完了");

  return {
    userId: result.userId,
    taskId: result.taskId,
    content: result.content,
    completedAt: result.completedAt,
    metadata: getMetadata(result),
  };
}

export async function findManyTasks(user: User): Promise<Task[] | null> {
  logger.info({ user }, "タスクの取得を開始");
  const prisma = getPrisma();

  const result = await prisma.tasks.findMany({
    where: { userId: user.userId },
    orderBy: { updatedAt: "desc" },
  });

  logger.info({ result }, "タスクの取得が完了");

  return result.map((record) => ({
    userId: record.userId,
    taskId: record.taskId,
    content: record.content,
    completedAt: record.completedAt,
    metadata: getMetadata(record),
  }));
}

export async function deleteTask(
  command: TaskGetCommand,
): Promise<{ count: number }> {
  logger.info({ command }, "タスクの削除を開始");
  const prisma = getPrisma();

  try {
    const result = await prisma.tasks.delete({
      where: {
        userId_taskId: { userId: command.user.userId, taskId: command.taskId },
      },
    });
    logger.info({ result }, "タスクの削除が完了");
    return { count: 1 };
  } catch (error) {
    if (isNotFoundError(error)) {
      logger.info(error, "タスクが見つかりません");
      return { count: 0 };
    }
    throw error;
  }
}
