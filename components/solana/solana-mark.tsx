import { cn } from "@/lib/utils";

export function SolanaMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("inline-flex size-11 items-center justify-center rounded-2xl bg-[#11110f]", className)}>
      <svg aria-hidden="true" className={cn("h-5 w-6", iconClassName)} viewBox="0 0 24 20" fill="none">
        <path d="M5.1 1.2h17.4l-3.6 3.6H1.5l3.6-3.6Z" fill="#8C66FF" />
        <path d="M5.1 8.2h17.4l-3.6 3.6H1.5l3.6-3.6Z" fill="#58D8B0" />
        <path d="M5.1 15.2h17.4l-3.6 3.6H1.5l3.6-3.6Z" fill="#A6F2D4" />
      </svg>
    </span>
  );
}
