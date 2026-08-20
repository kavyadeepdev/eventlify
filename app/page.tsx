"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCarousel from "@/components/events/event-carousel";
import EventCard from "@/components/events/event-card";
import ClubCard from "@/components/clubs/club-card";
import { fetchEvents, fetchClubs } from "@/lib/api-client";
import { EventApiData, ClubApiData } from "@/lib/types";
import { Sparkles, Calendar, Building2, ArrowRight, Flame, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [events, setEvents] = useState<EventApiData[]>([]);
  const [clubs, setClubs] = useState<ClubApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fetchedEvents, fetchedClubs] = await Promise.all([
        fetchEvents(),
        fetchClubs(),
      ]);
      setEvents(fetchedEvents);
      setClubs(fetchedClubs);
      setLoading(false);
    }
    loadData();
  }, []);

  const clubsMap = useMemo(() => {
    const map: Record<string, ClubApiData> = {};
    clubs.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [clubs]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      (evt) =>
        evt.name.toLowerCase().includes(query) ||
        evt.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 w-full">
        {/* Section 1: Hero Carousel of Popular / Featured Events */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Featured Campus Events
              </h2>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Latest events from backend database
            </span>
          </div>

          {!loading && events.length > 0 ? (
            <EventCarousel events={events} clubsMap={clubsMap} />
          ) : loading ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              Loading featured events...
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No campus events scheduled yet.
            </Card>
          )}
        </section>

        {/* Section 2: Campus Events Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-foreground" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Explore Campus Events
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Browse upcoming workshops, hackathons, and challenges across campus clubs.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter events by title or keyword..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading campus events...
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} club={clubsMap[event.clubId]} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-xs text-muted-foreground">
              No events found matching your search.
            </Card>
          )}

          {/* View All Events Button */}
          <div className="flex justify-center pt-4">
            <Link href="/events">
              <Button size="lg" variant="secondary" className="gap-2">
                <span>Explore All Events</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        <Separator />

        {/* Section 3: Partnered Clubs Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-foreground" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Partnered Campus Clubs
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Join student chapters, participate in club activities, and access club events.
              </p>
            </div>

            <Link href="/clubs">
              <Button variant="link" size="sm" className="gap-1 text-muted-foreground hover:text-foreground p-0">
                <span>View All Clubs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Clubs Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading campus clubs...
            </div>
          ) : clubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-xs text-muted-foreground">
              No campus clubs registered yet.
            </Card>
          )}
        </section>

        {/* Call to Action Banner */}
        <Card className="text-center p-8 sm:p-12 space-y-6 bg-card border-border">
          <CardContent className="p-0 space-y-6 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Are you a Club Lead or Event Organizer?
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Publish your upcoming workshops, manage member teams, track participant check-ins, and streamline student registrations on Eventlify.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/signup">
                <Button variant="default" size="default">
                  Register Club Account
                </Button>
              </Link>
              <Link href="/clubs">
                <Button variant="outline" size="default">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
