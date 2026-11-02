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
