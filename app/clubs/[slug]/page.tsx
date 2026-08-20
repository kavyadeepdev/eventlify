"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/events/event-card";
import { fetchClubBySlug, fetchEventsByClubSlug } from "@/lib/api-client";
import { ClubDetailApiResponse, EventApiData } from "@/lib/types";
import {
  Users,
  Calendar,
  Mail,
  Globe,
  Code2,
  ArrowLeft,
  Layers,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

export default function SingleClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<ClubDetailApiResponse | null>(null);
  const [events, setEvents] = useState<EventApiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClubData() {
      setLoading(true);
      const [fetchedClubData, fetchedEvents] = await Promise.all([
        fetchClubBySlug(slug),
        fetchEventsByClubSlug(slug),
      ]);
      setData(fetchedClubData);
      setEvents(fetchedEvents);
      setLoading(false);
    }
    loadClubData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center text-xs text-muted-foreground w-full">
          Loading club details...
        </main>
        <Footer />
      </div>
    );
  }

  if (!data || !data.club) {
    notFound();
  }

  const { club, members, contacts, links } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 w-full">
        {/* Back Link */}
        <Link href="/clubs">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Clubs</span>
          </Button>
        </Link>

        {/* Club Profile Hero Banner */}
        <Card className="relative rounded-xl overflow-hidden shadow-sm">
          {/* Top Banner Gradient */}
          <div className="relative w-full h-44 sm:h-56 overflow-hidden bg-gradient-to-r from-primary/20 via-muted to-accent/20">
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>

          {/* Profile Header Content */}
          <CardContent className="p-6 sm:p-10 -mt-16 sm:-mt-20 relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Club Logo Avatar */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-lg shrink-0 flex items-center justify-center">
                  {club.logo ? (
                    <Image src={club.logo} alt={club.name} fill className="object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Campus Partner</Badge>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                    {club.name}
                  </h1>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-muted border border-border text-center">
                  <span className="block text-lg font-bold text-foreground">{members.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Members</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-muted border border-border text-center">
                  <span className="block text-lg font-bold text-foreground">{events.length}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Events Hosted</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-4xl">
              {club.description}
            </p>

            <Separator />

            {/* Social Links & Contact Channels */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      {link.type === "GITHUB" && <Code2 className="w-3.5 h-3.5" />}
                      {link.type === "WEBSITE" && <Globe className="w-3.5 h-3.5" />}
                      {link.type === "LINKEDIN" && <Globe className="w-3.5 h-3.5" />}
                      <span>{link.title}</span>
                    </Button>
                  </a>
                ))}
              </div>

              {contacts.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Contact: {contacts[0].value}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Club Members & Leadership Team */}
        <Card className="p-6 sm:p-8 space-y-4">
          <CardContent className="p-0 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Club Officers & Members
            </h3>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3 p-3.5 rounded-lg bg-muted border border-border">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border bg-card shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {member.image ? (
                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                      ) : (
                        <span>{member.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{member.name}</h4>
                      <span className="text-xs text-muted-foreground font-medium uppercase">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No members listed yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Events Held by this Club Section */}
        <section className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Events Organized by {club.name}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {events.length} events listed
            </span>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} club={club} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center space-y-2">
              <CardContent className="p-0">
                <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground mt-2">No Active Events</h3>
                <p className="text-xs text-muted-foreground">
                  This club does not have any active events scheduled right now. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
