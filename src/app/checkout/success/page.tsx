import { Suspense } from "react";
import type { Metadata } from "next";
import { SuccessView } from "./success";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessView />
    </Suspense>
  );
}
