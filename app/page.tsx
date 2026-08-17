import Header from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import Image from "next/image";

const events = [
  {
    id: "evt_001",
    name: "Hackathon 2026",
    description:
      "A 24-hour hackathon focused on building innovative solutions.",
    art: "hackathon.jpg",
    clubId: "club_protocol",
    startsAt: new Date("2026-08-15T09:00:00Z"),
    endsAt: new Date("2026-08-16T09:00:00Z"),
    duration: 24,
  },
  {
    id: "evt_002",
    name: "Web Development Workshop",
    description:
      "Hands-on workshop covering modern web development with Next.js.",
    art: "web-workshop.jpg",
    clubId: "club_protocol",
    startsAt: new Date("2026-08-22T14:00:00Z"),
    endsAt: new Date("2026-08-22T17:00:00Z"),
    duration: 3,
  },
  {
    id: "evt_003",
    name: "Capture The Flag",
    description:
      "Cybersecurity competition with beginner and advanced challenges.",
    art: "ctf.jpg",
    clubId: "club_cyber",
    startsAt: new Date("2026-09-05T10:00:00Z"),
    endsAt: new Date("2026-09-05T18:00:00Z"),
    duration: 8,
  },
];

export default function Home() {
  return (
    <div>
      <main>
        <Header />
        <div className="m-40 flex justify-center">
          <div className="w-2/3 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
            {events.map((event) => (
              <Card key={event.id} className="w-80">
                <CardHeader>
                  <Image
                    src={`/${event.art}`}
                    alt="Event art"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto"
                  />
                  <h2>{event.name}</h2>
                  <h3>{event.clubId}</h3>
                </CardHeader>
                <CardDescription>
                  <p>{event.description}</p>
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
