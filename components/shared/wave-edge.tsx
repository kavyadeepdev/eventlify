import { cn } from "@/lib/utils";

const SCALLOP = 56;
const COUNT = 32;
const WIDTH = SCALLOP * COUNT;
const DEPTH = 26;

/** One scalloped run: a quadratic bulge per segment, left to right. */
const curve = Array.from({ length: COUNT }, (_, index) => {
  const controlX = index * SCALLOP + SCALLOP / 2;
  const endX = (index + 1) * SCALLOP;
  return `Q ${controlX} ${DEPTH * 2} ${endX} 0`;
}).join(" ");

const path = `M 0 0 ${curve}`;

interface WaveEdgeProps {
  /** Colour of the scallops — usually the section above. */
  fill: string;
  /** Background behind the scallops, i.e. the section below. */
  className?: string;
  flip?: boolean;
}

/**
 * Scalloped divider between two colour blocks: the section above spills into
 * the one below in a run of lobes, outlined in ink.
 */
export default function WaveEdge({ fill, className, flip }: WaveEdgeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative h-6 w-full overflow-hidden sm:h-7", className)}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${DEPTH}`}
        preserveAspectRatio="none"
        className={cn("absolute inset-0 h-full w-full", flip && "rotate-180")}
      >
        <path d={`${path} Z`} fill={fill} />
        <path
          d={path}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
