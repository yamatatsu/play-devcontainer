import { z } from "zod";

export const jwtPayloadSchema = z.object({
  sub: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export type User = {
  userId: string;
};
