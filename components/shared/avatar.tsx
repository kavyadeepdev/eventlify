import Image from "next/image";
import { initials, accentFor } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-8 text-[10px]",
  md: "size-11 text-xs",
  lg: "size-16 text-base",
};

export default function Avatar({
  name,
  image,
  size = "md",
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-ink font-bold",
        sizes[size],
        !image && accentFor(name),
        className
      )}
      title={name}
    >
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" sizes="64px" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
