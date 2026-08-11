import Logo from "@/components/Logo";
import CotationFlow from "@/components/tree/CotationFlow";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-6">
        <Logo size="large" />
      </div>
      <CotationFlow />
    </div>
  );
}
