import type { FieldValue } from '../schemas/common.ts';

/**
 * The message payload `sendContent` takes: ManyChat's Dynamic Block v2 format.
 * Typed rather than validated. ManyChat validates it and answers with a
 * `ManyChatApiError` naming what it refused.
 */
export interface Content {
  version: 'v2';
  content: {
    /** Omitted for Messenger. */
    type?: 'whatsapp' | 'instagram' | 'telegram' | (string & {});
    messages: Message[];
    actions?: Action[];
    quick_replies?: QuickReply[];
  };
}

export type Message =
  | { type: 'text'; text: string; buttons?: Button[] }
  | { type: 'image'; url: string; buttons?: Button[] }
  | { type: 'video'; url: string; buttons?: Button[] }
  | { type: 'audio'; url: string }
  | { type: 'file'; url: string }
  | { type: 'cards'; elements: Card[]; image_aspect_ratio?: 'horizontal' | 'square' };

export interface Card {
  title: string;
  subtitle?: string;
  image_url?: string;
  action_url?: string;
  buttons?: Button[];
}

export type Button =
  | { type: 'url'; caption: string; url: string }
  | { type: 'call'; caption: string; phone: string }
  | { type: 'flow'; caption: string; target: string }
  | { type: 'node'; caption: string; target: string };

export type QuickReply =
  | { type: 'flow'; caption: string; target: string }
  | { type: 'node'; caption: string; target: string };

export type Action =
  | { action: 'add_tag'; tag_name: string }
  | { action: 'remove_tag'; tag_name: string }
  | { action: 'set_field_value'; field_name: string; value: FieldValue }
  | { action: 'unset_field_value'; field_name: string };
