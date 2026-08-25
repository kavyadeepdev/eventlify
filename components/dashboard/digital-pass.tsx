import Image from "next/image";
import { IdCard, ShieldCheck } from "lucide-react";
import BmsceCrest from "@/components/brand/bmsce-crest";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DigitalPassProps {
  name: string;
  usn: string;
  image: string | null;
  /** Left blank until club membership is wired up. */
  clubs?: string[];
  issuedOn?: string;
  /** Plays the issue + stamp animation on mount. */
  animate?: boolean;
  className?: string;
}

/**
 * The student's identity card for AfterClass: picture, name, USN and the
 * clubs they're active in, finished with a BMSCE crest stamped over the
 * corner.
 */
export default function DigitalPass({
  name,
  usn,
  image,
  clubs = [],
  issuedOn,
  animate = false,
  className,
}: DigitalPassProps) {
  const isInlineImage = image?.startsWith("data:") ?? false;

  return (
    <article
      className={cn(
        "pass relative overflow-hidden rounded-3xl border-[3px] border-ink bg-ink text-paper shadow-[10px_10px_0_var(--color-ink)]",
        animate && "pass--issuing",
        className
      )}
    >
      {/* Guilloche-ish security texture */}
      <span aria-hidden="true" className="pass__texture" />

      <header className="relative flex items-center justify-between gap-3 border-b-2 border-paper/15 px-5 py-3">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-limepop">
          <IdCard className="size-3.5" />
          AfterClass pass
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">
          <ShieldCheck className="size-3.5" />
          BMSCE
        </span>
      </header>

      <div className="relative flex items-start gap-4 px-5 py-5 sm:gap-5">
        {/* Portrait */}
        <div className="pass__portrait relative size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-paper/25 bg-grape sm:size-28">
          {image ? (
            isInlineImage ? (
              // Uploaded pictures are inline data URLs, which the image
              // optimiser can't fetch — render them directly.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={image}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            )
          ) : (
            <span className="display grid size-full place-items-center text-3xl text-white">
              {initials(name)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45">
            Student
          </p>
          <h3 className="display mt-1 truncate text-3xl leading-none sm:text-4xl">
            {name}
          </h3>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45">
            USN
          </p>
          <p className="font-mono text-lg font-bold tracking-[0.14em] text-limepop">
            {usn}
          </p>
        </div>
      </div>

      {/* Clubs */}
      <div className="relative border-t-2 border-dashed border-paper/20 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/45">
          Active clubs
        </p>
        {clubs.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
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
          <p className="mt-2 text-sm text-paper/45">
            None yet — join a club and it shows up here.
          </p>
        )}
      </div>

      <footer className="relative flex items-center justify-between gap-3 border-t-2 border-paper/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/40">
        <span>Issued {issuedOn ?? "—"}</span>
        <span>afterclass.app</span>
      </footer>

      {/* Crest stamp */}
      <span aria-hidden="true" className="pass__stamp">
        <BmsceCrest className="size-full" />
      </span>
    </article>
  );
}
