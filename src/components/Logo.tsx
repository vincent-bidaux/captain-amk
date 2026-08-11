import Image from "next/image";

const SIZES = {
  // Home hero — 2x the original placement size.
  large: "h-[320px] w-[320px] sm:h-[448px] sm:w-[448px]",
  // Sidebar header, next to the title — small enough to sit inline with text.
  tiny: "h-10 w-10",
} as const;

export default function Logo({
  size = "tiny",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Image
      src="/captain-amk-logo.PNG"
      alt="Captain AMK — ton super-pouvoir, c'est la NGAP"
      width={448}
      height={448}
      priority={size === "large"}
      className={`${SIZES[size]} ${className}`}
    />
  );
}
