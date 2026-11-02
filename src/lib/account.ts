"use client";

import { create } from "zustand";
import type { PlanId } from "./catalog";
import { useWallet } from "./store";

type WalletResponse = {
  enabled: boolean;
  signedIn: boolean;
  email?: string | null;
  coins?: number;
  plan?: PlanId;
  planRenewsAt?: number | null;
};

type AccountState = {
  enabled: boolean;
  email: string | null;
  loaded: boolean;
  /** Pulls the server wallet; when signed in it becomes the source of truth for coins and plan. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAccount = create<AccountState>()((set) => ({
  enabled: false,
  email: null,
  loaded: false,
  refresh: async () => {
    try {
      const r = await fetch("/api/wallet", { cache: "no-store" });
      const j = (await r.json()) as WalletResponse;
      set({ enabled: j.enabled, email: j.signedIn ? (j.email ?? "") : null, loaded: true });
      if (j.signedIn) {
        useWallet.setState({
          coins: j.coins ?? 0,
          plan: j.plan ?? "free",
          planRenewsAt: j.planRenewsAt ?? null,
        });
      }
    } catch {
      set({ loaded: true });
    }
  },
  signOut: async () => {
    await fetch("/auth/signout", { method: "POST" }).catch(() => null);
    set({ email: null });
  },
}));

export type SpendRequest = { kind: "card"; id: string } | { kind: "tip"; amount: number; target: string };

/**
 * Mirrors a local spend on the server for signed-in users. The UI stays instant; the server's
 * answer (new balance, or a refusal) then becomes the balance shown.
 */
export function chargeServer(body: SpendRequest) {
  if (useAccount.getState().email === null) return;
  void fetch("/api/wallet/spend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(async (r) => {
      const j = (await r.json().catch(() => null)) as { coins?: number } | null;
      if (typeof j?.coins === "number") useWallet.setState({ coins: j.coins });
      else useAccount.getState().refresh();
    })
    .catch(() => useAccount.getState().refresh());
}

/** Server-side jury reward for signed-in users (paid once per case). */
export function rewardCourtVote(caseId: string) {
  if (useAccount.getState().email === null) return;
  void fetch("/api/wallet/court-vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId }),
  })
    .then(async (r) => {
      const j = (await r.json().catch(() => null)) as { coins?: number } | null;
      if (typeof j?.coins === "number") useWallet.setState({ coins: j.coins });
    })
    .catch(() => null);
}
