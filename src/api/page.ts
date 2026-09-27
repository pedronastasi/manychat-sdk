import { z } from 'zod';
import type { HttpTransport, RequestOptions } from '../http/transport.ts';
import { type FieldType, type FieldValue, NoData } from '../schemas/common.ts';
import { BotField, CustomField, Flows, GrowthTool, OtnTopic, Page, Tag } from '../schemas/page.ts';
import type { FieldAssignment } from './params.ts';

export interface CreateTagParams {
  name: string;
}

export interface RemoveTagParams {
  tag_id: number;
}

export interface RemoveTagByNameParams {
  tag_name: string;
}

export interface CreateCustomFieldParams {
  caption: string;
  type: FieldType;
  description?: string;
}

export interface CreateBotFieldParams {
  name: string;
  type: FieldType;
  description?: string;
  value?: FieldValue;
}

export interface SetBotFieldParams {
  field_id: number;
  field_value: FieldValue;
}

export interface SetBotFieldByNameParams {
  field_name: string;
  field_value: FieldValue;
}

export interface SetBotFieldsParams {
  fields: FieldAssignment[];
}

/** The `/fb/page/*` endpoints: account-wide objects, shared by every subscriber. */
export class PageApi {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  getInfo(options?: RequestOptions): Promise<Page> {
    return this.transport.send({ method: 'GET', path: '/fb/page/getInfo', data: Page, options });
  }

  createTag(params: CreateTagParams, options?: RequestOptions): Promise<Tag> {
    return this.transport.send({
      method: 'POST',
      path: '/fb/page/createTag',
      params,
      data: z.looseObject({ tag: Tag }).transform(created => created.tag),
      options,
    });
  }

  getTags(options?: RequestOptions): Promise<Tag[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getTags',
      data: z.array(Tag),
      options,
    });
  }

  /** Deletes the tag from the account, and so from every subscriber that has it. */
  removeTag(params: RemoveTagParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/page/removeTag', params, options);
  }

  /** Deletes the tag from the account, and so from every subscriber that has it. */
  removeTagByName(params: RemoveTagByNameParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/page/removeTagByName', params, options);
  }

  /** The same response as `getGrowthTools`, under its older name. */
  getWidgets(options?: RequestOptions): Promise<GrowthTool[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getWidgets',
      data: z.array(GrowthTool),
      options,
    });
  }

  getGrowthTools(options?: RequestOptions): Promise<GrowthTool[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getGrowthTools',
      data: z.array(GrowthTool),
      options,
    });
  }

  getFlows(options?: RequestOptions): Promise<Flows> {
    return this.transport.send({ method: 'GET', path: '/fb/page/getFlows', data: Flows, options });
  }

  createCustomField(
    params: CreateCustomFieldParams,
    options?: RequestOptions,
  ): Promise<CustomField> {
    return this.transport.send({
      method: 'POST',
      path: '/fb/page/createCustomField',
      params,
      data: z.looseObject({ field: CustomField }).transform(created => created.field),
      options,
    });
  }

  getCustomFields(options?: RequestOptions): Promise<CustomField[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getCustomFields',
      data: z.array(CustomField),
      options,
    });
  }

  getOtnTopics(options?: RequestOptions): Promise<OtnTopic[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getOtnTopics',
      data: z.array(OtnTopic),
      options,
    });
  }

  getBotFields(options?: RequestOptions): Promise<BotField[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/page/getBotFields',
      data: z.array(BotField),
      options,
    });
  }

  createBotField(params: CreateBotFieldParams, options?: RequestOptions): Promise<BotField> {
    return this.transport.send({
      method: 'POST',
      path: '/fb/page/createBotField',
      params,
      data: z.looseObject({ field: BotField }).transform(created => created.field),
      options,
    });
  }

  /**
   * Bot fields are account-wide: every subscriber reads the same value. For a
   * value that belongs to one contact, use `subscriber.setCustomField`.
   */
  setBotField(params: SetBotFieldParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/page/setBotField', params, options);
  }

  /** Account-wide, like `setBotField`. */
  setBotFieldByName(params: SetBotFieldByNameParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/page/setBotFieldByName', params, options);
  }

  /** Account-wide, like `setBotField`. */
  setBotFields(params: SetBotFieldsParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/page/setBotFields', params, options);
  }

  private command(
    path: string,
    params: object,
    options: RequestOptions | undefined,
  ): Promise<void> {
    return this.transport.send({ method: 'POST', path, params, data: NoData, options });
  }
}
