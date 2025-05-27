import { z } from 'zod';

export const MediaSchema = z.object({
  id: z.number(),
  type: z.string(),
  tmdb_id: z.number(),
  external_identifier: z.string(),
  name: z.string(),
  poster: z.string(),
  backdrop: z.string(),
  online_available: z.boolean(),
});

export const MediaArraySchema = z.object({
  newMedia: z.array(MediaSchema).optional(),
  toggleMedia: z.array(MediaSchema).optional(),
});

export const ZProvider = z.object({
  name: z.string(),
  fetchData: z.function(),
  trending: z.function().optional(),
  schedule: z.string(),
});
