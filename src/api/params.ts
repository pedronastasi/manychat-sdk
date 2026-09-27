import type { FieldValue } from '../schemas/common.ts';

/**
 * ManyChat documents subscriber ids as integers and returns them as strings.
 * Either is accepted and sent as given.
 */
export type SubscriberId = string | number;

/** Pass a string: user refs can exceed `Number.MAX_SAFE_INTEGER`. */
export type UserRef = string | number;

/** A field named by id or by name, never both. */
export type FieldRef =
  { field_id: number; field_name?: never } | { field_name: string; field_id?: never };

export type FieldAssignment = FieldRef & { field_value: FieldValue };
