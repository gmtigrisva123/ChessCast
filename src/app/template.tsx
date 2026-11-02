"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(14px)", scale: 0.985 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transitionEnd: { filter: "none" } }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "50% 0%" }}
    >
      {children}
    </motion.div>
  );
}
