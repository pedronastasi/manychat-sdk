import { z } from 'zod';
import { ExternalId, FieldValue, list, nullable } from './common.ts';

export const Page = z.looseObject({
  id: ExternalId,
  name: z.string(),
  category: nullable(z.string()),
  avatar_link: nullable(z.string()),
  username: nullable(z.string()),
  about: nullable(z.string()),
  description: nullable(z.string()),
  is_pro: z.boolean(),
  timezone: nullable(z.string()),
});
export type Page = z.infer<typeof Page>;

export const Tag = z.looseObject({
  id: z.number(),
  name: z.string(),
});
export type Tag = z.infer<typeof Tag>;

export const CustomField = z.looseObject({
  id: z.number(),
  name: z.string(),
  /** One of `FieldType` today; a string so a new type ManyChat adds is not refused. */
  type: z.string(),
  description: nullable(z.string()),
});
export type CustomField = z.infer<typeof CustomField>;

export const BotField = CustomField.extend({
  value: nullable(FieldValue),
});
export type BotField = z.infer<typeof BotField>;

export const GrowthTool = z.looseObject({
  id: z.number(),
  name: z.string(),
  type: z.string(),
});
export type GrowthTool = z.infer<typeof GrowthTool>;

export const Flow = z.looseObject({
  /** The flow's namespace, which `sendFlow` takes as `flow_ns`. */
  ns: z.string(),
  name: z.string(),
  folder_id: nullable(z.number()),
});
export type Flow = z.infer<typeof Flow>;

export const Folder = z.looseObject({
  id: z.number(),
  name: z.string(),
  parent_id: nullable(z.number()),
});
export type Folder = z.infer<typeof Folder>;

export const Flows = z.looseObject({
  flows: list(Flow),
  folders: list(Folder),
});
export type Flows = z.infer<typeof Flows>;

export const OtnTopic = z.looseObject({
  id: z.number(),
  name: z.string(),
  description: nullable(z.string()),
});
export type OtnTopic = z.infer<typeof OtnTopic>;
