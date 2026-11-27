import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

/** Requests to `/authorize` for each caller, in each period of seconds. */
export const AUTHORIZE_LIMIT = { limit: 30, period: 60 } as const;

/**
 * The key that a caller is counted under: its IPv4 address, or the /64 network of its IPv6
 * address, because one IPv6 host usually holds a whole /64.
 */
export const callerKey = (address: string | undefined): string => {
  if (address === undefined || address === "") {
    return "unknown";
  }
  if (!address.includes(":")) {
    return address;
  }
  const [head = "", tail] = address.toLowerCase().split("::");
  const left = head === "" ? [] : head.split(":");
  const right = tail === undefined || tail === "" ? [] : tail.split(":");
  const zeros = Array.from({ length: Math.max(0, 8 - left.length - right.length) }, () => "0");
  const groups = tail === undefined ? left : [...left, ...zeros, ...right];
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
};

/**
 * The broker behind a limit for each caller on `/authorize`, where each request can read a client's
 * file and store a client. `allow` counts one request of a key and says if it is inside the limit.
 */
export const limitAuthorize = <E, R, A>(
  allow: (key: string) => Effect.Effect<boolean, never, A>,
  fetch: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    if (request.url.split("?", 1)[0] !== "/authorize") {
      return yield* fetch;
    }
    if (yield* allow(callerKey(request.headers["cf-connecting-ip"]))) {
      return yield* fetch;
    }
    return HttpServerResponse.text("Too many sign-in requests from your network. Try again soon.", {
      status: 429,
      headers: { "retry-after": String(AUTHORIZE_LIMIT.period) },
    });
  });
