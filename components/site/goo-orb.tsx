"use client";

import { motion, useReducedMotion } from "motion/react";
import { GooFilter, gooStyle, useGooId } from "@/components/motion/goo";

const BLOBS = [
  { size: 150, x: [0, 40, -20, 0], y: [0, -30, 20, 0], color: "#9945ff", d: 11 },
  { size: 120, x: [70, 10, 90, 70], y: [40, 80, 10, 40], color: "#14f195", d: 13 },
  { size: 90, x: [-80, -30, -100, -80], y: [50, 10, 70, 50], color: "#8ae9ff", d: 9 },
  { size: 60, x: [20, 110, 40, 20], y: [-90, -40, -120, -90], color: "#9945ff", d: 8 },
  { size: 44, x: [-60, -120, -20, -60], y: [-70, -20, -100, -70], color: "#14f195", d: 7 },
];

/** Decorative metaball cluster for the hero. Static under reduced motion. */
export function GooOrb({ className }: { className?: string }) {
  const id = useGooId("hero-orb");
  const reduce = useReducedMotion();
  return (
    <div aria-hidden="true" className={className}>
      <GooFilter blur={18} contrast={24} id={id} threshold={-10} />
      <div className="relative grid size-full place-items-center" style={gooStyle(id)}>
        {BLOBS.map((blob, i) => (
          <motion.span
            animate={reduce ? undefined : { x: blob.x, y: blob.y }}
            className="absolute rounded-full"
            initial={{ x: blob.x[0], y: blob.y[0] }}
            key={i}
            style={{ width: blob.size, height: blob.size, background: blob.color }}
            transition={{ duration: blob.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
