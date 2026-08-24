/** Placeholder grid used by route-level loading files. */
export default function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="brutal skeleton h-80 rounded-2xl"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}
