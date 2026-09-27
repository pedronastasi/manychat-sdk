// Invented data. Nothing here comes from a real ManyChat account.

export const PAGE = {
  id: 100000000000001,
  name: 'Example Studio',
  category: 'Education',
  avatar_link: 'https://example.com/avatar.png',
  username: 'example.studio',
  about: 'An invented page for tests.',
  description: 'An invented page for tests.',
  is_pro: true,
  timezone: 'UTC',
};

export const TAG = { id: 11, name: 'demo-lead' };

export const CUSTOM_FIELD = {
  id: 21,
  name: 'demo_shift',
  type: 'text',
  description: 'Which shift suits the contact.',
};

export const BOT_FIELD = {
  ...CUSTOM_FIELD,
  id: 31,
  name: 'demo_open_seats',
  type: 'number',
  value: 4,
};

export const GROWTH_TOOL = { id: 41, name: 'Demo link', type: 'ref_url' };

export const FLOWS = {
  flows: [{ ns: 'content00000000000000_000001', name: 'Demo brochure', folder_id: 51 }],
  folders: [{ id: 51, name: 'Demo folder', parent_id: 0 }],
};

export const OTN_TOPIC = { id: 61, name: 'Demo reminder', description: 'An invented topic.' };

/** A subscriber as ManyChat returns one for a WhatsApp contact: ids as strings, many nulls. */
export const SUBSCRIBER = {
  id: '900000001',
  page_id: '100000000000001',
  user_refs: [],
  first_name: 'Ada',
  last_name: null,
  name: 'Ada',
  gender: null,
  profile_pic: null,
  locale: 'en_US',
  language: 'English',
  timezone: 'UTC',
  live_chat_url: 'https://example.com/chat/900000001',
  last_input_text: 'hello',
  optin_phone: false,
  phone: null,
  optin_email: false,
  email: null,
  subscribed: '2026-01-01T10:00:00+00:00',
  last_interaction: '2026-01-02T10:00:00+00:00',
  last_seen: '2026-01-02T10:00:00+00:00',
  is_followup_enabled: true,
  ig_username: null,
  ig_id: null,
  whatsapp_phone: '+10000000000',
  whatsapp_bsuid: null,
  whatsapp_username: null,
  optin_whatsapp: true,
  custom_fields: [{ ...CUSTOM_FIELD, value: 'evening' }],
  tags: [TAG],
};
