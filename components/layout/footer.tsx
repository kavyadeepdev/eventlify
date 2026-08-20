import Link from "next/link";
import { Heart, Code2, MessageSquare, Globe, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-24 py-12 text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              CP
            </div>
            <span className="text-base font-bold text-foreground">Campus Pulse</span>
          </div>
          <p className="text-xs leading-relaxed">
            The platform for campus club discovery, events, workshops, and competitive hackathons.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">Home Page</Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-foreground transition-colors">All Events</Link>
            </li>
            <li>
              <Link href="/clubs" className="hover:text-foreground transition-colors">Partnered Clubs</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/events?category=Hackathon" className="hover:text-foreground transition-colors">Hackathons</Link></li>
            <li><Link href="/events?category=Workshop" className="hover:text-foreground transition-colors">Workshops & Labs</Link></li>
            <li><Link href="/events?category=Cybersecurity" className="hover:text-foreground transition-colors">Cybersecurity CTFs</Link></li>
            <li><Link href="/events?category=Design" className="hover:text-foreground transition-colors">Design Sprints</Link></li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-foreground tracking-wider uppercase">Connect</h4>
          <p className="text-xs">Join our campus community channels for real-time announcements.</p>
          <div className="flex items-center gap-2 pt-1">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" title="GitHub">
              <Code2 className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" title="Feed">
              <Globe className="w-4 h-4" />
            </a>
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" title="Discord">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="mailto:events@campus.edu" className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" title="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <Separator />
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 Campus Pulse. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive inline" /> for campus teams
          </p>
        </div>
      </div>
    </footer>
  );
}
