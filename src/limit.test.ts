import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { expect, test } from "vitest";
import { callerKey, limitAuthorize } from "./limit.ts";

test("an IPv6 caller is counted by its /64 network", () => {
  expect(callerKey("2001:db8:a:b:1:2:3:4")).toBe("2001:db8:a:b::/64");
  expect(callerKey("2001:DB8:a:b::ff")).toBe("2001:db8:a:b::/64");
  expect(callerKey("2001:db8::1")).toBe("2001:db8:0:0::/64");
  expect(callerKey("::1")).toBe("0:0:0:0::/64");
  expect(callerKey("203.0.113.7")).toBe("203.0.113.7");
  expect(callerKey(undefined)).toBe("unknown");
});

const run = (path: string, allowed: boolean) => {
  const counted: Array<string> = [];
  const handler = limitAuthorize(
    (key) =>
      Effect.sync(() => {
        counted.push(key);
        return allowed;
      }),
    Effect.succeed(HttpServerResponse.text("broker")),
  );
  const request = new Request(`https://login.example.com${path}`, {
    headers: { "cf-connecting-ip": "203.0.113.7" },
  });
  const response = Effect.runSync(
    handler.pipe(
      Effect.provideService(
        HttpServerRequest.HttpServerRequest,
        HttpServerRequest.fromWeb(request),
      ),
    ),
  );
  return { response, counted };
};

test("a caller over the limit on /authorize gets 429 with Retry-After", () => {
  const { response, counted } = run("/authorize?client_id=x", false);
  expect(response.status).toBe(429);
  expect(response.headers["retry-after"]).toBe("60");
  expect(counted).toEqual(["203.0.113.7"]);
});

test("a caller inside the limit reaches the broker", () => {
  expect(run("/authorize?client_id=x", true).response.status).toBe(200);
});

test("other paths are not counted", () => {
  const { response, counted } = run("/token", false);
  expect(response.status).toBe(200);
  expect(counted).toEqual([]);
});
