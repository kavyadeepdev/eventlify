"use client";

import Image from "next/image";
import Link from "next/link";
import { ClubApiData } from "@/lib/types";
import { ArrowRight, Building2 } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ClubCardProps {
  club: ClubApiData;
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all">
      {/* Top Banner Gradient */}
      <div className="relative w-full h-24 overflow-hidden bg-gradient-to-r from-primary/20 via-muted to-accent/20">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Profile Logo & Info */}
      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between -mt-10 relative z-10 space-y-4">
        <div>
          {/* Logo Badge */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-background bg-muted shadow-md mb-3 flex items-center justify-center">
            {club.logo ? (
              <Image src={club.logo} alt={club.name} fill className="object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Club Title */}
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {club.name}
          </CardTitle>

          {/* Short description */}
          <CardDescription className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
            {club.description}
          </CardDescription>
        </div>
      </CardContent>

      <Separator />

      {/* Footer Link Button */}
      <CardFooter className="p-5 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Campus Partner</span>

        <Link href={`/clubs/${club.slug}`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <span>View Club</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
