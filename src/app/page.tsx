import Image from "next/image";
import CotationFlow from "@/components/tree/CotationFlow";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-6 flex justify-center">
        <Image
          src="/captain-amk-logo.PNG"
          alt="Captain AMK — ton super-pouvoir, c'est la NGAP"
          width={220}
          height={220}
          priority
          className="h-40 w-40 sm:h-56 sm:w-56"
        />
      </div>
      <CotationFlow />
    </div>
  );
}
