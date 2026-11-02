"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function LoginForm() {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "err">(sp.get("error") ? "err" : "idle");
  const sb = getSupabaseBrowser();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    setState("sending");
    const next = sp.get("next") ?? "/";
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setState(error ? "err" : "sent");
  }

  return (
    <section className="shell grid min-h-[80vh] place-items-center pt-28">
      <div className="glass-strong w-full max-w-md rounded-[28px] p-8">
        <div className="kicker text-fg-3">Your account</div>
        <h1 className="display mt-2 text-4xl">Sign in</h1>
        {!sb ? (
          <p className="mt-4 text-fg-2">
            Accounts are not configured on this deployment yet. Your wallet is saved in this browser.
          </p>
        ) : state === "sent" ? (
          <p className="mt-4 text-fg-2">
            Check <b className="text-fg">{email}</b> — we sent you a sign-in link.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block text-sm text-fg-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-fg outline-none focus:border-violet"
              placeholder="you@example.com"
            />
            {state === "err" && <p className="text-sm text-rose">Could not sign you in — please try again.</p>}
            <Button type="submit" disabled={state === "sending"} className="w-full">
              {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Email me a sign-in link
            </Button>
          </form>
        )}
        <ButtonLink href="/" variant="glass" className="mt-4 w-full">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
