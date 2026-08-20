"use client";

import Image from "next/image";
import Link from "next/link";
import { EventApiData, ClubApiData } from "@/lib/types";
import { Calendar, Users, ArrowRight, Building2 } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EventCardProps {
  event: EventApiData;
  club?: ClubApiData;
}

export default function EventCard({ event, club }: EventCardProps) {
  const startDate = new Date(event.startsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const defaultArt =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop";

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all">
      {/* Event Cover Image */}
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        <Image
          src={event.art || defaultArt}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

        {/* Team size tag */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            {event.minTeamSize === 1 && event.maxTeamSize === 1
              ? "Solo"
              : `${event.minTeamSize}-${event.maxTeamSize} Team`}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 pt-4">
        <div>
          {/* Start Date */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {startDate}
            </span>
          </div>

          {/* Event Title */}
          <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.name}
          </CardTitle>

          {/* Description */}
          <CardDescription className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </CardDescription>
        </div>
      </CardContent>

      <Separator />

      {/* Footer */}
      <CardFooter className="p-5 pt-3 flex flex-col space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Organized by:</span>
            {club ? (
              <div className="flex items-center gap-1.5">
                {club.logo ? (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-border bg-muted">
                    <Image src={club.logo} alt={club.name} fill className="object-cover" />
                  </div>
                ) : (
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs text-foreground font-medium truncate max-w-[140px]">
                  {club.name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-foreground font-medium">Campus Club</span>
            )}
          </div>
        </div>

        <Link href={`/events/${event.slug}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <span>View Event Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
