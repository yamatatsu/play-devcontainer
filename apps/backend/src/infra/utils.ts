import { z } from "zod";

const errorWithCodeSchema = z.object({ code: z.string() });

export const isNotFoundError = (error: unknown): boolean => {
  const res = errorWithCodeSchema.safeParse(error);
  if (!res.success) {
    return false;
  }
  return res.data.code === "P2025";
};

export const getMetadata = (record: { createdAt: Date; updatedAt: Date }) => ({
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});
