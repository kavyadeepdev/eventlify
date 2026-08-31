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

/** One ruled line of the card, label on the left, value on a dotted leader. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="pass__field">
      <span className="pass__field-label">{label}:</span>
      <span className="pass__field-value">{value}</span>
    </div>
  );
}

/**
 * The student's identity card for AfterClass.
 *
 * Landscape, drawn like a sketchbook ID card: a coloured frame around paper,
 * a title chip, ruled fields on a dotted leader, a barcode, and a portrait
 * pinned in a dashed box. Sized so the whole card is on screen at once — see
 * `.pass` in globals.css.
 *
 * USN and photo are deliberately absent: there's no USN verification in place
 * yet, so the card carries only what can actually be trusted.
 */
export default function DigitalPass({
  name,
  clubs = [],
  issuedOn,
  animate = false,
  className,
}: DigitalPassProps) {
  const serial = String(
    Math.abs(
      [...name].reduce((total, character) => total + character.charCodeAt(0), 0)
    ) % 10000
  ).padStart(4, "0");

  return (
    <article
      className={cn("pass", animate && "pass--issuing", className)}
      aria-label={`AfterClass pass for ${name}`}
    >
      <div className="pass__paper">
        {/* Title row */}
        <div className="pass__top">
          <span className="pass__index">{serial.slice(0, 2)}</span>
          <span className="pass__chip">ID-CARD</span>
          <span aria-hidden="true" className="pass__dots">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="pass__body">
          {/* Ruled details */}
          <div className="pass__fields">
            <Field label="name" value={name} />
            <Field label="member since" value={issuedOn ?? "—"} />
            <Field
              label="clubs"
              value={clubs.length ? clubs.join(", ") : "coming soon"}
            />

            <div className="pass__barcode-wrap">
              <span aria-hidden="true" className="pass__barcode" />
              <span className="pass__serial">{serial} 0114</span>
            </div>
          </div>

          {/* Portrait, pinned in a dashed box */}
          <div className="pass__portrait-box">
            <span className="pass__portrait-tag">afterclass</span>
            <span className="pass__monogram display">{initials(name)}</span>
          </div>
        </div>
      </div>

      {/* Protocol stamp, pressed over the corner */}
      <span aria-hidden="true" className="pass__stamp">
        <span className="pass__stamp-frame">
          <ProtocolMark className="pass__stamp-mark" />
          <span className="pass__stamp-caption">Verified member</span>
        </span>
      </span>
    </article>
  );
}
