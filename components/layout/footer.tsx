import Link from "next/link";
import { ArrowUpRight, Code2, Globe, Mail, MessageSquare } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "All events", href: "/events" },
      { label: "BMSCE clubs", href: "/clubs" },
      { label: "Open registrations", href: "/events?status=open" },
    ],
  },
  {
    title: "Your corner",
    links: [
      { label: "My pass", href: "/dashboard" },
      { label: "Sign in", href: "/login" },
      { label: "Publish an event", href: "/events/new" },
    ],
  },
];

const socials = [
  { label: "GitHub", href: "https://github.com", Icon: Code2 },
  { label: "Website", href: "https://example.com", Icon: Globe },
  { label: "Discord", href: "https://discord.gg", Icon: MessageSquare },
  { label: "Email", href: "mailto:hello@afterclass.app", Icon: Mail },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t-2 border-ink bg-ink text-white">
      <div className="absolute inset-0 opacity-[0.07] halftone" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-white/20 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-limepop">
              BMSCE culture, live
            </span>
            <p className="display mt-4 max-w-3xl text-5xl leading-[0.85] sm:text-7xl lg:text-8xl">
              See you out there.
            </p>
          </div>
          <Link
            href="/events"
            className="group flex size-24 shrink-0 items-center justify-center self-end rounded-full border-2 border-ink bg-limepop text-ink shadow-[5px_5px_0_white] transition-transform hover:-rotate-6 sm:size-28 md:self-auto"
          >
            <span className="text-center text-[10px] font-black uppercase tracking-wider">
              Find an
              <br />
              event
            </span>
            <ArrowUpRight className="ml-1 size-5 transition-transform group-hover:rotate-45" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-5">
          <div className="space-y-5 md:col-span-3">
            <Link href="/" className="inline-block text-4xl font-extrabold tracking-[-0.065em]">
              <span>After</span><span className="text-limepop">Class</span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-white/55">
              One place to discover BMSCE events, register with your crew and
              keep track of every good plan you made this semester.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  className="grid size-10 place-items-center rounded-full border border-white/25 text-white/70 transition-colors hover:border-limepop hover:bg-limepop hover:text-ink"
                >
                  <Icon className="size-4" />
                  <span className="sr-only">{label}</span>
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-limepop">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/58">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/20 pt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-white/38 sm:flex-row">
          <p>© {new Date().getFullYear()} AfterClass</p>
          <a href="mailto:hello@afterclass.app" className="hover:text-limepop">
            hello@afterclass.app
          </a>
          <p>Made for crowded calendars</p>
        </div>
      </div>
    </footer>
  );
}
