"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SmoothScroll } from "./smooth-scroll";
import { Cursor } from "../ui/cursor";
import { Toaster } from "../commerce/toaster";
import { WalletDrawer } from "../commerce/wallet-drawer";
import { CheckoutModal } from "../commerce/checkout-modal";
import { Preloader } from "./preloader";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <Preloader />
        {children}
        <Cursor />
        <Toaster />
        <WalletDrawer />
        <CheckoutModal />
        <div className="grain" aria-hidden />
      </SmoothScroll>
    </MotionConfig>
  );
}
