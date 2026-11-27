// The stack of the public identity broker, with one stage: `prod` deploys the Worker of src/broker.ts
// at https://login.samebase.com. The stack is named after the repository; its state is in the
// team's Convex store (`alchemy-state-store`). A run needs CONVEX_ACCESS_TOKEN,
// CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and the broker's secrets GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET and IDENTITY_BROKER_KEYS.
import { execFileSync } from "node:child_process";
import process from "node:process";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Convex from "@samebase/alchemy-convex";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";
import Broker from "./src/broker.ts";

/** The GitHub repository, `owner/name`: GITHUB_REPOSITORY in Actions, else the origin remote. */
const repository =
  process.env["GITHUB_REPOSITORY"] ??
  /[:/]([^/:]+\/[^/]+?)(?:\.git)?$/.exec(
    execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim(),
  )?.[1];
if (repository === undefined) {
  throw new Error("Set GITHUB_REPOSITORY to owner/name: the origin remote names no repository.");
}

export default Alchemy.Stack(
  repository,
  { providers: Cloudflare.providers(), state: Convex.withRunRecord(Convex.state()) },
  Effect.gen(function* () {
    const { stage } = yield* Alchemy.Stack;
    // One stage: Google accepts only the exact callback address of login.samebase.com.
    if (stage !== "prod") {
      throw new Error(`This stack has one stage, prod. The stage ${stage} is not deployed.`);
    }
    const broker = yield* Broker;
    return { url: broker.url };
  }),
);
