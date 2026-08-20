"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/events/event-card";
import { fetchEvents, fetchClubs } from "@/lib/api-client";
import { EventApiData, ClubApiData } from "@/lib/types";
import { Search, SlidersHorizontal, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AllEventsPage() {
  const [events, setEvents] = useState<EventApiData[]>([]);
  const [clubs, setClubs] = useState<ClubApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"ASC" | "DESC">("ASC");

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
    return events
      .filter((event) => {
        const query = searchQuery.toLowerCase();
        return (
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.startsAt).getTime();
        const dateB = new Date(b.startsAt).getTime();
        return sortBy === "ASC" ? dateA - dateB : dateB - dateA;
      });
  }, [events, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Campus Events Directory</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Discover Campus Events
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Browse technical workshops, hackathons, and challenges hosted by official campus clubs.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-4 sm:p-5">
          <CardContent className="p-0 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title or keyword..."
                  className="pl-9"
                />
              </div>

              {/* Controls: Sort */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Sort Date:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "ASC" | "DESC")}
                    className="bg-transparent text-foreground focus:outline-none cursor-pointer font-semibold"
                  >
                    <option value="ASC" className="bg-popover text-popover-foreground">Earliest First</option>
                    <option value="DESC" className="bg-popover text-popover-foreground">Latest First</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredEvents.length} events</span>
          {searchQuery && (
            <Button
              variant="link"
              size="xs"
              onClick={() => setSearchQuery("")}
              className="p-0"
            >
              Clear search filter
            </Button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading events from database...
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} club={clubsMap[event.clubId]} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center space-y-4">
            <CardContent className="p-0">
              <Compass className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold text-foreground mt-2">No Events Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any events matching your current search query.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
