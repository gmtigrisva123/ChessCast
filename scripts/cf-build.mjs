// Build the Cloudflare bundle without dev-only secrets.
//
// `@opennextjs/cloudflare` generates `.open-next/cloudflare/next-env.mjs` with the
// production AND development env maps, so anything in `.env.development.local`
// (SUPABASE_SECRET_KEY, Stripe keys…) would be uploaded inside worker.js even though
// only the production map is ever read. Production secrets come from
// `wrangler secret put`, so we hide the dev file for the duration of the build.
import { execFileSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";

const DEV_ENV = ".env.development.local";
const PARKED = ".env.development.local.build-hidden";
const hide = existsSync(DEV_ENV);

if (hide) renameSync(DEV_ENV, PARKED);
try {
  execFileSync("opennextjs-cloudflare", process.argv.slice(2), {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
} finally {
  if (hide) renameSync(PARKED, DEV_ENV);
}
