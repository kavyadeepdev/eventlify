"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { fetchEventBySlug } from "@/lib/api-client";
import { EventDetailApiResponse } from "@/lib/types";
import {
  Calendar,
  Clock,
  Users,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  FileText,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

export default function SingleEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<EventDetailApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "club" | "resources">("overview");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      const res = await fetchEventBySlug(slug);
      setData(res);
      setLoading(false);
    }
    loadEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center text-xs text-muted-foreground w-full">
          Loading event details...
        </main>
        <Footer />
      </div>
    );
  }

  if (!data || !data.event) {
    notFound();
  }

  const { event, club, contacts, links } = data;

  const startDateFormatted = new Date(event.startsAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const startTimeFormatted = new Date(event.startsAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTimeFormatted = new Date(event.endsAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const deadlineFormatted = new Date(event.registrationDeadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const defaultArt =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Back Link */}
        <Link href="/events">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Button>
        </Link>

        {/* Hero Section Banner */}
        <Card className="relative rounded-xl overflow-hidden shadow-sm">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 bg-muted">
            <Image
              src={event.art || defaultArt}
              alt={event.name}
              fill
              priority
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
          </div>

          <CardContent className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Campus Event
              </Badge>
              {club && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  {club.name}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {event.name}
            </h1>

            {/* Quick badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{startDateFormatted}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  {event.minTeamSize === 1 && event.maxTeamSize === 1
                    ? "Individual Entry"
                    : `Teams of ${event.minTeamSize}-${event.maxTeamSize}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid: Content Tabs (Left) + Sticky Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Navigation Tabs & Tab Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs Header Bar */}
            <div className="flex items-center gap-2 p-1 rounded-lg border border-border bg-card overflow-x-auto scrollbar-none">
              <Button
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("overview")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === "club" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("club")}
                className="gap-2"
              >
                <Building2 className="w-4 h-4" />
                Organizing Club
              </Button>
              <Button
                variant={activeTab === "resources" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("resources")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Links & Contacts ({links.length + contacts.length})
              </Button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <Card className="p-6 sm:p-8 space-y-6">
                <CardContent className="p-0 space-y-6">
                  {/* Event Image Banner */}
                  <div className="relative w-full h-72 sm:h-96 rounded-lg overflow-hidden border border-border bg-muted">
                    <Image
                      src={event.art || defaultArt}
                      alt={event.name}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">About the Event</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted border border-border space-y-1">
                      <span className="text-xs text-muted-foreground">Team Size Constraint</span>
                      <p className="text-sm font-semibold text-foreground">
                        {event.minTeamSize === 1 && event.maxTeamSize === 1
                          ? "Individual Participation Only"
                          : `${event.minTeamSize} to ${event.maxTeamSize} Members per Team`}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted border border-border space-y-1">
                      <span className="text-xs text-muted-foreground">Registration Deadline</span>
                      <p className="text-sm font-semibold text-foreground">{deadlineFormatted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tab 2: Organizing Club */}
            {activeTab === "club" && (
              <Card className="p-6 sm:p-8 space-y-6">
                <CardContent className="p-0 space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    Host Campus Club
                  </h3>

                  {club ? (
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="flex items-center gap-4 p-5 rounded-lg bg-muted border border-border hover:bg-accent transition-all group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-card shrink-0 flex items-center justify-center">
                        {club.logo ? (
                          <Image src={club.logo} alt={club.name} fill className="object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {club.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {club.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground">No host club details available.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tab 3: Resources & Contacts */}
            {activeTab === "resources" && (
              <Card className="p-6 sm:p-8 space-y-6">
                <CardContent className="p-0 space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    Event Links & Attachments
                  </h3>

                  {links.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-lg bg-muted border border-border hover:bg-accent transition-colors"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-foreground block">{link.title}</span>
                            <span className="text-[11px] text-muted-foreground uppercase">{link.type}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No external links attached to this event.</p>
                  )}

                  <Separator />

                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-2">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    Contact & Helpdesk
                  </h3>

                  {contacts.length > 0 ? (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border text-xs"
                        >
                          <span className="font-medium text-foreground">{contact.title} ({contact.type}):</span>
                          <span className="text-muted-foreground font-mono">{contact.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No direct contacts listed for this event.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Info Card */}
          <div className="lg:col-span-4 sticky top-20 space-y-6">
            <Card className="p-6 space-y-6 shadow-sm">
              <CardContent className="p-0 space-y-6">
                <div>
                  <Badge variant="default" className="text-[11px]">
                    Event Status
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mt-2">Registration Info</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Open for all campus students.
                  </p>
                </div>

                {/* Deadline alert */}
                <div className="p-3.5 rounded-lg bg-muted border border-border space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Registration Deadline</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{deadlineFormatted}</p>
                </div>

                {/* Time Summary */}
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Starts</span>
                      <span>{startDateFormatted} at {startTimeFormatted}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Ends</span>
                      <span>{endTimeFormatted}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground block">Team Format</span>
                      <span>
                        {event.minTeamSize === 1 && event.maxTeamSize === 1
                          ? "Individual (Solo)"
                          : `Teams of ${event.minTeamSize} to ${event.maxTeamSize} members`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration Button */}
                <Button variant="default" size="lg" className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Register Now</span>
                </Button>

                {/* Contact Information */}
                {contacts.length > 0 && (
                  <div className="pt-4 border-t border-border space-y-2 text-xs">
                    <span className="text-muted-foreground font-semibold block">Need Assistance?</span>
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex justify-between text-muted-foreground">
                        <span>{contact.title}:</span>
                        <span className="text-foreground font-medium">{contact.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
