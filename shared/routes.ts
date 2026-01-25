import { z } from "zod";
import { insertGameStateSchema, gameStates } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  game: {
    load: {
      method: 'GET' as const,
      path: '/api/game/current',
      responses: {
        200: z.custom<typeof gameStates.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/game/current',
      input: insertGameStateSchema,
      responses: {
        200: z.custom<typeof gameStates.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};
