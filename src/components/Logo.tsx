import Image from "next/image";

const SIZES = {
  // Home hero — 2x the original placement size.
  large: "h-[320px] w-[320px] sm:h-[448px] sm:w-[448px]",
  // Other pages — 1.5x smaller than the original placement size.
  compact: "h-[107px] w-[107px] sm:h-[149px] sm:w-[149px]",
} as const;

export default function Logo({ size = "compact" }: { size?: keyof typeof SIZES }) {
  return (
    <div className="flex justify-center">
      <Image
        src="/captain-amk-logo.PNG"
        alt="Captain AMK — ton super-pouvoir, c'est la NGAP"
        width={448}
        height={448}
        priority={size === "large"}
        className={SIZES[size]}
      />
    </div>
  );
}
