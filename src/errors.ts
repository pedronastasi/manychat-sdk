/** Base class of every error this SDK throws. */
export class ManyChatError extends Error {
  /**
   * Whether repeating the request could succeed. Not whether repeating it is
   * safe: a `sendFlow` that timed out may already have reached the contact.
   */
  readonly retryable: boolean;

  constructor(message: string, retryable: boolean, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ManyChatError';
    this.retryable = retryable;
  }
}

export interface ManyChatApiErrorInit {
  endpoint: string;
  status: number;
  message: string;
  code: number | undefined;
  details: readonly string[];
}

/** ManyChat answered, and the answer was an error. */
export class ManyChatApiError extends ManyChatError {
  readonly endpoint: string;
  /** HTTP status. ManyChat sometimes reports an error with a 200. */
  readonly status: number;
  /** ManyChat's own error code, when it sends one. */
  readonly code: number | undefined;
  /** ManyChat's per-item messages, such as which field failed validation. */
  readonly details: readonly string[];

  constructor(init: ManyChatApiErrorInit) {
    super(
      `ManyChat ${init.endpoint} failed with ${init.status}: ${init.message}`,
      init.status === 429 || init.status >= 500,
    );
    this.name = 'ManyChatApiError';
    this.endpoint = init.endpoint;
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
  }
}

/** ManyChat reported success with a body this SDK cannot read as the promised type. */
export class ManyChatResponseError extends ManyChatError {
  readonly endpoint: string;

  constructor(endpoint: string, problem: string, options?: ErrorOptions) {
    super(`ManyChat ${endpoint} returned an unexpected response: ${problem}`, false, options);
    this.name = 'ManyChatResponseError';
    this.endpoint = endpoint;
  }
}

export type ConnectionFailure = 'timeout' | 'aborted' | 'network';

/** No answer arrived: the request timed out, was aborted, or never connected. */
export class ManyChatConnectionError extends ManyChatError {
  readonly endpoint: string;
  readonly reason: ConnectionFailure;

  constructor(endpoint: string, reason: ConnectionFailure, options?: ErrorOptions) {
    super(`ManyChat ${endpoint} did not respond: ${reason}`, reason !== 'aborted', options);
    this.name = 'ManyChatConnectionError';
    this.endpoint = endpoint;
    this.reason = reason;
  }
}
