"use client";

import { useEffect } from "react";
import { useAccount } from "@/lib/account";

/** Loads the signed-in account once per page load and when the tab regains focus. */
export function AccountSync() {
  const refresh = useAccount((s) => s.refresh);
  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);
  return null;
}
