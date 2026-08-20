"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventApiData, ClubApiData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Calendar, Users, Sparkles, ArrowRight, Pause, Play, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface EventCarouselProps {
  events: EventApiData[];
  clubsMap?: Record<string, ClubApiData>;
}

export default function EventCarousel({ events, clubsMap = {} }: EventCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    if (!events.length) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  }, [events.length]);

  const prevSlide = () => {
    if (!events.length) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  useEffect(() => {
    if (!isPlaying || !events.length) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, events.length]);

  if (!events.length) return null;

  const currentEvent = events[currentIndex];
  const hostClub = clubsMap[currentEvent.clubId];

  const startDate = new Date(currentEvent.startsAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const defaultArt =
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop";

  return (
    <Card className="relative w-full rounded-xl overflow-hidden shadow-sm group">
      <CardContent className="p-0">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 lg:p-10 bg-card">
          {/* Left Side: Text Details */}
          <div className="lg:col-span-7 space-y-5 z-10">
            {/* Top badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="gap-1.5 px-3 py-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Event
              </Badge>
            </div>

            {/* Event Title */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              {currentEvent.name}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl line-clamp-3">
              {currentEvent.description}
            </p>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Starts: {startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  {currentEvent.minTeamSize === 1 && currentEvent.maxTeamSize === 1
                    ? "Solo Entry"
                    : `Team (${currentEvent.minTeamSize}-${currentEvent.maxTeamSize})`}
                </span>
              </div>
            </div>

            {/* Organizing Club */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">Organized by:</span>
                {hostClub ? (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted border border-border">
                    {hostClub.logo ? (
                      <div className="relative w-4 h-4 rounded-full overflow-hidden">
                        <Image src={hostClub.logo} alt={hostClub.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium text-foreground">{hostClub.name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-foreground">Campus Club</span>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4 pt-2">
              <Link href={`/events/${currentEvent.slug}`}>
                <Button variant="default" size="lg" className="gap-2">
                  <span>Explore Event</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side: Visual Image Banner */}
          <div className="lg:col-span-5 relative w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden border border-border shadow-sm group/img bg-muted">
            <Image
              src={currentEvent.art || defaultArt}
              alt={currentEvent.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

            {/* Slide Indicator counter */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                {currentIndex + 1} / {events.length}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Carousel Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-card">
          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "w-8 bg-primary shadow-sm"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls: Play/Pause & Prev/Next */}
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause auto-play" : "Start auto-play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={prevSlide}
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={nextSlide}
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
