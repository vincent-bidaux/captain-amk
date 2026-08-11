"use client";

import Logo from "@/components/Logo";
import CotationFlow from "@/components/tree/CotationFlow";
import { useWorkState } from "@/lib/ui/workState";

export default function Home() {
  const { expanded } = useWorkState();

  return (
    <div className="flex flex-1 flex-col items-center">
      {!expanded && (
        <div className="mt-6">
          <Logo size="large" />
        </div>
      )}
      <CotationFlow />
    </div>
  );
}
