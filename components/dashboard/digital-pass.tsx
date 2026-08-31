import { IdCard, ShieldCheck } from "lucide-react";
import ProtocolMark from "@/components/brand/protocol-mark";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DigitalPassProps {
  name: string;
  /** Left blank until club membership is wired up. */
  clubs?: string[];
  issuedOn?: string;
  /** Plays the issue + stamp animation on mount. */
  animate?: boolean;
  className?: string;
}

/**
 * The student's identity card for AfterClass.
 *
 * Portrait, and sized so the whole card fits on a phone screen without
 * scrolling — see `.pass` in globals.css. USN and photo are deliberately
 * absent: there's no USN verification in place yet, so the card carries only
 * what can actually be trusted.
 */
export default function DigitalPass({
  name,
  clubs = [],
  issuedOn,
  animate = false,
  className,
}: DigitalPassProps) {
  return (
    <article
      className={cn(
        "pass relative flex flex-col overflow-hidden rounded-3xl border-[3px] border-ink bg-ink text-paper shadow-[10px_10px_0_var(--color-ink)]",
        animate && "pass--issuing",
        className
      )}
    >
      {/* Guilloche-ish security texture */}
      <span aria-hidden="true" className="pass__texture" />

      <header className="relative flex items-center justify-between gap-3 border-b-2 border-paper/15 px-5 py-3">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-limepop">
          <IdCard className="size-3.5" />
          AfterClass
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">
          <ShieldCheck className="size-3.5" />
          Member
        </span>
      </header>

      {/* Monogram + name */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-5 py-6 text-center">
        <span className="pass__monogram display grid size-24 place-items-center rounded-2xl border-2 border-paper/25 bg-grape text-3xl text-white">
          {initials(name)}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45">
            Student
          </p>
          <h3 className="display mt-1.5 text-4xl leading-[0.95] break-words">
            {name}
          </h3>
        </div>
      </div>

      {/* Protocol stamp — a band of its own, so it never lands on the text */}
      <div className="relative flex items-center justify-center px-6 pb-1">
        <span aria-hidden="true" className="pass__stamp">
          <ProtocolMark className="w-full" />
        </span>
      </div>

      {/* Clubs */}
      <div className="relative border-t-2 border-dashed border-paper/20 px-5 py-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45">
          Active clubs
        </p>
        {clubs.length ? (
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {clubs.map((club) => (
              <li
                key={club}
                className="rounded-full border-2 border-limepop/60 px-3 py-1 text-xs font-bold uppercase tracking-wide text-limepop"
              >
                {club}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1.5 text-sm text-paper/45">Coming soon</p>
        )}
      </div>

      <footer className="relative flex items-center justify-between gap-3 border-t-2 border-paper/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/40">
        <span>Issued {issuedOn ?? "—"}</span>
        <span>afterclass.app</span>
      </footer>
    </article>
  );
}
