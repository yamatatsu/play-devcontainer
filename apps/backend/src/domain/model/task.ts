import type { User } from "./user";

export type Task = {
  userId: string;
  taskId: string;
  content: string;
  completedAt: Date | null;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
};

export type TaskCreateCommand = {
  user: User;
  content: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
};
export function taskCreateCommand(
  user: User,
  content: string,
  now: Date,
): TaskCreateCommand {
  return {
    user,
    content,
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  };
}

export type TaskGetCommand = {
  user: User;
  taskId: string;
};
export function taskGetCommand(user: User, taskId: string): TaskGetCommand {
  return {
    user,
    taskId,
  };
}

export type TaskUpsertCommand = {
  user: User;
  taskId: string;
  content: string;
  completedAt: Date | null;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
};
export function taskUpsertCommand(
  user: User,
  taskId: string,
  content: string,
  completedAt: string | null,
  now: Date,
): TaskUpsertCommand {
  return {
    user,
    taskId,
    content,
    completedAt: completedAt ? new Date(completedAt) : null,
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  };
}
