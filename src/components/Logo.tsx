import Image from "next/image";

const SIZES = {
  // Home hero — 2x the original placement size.
  large: "h-[320px] w-[320px] sm:h-[448px] sm:w-[448px]",
  // Sidebar header — fills the column width (parent controls padding), height follows.
  full: "h-auto w-full",
} as const;

export default function Logo({
  size = "full",
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
