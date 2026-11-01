"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlanId } from "./catalog";
import { uid } from "./utils";

export type Order = {
  id: string;
  label: string;
  amount: number; // VND
  coins: number;
  createdAt: number;
  provider: "stripe" | "demo";
};

export type Clip = {
  id: string;
  title: string;
  san: string;
  host: string;
  createdAt: number;
  fen: string;
};

export type Toast = {
  id: string;
  title: string;
  body?: string;
  tone?: "lime" | "pink" | "cyan" | "neutral";
};

type WalletState = {
  username: string;
  coins: number;
  plan: PlanId;
  planRenewsAt: number | null;
  orders: Order[];
  clips: Clip[];
  courtVotes: Record<string, "guilty" | "innocent">;
  royaleRegistered: boolean;
  processedSessions: string[];
  setUsername: (name: string) => void;
  spend: (amount: number) => boolean;
  credit: (amount: number) => void;
  purchase: (o: Omit<Order, "id" | "createdAt">, sessionId?: string) => boolean;
  setPlan: (plan: PlanId, cycle: "monthly" | "yearly") => void;
  addClip: (c: Omit<Clip, "id" | "createdAt">) => void;
  removeClip: (id: string) => void;
  vote: (caseId: string, v: "guilty" | "innocent") => void;
  registerRoyale: () => void;
};

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      username: "khach_" + Math.random().toString(36).slice(2, 6),
      coins: 300,
      plan: "free",
      planRenewsAt: null,
      orders: [],
      clips: [],
      courtVotes: {},
      royaleRegistered: false,
      processedSessions: [],
      setUsername: (username) => set({ username }),
      spend: (amount) => {
        if (get().coins < amount) return false;
        set({ coins: get().coins - amount });
        return true;
      },
      credit: (amount) => set({ coins: get().coins + amount }),
      purchase: (o, sessionId) => {
        if (sessionId && get().processedSessions.includes(sessionId)) return false;
        set({
          coins: get().coins + o.coins,
          orders: [{ ...o, id: uid("ord"), createdAt: Date.now() }, ...get().orders].slice(0, 50),
          processedSessions: sessionId ? [...get().processedSessions, sessionId] : get().processedSessions,
        });
        return true;
      },
      setPlan: (plan, cycle) =>
        set({
          plan,
          planRenewsAt: plan === "free" ? null : Date.now() + (cycle === "yearly" ? 365 : 30) * 86400_000,
        }),
      addClip: (c) =>
        set({ clips: [{ ...c, id: uid("clip"), createdAt: Date.now() }, ...get().clips].slice(0, 40) }),
      removeClip: (id) => set({ clips: get().clips.filter((c) => c.id !== id) }),
      vote: (caseId, v) => set({ courtVotes: { ...get().courtVotes, [caseId]: v } }),
      registerRoyale: () => set({ royaleRegistered: true }),
    }),
    {
      name: "chesscast-wallet",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

type UIState = {
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  walletOpen: boolean;
  setWalletOpen: (v: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  checkout: null | { kind: "coin" | "plan"; id: string; cycle?: "monthly" | "yearly" };
  openCheckout: (c: UIState["checkout"]) => void;
};

export const useUI = create<UIState>()((set, get) => ({
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  walletOpen: false,
  setWalletOpen: (walletOpen) => set({ walletOpen }),
  toasts: [],
  toast: (t) => {
    const id = uid("t");
    set({ toasts: [...get().toasts, { ...t, id }].slice(-4) });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
  checkout: null,
  openCheckout: (checkout) => set({ checkout }),
}));
