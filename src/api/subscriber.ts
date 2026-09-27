import { z } from 'zod';
import type { HttpTransport, RequestOptions } from '../http/transport.ts';
import { type FieldValue, NoData } from '../schemas/common.ts';
import { Subscriber } from '../schemas/subscriber.ts';
import type { FieldAssignment, SubscriberId, UserRef } from './params.ts';

export interface GetInfoParams {
  subscriber_id: SubscriberId;
}

export interface FindByNameParams {
  name: string;
}

export interface GetInfoByUserRefParams {
  user_ref: UserRef;
}

export interface FindByCustomFieldParams {
  field_id: number;
  field_value: FieldValue;
}

export type FindBySystemFieldParams =
  { email: string; phone?: never } | { phone: string; email?: never };

export interface TagByIdParams {
  subscriber_id: SubscriberId;
  tag_id: number;
}

export interface TagByNameParams {
  subscriber_id: SubscriberId;
  tag_name: string;
}

export interface SetCustomFieldParams {
  subscriber_id: SubscriberId;
  field_id: number;
  field_value: FieldValue;
}

export interface SetCustomFieldByNameParams {
  subscriber_id: SubscriberId;
  field_name: string;
  field_value: FieldValue;
}

export interface SetCustomFieldsParams {
  subscriber_id: SubscriberId;
  fields: FieldAssignment[];
}

export interface VerifyBySignedRequestParams {
  subscriber_id: SubscriberId;
  signed_request: string;
}

export interface SubscriberProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  has_opt_in_sms?: boolean;
  has_opt_in_email?: boolean;
  /** Required by ManyChat whenever an opt-in is set. */
  consent_phrase?: string;
}

export interface CreateSubscriberParams extends SubscriberProfile {
  whatsapp_phone?: string;
}

export interface UpdateSubscriberParams extends SubscriberProfile {
  subscriber_id: SubscriberId;
}

/** The `/fb/subscriber/*` endpoints: one contact at a time. */
export class SubscriberApi {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  getInfo(params: GetInfoParams, options?: RequestOptions): Promise<Subscriber> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/subscriber/getInfo',
      params,
      data: Subscriber,
      options,
    });
  }

  findByName(params: FindByNameParams, options?: RequestOptions): Promise<Subscriber[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/subscriber/findByName',
      params,
      data: z.array(Subscriber),
      options,
    });
  }

  getInfoByUserRef(params: GetInfoByUserRefParams, options?: RequestOptions): Promise<Subscriber> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/subscriber/getInfoByUserRef',
      params,
      data: Subscriber,
      options,
    });
  }

  findByCustomField(
    params: FindByCustomFieldParams,
    options?: RequestOptions,
  ): Promise<Subscriber[]> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/subscriber/findByCustomField',
      params,
      data: z.array(Subscriber),
      options,
    });
  }

  /** Resolves to `null` when no subscriber has that email or phone. */
  findBySystemField(
    params: FindBySystemFieldParams,
    options?: RequestOptions,
  ): Promise<Subscriber | null> {
    return this.transport.send({
      method: 'GET',
      path: '/fb/subscriber/findBySystemField',
      params,
      data: Subscriber.nullish().transform(found => found ?? null),
      options,
    });
  }

  addTag(params: TagByIdParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/addTag', params, options);
  }

  addTagByName(params: TagByNameParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/addTagByName', params, options);
  }

  removeTag(params: TagByIdParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/removeTag', params, options);
  }

  removeTagByName(params: TagByNameParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/removeTagByName', params, options);
  }

  setCustomField(params: SetCustomFieldParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/setCustomField', params, options);
  }

  setCustomFields(params: SetCustomFieldsParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/subscriber/setCustomFields', params, options);
  }

  setCustomFieldByName(
    params: SetCustomFieldByNameParams,
    options?: RequestOptions,
  ): Promise<void> {
    return this.command('/fb/subscriber/setCustomFieldByName', params, options);
  }

  verifyBySignedRequest(
    params: VerifyBySignedRequestParams,
    options?: RequestOptions,
  ): Promise<void> {
    return this.command('/fb/subscriber/verifyBySignedRequest', params, options);
  }

  createSubscriber(params: CreateSubscriberParams, options?: RequestOptions): Promise<Subscriber> {
    return this.transport.send({
      method: 'POST',
      path: '/fb/subscriber/createSubscriber',
      params,
      data: Subscriber,
      options,
    });
  }

  updateSubscriber(params: UpdateSubscriberParams, options?: RequestOptions): Promise<Subscriber> {
    return this.transport.send({
      method: 'POST',
      path: '/fb/subscriber/updateSubscriber',
      params,
      data: Subscriber,
      options,
    });
  }

  private command(
    path: string,
    params: object,
    options: RequestOptions | undefined,
  ): Promise<void> {
    return this.transport.send({ method: 'POST', path, params, data: NoData, options });
  }
}
