import { z } from 'zod';

/**
 * Response schemas refuse a body only when it lacks something the return type
 * promises (ADR-0001). Everything else ManyChat may leave out, send as `null`,
 * or extend, so objects are loose and optional values normalise to `null`.
 */
export function nullable<Schema extends z.ZodType>(schema: Schema) {
  return schema.nullish().transform(value => value ?? null);
}

export function list<Schema extends z.ZodType>(item: Schema) {
  return z
    .array(item)
    .nullish()
    .transform(items => items ?? []);
}

/**
 * Subscriber, page and Instagram ids are documented as integers but returned as
 * strings, and some exceed `Number.MAX_SAFE_INTEGER`. Always a string here.
 */
export const ExternalId = z.union([z.string(), z.number()]).transform(String);

/** A custom or bot field value. Dates are `YYYY-MM-DD`, datetimes ISO 8601. */
export const FieldValue = z.union([z.string(), z.number(), z.boolean()]);
export type FieldValue = z.infer<typeof FieldValue>;

export type FieldType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

/** For endpoints that answer `{ "status": "success" }` and nothing else. */
export const NoData = z
  .unknown()
  .optional()
  .transform((): undefined => undefined);

export const ErrorBody = z.looseObject({
  status: z.literal('error'),
  message: z.string().optional(),
  code: z.number().optional(),
  details: z
    .looseObject({
      messages: z
        .array(z.looseObject({ message: z.string() }))
        .optional()
        .catch(undefined),
    })
    .optional()
    .catch(undefined),
});
