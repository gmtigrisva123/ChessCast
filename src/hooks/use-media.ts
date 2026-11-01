"use client";
import { useEffect, useState } from "react";

export function useMedia(query: string, fallback = false) {
  const [v, setV] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setV(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return v;
}
