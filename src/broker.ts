// The broker Worker: `@samebase/identity-broker` with Google and the Client ID Metadata Document
// layer for any host, behind a limit for each caller on `/authorize` (src/limit.ts). The signing
// keys are the package's default, the secret IDENTITY_BROKER_KEYS. `alchemy deploy` binds the three
// secrets to the Worker from the deploying shell's variables of the same names; alchemy.run.ts binds
// the moderation key, which the broker reads in each request.
import * as Cloudflare from "@alchemy.run/cloudflare";
import { identityBroker } from "@samebase/identity-broker";
import { DurableObjectStore, brokerWorkerProps } from "@samebase/identity-broker/cloudflare";
import * as Connectors from "@samebase/identity-broker/connectors";
import { moderation } from "@samebase/identity-broker/moderation";
import * as Registration from "@samebase/identity-broker/registration";
import { Config, Effect } from "effect";
import { AUTHORIZE_LIMIT, limitAuthorize } from "./limit.ts";

const ISSUER = "https://login.samebase.com";

export default class Broker extends Cloudflare.Worker<Broker>()(
  "Broker",
  {
    ...brokerWorkerProps,
    main: import.meta.url,
    // With the Durable Object's class and instance names, the address of all the broker's data.
    name: "public-identity-broker",
    domain: "login.samebase.com",
    workersDev: false,
  },
  Effect.gen(function* () {
    const limit = yield* Cloudflare.RateLimit("AUTHORIZE_LIMIT", {
      // Unique in the Cloudflare account: Workers that share an id share the counters.
      namespaceId: 4401,
      simple: AUTHORIZE_LIMIT,
    });
    const broker = yield* identityBroker({
      issuer: ISSUER,
      connectors: [
        Connectors.google({
          clientId: Config.Redacted("GOOGLE_CLIENT_ID"),
          clientSecret: Config.Redacted("GOOGLE_CLIENT_SECRET"),
        }),
      ],
      registration: Registration.clientIdMetadataDocuments(),
      moderation: moderation({ key: Config.Redacted("IDENTITY_BROKER_MODERATION_KEY") }),
      service: {
        name: "Samebase",
        terms: "https://samebase.com/terms",
        privacy: "https://samebase.com/privacy",
      },
    });
    return {
      fetch: limitAuthorize(
        (key) =>
          limit.limit({ key }).pipe(
            Effect.map((outcome) => outcome.success),
            // The limiter is down: let the request in. The broker's own budgets still hold.
            Effect.orElseSucceed(() => true),
          ),
        broker.fetch,
      ),
    };
  }).pipe(Effect.provide(DurableObjectStore), Effect.provide(Cloudflare.Workers.RateLimitBinding)),
) {}
