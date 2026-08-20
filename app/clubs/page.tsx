"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ClubCard from "@/components/clubs/club-card";
import { fetchClubs } from "@/lib/api-client";
import { ClubApiData } from "@/lib/types";
import { Search, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const fetchedClubs = await fetchClubs();
      setClubs(fetchedClubs);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const query = searchQuery.toLowerCase();
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query)
    );
  }, [clubs, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Campus Partnered Clubs</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Explore Campus Clubs
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Discover student communities, connect with club members, and participate in organized events.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 sm:p-5">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clubs by name or description..."
                  className="pl-9"
                />
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                Active Partnered Organizations: <span className="text-foreground font-bold">{clubs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clubs Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading campus clubs...
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center space-y-4">
            <CardContent className="p-0">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-bold text-foreground mt-2">No Clubs Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any club matching your search keyword.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
