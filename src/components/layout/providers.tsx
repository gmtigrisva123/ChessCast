"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SmoothScroll } from "./smooth-scroll";
import { Cursor } from "../ui/cursor";
import { Toaster } from "../commerce/toaster";
import { WalletDrawer } from "../commerce/wallet-drawer";
import { CheckoutModal } from "../commerce/checkout-modal";
import { AccountSync } from "../commerce/account-sync";
import { Preloader } from "./preloader";
import { CommandMenu } from "./command-menu";
import { liquidSupported } from "../ui/liquid-glass";

const Ambient = dynamic(() => import("../gl/ambient"), { ssr: false });

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (liquidSupported()) document.documentElement.classList.add("lg-on");
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <Ambient />
        <Preloader />
        {children}
        <Cursor />
        <Toaster />
        <WalletDrawer />
        <CheckoutModal />
        <AccountSync />
        <CommandMenu />
        <div className="grain" aria-hidden />
      </SmoothScroll>
    </MotionConfig>
  );
}
