import type { HttpTransport, RequestOptions } from '../http/transport.ts';
import { NoData } from '../schemas/common.ts';
import type { Content } from './content.ts';
import type { SubscriberId, UserRef } from './params.ts';

export interface SendContentParams {
  subscriber_id: SubscriberId;
  data: Content;
  /**
   * Messenger only. Meta limits free-form messages to 24 hours after the
   * contact's last message; outside it, send a flow built on a template.
   */
  message_tag?: string;
  otn_topic_name?: string;
}

export interface SendContentByUserRefParams {
  user_ref: UserRef;
  data: Content;
}

export interface SendFlowParams {
  subscriber_id: SubscriberId;
  /** A flow's `ns`, as `page.getFlows` returns it. */
  flow_ns: string;
}

/** The `/fb/sending/*` endpoints. */
export class SendingApi {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  sendContent(params: SendContentParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/sending/sendContent', params, options);
  }

  sendContentByUserRef(
    params: SendContentByUserRefParams,
    options?: RequestOptions,
  ): Promise<void> {
    return this.command('/fb/sending/sendContentByUserRef', params, options);
  }

  sendFlow(params: SendFlowParams, options?: RequestOptions): Promise<void> {
    return this.command('/fb/sending/sendFlow', params, options);
  }

  private command(
    path: string,
    params: object,
    options: RequestOptions | undefined,
  ): Promise<void> {
    return this.transport.send({ method: 'POST', path, params, data: NoData, options });
  }
}
