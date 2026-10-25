import { cn } from "@/lib/utils";

/**
 * Decorative mist: three large, heavily blurred radial clouds that drift slowly.
 * Pure CSS (server-safe); drifting stops under prefers-reduced-motion.
 */
export function Clouds({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={{ opacity: intensity }}>
      <div className="absolute -left-[12%] top-[2%] h-[62%] w-[58%] animate-drift rounded-full bg-[radial-gradient(closest-side,var(--cloud-a),transparent)] blur-3xl motion-reduce:animate-none" />
      <div className="absolute -right-[10%] top-[14%] h-[58%] w-[52%] animate-drift-slow rounded-full bg-[radial-gradient(closest-side,var(--cloud-c),transparent)] blur-3xl motion-reduce:animate-none" />
      <div className="absolute bottom-[-8%] left-[26%] h-[48%] w-[50%] animate-drift rounded-full bg-[radial-gradient(closest-side,var(--cloud-b),transparent)] blur-3xl [animation-delay:-9s] motion-reduce:animate-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
