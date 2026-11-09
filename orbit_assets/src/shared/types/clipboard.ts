import { z } from 'zod';

/** One remembered copy, as the Clipboard tab sees it (images arrive as a small preview). */
export const clipItemSchema = z.object({
  id: z.string().max(64),
  kind: z.enum(['text', 'link', 'image']),
  text: z.string().max(100_000),
  /** A data: URL preview for images. */
  preview: z.string().nullable(),
  createdAt: z.number(),
});
export type ClipItem = z.output<typeof clipItemSchema>;

export const clipboardStateSchema = z.object({
  enabled: z.boolean(),
  items: z.array(clipItemSchema),
});
export type ClipboardState = z.output<typeof clipboardStateSchema>;
